import { Router } from "express";
import AuthController from "../../controllers/auth.controller.js";
import { requireAuth } from "../../middlewares/auth.js";
const router = Router();

// publico
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/current", requireAuth, AuthController.current);

export default router;
