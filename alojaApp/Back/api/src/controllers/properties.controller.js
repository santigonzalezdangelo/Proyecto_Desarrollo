// src/controllers/properties.controller.js
import { getFeaturedDAO, getAvailableDAO } from "../dao/properties.dao.js";

class PropertiesController {
  async getFeaturedProperties(req, res) {
    try {
      const rows = await getFeaturedDAO();
      res.json(rows);
    } catch (err) {
      console.error("getFeaturedProperties error:", err);
      res.status(500).json({ error: "Error obteniendo propiedades destacadas" });
    }
  }

  // controllers/properties.controller.js
async getAvailableProperties(req, res) {
  try {
    const {
      fecha_inicio,
      fecha_fin,
      huespedes,
      id_localidad,
      precio_max,          // básico opcional

      // AVANZADOS (opcionales)
      id_tipo_propiedad,
      precio_min,
      rating_min,
      amenities,           // CSV: "1,2,5"
      order_by,            // "precio_asc" | "precio_desc" | "rating_desc"
    } = req.query;

    // misma validación mínima que hoy
    if (!fecha_inicio || !fecha_fin || !huespedes || !id_localidad) {
      return res.status(400).json({error: "Faltan parámetros obligatorios",
          required: ["fecha_inicio", "fecha_fin", "huespedes", "id_localidad"],
          received: req.query,});
    }

    const rows = await getAvailableDAO({
      fecha_inicio,
      fecha_fin,
      huespedes: Number(huespedes),
      id_localidad: Number(id_localidad),
      precio_max: precio_max ? Number(precio_max) : undefined,

      // pasar opcionales si llegan
      id_tipo_propiedad: id_tipo_propiedad ? Number(id_tipo_propiedad) : undefined,
      precio_min: precio_min ? Number(precio_min) : undefined,
      rating_min: rating_min ? Number(rating_min) : undefined,
      amenities: amenities ? amenities.split(",").map((n) => Number(n)) : undefined,
      order_by: order_by || undefined,
    });

    res.json(rows);
  } catch (err) {
    console.error("getAvailableProperties error:", err);
    res.status(500).json({ error: "Error obteniendo propiedades disponibles" });
  }
}

}

export default new PropertiesController();
