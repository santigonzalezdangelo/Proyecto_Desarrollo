// controllers/properties.controller.js
import { getFeaturedDAO, getAvailableDAO } from "../dao/properties.dao.js";

export async function getFeaturedProperties(req, res) {
  try {
    const rows = await getFeaturedDAO();
    res.json(rows);
  } catch (err) {
    console.error("getFeaturedProperties error:", err);
    res.status(500).json({ error: "Error obteniendo propiedades destacadas" });
  }
}

export async function getAvailableProperties(req, res) {
  try {
    const {
      fecha_inicio,
      fecha_fin,
      huespedes,
      id_localidad,
      precio_max,
    } = req.query;

    // Validación mínima (igual que en tu Home)
    if (!fecha_inicio || !fecha_fin || !huespedes || !id_localidad) {
      return res.status(400).json({
        error: "Faltan parámetros obligatorios",
        required: ["fecha_inicio", "fecha_fin", "huespedes", "id_localidad"],
        received: req.query,
      });
    }

    const rows = await getAvailableDAO({
      fecha_inicio,
      fecha_fin,
      huespedes: Number(huespedes),
      id_localidad: Number(id_localidad),
      precio_max: precio_max ? Number(precio_max) : undefined,
    });

    res.json(rows);
  } catch (err) {
    console.error("getAvailableProperties error:", err);
    res.status(500).json({ error: "Error obteniendo propiedades disponibles" });
  }
}
