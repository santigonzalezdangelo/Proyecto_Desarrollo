import { Router } from "express";
import authRoutes from "./auth.router.js";
import rolesRoutes from "./roles.router.js";
import usersRoutes from "./user.router.js";
import reservationRouter from "./reservations.router.js";
import stateRouter from "./state.router.js";
import propertyRouter from "./properties.router.js";
import tipoPropiedadRouter from "./tiposPropiedad.router.js";
import localidadRouter from "./localidad.router.js";
import photosRouter from "./photos.router.js";
import caracteristicasRouter from "./caracteristicas.router.js";
import messagesRouter from "./messages.router.js"; // 👈 NUEVO

const router = Router();

router.use("/auth", authRoutes); // /api/auth/...
router.use("/roles", rolesRoutes); // /api/roles/...
router.use("/users", usersRoutes); // /api/users/...
router.use("/reservations", reservationRouter); // /api/reservations/...
router.use("/states", stateRouter); // /api/states/...
router.use("/properties", propertyRouter); // /api/properties/...
router.use("/tipos-propiedad", tipoPropiedadRouter);
router.use("/localidades", localidadRouter);
router.use("/photos", photosRouter);
router.use("/caracteristicas", caracteristicasRouter);
router.use("/messages", messagesRouter); // 👈 NUEVO => /api/messages/...

export default router;
