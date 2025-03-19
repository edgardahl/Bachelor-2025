import express from "express";
import connectDB from "./database/index.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
app.use(express.json());

// User API routes
app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
