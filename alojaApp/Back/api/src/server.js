const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { pool } = require("./db");

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
    const result = await pool.query("SELECT id_usuario, nombre, apellido, correo FROM usuario");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al consultar usuarios" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
