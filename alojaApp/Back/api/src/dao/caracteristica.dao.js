import PostgresDAO from './postgres.dao.js';
import { caracteristicaModel, caracteristicaPropiedadModel } from '../models/associations.js'; // Asumo que el modelo de característica existe

class CaracteristicaDAO extends PostgresDAO {
  constructor() {
    super(caracteristicaModel);
    this.caracteristicaPropiedadModel = caracteristicaPropiedadModel;
  }
  create = async (data) => { // Método para crear una característica (usa el método 'create' de Sequelize heredado/disponible)
    try {
      // Espera { nombre_caracteristica, nombre_categoria }
      return await this.model.create(data);
    } catch (error) {
      console.error("Error creating characteristic:", error);
      throw new Error(error);
    }
  };
  getAll = async () => { // Método para obtener todas las características
      try {
          return await this.model.findAll();
      } catch (error) {
          console.error("Error fetching all characteristics:", error);
          throw new Error(error);
      }
  };


  // --- MÉTODOS PARA CARACTERISTICAS_PROPIEDAD ---
  
  // Guardar/Actualizar un conjunto de características para una propiedad
  setCaracteristicasForProperty = async (id_propiedad, caracteristicasArray) => {
    try {
      // 1. Eliminar todas las características existentes para esta propiedad
      await this.caracteristicaPropiedadModel.destroy({ where: { id_propiedad } });
      
      // 2. Insertar las nuevas características
      const entriesToCreate = caracteristicasArray.map(carac => ({
        id_propiedad: id_propiedad,
        id_caracteristica: carac.id_caracteristica,
        cantidad: Number(carac.cantidad) || 1 // Asegurar que sea un número
      }));

      if (entriesToCreate.length > 0) {
        return await this.caracteristicaPropiedadModel.bulkCreate(entriesToCreate);
      }
      return [];

    } catch (error) {
      console.error("Error setting characteristics for property:", error);
      throw new Error(error);
    }
  };

  // Obtener características existentes de una propiedad (usado en modo edición)
  getCaracteristicasByPropertyId = async (id_propiedad) => {
    try {
        return await this.caracteristicaPropiedadModel.findAll({
            where: { id_propiedad },
            // Incluir el nombre si es necesario para el front-end
            // include: [{ model: this.model, attributes: ['nombre_caracteristica'] }] 
        });
    } catch (error) {
        console.error("Error fetching characteristics by property id:", error);
        throw new Error(error);
    }
  };
}

export default new CaracteristicaDAO();