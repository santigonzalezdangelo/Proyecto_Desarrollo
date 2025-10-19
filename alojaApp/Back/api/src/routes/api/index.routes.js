// routes/api/index.routes.js
import { Router } from "express";
import authRoutes from "./auth.router.js";
import rolesRoutes from "./roles.router.js";
import usersRoutes from "./user.router.js";
import reservationRouter from "./reservations.router.js";
import stateRouter from "./state.router.js";
import propertyRouter from "./properties.router.js";
import tipoPropiedadRouter from './tipoPropiedad.router.js';
import localidadRouter from './localidad.router.js';

const router = Router();

router.use("/auth", authRoutes);   // /api/auth/register | /login | /logout
router.use("/roles", rolesRoutes); // /api/roles/...
router.use("/users", usersRoutes); // /api/users/:id/updateRole
router.use("/reservations", reservationRouter); // /api/reservations/...
router.use("/states", stateRouter); // /api/states/...
router.use("/properties", propertyRouter); // /api/properties/...
router.use("/tipos-propiedad", tipoPropiedadRouter); // /api/tipo-propiedades/...
router.use("/localidades", localidadRouter); // /api/localidades/...

export default router;
