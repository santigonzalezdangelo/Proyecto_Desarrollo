
import { Router } from "express";
import { reservationController } from "../../controllers/reservation.controller.js";

const router = Router();

router.post("/createReservation", reservationController.create);
router.get("/myReservations/:id", reservationController.getMine);

export default router;
