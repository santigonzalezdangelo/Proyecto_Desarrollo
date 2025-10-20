import { Router } from "express";
import {
  getPrecio,
  getPropiedadById,
  getPropiedadesDestacadas,
} from "../../controllers/property.controller.js";

const router = Router();


router.get("/precio", getPrecio);
router.get("/destacadas", getPropiedadesDestacadas);
router.get("/:id", getPropiedadById);

export default router;
