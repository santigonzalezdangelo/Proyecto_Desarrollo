// src/controllers/localidad.controller.js

import LocalidadDAO from '../dao/localidad.dao.js';

class LocalidadController {

  createLocalidad = async (req, res) => {
    try {
      // req.body será { nombre: "Bariloche" }
      const newLocalidad = await LocalidadDAO.createLocalidad(req.body); 
      res.status(201).json(newLocalidad);
    } catch (error) {
      res.status(500).json({ error: "Error creando localidad" });
    }
  };

  getAllLocalidades = async (req, res) => {
    try {
      const localidades = await LocalidadDAO.getAllLocalidades();
      res.status(200).json(localidades);
    } catch (error) {
      res.status(500).json({ error: "Error obteniendo localidades" });
    }
  };

  searchLocalidades = async (req, res) => {
    try {
      const q = String(req.query.q || "").trim();
      if (q.length < 1) return res.status(200).json([]);
      const rows = await LocalidadDAO.searchLocalidades(q);

      // Normalizamos al shape que espera el front:
      // { id_localidad, localidad, ciudad, pais }
      const out = rows.map(r => ({
        id_localidad: r.id_localidad ?? r.id ?? r.dataValues?.id_localidad,
        localidad: r.nombre ?? r.localidad ?? r.dataValues?.nombre ?? "",
        ciudad: r.ciudad ?? r.dataValues?.ciudad ?? "",   // si no hay columnas relacionadas, queda vacío
        pais: r.pais ?? r.dataValues?.pais ?? "",
      }));

      res.status(200).json(out);
    } catch (error) {
      console.error("Error buscando localidades:", error);
      res.status(500).json({ error: "Error buscando localidades" });
    }
  };
}



export default new LocalidadController();