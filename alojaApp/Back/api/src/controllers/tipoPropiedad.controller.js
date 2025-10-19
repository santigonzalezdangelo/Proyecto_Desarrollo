// src/controllers/tipoPropiedad.controller.js

import TipoPropiedadDAO from '../dao/tipoPropiedad.dao.js';

class TipoPropiedadController {

  createTipo = async (req, res) => {
    try {
      // req.body será { nombre: "Cabaña" }
      const newTipo = await TipoPropiedadDAO.createTipo(req.body); 
      res.status(201).json(newTipo);
    } catch (error) {
      res.status(500).json({ error: "Error creando tipo de propiedad" });
    }
  };

  getAllTipos = async (req, res) => {
    try {
      const tipos = await TipoPropiedadDAO.getAllTipos();
      res.status(200).json(tipos);
    } catch (error) {
      res.status(500).json({ error: "Error obteniendo tipos de propiedad" });
    }
  };
}

export default new TipoPropiedadController();