import { Router } from 'express';
import multer from 'multer';
import PhotoController from '../../controllers/photo.controller.js';
import { requireAuth } from '../../middlewares/auth.js'; // Asumo que se llama así

const router = Router();
const upload = multer({ dest: 'uploads/' }); // Carpeta temporal para guardar archivos

// Endpoint para subir una o más fotos para una propiedad específica
// El 'upload.array('photos', 20)' procesa hasta 20 archivos que vengan en el campo 'photos'
// POST /api/photos/photo/:id_propiedad -> Sube fotos para una propiedad
router.post(
  '/photo/:id_propiedad', 
  requireAuth, 
  upload.array('photos', 20),
  PhotoController.uploadPropertyPhotos
);

// DELETE /api/photos/photo/:id_foto -> Elimina una foto por su ID de foto
router.delete(
    '/photo/:id_foto',
    requireAuth,
    PhotoController.deletePhoto
);

export default router;