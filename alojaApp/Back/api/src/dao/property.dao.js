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

  // Crea una nueva propiedad asignada al anfitrión
  createForAnfitrion = async (data, anfitrionId) => {
    try {
      const propertyData = {
        ...data,
        id_anfitrion: anfitrionId,
      };
      return await this.model.create(propertyData);
    } catch (error) {
      console.error("Error creating property for anfitrion:", error);
      throw new Error(error);
    }
  };
}

export default new PropertyDAO();