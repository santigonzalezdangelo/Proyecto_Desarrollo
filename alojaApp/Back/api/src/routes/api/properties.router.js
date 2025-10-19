import { Router } from 'express';
import PropertyController from '../../controllers/property.controller.js'; 

const router = Router();

// --- RUTAS PÚBLICAS ---
// (Ahora llamamos a los métodos del controlador)
router.get('/getAllProperties', PropertyController.getAllProperties);
router.get('/getPropertiesById/:id', PropertyController.getPropertyById);

// (También llamamos a los métodos del controlador)
router.get('/my-properties', PropertyController.getMyProperties);
router.post('/createProperty', PropertyController.createProperty);
router.put('/updatePropertyById/:id', PropertyController.updateProperty);
router.delete('/deletePropertyById/:id', PropertyController.deleteProperty);

export default router;