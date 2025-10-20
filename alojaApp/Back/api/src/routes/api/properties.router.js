
import { Router } from 'express';
import PropertyController from '../../controllers/property.controller.js'; 
import { getFeaturedProperties, getAvailableProperties } from "../../controllers/properties.controller.js";
import { requireAuth } from '../../middlewares/auth.js';


const router = Router();

// --- RUTAS PÚBLICAS ---
// (Ahora llamamos a los métodos del controlador)
router.get('/getAllProperties', PropertyController.getAllProperties);
router.get('/getPropertiesById/:id', PropertyController.getPropertyById);

// (También llamamos a los métodos del controlador)
router.get('/my-properties', requireAuth, PropertyController.getMyProperties);
router.post('/createProperty', requireAuth,PropertyController.createProperty);
router.put('/updatePropertyById/:id', requireAuth, PropertyController.updateProperty);
router.delete('/deletePropertyById/:id', requireAuth, PropertyController.deleteProperty);
// GET /api/properties/featured
router.get("/featured", getFeaturedProperties);

// GET /api/properties/available?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD&huespedes=2&id_localidad=1&precio_max=30000
router.get("/available", getAvailableProperties);


export default router;