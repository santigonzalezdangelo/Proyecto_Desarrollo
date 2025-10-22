// src/controllers/properties.controller.js
// src/controllers/properties.controller.js
import { 
  getFeaturedDAO, 
  getAvailableDAO, 
  getFiltersDAO       // 👈 agregalo acá
} from "../dao/properties.dao.js";


class PropertiesController {
  /**
   * 🏡 GET /api/properties/featured
   * Devuelve propiedades destacadas
   */
  async getFeaturedProperties(req, res) {
    try {
      const rows = await getFeaturedDAO();
      return res.json(rows);
    } catch (err) {
      console.error("getFeaturedProperties error:", err);
      return res.status(500).json({ error: "Error obteniendo propiedades destacadas" });
    }
  }

  async getFilters(req, res) {
    try {
      const data = await getFiltersDAO();
      res.json(data);
    } catch (err) {
      console.error("getFilters error:", err);
      res.status(500).json({ error: "Error obteniendo filtros" });
    }
  }


  /**
   * 🔍 GET /api/properties/available
   * Filtra propiedades disponibles según filtros.
   * (por ahora, el filtro de fechas puede no excluir reservas)
   */
  async getAvailableProperties(req, res) {
    try {
      const {
        fecha_inicio,
        fecha_fin,
        huespedes,
        id_localidad
      } = req.query;

      console.log("[Controller] getAvailableProperties query:", req.query);

      // Solo verificamos los mínimos necesarios
      if (!huespedes || !id_localidad) {
        return res.status(400).json({
          error: "Faltan parámetros mínimos",
          required: ["huespedes", "id_localidad"],
          received: req.query
        });
      }

      const data = await getAvailableDAO(req.query);
      return res.json(data);
    } catch (error) {
      console.error("getAvailableProperties error:", error);
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new PropertiesController();
