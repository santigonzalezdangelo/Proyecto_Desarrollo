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

  // createProperty = async (req, res) => {
  //   try {
  //     const anfitrionId = req.user.id_usuario;
  //     const newProperty = await PropertyDAO.createForAnfitrion(req.body, anfitrionId);
  //     res.status(201).json(newProperty);
  //   } catch (error) {
  //     res.status(400).json({ message: 'Error al crear la propiedad', error: error.message });
  //   }
  // };
  createPropertyWithAssociation = async (data, anfitrionId) => {
    try {
      return await this.createWithAssociation('userModel', anfitrionId, 'properties', data);
    } catch (error) {
      console.error('Error al crear una propiedad para un anfitrion:', error);
      throw new Error(error);
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
      
      const [updatedCount] = await PropertyDAO.update(propiedadId, dataToUpdate);
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

      await PropertyDAO.delete(propiedadId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar la propiedad', error: error.message });
    }
  };
}

export default new PropertyController();