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

  // DELETE /api/photos/deletephoto/:id_foto -> Elimina una foto por su ID de foto
  router.delete(
      '/deletePhoto/:id_foto',
      requireAuth,
      PhotoController.deletePhoto
  );

  // PUT /api/photos/setPhotoAsPrincipal/:id_foto -> Establece una foto como principal por su ID de foto
  router.put(
      '/setPhotoAsPrincipal/:id_foto',
      requireAuth,
      PhotoController.setPhotoAsPrincipal
  );

  // GET /api/photos/principal/:id_propiedad -> devuelve id de la foto principal
  router.get(
    '/principal/:id_propiedad',
    requireAuth,
    PhotoController.getPrincipalPhotoId
  );

  // GET /api/photos/test
  router.get('/test', (req, res) => {
      res.status(200).json({ message: "Router base de photos funcionando" });
  });

  export default router;