// const express = require("express");
// const cors = require("cors");
// const helmet = require("helmet");
// const { pool } = require("./db");
// const bcrypt = require("bcrypt");

// const app = express();

// app.use(helmet());
// app.use(cors());
// app.use(express.json());

// app.get("/", (req, res) => {
//   res.json({ message: "API funcionando 🚀" });
// });

// // Endpoint de prueba - lista usuario
// app.get("/usuarios", async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT 
//         u.id_usuario,
//         p.nombre,
//         p.apellido,
//         u.correo
//       FROM usuario u
//       JOIN persona p ON u.id_persona = p.id_persona
//     `);
//     res.json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error al consultar usuarios" });
//   }
// });


// app.post("/usuarios", async (req, res) => {
//   const { nombre, apellido, dni, calle, numero, id_localidad, correo, contrasenia, id_tipo_usuario } = req.body;

//   console.log("Body recibido:", req.body);
//   // Validaciones básicas
//   if (!nombre || !apellido || !dni || !calle || !numero || !id_localidad || !correo || !contrasenia || !id_tipo_usuario) {
//     return res.status(400).json({ error: "Faltan datos obligatorios" });
//   }

//   // Podés ajustar el número de salt rounds según seguridad/tiempo
//   const saltRounds = 10;

//   try {
//     // Empezamos transaction
//     await pool.query("BEGIN");

//     // 1) Verificar que no exista un usuario con ese correo
//     const existing = await pool.query(
//       `SELECT id_usuario FROM usuario WHERE correo = $1`,
//       [correo]
//     );

//     if (existing.rowCount > 0) {
//       await pool.query("ROLLBACK");
//       return res.status(409).json({ error: "Ya existe un usuario con ese correo" });
//     }

//     // 2) Insertar en personaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
//     const personaResult = await pool.query(
//       `INSERT INTO persona (nombre, apellido, dni, calle, numero, id_localidad)
//        VALUES ($1, $2, $3, $4, $5, $6)
//        RETURNING id_persona`,
//       [nombre, apellido, dni, calle, numero, id_localidad]
//     );

//     const id_persona = personaResult.rows[0].id_persona;

//     // 3) Hashear la contraseña
//     const hashed = await bcrypt.hash(contrasenia, saltRounds);

//     // 4) Insertar en usuario (guardo la contrasenia hasheada)
//     const usuarioResult = await pool.query(
//       `INSERT INTO usuario (id_persona, correo, contrasenia, id_tipo_usuario)
//        VALUES ($1, $2, $3, $4)
//        RETURNING id_usuario, correo, id_persona`,
//       [id_persona, correo, hashed, id_tipo_usuario]
//     );

//     await pool.query("COMMIT");

//     // No devolvemos la contraseña (ni siquiera la hasheada)
//     res.status(201).json({
//       message: "Usuario registrado con éxito",
//       usuario: usuarioResult.rows[0],
//     });
//   } catch (error) {
//     await pool.query("ROLLBACK");

//     // Manejo especial si la BD lanza unique violation (por si no chequeaste antes)
//     if (error.code === "23505") {
//       return res.status(409).json({ error: "Correo ya registrado" });
//     }

//     console.error("Error en POST /usuarios:", error);
//     res.status(500).json({ error: "Error al registrar usuario" });
//   }
// });

// app.post("/reservas", async (req, res) => {
//   const { id_usuario, id_propiedad, fecha_inicio, fecha_fin, cantidad_de_dias, precio_final, id_comision } = req.body;

//   console.log("Body recibido:", req.body);
//   // Validaciones básicas
//   if (!id_usuario || !id_propiedad || !fecha_inicio || !fecha_fin || !cantidad_de_dias || !precio_final || !id_comision ) {
//     return res.status(400).json({ error: "Faltan datos obligatorios" });
//   }

//     try {
//     // Empezamos transaction
//     await pool.query("BEGIN");

//     const reservaResult = await pool.query(
//       `INSERT INTO reserva (id_usuario, id_propiedad, fecha_inicio, fecha_fin, cantidad_de_dias, precio_final, id_comision)
//        VALUES ($1, $2, $3, $4, $5, $6, $7)
//        RETURNING id_reserva`,
//       [id_usuario, id_propiedad, fecha_inicio, fecha_fin, cantidad_de_dias, precio_final, id_comision]
//     );

//     await pool.query("COMMIT");

//     // No devolvemos la contraseña (ni siquiera la hasheada)
//     res.status(201).json({
//       message: "Reserva registrada con éxito",
//       reserva: reservaResult.rows[0],
//     });
//   } catch (error) {
//     await pool.query("ROLLBACK");

//     console.error("Error en POST /reservas:", error);
//     res.status(500).json({ error: "Error al registrar reserva" });
//   }
// });

// app.put("/propiedades/:id", async (req, res) => {
//     const id = req.params.id; // id_propiedad
//     const { precio_por_noche } = req.body; // nuevo precio

