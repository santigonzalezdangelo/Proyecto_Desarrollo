import { Router } from 'express';
import PropertyController from '../../controllers/property.controller.js'; 

const router = Router();

// --- RUTAS PÚBLICAS ---
// (Ahora llamamos a los métodos del controlador)
router.get('/', PropertyController.getAllProperties);
router.get('/:id', PropertyController.getPropertyById);

// (También llamamos a los métodos del controlador)
router.get('/my-properties', PropertyController.getMyProperties);
router.post('/', PropertyController.createProperty);
router.put('/:id', PropertyController.updateProperty);
router.delete('/:id', PropertyController.deleteProperty);

export default router;