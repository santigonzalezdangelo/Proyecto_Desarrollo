import { Router } from 'express';
import CaracteristicaController from '../../controllers/caracteristica.controller.js';
import { requireAuth } from '../../middlewares/auth.js'; 

const router = Router();

// GET /api/caracteristicas/getAllCaracteristicas
// Devuelve todas las características disponibles (ej. Piscina, WiFi, etc.)
router.get(
  '/getAllCaracteristicas',
  CaracteristicaController.getAllCaracteristicas
);

export default router;