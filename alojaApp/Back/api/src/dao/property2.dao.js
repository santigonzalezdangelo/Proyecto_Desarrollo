import PostgresDAO from "./postgres.dao.js";
import {
  propertyModel,
  photoModel,
  userModel,
  typePropertyModel,
  localidadModel,
  ciudadModel,
  paisModel,
  reservationModel,
} from "../models/associations.js";
import ratingPropertyModel from "../models/ratingProperty.model.js";
import { Op } from "sequelize";


/**
 * DAO para la entidad Propiedad
 * Gestiona todas las operaciones relacionadas con propiedades y sus asociaciones
 */
class PropertyDAO extends PostgresDAO {
  constructor() {
    super(propertyModel);
  }

  /**
   * Obtener todas las propiedades con sus fotos
   */
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
      return await this.model.findByPk(id, {
        include: [
          // 📸 Fotos
          { model: photoModel, as: "fotos" },

          // 🏡 Tipo de propiedad
          { model: typePropertyModel, as: "tipo" },

          // 👤 Anfitrión
          {
            model: userModel,
            as: "anfitrion",
            attributes: ["nombre", "apellido", "correo"],
          },

          // 🌍 Localidad → Ciudad → País
          {
            model: localidadModel,
            as: "localidad",
            include: {
              model: ciudadModel,
              as: "ciudad",
              include: { model: paisModel, as: "pais" },
            },
          },

          // 📅 Reservas → Calificaciones
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
            attributes: ["nombre_localidad"],
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
        const calificaciones = p.reservas?.map((r) => r.calificacion?.puntuacion).filter(Boolean);
        const ratingPromedio =
          calificaciones.length > 0
            ? (calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length).toFixed(1)
            : 0;

        return {
          id_propiedad: p.id_propiedad,
          imagen_url: p.fotos?.[0]?.url_foto || null,
          titulo: p.descripcion.slice(0, 40) + "...",
          subtitulo: `${p.localidad?.nombre_localidad ?? ""}, ${p.localidad?.ciudad?.nombre_ciudad ?? ""}`,
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
