// routes/api/properties.router.js
import { Router } from "express";
import { getFeaturedProperties, getAvailableProperties } from "../../controllers/properties.controller.js";

const router = Router();

// GET /api/properties/featured
router.get("/featured", getFeaturedProperties);

// GET /api/properties/available?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD&huespedes=2&id_localidad=1&precio_max=30000
router.get("/available", getAvailableProperties);

export default router;
        