import { uploadImage, deleteImage } from '../config/cloudinary.config.js';
import PhotoDAO from '../dao/photo.dao.js';
import PropertyDAO from '../dao/property.dao.js';

class PhotoController {
  uploadPropertyPhotos = async (req, res) => {
    try {
      const { id_propiedad } = req.params;
      const { id_usuario } = req.user;

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

        const photo = await PhotoDAO.findById(id_foto);
        if (!photo) {
            return res.status(404).json({ error: 'Foto no encontrada.' });
        }

        const property = await PropertyDAO.findByIdAndAnfitrion(photo.id_propiedad, id_usuario);
        if (!property) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar esta foto.' });
        }

        await deleteImage(photo.nombre_foto); 

        await PhotoDAO.deletePropertyPhotoById(id_foto);
        
        res.status(204).send();
    } catch (error) {
        console.error("Error al eliminar foto:", error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar la foto.' });
    }
  };
  
  // --- NUEVO: MÉTODO PARA MARCAR COMO PRINCIPAL ---
  setPhotoAsPrincipal = async (req, res) => {
    try {
      const { id_foto } = req.params;
      const { id_usuario } = req.user;

      // 1️⃣ Buscar la foto
      const photo = await PhotoDAO.findById(id_foto);
      if (!photo) {
        return res.status(404).json({ error: 'Foto no encontrada.' });
      }

      // 2️⃣ Verificar que el usuario sea dueño de la propiedad
      const property = await PropertyDAO.findByIdAndAnfitrion(photo.id_propiedad, id_usuario);
      if (!property) {
        return res.status(403).json({ error: 'No tienes permiso para modificar esta propiedad.' });
      }

      // 3️⃣ Si la foto ya era principal, desmarcarla
      if (photo.principal) {
        await photo.update({ principal: false });
        return res.status(200).json({ message: 'Foto desmarcada como principal.' });
      }

      // 4️⃣ Si no era principal, marcar esta y desmarcar las demás
      await PhotoDAO.setPrincipal(id_foto, photo.id_propiedad);

      res.status(200).json({ message: 'Foto marcada como principal.' });
    } catch (error) {
      console.error('Error al establecer foto principal:', error);
      res.status(500).json({ error: 'Error interno del servidor al establecer la foto principal.' });
    }

  };

  getPrincipalPhotoId = async (req, res) => { // Nuevo método para obtener la foto principal por id propiedad
    try {
      const { id_propiedad } = req.params;
      const { id_usuario } = req.user;

      // Verificar que el usuario sea dueño de la propiedad
      const property = await PropertyDAO.findByIdAndAnfitrion(id_propiedad, id_usuario);
      if (!property) {
        return res.status(403).json({ error: 'No tienes permiso para ver esta propiedad.' });
      }

      const photo = await PhotoDAO.getPrincipalByPropertyId(id_propiedad);
      if (!photo) {
        return res.status(404).json({ error: 'No hay foto principal.' });
      }

      res.status(200).json({ id_foto: photo.id_foto });
    } catch (error) {
      console.error('Error fetching principal photo:', error);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  };
}

export default new PhotoController();
