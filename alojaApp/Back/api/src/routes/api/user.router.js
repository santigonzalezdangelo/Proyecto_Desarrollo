import { Router } from "express";
import { updateRole } from "../../controllers/user.controller.js";
import { requireAuth, requireRole } from "../../middlewares/auth.js";

const router = Router();

// Ejemplo: solo 'anfitrion' puede cambiar roles (ajustalo si querés)
router.put("/:id/updateRole", updateRole);

export default router;
