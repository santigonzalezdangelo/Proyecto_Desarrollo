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
export async function getAvailableDAO({ fecha_inicio, fecha_fin, huespedes, id_localidad, precio_max }) {
  const wherePrecio = precio_max ? " AND p.precio_por_noche <= :precio_max" : "";

  const SQL = `
    SELECT 
      p.id_propiedad,
      p.descripcion,
      p.precio_por_noche,
      p.cantidad_huespedes,
      l.nombre_localidad AS localidad,
      c.nombre_ciudad   AS ciudad,
      pa.nombre_pais    AS pais,
      MIN(f.url_foto)   AS imagen_url
    FROM propiedades p
    JOIN localidades l ON l.id_localidad = p.id_localidad
    JOIN ciudades c    ON c.id_ciudad = l.id_ciudad
    JOIN paises pa     ON pa.id_pais  = c.id_pais
    LEFT JOIN fotos f  ON f.id_propiedad = p.id_propiedad
    WHERE p.cantidad_huespedes >= :huespedes
      AND p.id_localidad = :id_localidad
      ${wherePrecio}
      AND NOT EXISTS (
        SELECT 1
        FROM reservas r
        WHERE r.id_propiedad = p.id_propiedad
          AND r.fecha_inicio < :fecha_fin
          AND r.fecha_fin    > :fecha_inicio
      )
    GROUP BY p.id_propiedad, l.nombre_localidad, c.nombre_ciudad, pa.nombre_pais
    ORDER BY p.id_propiedad DESC
    LIMIT 100;
  `;

  const replacements = {
    fecha_inicio,
    fecha_fin,
    huespedes,
    id_localidad,
  };
  if (precio_max) replacements.precio_max = precio_max;

  const [rows] = await sequelize.query(SQL, { replacements });
  return rows;
}
