// src/api/messages.js
const API = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(
  /\/$/,
  ""
);

export async function fetchHistory(peerId, limit = 50) {
  const url = `${API}/messages/history?peerId=${encodeURIComponent(
    peerId
  )}&limit=${limit}`;
  const r = await fetch(url, { credentials: "include" });
  if (!r.ok) throw new Error("No se pudo cargar el historial");
  const json = await r.json();
  return json.messages || [];
}
