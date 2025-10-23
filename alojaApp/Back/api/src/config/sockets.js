// // src/config/socket.js
// import { Server } from "socket.io";
// import { pushUnreadTo } from "../sockets/dm.handlers.js";
// import { verifyToken } from "../utils/jwt.js"; // usa tu helper actual (ya lo tenés)

// const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
// const AUTH_COOKIE = process.env.AUTH_COOKIE || "aloja_jwt";

// export function buildSocketIOServer(httpServer) {
//   const io = new Server(httpServer, {
//     cors: { origin: ORIGIN, credentials: true },
//   });

//   io.use((socket, next) => {
//     try {
//       const cookie = socket.request.headers.cookie || "";
//       const tokenFromCookie = cookie
//         .split(";")
//         .map((v) => v.trim())
//         .find((v) => v.startsWith(AUTH_COOKIE + "="))
//         ?.split("=")[1];

//       const token = socket.handshake.auth?.token || tokenFromCookie;
//       if (!token) return next(new Error("No token"));

//       const payload = verifyToken(token); // { id, ... }
//       socket.user = { id: String(payload.id) };
//       next();
//     } catch (e) {
//       next(new Error("Auth failed"));
//     }
//   });

//   io.on("connection", async (socket) => {
//     const userId = socket.user.id;
//     socket.join(`user:${userId}`);

//     await pushUnreadTo(io, userId);

//     socket.on("dm:send", async (payload, ack) => {
//       try {
//         const { handleDmSend } = await import("../sockets/dm.handlers.js");
//         const saved = await handleDmSend(io, socket, payload);
//         ack?.({ ok: true, messageId: saved.id });
//       } catch (err) {
//         ack?.({ ok: false, error: err.message });
//       }
//     });
//   });

//   return io;
// }

// src/config/socket.js (o sockets.js)
import { Server } from "socket.io";
import { pushUnreadTo } from "../sockets/dm.handlers.js";
import { verifyToken } from "../utils/jwt.js"; // tu helper actual

const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const AUTH_COOKIE = process.env.AUTH_COOKIE || "aloja_jwt";

function pickUserId(payload) {
  // acepta varias variantes según tu JWT
  const cand = [
    payload?.id,
    payload?.id_usuario,
    payload?.userId,
    payload?.uid,
  ];
  const found = cand.find((v) => Number.isFinite(Number(v)));
  return found ? String(found) : null;
}

const roomFor = (userId) => `user:${Number(userId)}`;

export function buildSocketIOServer(httpServer) {
  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: { origin: ORIGIN, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const cookie = socket.request.headers.cookie || "";
      const tokenFromCookie = cookie
        .split(";")
        .map((v) => v.trim())
        .find((v) => v.startsWith(AUTH_COOKIE + "="))
        ?.split("=")[1];

      const token = socket.handshake.auth?.token || tokenFromCookie;
      if (!token) return next(new Error("No token"));

      const payload = verifyToken(token);
      const uidStr = pickUserId(payload); // <- string o null
      if (!uidStr) return next(new Error("Invalid token payload (no user id)"));

      // 🔧 FIX: setear ambas propiedades
      socket.user = { id: Number(uidStr) };
      socket.userId = Number(uidStr); // <- ESTA LÍNEA ES CLAVE

      next();
    } catch (e) {
      next(new Error("Auth failed"));
    }
  });

  io.on("connection", (socket) => {
    // 🔧 FIX: usar el id que acabamos de setear
    const userId = Number(socket.userId); // o Number(socket.user?.id)
    if (Number.isFinite(userId) && userId > 0) {
      socket.join(roomFor(userId)); // 👈 ahora sí entra al room
      console.log("[socket] joined room", roomFor(userId));
    } else {
      console.warn("[socket] sin userId; no se une a room");
    }

    socket.on("dm:send", async (payload, cb = () => {}) => {
      try {
        const from = Number(socket.userId); // NO confíes en payload.from
        const to = Number(payload?.to);
        const text = String(payload?.text ?? "").trim();

        if (!Number.isFinite(to) || to <= 0 || !text) {
          return cb({ ok: false, error: "bad-payload" });
        }

        const at = Date.now();

        // Notificación + mensaje al receptor
        io.to(roomFor(to)).emit("notif:new", { type: "dm", from, text, at });
        io.to(roomFor(to)).emit("dm:new", { from, to, text, at });

        // Eco al emisor (útil si se manda a sí mismo o tiene otra pestaña abierta)
        io.to(roomFor(from)).emit("dm:new", { from, to, text, at, echo: true });

        return cb({ ok: true });
      } catch (e) {
        console.error("dm:send error:", e);
        return cb({ ok: false, error: "server-error" });
      }
    });
  });

  return io;
}
