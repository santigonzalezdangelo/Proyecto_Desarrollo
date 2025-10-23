import { Router } from "express";
import userController from "../../controllers/user.controller.js";
// import { requireAuth } from "../../middlewares/auth.js";
import { requireAuth } from "../../middlewares/auth.js";

const router = Router();

router.get("/me", requireAuth, userController.getProfile);
router.put("/me", requireAuth, userController.updateProfile); // ✅ nuevo
router.get("/:id", userController.findById);
router.post("/upgradeToHost", userController.upgradeToHost);

export default router;
