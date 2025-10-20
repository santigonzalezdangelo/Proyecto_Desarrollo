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
}

export default new PropertyController();