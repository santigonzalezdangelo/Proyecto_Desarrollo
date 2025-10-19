// src/routes/api/localidad.router.js

import { Router } from 'express';
import LocalidadController from '../../controllers/localidad.controller.js';

const router = Router();

router.post('/', LocalidadController.createLocalidad);
router.get('/', LocalidadController.getAllLocalidades);

export default router;