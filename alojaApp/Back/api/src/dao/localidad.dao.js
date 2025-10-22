// src/dao/localidad.dao.js
import localidadModel from "../models/localidad.model.js";
import PostgresDAO from "./postgres.dao.js";
import { sequelize } from "../config/db.js";

class LocalidadDAO extends PostgresDAO {
  constructor() {
    super(localidadModel);
  }

  /**
   * Crea una nueva localidad
   * @param {Object} data - { nombre: "Bariloche" }
   */
  createLocalidad = async (data) => {
    try {
      return await this.model.create(data);
    } catch (error) {
      console.error("Error creating localidad:", error);
      throw new Error("Error al crear la localidad");
    }
  };

  /**
   * Devuelve todas las localidades (básico)
   */
  getAllLocalidades = async () => {
    try {
      return await this.model.findAll({
        attributes: ["id_localidad", "nombre"],
        order: [["nombre", "ASC"]],
      });
    } catch (error) {
      console.error("Error fetching localidades:", error);
      throw new Error("Error al obtener las localidades");
    }
  };

  /**
   * 🔎 Busca localidades por nombre (para autocompletar)
   * GET /api/localidades/search?q=texto
   */
  searchLocalidades = async (q) => {
    try {
      if (!q || !q.trim()) {
        throw new Error("Parámetro de búsqueda vacío");
      }

      const [rows] = await sequelize.query(
        `
        SELECT 
          l.id_localidad,
          l.nombre AS nombre,
          c.nombre_ciudad AS ciudad,
          p.nombre_pais AS pais
        FROM localidades l
        JOIN ciudades c ON l.id_ciudad = c.id_ciudad
        JOIN paises p   ON c.id_pais   = p.id_pais
        WHERE LOWER(l.nombre) LIKE LOWER(:pattern)
        ORDER BY l.nombre
        LIMIT 10;
        `,
        {
          replacements: { pattern: `%${q}%` },
        }
      );

      return rows;
    } catch (error) {
      console.error("Error searching localidades:", error);
      throw new Error("Error al buscar localidades");
    }
  };
}

export default new LocalidadDAO();
