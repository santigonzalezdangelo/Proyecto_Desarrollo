// src/controllers/property.controller.js

import PropertyDAO from '../dao/property.dao.js';

class PropertyController {

  // --- Controladores de Vistas Públicas ---

  getAllProperties = async (req, res) => {
    try {
      const properties = await PropertyDAO.getAllWithPhotos();
      res.status(200).json(properties);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener propiedades', error: error.message });
    }
  };

  getPropertyById = async (req, res) => {
    try {
      const { id } = req.params;
      const property = await PropertyDAO.getByIdWithPhotos(id);
      if (!property) {
        return res.status(404).json({ message: 'Propiedad no encontrada' });
      }
      res.status(200).json(property);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener la propiedad', error: error.message });
    }
  };

  // --- Controladores del Panel de Anfitrión (Privados) ---

  getMyProperties = async (req, res) => {
    try {
      const anfitrionId = req.user.id_usuario; 
      const properties = await PropertyDAO.findAllByAnfitrion(anfitrionId);
      res.status(200).json(properties);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener mis propiedades', error: error.message });
    }
  };


  createProperty = async (req, res) => {
    try {
      const { id_usuario } = req.user;
      if (!id_usuario) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      // Usa solo los datos del body (sin el id del anfitrión)
      const data = req.body;

      // Llama al DAO que se encarga de la asociación
      const nuevaPropiedad = await PropertyDAO.createPropertyWithAssociation(data, id_usuario);

      res.status(201).json({
        message: 'Propiedad creada correctamente',
        data: nuevaPropiedad
      });
    } catch (error) {
      console.error('ERROR DETALLADO:', error); 
      res.status(500).json({ 
        error: 'Error al crear la propiedad', 
        message: error.message, // Devuelve el mensaje real de la BBDD
        details: error.parent?.detail // (Si es un error de Postgres, aquí estará el detalle)
      });
    }
  };
  
  updateProperty = async (req, res) => {
    try {
      const { id: propiedadId } = req.params;
      const anfitrionId = req.user.id_usuario;
      const dataToUpdate = req.body;

      const property = await PropertyDAO.findByIdAndAnfitrion(propiedadId, anfitrionId);
      if (!property) {
        return res.status(404).json({ message: 'Propiedad no encontrada o no te pertenece' });
      }
      
      const [updatedCount] = await PropertyDAO.updateById(propiedadId, dataToUpdate);
      if (updatedCount === 0) {
          return res.status(404).json({ message: 'Propiedad no encontrada' });
      }

      const updatedProperty = await PropertyDAO.getByIdWithPhotos(propiedadId);
      res.status(200).json(updatedProperty);
      
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar la propiedad', error: error.message });
    }
  };

  deleteProperty = async (req, res) => {
    try {
      const { id: propiedadId } = req.params;
      const anfitrionId = req.user.id_usuario;

      const property = await PropertyDAO.findByIdAndAnfitrion(propiedadId, anfitrionId);
      if (!property) {
        return res.status(404).json({ message: 'Propiedad no encontrada o no te pertenece' });
      }

      await PropertyDAO.deleteById(propiedadId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar la propiedad', error: error.message });
    }
  };


  // --- 🟨 SANTI: Endpoints de Reserva y Propiedades destacadas ---

  /**
   * GET /api/propiedades/precio
   * Calcula el precio total de una reserva según las fechas y la propiedad
   */
  getPrecio = async (req, res) => {
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
   * - Coordenadas (latitud, longitud)
   */
  getPropiedadById = async (req, res) => {
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
        tipo: propiedad.tipoPropiedad?.nombre_tipo ?? null,
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


  /**
   * GET /api/propiedades/destacadas
   * Devuelve un listado de 4 propiedades destacadas
   */
  getPropiedadesDestacadas = async (req, res) => {
    try {
      const excludeId = req.query.excludeId ? Number(req.query.excludeId) : null;
      const propiedades = await PropertyDAO.getFeaturedProperties(4, excludeId);
      return res.json(propiedades);
    } catch (error) {
      console.error("Error en GET /api/propiedades/destacadas:", error);
      return res.status(500).json({ error: "Error al obtener propiedades destacadas" });
    }
  };

  // --- NUEVO MÉTODO PARA CARACTERÍSTICAS ---
    setCaracteristicas = async (req, res) => {
        const { id_propiedad } = req.params;
        const { id_usuario } = req.user; // Asumo autenticación
        const { caracteristicas } = req.body; // Array de { id_caracteristica, cantidad }
        if (!caracteristicas || !Array.isArray(caracteristicas)) {
            return res.status(400).json({ error: "Datos de características inválidos." });
        }

        try {
            // 1. Verificar si el usuario tiene permiso sobre esta propiedad
            const property = await PropertyDAO.findByIdAndAnfitrion(id_propiedad, id_usuario);
            if (!property) {
                return res.status(403).json({ error: 'No tienes permiso para modificar esta propiedad.' });
            }
            // 2. Guardar las características (el DAO se encarga de eliminar y recrear)
            const result = await CaracteristicaDAO.setCaracteristicasForProperty(id_propiedad, caracteristicas);
            res.status(200).json({ message: 'Características actualizadas correctamente.', data: result });
        } catch (error) {
            console.error('Error al actualizar características de la propiedad:', error);
            res.status(500).json({ error: 'Error interno del servidor al guardar características.' });
        }
    };
}

export default new PropertyController();
