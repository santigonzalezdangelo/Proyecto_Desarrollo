// dao/properties.dao.js
import { sequelize } from "../config/db.js";

/**
 * Featured: top propiedades con una foto y rating promedio (si tuvieras calificaciones).
 * Ajusta nombres de tablas/columnas si difieren.
 */
export async function getFeaturedDAO() {
  const SQL = `
    SELECT 
      p.id_propiedad,
      p.descripcion,
      p.precio_por_noche,
      p.cantidad_huespedes,
      l.nombre_localidad AS localidad,
      c.nombre_ciudad   AS ciudad,
      pa.nombre_pais    AS pais,
      -- si luego tienes calificaciones_propiedad, podrías hacer AVG:
      COALESCE(ROUND(AVG(cp.puntuacion),1), 0) AS rating,
      MIN(f.url_foto) AS imagen_url
    FROM propiedades p
    JOIN localidades l ON l.id_localidad = p.id_localidad
    JOIN ciudades c    ON c.id_ciudad = l.id_ciudad
    JOIN paises pa     ON pa.id_pais  = c.id_pais
    LEFT JOIN fotos f  ON f.id_propiedad = p.id_propiedad
    LEFT JOIN calificaciones_propiedad cp ON cp.id_reserva IN (
      SELECT r.id_reserva FROM reservas r WHERE r.id_propiedad = p.id_propiedad
    )
    GROUP BY p.id_propiedad, l.nombre_localidad, c.nombre_ciudad, pa.nombre_pais
    ORDER BY rating DESC, p.id_propiedad DESC
    LIMIT 12;
  `;
  const [rows] = await sequelize.query(SQL);
  return rows;
}

/**
 * Available: filtra por fechas + huéspedes + localidad + (opcional) precio_max
 * Excluye propiedades con reservas superpuestas:
 *  r.fecha_inicio < :fecha_fin AND r.fecha_fin > :fecha_inicio
 */
export async function getAvailableDAO(params) {
  const {
    fecha_inicio, fecha_fin, huespedes, id_localidad, precio_max,
    id_tipo_propiedad, precio_min, rating_min, amenities, order_by,
  } = params;

  const where = [];
  const repl = { fecha_inicio, fecha_fin, huespedes, id_localidad };

  // básicos (tu lógica actual)
  where.push("p.cantidad_huespedes >= :huespedes");
  where.push("p.id_localidad = :id_localidad");
  if (precio_max) {
    where.push("p.precio_por_noche <= :precio_max");
    repl.precio_max = precio_max;
  }

  // AVANZADOS
  if (precio_min) {
    where.push("p.precio_por_noche >= :precio_min");
    repl.precio_min = precio_min;
  }
  if (id_tipo_propiedad) {
    where.push("p.id_tipo_propiedad = :id_tipo_propiedad");
    repl.id_tipo_propiedad = id_tipo_propiedad;
  }

  // JOINs opcionales
  let joinAmenities = "";
  let joinRatings = "";
  let havingRating = "";

  if (Array.isArray(amenities) && amenities.length) {
    // solo propiedades que tengan TODAS las amenities pedidas
    joinAmenities = `
      JOIN (
        SELECT cp.id_propiedad
        FROM caracteristicas_propiedad cp
        WHERE cp.id_caracteristica = ANY(:amenities)
        GROUP BY cp.id_propiedad
        HAVING COUNT(DISTINCT cp.id_caracteristica) = :amenities_count
      ) am ON am.id_propiedad = p.id_propiedad
    `;
    repl.amenities = amenities;
    repl.amenities_count = amenities.length;
  }

  if (rating_min) {
    joinRatings = `
      LEFT JOIN reservas r2 ON r2.id_propiedad = p.id_propiedad
      LEFT JOIN calificaciones_propiedad cal ON cal.id_reserva = r2.id_reserva
    `;
    havingRating = "HAVING COALESCE(AVG(cal.puntuacion),0) >= :rating_min";
    repl.rating_min = rating_min;
  }

  // ORDER BY
  let orderBy = "ORDER BY p.id_propiedad DESC";
  if (order_by === "precio_asc")  orderBy = "ORDER BY p.precio_por_noche ASC";
  if (order_by === "precio_desc") orderBy = "ORDER BY p.precio_por_noche DESC";
  if (order_by === "rating_desc") orderBy = "ORDER BY AVG(cal.puntuacion) DESC NULLS LAST";

  const SQL = `
    SELECT
      p.id_propiedad,
      p.descripcion,
      p.precio_por_noche,
      p.cantidad_huespedes,
      l.nombre_localidad AS localidad,
      c.nombre_ciudad   AS ciudad,
      pa.nombre_pais    AS pais,
      MIN(f.url_foto)   AS imagen_url,
      COALESCE(AVG(cal.puntuacion),0) AS rating
    FROM propiedades p
    JOIN localidades l ON l.id_localidad = p.id_localidad
    JOIN ciudades    c ON c.id_ciudad    = l.id_ciudad
    JOIN paises      pa ON pa.id_pais    = c.id_pais
    LEFT JOIN fotos  f ON f.id_propiedad = p.id_propiedad
    ${joinAmenities}
    ${joinRatings}
    WHERE
      ${where.join(" AND ")} AND
      NOT EXISTS (
        SELECT 1
        FROM reservas r
        WHERE r.id_propiedad = p.id_propiedad
          AND r.fecha_inicio < :fecha_fin
          AND r.fecha_fin    > :fecha_inicio
      )
    GROUP BY
      p.id_propiedad, l.nombre_localidad, c.nombre_ciudad, pa.nombre_pais
    ${havingRating}
    ${orderBy}
    LIMIT 100;
  `;

  const [rows] = await sequelize.query(SQL, { replacements: repl });
  return rows;
}