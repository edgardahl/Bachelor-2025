import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./database/index.js";
import userRoutes from "./routes/userRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";
import storeRoutes from "./routes/storeRoutes.js"; // Import store routes
import municipalityRoutes from "./routes/municipalityRoutes.js";
import authRoutes from "./routes/authRoutes.js"; // Import auth routes
import qualificationRoutes from "./routes/qualificationRoutes.js";

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// Trust proxy settings (for production deployments)
if (isProduction) {
  app.set("trust proxy", 1);
}

// Helmet security middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: { action: "sameorigin" },
  })
);

// Other middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: isProduction ? "https://your-frontend.vercel.app" : "http://localhost:5173",
    credentials: true,
  })
);

// API routes
app.use("/api/auth", authRoutes); // Register the new auth routes
app.use("/api/users", userRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/stores", storeRoutes);  // ✅ Register the new store routes
app.use("/api/municipalities", municipalityRoutes);
app.use("/api/qualifications", qualificationRoutes); // Mounting qualification routes here

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/api/`);
});
