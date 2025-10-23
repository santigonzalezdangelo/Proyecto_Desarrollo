// src/components/ChatDM.jsx
import { useMemo, useState } from "react";
import { useDirectChat } from "../hooks/useDirectChat";

export default function ChatDM({ meId, peerId }) {
  const { messages, send } = useDirectChat(meId, peerId);
  const [text, setText] = useState("");

  const conv = useMemo(
    () =>
      [...messages].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      ),
    [messages]
  );

  const onSend = async (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    await send(t);
    setText("");
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="border rounded-lg p-3 h-80 overflow-auto bg-white">
        {conv.map((m) => (
          <div
            key={m.id}
            className={`my-1 flex ${
              String(m.from) === String(meId) ? "justify-end" : "justify-start"
            }`}
          >
            <span
              className={`px-3 py-2 rounded-2xl shadow ${
                String(m.from) === String(meId)
                  ? "bg-black text-white"
                  : "bg-gray-100"
              }`}
            >
              {m.text}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={onSend} className="mt-3 flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribí un mensaje…"
        />
        <button className="px-4 py-2 rounded bg-black text-white">
          Enviar
        </button>
      </form>
    </div>
  );
}
