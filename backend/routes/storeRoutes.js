import express from "express";

import{
    getAllStores
} from "../controllers/storeController.js";

const router = express.Router();

router.get("/", getAllStores);

export default router;