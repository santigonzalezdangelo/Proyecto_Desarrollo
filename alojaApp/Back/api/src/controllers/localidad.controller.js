// src/controllers/localidad.controller.js
import LocalidadDAO from "../dao/localidad.dao.js";

class LocalidadController {
  createLocalidad = async (req, res) => {
    try {
      const newLocalidad = await LocalidadDAO.createLocalidad(req.body);
      res.status(201).json(newLocalidad);
    } catch (error) {
      console.error("Error creando localidad:", error);
      res.status(500).json({ error: "Error creando localidad" });
    }
  };

  getAllLocalidades = async (req, res) => {
    try {
      const localidades = await LocalidadDAO.getAllLocalidades();
      res.status(200).json(localidades);
    } catch (error) {
      console.error("Error obteniendo localidades:", error);
      res.status(500).json({ error: "Error obteniendo localidades" });
    }
  };

  search = async (req, res) => {
    try {
      const q = req.query.q?.trim();
      if (!q) {
        return res.status(400).json({ error: "Parámetro q requerido" });
      }

      const localidades = await LocalidadDAO.searchLocalidades(q);
      res.status(200).json(localidades);
    } catch (error) {
      console.error("Error al buscar localidades:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };
}

export default new LocalidadController();
