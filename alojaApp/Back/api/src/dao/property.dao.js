import PostgresDAO from "./postgres.dao.js";
import { propertyModel, photoModel } from "../models/associations.js";

class PropertyDAO extends PostgresDAO {
  constructor() {
    super(propertyModel);
  }

  // 🔍 Obtener todas las propiedades con sus fotos asociadas
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

  // 🔍 Obtener una propiedad específica con sus fotos
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
}

export default new PropertyDAO();
