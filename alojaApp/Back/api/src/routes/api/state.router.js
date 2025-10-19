
import { Router } from "express";
import stateController from "../../controllers/state.controller.js";

const router = Router();

router.post("/createState", stateController.createState);
router.get("/:id_estado", stateController.getStateById);

export default router;