//     if (precio_por_noche === undefined) {
//         return res.status(400).json({ error: "Debe enviar el precio_por_noche" });
//     }

//     try {
//         const result = await pool.query(
//             `UPDATE propiedad
//              SET precio_por_noche = $1
//              WHERE id_propiedad = $2
//              RETURNING *`,
//             [precio_por_noche, id]
//         );

//         if (result.rowCount === 0) {
//             return res.status(404).json({ error: "Propiedad no encontrada" });
//         }

//         res.json({
//             message: "Precio actualizado correctamente",
//             propiedad: result.rows[0]
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Error al actualizar el precio" });
//     }
// });

// app.get("/precio", async (req, res) => {
//   try {
//     const { id_propiedad, fecha_inicio, fecha_fin } = req.query;

//     // Validar que vengan los parámetros
//     if (!id_propiedad || !fecha_inicio || !fecha_fin) {
//       return res.status(400).json({ error: "Faltan parámetros obligatorios" });
//     }

//     // Calcular diferencia de días
//     const inicio = new Date(fecha_inicio);
//     const fin = new Date(fecha_fin);

//     if (isNaN(inicio) || isNaN(fin) || fin <= inicio) {
//       return res.status(400).json({ error: "Fechas inválidas" });
//     }

//     const diffTime = Math.abs(fin - inicio); // milisegundos
//     const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//     // Obtener precio de la propiedad desde la BD
//     const result = await pool.query(
//       `SELECT precio_por_noche FROM propiedad WHERE id_propiedad = $1`,
//       [id_propiedad]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Propiedad no encontrada" });
//     }

//     const precioPorNoche = result.rows[0].precio_por_noche;

//     // Calcular precio total
//     const precioTotal = dias * precioPorNoche;

//     res.json({
//       id_propiedad,
//       fecha_inicio,
//       fecha_fin,
//       dias,
//       precio_por_noche: precioPorNoche,
//       precio_total: precioTotal,
//     });
//   } catch (error) {
//     console.error("Error en GET /precio:", error);
//     res.status(500).json({ error: "Error al calcular precio" });
//   }
// });


// app.get("/propiedades/disponibles", async (req, res) => {
//   try {
//     const { fecha_inicio, fecha_fin, huespedes, id_localidad, precio_max } = req.query;

//     // Validación básica
//     if (!fecha_inicio || !fecha_fin || !huespedes || !id_localidad) {
//       return res.status(400).json({
//         error: "Faltan parámetros obligatorios",
//         missing: [
//           !fecha_inicio ? "fecha_inicio" : null,
//           !fecha_fin ? "fecha_fin" : null,
//           !huespedes ? "huespedes" : null,
//           !id_localidad ? "id_localidad" : null,
//         ].filter(Boolean),
//         received: req.query,
//       });
//     }

//     // Construcción dinámica del query
//     let query = `
//       SELECT p.*
//       FROM propiedad p
//       WHERE p.cantidad_huespedes >= $1
//         AND p.id_localidad = $2
//         AND NOT EXISTS (
//           SELECT 1
//           FROM reserva r
//           WHERE r.id_propiedad = p.id_propiedad
//             AND r.fecha_inicio < $4
//             AND r.fecha_fin > $3
//         )
//     `;

//     const params = [huespedes, id_localidad, fecha_inicio, fecha_fin];

//     if (precio_max) {
//       query += " AND p.precio_por_noche <= $5";
//       params.push(precio_max);
//     }

//     const { rows } = await pool.query(query, params);

//     res.json(rows);
//   } catch (err) {
//     console.error("Error en GET /propiedades/disponibles:", err);
//     res.status(500).json({ error: "Error interno del servidor" });
//   }
// });

// // GET /propiedades/destacadas
// app.get("/propiedades/destacadas", async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT 
//         p.id_propiedad,
//         p.nombre_de_fantasia AS titulo,
//         p.descripcion AS subtitulo,
//         p.precio_por_noche,
//         l.nombre_localidad AS localidad,
//         c.nombre_ciudad AS ciudad,
//         pa.nombre_pais AS pais,
//         COALESCE(ROUND(AVG(cp.puntuacion),1), 0) AS rating,
//         f.id_url AS imagen_url
//       FROM propiedad p
//       JOIN localidad l ON p.id_localidad = l.id_localidad
//       JOIN ciudad c ON l.id_ciudad = c.id_ciudad
//       JOIN pais pa ON c.id_pais = pa.id_pais
//       LEFT JOIN calificacionpropiedad cp ON p.id_propiedad = cp.id_propiedad
//       LEFT JOIN foto f ON f.id_propiedad = p.id_propiedad
//       GROUP BY 
//         p.id_propiedad, 
//         l.nombre_localidad, 
//         c.nombre_ciudad, 
//         pa.nombre_pais,
//         f.id_url
//       ORDER BY rating DESC
//       LIMIT 8
//     `);

