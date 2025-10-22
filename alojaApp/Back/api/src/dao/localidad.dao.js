// src/dao/localidad.dao.js

import localidadModel from '../models/localidad.model.js';
import ciudadModel from '../models/ciudad.model.js';     // 👈 importar
import paisModel from '../models/pais.model.js'; 
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

      return await this.model.findAll({
        where: {
          // empieza por... (usá `%${term}%` si preferís contains)
          nombre: { [Op.iLike]: `${term}%` },
        },
        include: [
          {
            model: ciudadModel,
            as: 'ciudad',
            attributes: ['id_ciudad', 'nombre_ciudad'],    // ajustá a tus nombres
            include: [
              {
                model: paisModel,
                as: 'pais',
                attributes: ['id_pais', 'nombre_pais'],     // ajustá a tus nombres
              },
            ],
          },
        ],
        order: [['nombre', 'ASC']],
        limit: 10,
      });
    } catch (error) {
      console.error('Error searching localidades:', error);
      throw new Error(error);
    }
  };
}

export default new LocalidadDAO();