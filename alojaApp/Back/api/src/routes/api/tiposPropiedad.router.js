// src/routes/api/tipoPropiedad.router.js

import { Router } from 'express';
import TipoPropiedadController from '../../controllers/tipoPropiedad.controller.js';

const router = Router();

// Estas rutas son para cargar datos, por ahora las dejamos públicas
router.post('/createTipoPropiedad', TipoPropiedadController.createTipo);
router.get('/getAllTiposPropiedad', TipoPropiedadController.getAllTipos);

export default router;