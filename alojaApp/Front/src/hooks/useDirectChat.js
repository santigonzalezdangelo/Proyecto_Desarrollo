// src/hooks/useDirectChat.js
import { useEffect, useRef, useState } from "react";
import { socket } from "../lib/socket";
import { fetchHistory } from "../api/messages";

export function useDirectChat(meId, peerId) {
  const [messages, setMessages] = useState([]);
  const bootedRef = useRef(false);

  // cargar historial
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await fetchHistory(peerId, 50);
        if (mounted) setMessages(rows.map(mapRow));
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [peerId]);

  // escuchar en tiempo real
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    const onNew = (m) => {
      const belongs =
        (String(m.from) === String(meId) && String(m.to) === String(peerId)) ||
        (String(m.from) === String(peerId) && String(m.to) === String(meId));
      if (belongs) setMessages((prev) => [...prev, normalizeIncoming(m)]);
    };

    socket.on("dm:new", onNew);
    return () => socket.off("dm:new", onNew);
  }, [meId, peerId]);

  const send = (text) =>
    new Promise((resolve) => {
      const tmpId = crypto.randomUUID();
      const provisional = {
        id: tmpId,
        from: String(meId),
        to: String(peerId),
        text,
        createdAt: new Date().toISOString(),
        _optimistic: true,
      };
      setMessages((prev) => [...prev, provisional]);

      socket.emit(
        "dm:send",
        { to: String(peerId), text, clientId: tmpId },
        (ack) => {
          if (!ack?.ok) return resolve(ack);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tmpId
                ? { ...m, id: ack.messageId, _optimistic: false }
                : m
            )
          );
          resolve(ack);
        }
      );
    });

  return { messages, send };
}

function mapRow(r) {
  return {
    id: r.id,
    from: String(r.from_user_id),
    to: String(r.to_user_id),
    text: r.text,
    createdAt: r.created_at,
  };
}
function normalizeIncoming(m) {
  return {
    id: m.id,
    from: String(m.from),
    to: String(m.to),
    text: m.text,
    createdAt: m.createdAt || new Date().toISOString(),
  };
}
