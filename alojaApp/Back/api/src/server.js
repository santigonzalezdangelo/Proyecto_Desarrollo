const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { pool } = require("./db");
const bcrypt = require("bcrypt");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API funcionando 🚀" });
});

// Endpoint de prueba - lista usuarios
app.get("/usuarios", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id_usuario,
        p.nombre,
        p.apellido,
        u.correo
      FROM usuario u
      JOIN persona p ON u.id_persona = p.id_persona
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al consultar usuarios" });
  }
});


app.post("/usuarios", async (req, res) => {
  const { nombre, apellido, dni, calle, numero, id_localidad, correo, contrasenia, id_tipo_usuario } = req.body;

  console.log("Body recibido:", req.body);
  // Validaciones básicas
  if (!nombre || !apellido || !dni || !calle || !numero || !id_localidad || !correo || !contrasenia || !id_tipo_usuario) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  // Podés ajustar el número de salt rounds según seguridad/tiempo
  const saltRounds = 10;

  try {
    // Empezamos transaction
    await pool.query("BEGIN");

    // 1) Verificar que no exista un usuario con ese correo
    const existing = await pool.query(
      `SELECT id_usuario FROM usuario WHERE correo = $1`,
      [correo]
    );

    if (existing.rowCount > 0) {
      await pool.query("ROLLBACK");
      return res.status(409).json({ error: "Ya existe un usuario con ese correo" });
    }

    // 2) Insertar en persona
    const personaResult = await pool.query(
      `INSERT INTO persona (nombre, apellido, dni, calle, numero, id_localidad)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id_persona`,
      [nombre, apellido, dni, calle, numero, id_localidad]
    );

    const id_persona = personaResult.rows[0].id_persona;

    // 3) Hashear la contraseña
    const hashed = await bcrypt.hash(contrasenia, saltRounds);

    // 4) Insertar en usuario (guardo la contrasenia hasheada)
    const usuarioResult = await pool.query(
      `INSERT INTO usuario (id_persona, correo, contrasenia, id_tipo_usuario)
       VALUES ($1, $2, $3, $4)
       RETURNING id_usuario, correo, id_persona`,
      [id_persona, correo, hashed, id_tipo_usuario]
    );

    await pool.query("COMMIT");

    // No devolvemos la contraseña (ni siquiera la hasheada)
    res.status(201).json({
      message: "Usuario registrado con éxito",
      usuario: usuarioResult.rows[0],
    });
  } catch (error) {
    await pool.query("ROLLBACK");

    // Manejo especial si la BD lanza unique violation (por si no chequeaste antes)
    if (error.code === "23505") {
      return res.status(409).json({ error: "Correo ya registrado" });
    }

    console.error("Error en POST /usuarios:", error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

app.post("/reservas", async (req, res) => {
  const { id_usuario, id_propiedad, fecha_inicio, fecha_fin, cantidad_de_dias, precio_final, id_comision } = req.body;

  console.log("Body recibido:", req.body);
  // Validaciones básicas
  if (!id_usuario || !id_propiedad || !fecha_inicio || !fecha_fin || !cantidad_de_dias || !precio_final || !id_comision ) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

    try {
    // Empezamos transaction
    await pool.query("BEGIN");

    const reservaResult = await pool.query(
      `INSERT INTO reserva (id_usuario, id_propiedad, fecha_inicio, fecha_fin, cantidad_de_dias, precio_final, id_comision)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id_reserva`,
      [id_usuario, id_propiedad, fecha_inicio, fecha_fin, cantidad_de_dias, precio_final, id_comision]
    );

    await pool.query("COMMIT");

    // No devolvemos la contraseña (ni siquiera la hasheada)
    res.status(201).json({
      message: "Reserva registrada con éxito",
      reserva: reservaResult.rows[0],
    });
  } catch (error) {
    await pool.query("ROLLBACK");

    console.error("Error en POST /reservas:", error);
    res.status(500).json({ error: "Error al registrar reserva" });
  }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
