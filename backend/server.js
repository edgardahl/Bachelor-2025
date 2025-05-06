import express from "express";
import fs from "fs";
import https from "https";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmetMiddleware from "./middleware/helmetMiddleware.js";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import municipalityRoutes from "./routes/municipalityRoutes.js";
import qualificationRoutes from "./routes/qualificationRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 5002;
const isProduction = process.env.NODE_ENV === "production";

// Enable secure cookies in production
if (isProduction) {
  app.set("trust proxy", 1); // Enable trust proxy for secure cookies in production
}

// CORS Setup: Allow only trusted origins in production
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        `https://localhost:${FRONTEND_PORT}`,
        process.env.FRONTEND_URL,
      ];
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(helmetMiddleware);

// Middleware for parsing JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/municipalities", municipalityRoutes);
app.use("/api/qualifications", qualificationRoutes);
app.use("/api/notifications", notificationRoutes);

// Server setup
if (!isProduction) {
  const sslOptions = {
    key: fs.readFileSync(path.resolve("../pem/localhost-key.pem")),
    cert: fs.readFileSync(path.resolve("../pem/localhost.pem")),
  };

  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`🔐 Dev HTTPS running at https://localhost:${PORT}/api`);
  });
} else {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Production backend running on port ${PORT}`);
  });
}
