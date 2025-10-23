// src/sockets/dm.handlers.js
import { MessageDAO } from "../dao/messages.dao.js";

export async function handleDmSend(io, socket, payload) {
  const { to, text } = payload || {};
  if (!to || !text) throw new Error("Faltan campos");

  const from = Number(socket.user.id);
  const dest = Number(to);

  const saved = await MessageDAO.create({ from, to: dest, text: String(text) });

  const wire = {
    id: saved.id,
    from: String(from),
    to: String(dest),
    text: saved.text,
    createdAt: saved.created_at,
  };

  io.to(`user:${dest}`).emit("dm:new", wire);
  return saved;
}

export async function pushUnreadTo(io, userId) {
  const rows = await MessageDAO.listUndelivered(Number(userId));
  if (!rows.length) return;
  const ids = [];
  for (const m of rows) {
    io.to(`user:${userId}`).emit("dm:new", {
      id: m.id,
      from: String(m.from_user_id),
      to: String(m.to_user_id),
      text: m.text,
      createdAt: m.created_at,
    });
    ids.push(m.id);
  }
  await MessageDAO.markDelivered(ids);
}
