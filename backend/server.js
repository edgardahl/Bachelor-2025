// server.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./database/index.js";
import userRoutes from "./routes/userRoutes.js"; // Import user routes
import shiftRoutes from "./routes/shiftRoutes.js"; // Import shift routes

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

// User routes
app.use("/api/users", userRoutes);

// Shifts routes
app.use("/api/shifts", shiftRoutes);  // Adding the shift routes

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/api/`);
});
