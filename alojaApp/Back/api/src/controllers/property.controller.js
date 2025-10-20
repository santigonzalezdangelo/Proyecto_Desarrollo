import PropertyDAO from "../dao/property.dao.js";

/**
 * GET /api/propiedades/precio
 * Calcula el precio total de una reserva según las fechas y la propiedad
 */
export const getPrecio = async (req, res) => {
  try {
    const { id_propiedad, fecha_inicio, fecha_fin } = req.query;

    // ✅ Validar parámetros
    if (!id_propiedad || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: "Faltan parámetros obligatorios" });
    }

    // ✅ Validar fechas
    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);
    if (isNaN(inicio) || isNaN(fin) || fin <= inicio) {
      return res.status(400).json({ error: "Fechas inválidas" });
    }

    // ✅ Calcular días
    const diffTime = Math.abs(fin - inicio);
    const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // ✅ Buscar propiedad con DAO
    const propiedad = await PropertyDAO.getById(id_propiedad);
    if (!propiedad) {
      return res.status(404).json({ error: "Propiedad no encontrada" });
    }

    // ✅ Calcular precio total
    const precioPorNoche = Number(propiedad.precio_por_noche);
    const precioTotal = dias * precioPorNoche;

    // ✅ Responder
    return res.json({
      id_propiedad: Number(id_propiedad),
      fecha_inicio,
      fecha_fin,
      dias,
      precio_por_noche: precioPorNoche,
      precio_total: precioTotal,
    });
  } catch (error) {
    console.error("Error en GET /api/propiedades/precio:", error);
    return res.status(500).json({ error: "Error al calcular precio" });
  }
};


/**
 * GET /api/propiedades/:id
 * Devuelve toda la información de una propiedad:
 * - Datos básicos de la propiedad
 * - Tipo de propiedad
 * - Localidad → Ciudad → País
 * - Datos del anfitrión
 * - Fotos asociadas
 */
/**
 * GET /api/propiedades/:id
 * Devuelve toda la información de una propiedad:
 * - Datos básicos de la propiedad
 * - Tipo de propiedad
 * - Localidad → Ciudad → País
 * - Datos del anfitrión
 * - Fotos asociadas
 * - Coordenadas (latitud, longitud)
 */
export const getPropiedadById = async (req, res) => {
  try {
    const { id } = req.params;

    const propiedad = await PropertyDAO.getFullById(id);
    if (!propiedad) {
      return res.status(404).json({ error: "Propiedad no encontrada" });
    }

    // 🧮 promedio de calificaciones
    const calificaciones = propiedad.reservas
      ?.map((r) => r.calificacion?.puntuacion)
      .filter((p) => p !== undefined && p !== null);

    const promedio =
      calificaciones?.length > 0
        ? (calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length).toFixed(1)
        : null;

    // ✅ respuesta
    const result = {
      id_propiedad: propiedad.id_propiedad,
      descripcion: propiedad.descripcion,
      precio_por_noche: Number(propiedad.precio_por_noche),
      cantidad_huespedes: propiedad.cantidad_huespedes,
      estancia_minima: propiedad.estancia_minima,

      // 📍 Coordenadas
      latitud: propiedad.latitud !== null ? Number(propiedad.latitud) : null,
      longitud: propiedad.longitud !== null ? Number(propiedad.longitud) : null,

      // (opcional, por si querés mostrar dirección)
      calle: propiedad.calle ?? null,
      numero: propiedad.numero ?? null,

      // 🔗 relaciones
      tipo: propiedad.tipo?.nombre_tipo ?? null,
      localidad: propiedad.localidad?.nombre_localidad ?? null,
      ciudad: propiedad.localidad?.ciudad?.nombre_ciudad ?? null,
      pais: propiedad.localidad?.ciudad?.pais?.nombre_pais ?? null,
      anfitrion: propiedad.anfitrion
        ? {
            nombre: propiedad.anfitrion.nombre,
            apellido: propiedad.anfitrion.apellido,
            correo: propiedad.anfitrion.correo,
          }
        : null,
      fotos:
        propiedad.fotos?.map((f) => ({
          id_foto: f.id_foto,
          url_foto: f.url_foto,
          nombre_foto: f.nombre_foto,
          principal: f.principal,
        })) ?? [],
      calificaciones: propiedad.reservas?.map((r) => r.calificacion).filter(Boolean) ?? [],
      puntuacion_promedio: promedio ? Number(promedio) : 0,
    };

    return res.json(result);
  } catch (error) {
    console.error("Error en GET /api/propiedades/:id:", error);
    return res.status(500).json({ error: "Error al obtener la propiedad" });
  }
};




export const getPropiedadesDestacadas = async (req, res) => {
  try {
    const excludeId = req.query.excludeId ? Number(req.query.excludeId) : null;
    const propiedades = await PropertyDAO.getFeaturedProperties(4, excludeId);
    return res.json(propiedades);
  } catch (error) {
    console.error("Error en GET /api/propiedades/destacadas:", error);
    return res.status(500).json({ error: "Error al obtener propiedades destacadas" });
  }
};


