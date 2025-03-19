import express from "express";

import { getShifts } from "../controllers/shiftController.js";

const router = express.Router();

router.get("/", getShifts);
// router.get("/:id", getShift);
// router.post("/new", createShift);

export default router;
