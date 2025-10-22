// src/routes/api/localidad.router.js
import { Router } from "express";
import LocalidadController from "../../controllers/localidad.controller.js";

const router = Router();

router.post("/createLocalidad", LocalidadController.createLocalidad);
router.get("/getAllLocalidades", LocalidadController.getAllLocalidades);
router.get("/search", LocalidadController.search);

export default router;
