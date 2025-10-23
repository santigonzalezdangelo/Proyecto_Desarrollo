import { Router } from "express";
import PropertiesController from "../../controllers/properties.controller.js"; // ✅ sin llaves
import PropertyController from "../../controllers/property.controller.js";
import {
  requireAuth,
  verifyRoleName,
  requireRole,
  ROLE_NAMES,
} from "../../middlewares/authz.js";

const router = Router();

// --- RUTAS PÚBLICAS ---
router.get("/getAllProperties", PropertyController.getAllProperties);
router.get("/getPropertiesById/:id", PropertyController.getPropertyById);
router.get("/getPropiedadById/:id", PropertyController.getPropiedadById);

// --- PANEL DE ANFITRIÓN (Privadas) ---
router.get("/my-properties", requireAuth, PropertyController.getMyProperties);
router.post("/createProperty", requireAuth, PropertyController.createProperty);
router.put(
  "/updatePropertyById/:id",
  requireAuth,
  PropertyController.updateProperty
);
router.delete(
  "/deletePropertyById/:id",
  requireAuth,
  PropertyController.deleteProperty
);
// Permite guardar las características y sus cantidades para una propiedad respetando la Jerarquia de Recursos.
router.put(
  "/caracteristicas/:id_propiedad",
  requireAuth,
  PropertyController.setCaracteristicasForProperty // <-- Nuevo método
);
router.get("/filters", PropertiesController.getFilters);

// --- PROPIEDADES DESTACADAS Y DISPONIBLES ---
router.get("/featured", PropertiesController.getFeaturedProperties);
router.get("/available", PropertiesController.getAvailableProperties);

// --- ENDPOINTS DE SANTI ---
router.get("/precio", PropertyController.getPrecio);
router.get("/destacadas", PropertyController.getPropiedadesDestacadas);
router.get("/:id", PropertyController.getPropiedadById);

export default router;
