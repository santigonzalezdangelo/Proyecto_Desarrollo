import { Router } from "express";
import { addRole } from "../../controllers/roles.controller.js";
import { requireAuth, requireRole } from "../../middlewares/auth.js";

const router = Router();

// Solo un usuario con rol 'anfitrion' puede crear roles (ajustá según tu necesidad)
router.post("/addRole", addRole);

export default router;
