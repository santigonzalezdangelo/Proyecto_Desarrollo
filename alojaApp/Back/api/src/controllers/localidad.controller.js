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
}

export default new LocalidadController();