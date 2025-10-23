// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";

// import { connectDB, sequelize } from "./config/db.js";
// import apiRouter from "./routes/api/index.routes.js";

// import "dotenv/config"; // para cargar variables de entorno

// const app = express();
// const PORT = process.env.PORT;
// const ORIGIN = process.env.CORS_ORIGIN;

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(
//   cors({
//     origin: ORIGIN,
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
//   })
// );

// app.use(cookieParser());

// //conexión a la base de datos y sincronización de modelos
// await connectDB();
// await sequelize
//   .sync({ alter: true })
//   .then(() => console.log("Tablas sincronizadas con la base de datos"))
//   .catch((err) => console.error("Error al sincronizar las tablas:", err));

// app.use("/api", apiRouter);

// const httpServer = app.listen(PORT, () => {
//   console.log(`Servidor escuchando en el puerto ${PORT}`);
// });

// httpServer.on("error", (error) => console.log(`Error en servidor: ${error}`));

import express from "express";
import http from "http"; // 👈 nuevo
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB, sequelize } from "./config/db.js";
import apiRouter from "./routes/api/index.routes.js";
import { buildSocketIOServer } from "./config/sockets.js"; // 👈 nuevo
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 4000;
const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// 👇 server HTTP real para poder colgar Socket.IO
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
  })
);

app.use(cookieParser());

// DB + sync
await connectDB();
await sequelize
  .sync({ alter: true })
  .then(() => console.log("Tablas sincronizadas con la base de datos"))
  .catch((err) => console.error("Error al sincronizar las tablas:", err));

// Rutas REST
app.use("/api", apiRouter);

// 👇 MONTAR Socket.IO sobre el MISMO server HTTP
buildSocketIOServer(server);

// 👇 SIEMPRE server.listen (no app.listen)
server.listen(PORT, () => {
  console.log(`API + WS escuchando en ${PORT}`);
});
