import PostgresDAO from "./postgres.dao.js";
import { propertyModel, photoModel, localidadModel, tipoPropiedadModel } from "../models/associations.js";

class PropertyDAO extends PostgresDAO {
  constructor() {
    super(propertyModel);
  }

  // --- Métodos Públicos (CORREGIDOS) ---

  // Obtener todas las propiedades con sus asociaciones
  getAllWithPhotos = async () => {
    try {
      return await this.model.findAll({
        include: [
            { model: photoModel, as: "fotos" },
            { model: localidadModel, as: "localidad" },
            { model: tipoPropiedadModel, as: "tipoPropiedad" }
        ],
      });
    } catch (error) {
      console.error("Error fetching properties with photos:", error);
      throw new Error(error);
    }
  };

  // Obtener una propiedad específica por ID con sus asociaciones
  getByIdWithPhotos = async (id) => {
    try {
      return await this.model.findByPk(id, {
        include: [
            { model: photoModel, as: "fotos" },
            { model: localidadModel, as: "localidad" },
            { model: tipoPropiedadModel, as: "tipoPropiedad" }
        ],
      });
    } catch (error) {
      console.error("Error fetching property by id:", error);
      throw new Error(error);
    }
  };

  // --- Métodos Privados (Anfitrión) (CORREGIDOS) ---

  // Encuentra todas las propiedades de un anfitrión con sus asociaciones
  findAllByAnfitrion = async (anfitrionId) => {
    try {
      return await this.model.findAll({
        where: { id_anfitrion: anfitrionId },
        include: [
            { model: photoModel, as: "fotos" },
            { model: localidadModel, as: "localidad" },
            { model: tipoPropiedadModel, as: "tipoPropiedad" }
        ],
      });
    } catch (error) {
      console.error("Error fetching properties by anfitrion:", error);
      throw new Error(error);
    }
  };

  // Encuentra una propiedad, solo si pertenece al anfitrión (no necesita 'include')
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

  // Crea una propiedad y la devuelve con sus asociaciones
  createPropertyWithAssociation = async (data, anfitrionId) => {
    try {
      const propertyData = {
        ...data,
        id_anfitrion: anfitrionId,
      };
      const newProperty = await this.model.create(propertyData);
      
      // Volvemos a buscar la propiedad recién creada para obtener las asociaciones
      return await this.getByIdWithPhotos(newProperty.id_propiedad);

    } catch (error) {
      console.error('Error al crear una propiedad para un anfitrion:', error);
      throw new Error(error);
    }
  };

  // Este método está bien, no necesita cambios
  deleteById = async (id) => {
    try {
      return await this.model.destroy({
        where: { id_propiedad: id }
      });
    } catch (error) {
      console.error("Error deleting property:", error);
      throw new Error(error);
    }
  };

  // Este método está bien, no necesita cambios
  updateById = async (id, data) => {
    try {
      const [updated] = await this.model.update(data, {
        where: { id_propiedad: id },
      });
      if (!updated) throw new Error("Id not found");
      return [updated]; 
    } catch (error) {
      console.error("Error updating data:", error);
      throw new Error(error);
    }
  }
}

export default new PropertyDAO();

