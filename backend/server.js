import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/index.js";
import userRoutes from "./routes/userRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

// User API routes
app.use("/api/users", userRoutes);

// Shift API routes
app.use("/api/shifts", shiftRoutes);

//Store API routes
app.use("/api/stores", storeRoutes);

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}/api/`));
});
