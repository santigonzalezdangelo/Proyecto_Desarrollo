import { uploadImage, deleteImage } from '../config/cloudinary.config.js';
import PhotoDAO from '../dao/photo.dao.js';
import PropertyDAO from '../dao/property.dao.js';

class PhotoController {
  uploadPropertyPhotos = async (req, res) => {
    try {
      const { id_propiedad } = req.params;
      const { id_usuario } = req.user;

      // Verificamos que el usuario sea dueño de la propiedad
      const property = await PropertyDAO.findByIdAndAnfitrion(id_propiedad, id_usuario);
      if (!property) {
        return res.status(403).json({ error: 'No tienes permiso para agregar fotos a esta propiedad.' });
      }

      if (!req.files?.length) {
        return res.status(400).json({ error: 'No se subieron archivos.' });
      }

      const photosToCreate = [];
      for (const file of req.files) {
        const result = await uploadImage(file.path);
        photosToCreate.push({
          url_foto: result.secure_url,
          nombre_foto: result.public_id, // Usamos el public_id para poder borrarla después
          id_propiedad: id_propiedad,
        });
      }

      const newPhotos = await PhotoDAO.createPropertyPhoto(photosToCreate);
      res.status(201).json(newPhotos);
    } catch (error) {
      console.error("Error al subir fotos:", error);
      res.status(500).json({ error: 'Error interno del servidor al subir fotos.' });
    }
  };

  deletePhoto = async (req, res) => {
    try {
        const { id_foto } = req.params;
        const { id_usuario } = req.user;

        // Buscamos la foto para obtener el ID de la propiedad
        const photo = await PhotoDAO.findById(id_foto);
        if (!photo) {
            return res.status(404).json({ error: 'Foto no encontrada.' });
        }

        // Verificamos que el usuario sea dueño de la propiedad a la que pertenece la foto
        const property = await PropertyDAO.findByIdAndAnfitrion(photo.id_propiedad, id_usuario);
        if (!property) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar esta foto.' });
        }

        // 1. Borrar de Cloudinary
        await deleteImage(photo.nombre_foto); // Usamos el public_id que guardamos como nombre

        // 2. Borrar de la base de datos
        await PhotoDAO.deletePropertyPhotoById(id_foto);
        
        res.status(204).send(); // No content
    } catch (error) {
        console.error("Error al eliminar foto:", error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar la foto.' });
    }
  };
}

export default new PhotoController();
