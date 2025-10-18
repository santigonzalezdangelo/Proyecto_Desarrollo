import PostgresDAO from "./postgres.dao.js";
import { photoModel } from "../models/associations.js";

class PhotoDAO extends PostgresDAO {
  constructor() {
    super(photoModel);
  }

  // 🔍 Obtener todas las fotos de una propiedad específica
  getByPropertyId = async (id_propiedad) => {
    try {
      return await this.model.findAll({ where: { id_propiedad } });
    } catch (error) {
      console.error("Error fetching photos by property id:", error);
      throw new Error(error);
    }
  };

  // 🔄 Marcar una foto como principal
  setPrincipal = async (id_foto, id_propiedad) => {
    try {
      // Primero desmarcamos cualquier otra principal de esa propiedad
      await this.model.update(
        { principal: false },
        { where: { id_propiedad } }
      );

      // Luego marcamos esta como principal
      return await this.model.update(
        { principal: true },
        { where: { id_foto } }
      );
    } catch (error) {
      console.error("Error setting photo as principal:", error);
      throw new Error(error);
    }
  };
}

export default new PhotoDAO();
