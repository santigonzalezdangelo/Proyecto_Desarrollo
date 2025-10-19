// src/dao/localidad.dao.js

import localidadModel from '../models/localidad.model.js';
import PostgresDAO from './postgres.dao.js';

class LocalidadDAO extends PostgresDAO {
  constructor() {
    super(localidadModel);
  }

  createLocalidad = async (data) => {
    try {
      // data será { nombre: "Bariloche" }
      return await this.model.create(data); 
    } catch (error) {
        console.error("Error creating localidad:", error);
        throw new Error(error);
    }
  };

  getAllLocalidades = async () => {
    try {
      return await this.model.findAll();
    } catch (error) {
        console.error("Error fetching localidades:", error);
        throw new Error(error);
    }
  };
}

export default new LocalidadDAO();