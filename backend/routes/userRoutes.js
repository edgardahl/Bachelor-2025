import express from "express";

import { getUsers, getUser, createUser, updateUser, deleteUser, getAllUsersWithStore } from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);
router.post("/register", createUser);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.get("/store/:storeId", getAllUsersWithStore);

export default router;
