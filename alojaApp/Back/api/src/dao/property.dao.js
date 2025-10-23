import PostgresDAO from "./postgres.dao.js";

import {
  propertyModel,
  photoModel,
  userModel,
  tipoPropiedadModel,
  localidadModel,
  ciudadModel,
  paisModel,
  reservationModel,
  ratingPropertyModel,
  caracteristicaModel,
  caracteristicaPropiedadModel,
} from "../models/associations.js";

import { Op } from "sequelize";

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
          { model: tipoPropiedadModel, as: "tipoPropiedad" },
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
          { model: tipoPropiedadModel, as: "tipoPropiedad" },
        ],
      });
    } catch (error) {
      console.error("Error fetching property by id:", error);
      throw new Error(error);
    }
  };

  // --- Métodos Privados (Anfitrión) (CORREGIDOS) ---

  // Encuentra todas las propiedades de un anfitrión con sus asociaciones y estado calculado
  findAllByAnfitrion = async (anfitrionId) => {
    try {
      const properties = await this.model.findAll({
        where: { id_anfitrion: anfitrionId },
        include: [
          { model: photoModel, as: "fotos" },
          { model: localidadModel, as: "localidad" },
          { model: tipoPropiedadModel, as: "tipoPropiedad" },
        ],
      });

      // Calcular el estado basado en las reservas activas
      const propertiesWithStatus = properties.map(property => {
        const hasActiveReservation = property.reservas && property.reservas.length > 0;
        const estado_publicacion = hasActiveReservation ? 'RESERVADO' : 'DISPONIBLE';
        
        return {
          ...property.toJSON(),
          estado_publicacion
        };
      });

      return propertiesWithStatus;
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
  // createPropertyWithAssociation = async (data, anfitrionId) => {
  //   try {
  //     const propertyData = {
  //       ...data,
  //       id_anfitrion: anfitrionId,
  //     };
  //     const newProperty = await this.model.create(propertyData);

  //     // Volvemos a buscar la propiedad recién creada para obtener las asociaciones
  //     return await this.getByIdWithPhotos(newProperty.id_propiedad);
  //   } catch (error) {
  //     console.error('Error al crear una propiedad para un anfitrion:', error);
  //     throw new Error(error);
  //   }
  // };

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
      console.error("Error al crear una propiedad para un anfitrion:", error);
      throw new Error(error);
    }
  };

  // Este método está bien, no necesita cambios
  deleteById = async (id) => {
    try {
      return await this.model.destroy({
        where: { id_propiedad: id },
      });
    } catch (error) {
      console.error("Error deleting property:", error);
      throw new Error(error);
    }
  };

  // Este método está bien, no necesita cambios
  updateById = async (id, data) => {
    try {
      const [rowsUpdated, updatedRows] = await this.model.update(data, {
        where: { id_propiedad: id },
        returning: true,
      });
      if (rowsUpdated === 0) {
        throw new Error("Property not found for update");
      }
      return updatedRows[0];
    } catch (error) {
      console.error("Error updating data:", error);
      throw new Error("Database error during update");
    }
  };

  //SANTI
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

  /**
   * Obtener una propiedad específica por ID con sus fotos
   */
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

  /**
   * Obtener una propiedad completa con:
   * - Fotos
   * - Tipo
   * - Localidad → Ciudad → País
   * - Anfitrión (usuario)
   * - Calificaciones (a través de reservas)
   */
  getFullById = async (id) => {
    try {
      const result = await this.model.findByPk(id, {
        include: [
          { model: photoModel, as: "fotos" },
          { model: tipoPropiedadModel, as: "tipoPropiedad" },
          {
            model: userModel,
            as: "anfitrion",
            attributes: ["nombre", "apellido", "correo"],
          },
          {
            model: localidadModel,
            as: "localidad",
            include: {
              model: ciudadModel,
              as: "ciudad",
              include: { model: paisModel, as: "pais" },
            },
          },
          {
            model: caracteristicaPropiedadModel,
            as: "caracteristicas_propiedad",
            include: {
              model: caracteristicaModel,
              attributes: ["nombre_caracteristica", "nombre_categoria"],
            },
          },
          {
            model: reservationModel,
            as: "reservas",
            include: [
              {
                model: ratingPropertyModel,
                as: "calificacion",
              },
            ],
          },
        ],
      });
      
      
      return result;
    } catch (error) {
      console.error("Error fetching full property with relations:", error);
      throw new Error(error);
    }
  };

  // 📦 src/dao/property.dao.js
  getFeaturedProperties = async (limit = 4, excludeId = null) => {
    try {
      const whereClause = excludeId
        ? { id_propiedad: { [Op.ne]: excludeId } } // excluir la propiedad actual
        : {};

      const properties = await this.model.findAll({
        where: whereClause,
        limit,
        order: [["id_propiedad", "ASC"]],
        attributes: ["id_propiedad", "descripcion", "precio_por_noche"],
        include: [
          {
            model: photoModel,
            as: "fotos",
            attributes: ["url_foto", "principal"],
            where: { principal: true },
            required: false,
          },
          {
            model: localidadModel,
            as: "localidad",
            attributes: ["nombre"],
            include: [
              {
                model: ciudadModel,
                as: "ciudad",
                attributes: ["nombre_ciudad"],
              },
            ],
          },
          {
            model: reservationModel,
            as: "reservas",
            include: [
              {
                model: ratingPropertyModel,
                as: "calificacion",
                attributes: ["puntuacion"],
              },
            ],
          },
        ],
      });

      const mapped = properties.map((p) => {
        const calificaciones = p.reservas
          ?.map((r) => r.calificacion?.puntuacion)
          .filter(Boolean);
        const ratingPromedio =
          calificaciones.length > 0
            ? (
                calificaciones.reduce((a, b) => a + b, 0) /
                calificaciones.length
              ).toFixed(1)
            : 0;

        return {
          id_propiedad: p.id_propiedad,
          imagen_url: p.fotos?.[0]?.url_foto || null,
          titulo: p.descripcion.slice(0, 40) + "...",
          subtitulo: `${p.localidad?.nombre ?? ""}, ${
            p.localidad?.ciudad?.nombre_ciudad ?? ""
          }`,
          rating: Number(ratingPromedio),
        };
      });

      return mapped;
    } catch (error) {
      console.error("Error fetching featured properties:", error);
      throw new Error(error);
    }
  };
}

export default new PropertyDAO();
