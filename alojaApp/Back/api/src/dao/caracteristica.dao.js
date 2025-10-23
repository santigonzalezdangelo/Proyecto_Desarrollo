// import PostgresDAO from './postgres.dao.js';
// import { caracteristicaModel, caracteristicaPropiedadModel } from '../models/associations.js'; // Asumo que el modelo de característica existe

// class CaracteristicaDAO extends PostgresDAO {
//   constructor() {
//     super(caracteristicaModel);
//     this.caracteristicaPropiedadModel = caracteristicaPropiedadModel;
//   }
//   create = async (data) => { // Método para crear una característica (usa el método 'create' de Sequelize heredado/disponible)
//     try {
//       // Espera { nombre_caracteristica, nombre_categoria }
//       return await this.model.create(data);
//     } catch (error) {
//       console.error("Error creating characteristic:", error);
//       throw new Error(error);
//     }
//   };
//   getAll = async () => { // Método para obtener todas las características
//       try {
//           return await this.model.findAll();
//       } catch (error) {
//           console.error("Error fetching all characteristics:", error);
//           throw new Error(error);
//       }
//   };

//   // --- MÉTODOS PARA CARACTERISTICAS_PROPIEDAD ---

//   // Guardar/Actualizar un conjunto de características para una propiedad
//   setCaracteristicasForProperty = async (id_propiedad, caracteristicasArray) => {
//     try {
//       // 1. Eliminar todas las características existentes para esta propiedad
//       await this.caracteristicaPropiedadModel.destroy({ where: { id_propiedad } });

//       // 2. Insertar las nuevas características
//       const entriesToCreate = caracteristicasArray.map(carac => ({
//         id_propiedad: id_propiedad,
//         id_caracteristica: carac.id_caracteristica,
//         cantidad: Number(carac.cantidad) || 1 // Asegurar que sea un número
//       }));

//       if (entriesToCreate.length > 0) {
//         return await this.caracteristicaPropiedadModel.bulkCreate(entriesToCreate);
//       }
//       return [];

//     } catch (error) {
//       console.error("Error setting characteristics for property:", error);
//       throw new Error(error);
//     }
//   };

//   // Obtener características existentes de una propiedad (usado en modo edición)
//   getCaracteristicasByPropertyId = async (id_propiedad) => {
//     try {
//         return await this.caracteristicaPropiedadModel.findAll({
//             where: { id_propiedad },
//             // Incluir el nombre si es necesario para el front-end
//             // include: [{ model: this.model, attributes: ['nombre_caracteristica'] }]
//         });
//     } catch (error) {
//         console.error("Error fetching characteristics by property id:", error);
//         throw new Error(error);
//     }
//   };
// }

// export default new CaracteristicaDAO();

import PostgresDAO from "./postgres.dao.js";
import { sequelize } from "../config/db.js";
import {
  caracteristicaModel,
  caracteristicaPropiedadModel,
} from "../models/associations.js";

class CaracteristicaDAO extends PostgresDAO {
  constructor() {
    super(caracteristicaModel);
    this.caracteristicaPropiedadModel = caracteristicaPropiedadModel;
  }

  create = async (data) => {
    try {
      // { nombre_caracteristica, nombre_categoria, tipo_valor }
      return await this.model.create({
        nombre_caracteristica: String(data.nombre_caracteristica || "").trim(),
        nombre_categoria: data.nombre_categoria ?? null,
        tipo_valor: data.tipo_valor ?? "booleana",
      });
    } catch (error) {
      console.error("Error creating characteristic:", error);
      throw error;
    }
  };

  getAll = async () => {
    try {
      return await this.model.findAll({
        order: [
          ["nombre_categoria", "ASC"],
          ["nombre_caracteristica", "ASC"],
        ],
      });
    } catch (error) {
      console.error("Error fetching all characteristics:", error);
      throw error;
    }
  };

  /** ---------- NUEVO: catálogo + valores de una propiedad ---------- */
  getAllMergedForProperty = async (id_propiedad) => {
    try {
      const [catalog, values] = await Promise.all([
        this.model.findAll({
          raw: true,
          order: [
            ["nombre_categoria", "ASC"],
            ["nombre_caracteristica", "ASC"],
          ],
        }),
        this.caracteristicaPropiedadModel.findAll({
          where: { id_propiedad },
          raw: true,
        }),
      ]);

      const mapValues = new Map(values.map((v) => [v.id_caracteristica, v]));

      return catalog.map((c) => {
        const v = mapValues.get(c.id_caracteristica);
        const isBool = String(c.tipo_valor || "").toLowerCase() === "booleana";
        return {
          id_caracteristica: c.id_caracteristica,
          nombre_caracteristica: c.nombre_caracteristica,
          nombre_categoria: c.nombre_categoria || "Otros",
          tipo_valor: c.tipo_valor, // "booleana" | "numerica"
          checked: isBool ? Boolean(v) : null, // para checkbox
          cantidad: isBool ? (v ? v.cantidad ?? 1 : null) : v?.cantidad ?? null, // para input numérico
        };
      });
    } catch (error) {
      console.error("Error merging characteristics:", error);
      throw error;
    }
  };

  /** ---------- NUEVO: guarda todo de una para una propiedad ---------- */
  setForProperty = async (id_propiedad, items = []) => {
    return await sequelize.transaction(async (t) => {
      // borrado total → “estado fuente de verdad” es el payload que llega
      await this.caracteristicaPropiedadModel.destroy({
        where: { id_propiedad },
        transaction: t,
      });

      const rows = [];
      for (const it of items) {
        const tipo = String(it.tipo_valor || "").toLowerCase();
        if (tipo === "booleana") {
          if (it.checked === true) {
            rows.push({
              id_propiedad,
              id_caracteristica: it.id_caracteristica,
              cantidad: 1, // presencia = true
            });
          }
        } else {
          const cant = Number(it.cantidad);
          if (Number.isFinite(cant) && cant > 0) {
            rows.push({
              id_propiedad,
              id_caracteristica: it.id_caracteristica,
              cantidad: cant,
            });
          }
        }
      }

      if (rows.length === 0) return [];
      return await this.caracteristicaPropiedadModel.bulkCreate(rows, {
        transaction: t,
      });
    });
  };

  /** Mantengo tu método por compatibilidad, redirige al nuevo */
  setCaracteristicasForProperty = async (
    id_propiedad,
    caracteristicasArray
  ) => {
    return this.setForProperty(id_propiedad, caracteristicasArray);
  };

  getCaracteristicasByPropertyId = async (id_propiedad) => {
    try {
      return await this.caracteristicaPropiedadModel.findAll({
        where: { id_propiedad },
      });
    } catch (error) {
      console.error("Error fetching characteristics by property id:", error);
      throw error;
    }
  };
}

export default new CaracteristicaDAO();
