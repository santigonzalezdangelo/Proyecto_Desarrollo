import { io } from "socket.io-client";

// Si VITE_API_URL = "http://localhost:4000/api", quitamos "/api"
const RAW = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(
  /\/$/,
  ""
);
const BASE = RAW.replace(/\/api$/, "");

export const socket = io(BASE, {
  withCredentials: true,
  path: "/socket.io", // debe matchear con el server
  // NO pongas transports aquí; dejá que use polling -> upgrade
});

// DEBUG: mostrá por qué falla si falla
socket.on("connect", () => console.log("[socket] connected", socket.id));
socket.on("connect_error", (err) => {
  console.log("[socket] connect_error:", err?.message, err);
});
socket.on("error", (err) => console.log("[socket] error:", err));
socket.on("disconnect", (reason) =>
  console.log("[socket] disconnect:", reason)
);
