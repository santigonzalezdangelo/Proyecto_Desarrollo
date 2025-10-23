// import { Router } from 'express';
// import CaracteristicaController from '../../controllers/caracteristica.controller.js';
// import { requireAuth } from '../../middlewares/auth.js';

// const router = Router();

// // POST /api/caracteristicas/create -> Crea una nueva característica (Protegida)
// router.post(
//   '/create',
//   requireAuth,
//   CaracteristicaController.createCaracteristica // NUEVO
// );

// // GET /api/caracteristicas/getAllCaracteristicas
// // Devuelve todas las características disponibles (ej. Piscina, WiFi, etc.)
// router.get(
//   '/getAllCaracteristicas',
//   CaracteristicaController.getAllCaracteristicas
// );

// export default router;

import { Router } from "express";
import CaracteristicaController from "../../controllers/caracteristica.controller.js";
import { requireAuth } from "../../middlewares/auth.js";

const router = Router();

// Crear una característica (protegido)
router.post(
  "/create",
  requireAuth,
  CaracteristicaController.createCaracteristica
);

// Catálogo plano (opcional)
router.get(
  "/getAllCaracteristicas",
  CaracteristicaController.getAllCaracteristicas
);

// ---------- NUEVOS: catálogo + valores de una propiedad ----------
router.get(
  "/property/:id_propiedad",
  requireAuth, // si querés exponerlo público, quitá esto
  CaracteristicaController.getCaracteristicasForProperty
);

router.put(
  "/property/:id_propiedad",
  requireAuth,
  CaracteristicaController.setCaracteristicasForProperty
);

export default router;
