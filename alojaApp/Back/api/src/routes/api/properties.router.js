import { Router } from "express";
import PropertiesController from "../../controllers/properties.controller.js"; // ✅ sin llaves
import PropertyController from "../../controllers/property.controller.js";
import { requireAuth } from "../../middlewares/auth.js";

const router = Router();

// --- RUTAS PÚBLICAS ---
router.get("/getAllProperties", PropertyController.getAllProperties);
router.get("/getPropertiesById/:id", PropertyController.getPropertyById);

// --- PANEL DE ANFITRIÓN (Privadas) ---
router.get("/my-properties", requireAuth, PropertyController.getMyProperties);
router.post("/createProperty", requireAuth, PropertyController.createProperty);
router.put("/updatePropertyById/:id", requireAuth, PropertyController.updateProperty);
router.delete("/deletePropertyById/:id", requireAuth, PropertyController.deleteProperty);

// --- PROPIEDADES DESTACADAS Y DISPONIBLES ---
router.get("/featured", PropertiesController.getFeaturedProperties);
router.get("/available", PropertiesController.getAvailableProperties);

// --- ENDPOINTS DE SANTI ---
router.get("/precio", PropertyController.getPrecio);
router.get("/destacadas", PropertyController.getPropiedadesDestacadas);
router.get("/:id", PropertyController.getPropiedadById);

export default router;
