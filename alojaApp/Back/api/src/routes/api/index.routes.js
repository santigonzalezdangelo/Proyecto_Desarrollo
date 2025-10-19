// routes/api/index.routes.js
import { Router } from "express";
import authRoutes from "./auth.router.js";
import rolesRoutes from "./roles.router.js";
import usersRoutes from "./user.router.js";
import propertiesRoutes from "./properties.router.js";

const router = Router();

router.use("/auth", authRoutes);   // /api/auth/register | /login | /logout
router.use("/roles", rolesRoutes); // /api/roles/...
router.use("/users", usersRoutes); // /api/users/:id/updateRole
router.use("/properties", propertiesRoutes);
export default router;
