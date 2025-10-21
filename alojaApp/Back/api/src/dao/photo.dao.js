import PostgresDAO from "./postgres.dao.js";
import { photoModel } from "../models/associations.js";

class PhotoDAO extends PostgresDAO {
  constructor() {
    super(photoModel);
  }

  // --- MÉTODO RENOMBRADO ---
  createPropertyPhoto = async (data) => {
    try {
      if (Array.isArray(data)) {
        // Si 'data' es un array (múltiples fotos), usamos bulkCreate.
        return await this.model.bulkCreate(data);
      }
      // Si es un solo objeto, usamos el create normal.
      return await this.model.create(data);
    } catch (error) {
      console.error("Error creating photo data:", error);
      throw new Error(error);
    }
  };
    // --- MÉTODO DELETEBYID (FALTANTE) ---
  deletePropertyPhotoById = async (id_foto) => {
    try {
        return await this.model.destroy({ where: { id_foto: id_foto } });
    } catch (error) {
        console.error("Error deleting photo by id:", error);
        throw new Error(error);
    }
  };
    // --- MÉTODO FINDBYID FALTANTE ---
  findById = async (id_foto) => {
    try {
      // findByPk busca por la clave primaria definida en el modelo
      return await this.model.findByPk(id_foto);
    } catch (error) {
      console.error("Error fetching photo by id:", error);
      throw new Error(error);
    }
  };

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
  
  // Obtener la foto principal de una propiedad
  getPrincipalByPropertyId = async (id_propiedad) => {
    try {
      return await this.model.findOne({
        where: { id_propiedad, principal: true },
        attributes: ['id_foto'], // solo traemos el id
      });
    } catch (error) {
      console.error("Error fetching principal photo:", error);
      throw new Error(error);
    }
  };
}

export default new PhotoDAO();

