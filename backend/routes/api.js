import { Router } from "express";
import userController from "../controllers/userController.js";

const { getUser, createUser, getUsers } = userController;

const router = Router();

router.get("/user/", getUsers);
router.get("/user/:id", getUser);
router.post("/user", createUser);

export default router;
