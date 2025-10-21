import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.js";

const router = Router();

// Ejemplo: solo 'anfitrion' puede cambiar roles (ajustalo si querés)

export default router;
