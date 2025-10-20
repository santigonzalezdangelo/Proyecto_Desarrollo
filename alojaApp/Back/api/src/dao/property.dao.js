  import PostgresDAO from "./postgres.dao.js";
  import { propertyModel, photoModel } from "../models/associations.js";

  class PropertyDAO extends PostgresDAO {
    constructor() {
      super(propertyModel);
    }

    // --- Métodos Públicos ---

    // Obtener todas las propiedades con sus fotos
    getAllWithPhotos = async () => {
      try {
        return await this.model.findAll({
          include: [{ model: photoModel, as: "fotos" }],
        });
      } catch (error) {
        console.error("Error fetching properties with photos:", error);
        throw new Error(error);
      }
    };

    // Obtener una propiedad específica por ID con sus fotos
    getByIdWithPhotos = async (id) => {
      try {
        return await this.model.findByPk(id, {
          include: [{ model: photoModel, as: "fotos" }],
        });
      } catch (error) {
        console.error("Error fetching property by id:", error);
        throw new Error(error);
      }
    };

    // --- Métodos Privados (para el panel del Anfitrión) ---

    // Encuentra todas las propiedades de un anfitrión específico
    findAllByAnfitrion = async (anfitrionId) => {
      try {
        return await this.model.findAll({
          where: { id_anfitrion: anfitrionId },
          include: [{ model: photoModel, as: "fotos" }],
        });
      } catch (error) {
        console.error("Error fetching properties by anfitrion:", error);
        throw new Error(error);
      }
    };

    // Encuentra una propiedad, solo si pertenece al anfitrión (para seguridad)
    findByIdAndAnfitrion = async (propiedadId, anfitrionId) => {
      try {
        return await this.model.findOne({
          where: {
            id_propiedad: propiedadId,
            id_anfitrion: anfitrionId,
          },
        });
      } catch (error) {
        console.error("Error fetching property by id and anfitrion:", error);
        throw new Error(error);
      }
    };

    // createPropertyWithAssociation = async (data, anfitrionId) => {
    //   try {
    //     return await this.createWithAssociation('userModel', anfitrionId, 'properties', data);
    //   } catch (error) {
    //     console.error('Error al crear una propiedad para un anfitrion:', error);
    //     throw new Error(error);
    //   }
    // };
    createPropertyWithAssociation = async (data, anfitrionId) => {
      try {
        const propertyData = {
          ...data,
          id_anfitrion: anfitrionId 
        };
        return await this.model.create(propertyData);
      } catch (error) {
        console.error('Error al crear una propiedad para un anfitrion:', error);
        throw new Error(error);
      }
    };
    deleteById = async (id) => {
      try {
        return await this.model.destroy({
          where: { id_propiedad: id } // <-- ¡USA LA COLUMNA CORRECTA!
        });
      } catch (error) {
        console.error("Error deleting property:", error);
        throw new Error(error);
      }
    };
    updateById = async (id, data) => {
      try {
        const [updated] = await this.model.update(data, {
          where: { id_propiedad: id }, // <-- ¡USA LA COLUMNA CORRECTA!
        });
        if (!updated) throw new Error("Id not found");

        // findByPk(id) funciona bien porque sequelize sabe
        // que 'id' se refiere a la Primary Key 'id_propiedad'
        return [updated]; 
      } catch (error) {
        console.error("Error updating data:", error);
        throw new Error(error);
      }
    }
  }
  

export default new PropertyDAO();