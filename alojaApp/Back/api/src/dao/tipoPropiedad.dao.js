// src/dao/tipoPropiedad.dao.js

import tipoPropiedadModel from '../models/tipoPropiedad.model.js';
import PostgresDAO from './postgres.dao.js';

class TipoPropiedadDAO extends PostgresDAO {
  constructor() {
    super(tipoPropiedadModel);
  }

  createTipo = async (data) => {
    try {
      // data será { nombre: "Cabaña" }
      return await this.model.create(data); 
    } catch (error) {
        console.error("Error creating tipo:", error);
        throw new Error(error);
    }
  };

  getAllTipos = async () => {
    try {
      return await this.model.findAll();
    } catch (error) {
        console.error("Error fetching tipos:", error);
        throw new Error(error);
    }
  };
}

export default new TipoPropiedadDAO();