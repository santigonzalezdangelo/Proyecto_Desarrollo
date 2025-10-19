import e, { Router } from "express";
import reservationController from "../../controllers/reservation.controller.js";   


const router = Router();

// Crear una nueva reserva
router.post("/create", reservationController.createReservation);

export default router;
