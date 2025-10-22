// src/dao/localidad.dao.js

import localidadModel from '../models/localidad.model.js';
import PostgresDAO from './postgres.dao.js';
import { Op } from 'sequelize';

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

  searchLocalidades = async (q) => {
    try {
      const term = String(q).trim();
      // Para Postgres: ILIKE. Si usaras otra DB, [Op.substring] también funciona.
      return await this.model.findAll({
        where: {
          nombre: { [Op.iLike]: `${term}%` }, // o `%${term}%` si querés contains
        },
        order: [['nombre', 'ASC']],
        limit: 10,
      });
    } catch (error) {
      console.error("Error searching localidades:", error);
      throw new Error(error);
    }
  };
}

export default new LocalidadDAO();