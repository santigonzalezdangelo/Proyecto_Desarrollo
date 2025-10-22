import { Router } from 'express';
import CaracteristicaController from '../../controllers/caracteristica.controller.js';
import { requireAuth } from '../../middlewares/auth.js'; 

const router = Router();

// POST /api/caracteristicas/create -> Crea una nueva característica (Protegida)
router.post(
  '/create',
  requireAuth,
  CaracteristicaController.createCaracteristica // NUEVO
);

// GET /api/caracteristicas/getAllCaracteristicas
// Devuelve todas las características disponibles (ej. Piscina, WiFi, etc.)
router.get(
  '/getAllCaracteristicas',
  CaracteristicaController.getAllCaracteristicas
);

export default router;