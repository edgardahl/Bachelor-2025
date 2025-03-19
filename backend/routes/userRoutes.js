import { Router } from "express";
import userController from "../controllers/userController.js";

const { getUser, createUser, getUsers } = userController;

const router = Router();

router.get("/all/", getUsers);
router.get("/:id", getUser);
router.post("/register", createUser);

export default router;