//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error al obtener propiedades destacadas:", error);
//     res.status(500).json({ error: "Error al obtener propiedades destacadas" });
//   }
// });





// //PRUEBAS
// app.get("/propiedades/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     // --- Consulta principal de propiedad + anfitrión + ubicación + tipo ---
//     const propiedadResult = await pool.query(
//       `
//       SELECT 
//         p.id_propiedad,
//         p.nombre_de_fantasia,
//         p.descripcion,
//         p.precio_por_noche,
//         p.senia_minima,
//         p.cantidad_huespedes,
//         tp.nombre_tipo AS tipo,
//         l.nombre_localidad AS localidad,
//         c.nombre_ciudad AS ciudad,
//         pa.nombre_pais AS pais,
//         pe.nombre AS nombre_anfitrion,
//         pe.apellido AS apellido_anfitrion,
//         u.correo AS correo_anfitrion
//       FROM propiedad p
//       JOIN tipopropiedad tp ON p.id_tipo_propiedad = tp.id_tipo_propiedad
//       JOIN localidad l ON p.id_localidad = l.id_localidad
//       JOIN ciudad c ON l.id_ciudad = c.id_ciudad
//       JOIN pais pa ON c.id_pais = pa.id_pais
//       JOIN anfitrion a ON p.id_anfitrion = a.id_usuario
//       JOIN usuario u ON a.id_usuario = u.id_usuario
//       JOIN persona pe ON u.id_persona = pe.id_persona
//       WHERE p.id_propiedad = $1
//       `,
//       [id]
//     );

//     if (propiedadResult.rows.length === 0)
//       return res.status(404).json({ error: "Propiedad no encontrada" });

//     const propiedad = propiedadResult.rows[0];

//     // --- Traer fotos de la propiedad ---
//     const fotosResult = await pool.query(
//       "SELECT id_url, nombre FROM foto WHERE id_propiedad = $1",
//       [id]
//     );

//     // --- Calcular calificación promedio y cantidad ---
//     const calificacionResult = await pool.query(
//       `
//       SELECT 
//         COALESCE(ROUND(AVG(puntuacion),2),0) AS promedio,
//         COUNT(*) AS total
//       FROM calificacionpropiedad
//       WHERE id_propiedad = $1
//       `,
//       [id]
//     );

//     const calificaciones = calificacionResult.rows[0];

//     // --- Construir respuesta final ---
//     const respuesta = {
//       ...propiedad,
//       anfitrion: {
//         nombre: propiedad.nombre_anfitrion,
//         apellido: propiedad.apellido_anfitrion,
//         correo: propiedad.correo_anfitrion,
//       },
//       fotos: fotosResult.rows,
//       calificaciones,
//     };

//     // Eliminar duplicados de nivel raíz
//     delete respuesta.nombre_anfitrion;
//     delete respuesta.apellido_anfitrion;
//     delete respuesta.correo_anfitrion;

//     res.json(respuesta);
//   } catch (err) {
//     console.error("Error al obtener propiedad:", err);
//     res.status(500).json({ error: "Error interno del servidor" });
//   }
// });

// // GET /localidades/search?q=...
// app.get('/localidades/search', async (req, res) => {
//   try {
//     const q = req.query.q?.trim();
//     if (!q) {
//       return res.status(400).json({ error: 'Parámetro q requerido' });
//     }

//     const result = await pool.query(
//       `
//       SELECT 
//         l.id_localidad,
//         l.nombre_localidad AS localidad,
//         c.nombre_ciudad AS ciudad,
//         p.nombre_pais AS pais
//       FROM localidad l
//       JOIN ciudad c ON l.id_ciudad = c.id_ciudad
//       JOIN pais p ON c.id_pais = p.id_pais
//       WHERE LOWER(l.nombre_localidad) LIKE LOWER($1)
//       ORDER BY l.nombre_localidad
//       LIMIT 10
//       `,
//       [`%${q}%`]
//     );

//     res.json(result.rows);
//   } catch (error) {
//     console.error('Error al buscar localidades:', error);
//     res.status(500).json({ error: 'Error interno del servidor' });
//   }
// });













// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Servidor escuchando en http://localhost:${PORT}`);
// });

// /api/src/server.js (o /api/server.js si preferís)

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB, sequelize } from "./config/db.js";
import apiRouter from "./routes/api/index.routes.js";

import 'dotenv/config'; // para cargar variables de entorno

const app = express();
const PORT   = process.env.PORT;
const ORIGIN = process.env.CORS_ORIGIN;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use(cors({
  origin: ORIGIN,
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"]
}));

app.use(cookieParser());

//conexión a la base de datos y sincronización de modelos
await connectDB();
await sequelize
  .sync({ alter: true })
  .then(() => console.log("Tablas sincronizadas con la base de datos"))
  .catch((err) => console.error("Error al sincronizar las tablas:", err));

app.use("/api", apiRouter);

const httpServer = app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

httpServer.on("error", (error) => console.log(`Error en servidor: ${error}`));
