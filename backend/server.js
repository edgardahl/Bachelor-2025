import express from "express";
import connectDB from "./database/index.js";
import userRoutes from "./routes/userRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";

const app = express();
app.use(express.json());

// User API routes
app.use("/api/user", userRoutes);

// Shift API routes
app.use("/api/shift", shiftRoutes);

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
