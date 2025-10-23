import {
  propertyModel as Propiedad,
  localidadModel as Localidad,
  ciudadModel as Ciudad,
  paisModel as Pais,
  photoModel as Foto,
  reservationModel as Reserva,
  ratingPropertyModel as CalificacionPropiedad,
} from "../models/associations.js";

import { Op, fn, col, literal } from "sequelize";
import { sequelize } from "../config/db.js";

/**
 * 🏡 Propiedades destacadas (para portada)
 */
export async function getFeaturedDAO() {
  const SQL = `
    SELECT 
      p.id_propiedad,
      p.descripcion,
      p.precio_por_noche,
      p.cantidad_huespedes,
      l.nombre AS localidad,
      c.nombre_ciudad   AS ciudad,
      pa.nombre_pais    AS pais,
      COALESCE(ROUND(AVG(cp.puntuacion),1), 0) AS rating,
      MIN(f.url_foto) AS imagen_url
    FROM propiedades p
    JOIN localidades l ON l.id_localidad = p.id_localidad
    JOIN ciudades c    ON c.id_ciudad    = l.id_ciudad
    JOIN paises pa     ON pa.id_pais     = c.id_pais
    LEFT JOIN fotos f  ON f.id_propiedad = p.id_propiedad
    LEFT JOIN calificaciones_propiedad cp ON cp.id_reserva IN (
      SELECT r.id_reserva FROM reservas r WHERE r.id_propiedad = p.id_propiedad
    )
    GROUP BY p.id_propiedad, l.nombre, c.nombre_ciudad, pa.nombre_pais
    ORDER BY rating DESC, p.id_propiedad DESC
    LIMIT 12;
  `;
  const [rows] = await sequelize.query(SQL);
  return rows;
}

export async function getFiltersDAO() {
  const [tipos] = await sequelize.query(
    "SELECT id_tipo_propiedad, nombre FROM tipos_propiedad ORDER BY nombre;"
  );
  const [caracteristicas] = await sequelize.query(
    "SELECT id_caracteristica, nombre_caracteristica FROM caracteristicas ORDER BY nombre_caracteristica;"
  );
  const [precios] = await sequelize.query(
    "SELECT MIN(precio_por_noche) AS min, MAX(precio_por_noche) AS max FROM propiedades;"
  );

  return {
    tipos_propiedad: tipos,
    caracteristicas,
    precios: precios[0],
  };
}

/**
 * 🔍 Propiedades disponibles (versión estable)
 * Incluye todos los filtros pero el control de fechas está desactivado temporalmente.
 */
export async function getAvailableDAO(params) {
  console.log("[getAvailableDAO ORM] params:", params);

  const {
    fecha_inicio,
    fecha_fin,
    huespedes,
    id_localidad,
    precio_max,
    precio_min,
    id_tipo_propiedad,
    rating_min,
    order_by,
  } = params;

  // 🧱 Filtros básicos
  const where = {
    ...(huespedes
      ? { cantidad_huespedes: { [Op.gte]: Number(huespedes) } }
      : {}),
    ...(id_localidad ? { id_localidad: Number(id_localidad) } : {}),
    ...(precio_min
      ? { precio_por_noche: { [Op.gte]: Number(precio_min) } }
      : {}),
    ...(precio_max
      ? { precio_por_noche: { [Op.lte]: Number(precio_max) } }
      : {}),
    ...(id_tipo_propiedad
      ? { id_tipo_propiedad: Number(id_tipo_propiedad) }
      : {}),
  };

  // ⚙️ Orden
  let order = [["id_propiedad", "DESC"]];
  if (order_by === "precio_asc") order = [["precio_por_noche", "ASC"]];
  if (order_by === "precio_desc") order = [["precio_por_noche", "DESC"]];
  if (order_by === "rating_desc") order = [[literal("rating"), "DESC"]];

  // 🧮 Query principal
  // 🧮 Query principal (corregida)
  const propiedades = await Propiedad.findAll({
    attributes: [
      "id_propiedad",
      "descripcion",
      "precio_por_noche",
      "cantidad_huespedes",
      [col("localidad.nombre"), "localidad"],
      [col("localidad.ciudad.nombre_ciudad"), "ciudad"],
      [col("localidad.ciudad.pais.nombre_pais"), "pais"],
      [
        fn("COALESCE", fn("AVG", col("reservas->calificacion.puntuacion")), 0),
        "rating",
      ],
      [fn("MIN", col("fotos.url_foto")), "imagen_url"],
    ],
    where,
    include: [
      {
        model: Localidad,
        as: "localidad",
        attributes: [],
        include: [
          {
            model: Ciudad,
            as: "ciudad",
            attributes: [],
            include: [{ model: Pais, as: "pais", attributes: [] }],
          },
        ],
      },
      {
        model: Foto,
        as: "fotos",
        attributes: [],
      },
      {
        model: Reserva,
        as: "reservas",
        required: false,
        attributes: [], // ✅ Quitamos columnas directas de reservas
        include: [
          {
            model: CalificacionPropiedad,
            as: "calificacion",
            attributes: [], // ✅ Solo sirve para AVG()
          },
        ],
      },
    ],
    group: [
      "Property.id_propiedad",
      "localidad.nombre",
      "localidad.ciudad.nombre_ciudad",
      "localidad.ciudad.pais.nombre_pais",
    ],
    having: rating_min
      ? literal(
          `COALESCE(AVG("reservas->calificacion"."puntuacion"),0) >= ${rating_min}`
        )
      : undefined,
    order,
    limit: 100,
    subQuery: false,
    raw: true,
  });

  console.log(`[getAvailableDAO ORM] returned ${propiedades.length} rows`);
  return propiedades;
}
