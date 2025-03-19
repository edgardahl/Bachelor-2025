import { Router } from "express";
import shiftController from "../controllers/shiftController.js";

const { getShifts } = shiftController;

const router = Router();

router.get("/", getShifts);
// router.get("/:id", getShift);
// router.post("/new", createShift);

export default router;
