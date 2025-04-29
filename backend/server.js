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
const FRONTEND_URL = process.env.FRONTEND_URL;
const isProduction = process.env.NODE_ENV === "production";

// Enable secure cookies in production
if (isProduction) {
  app.set("trust proxy", 1); // Enable trust proxy for secure cookies in production
}

// CORS Setup: Allow only trusted origins in production
app.use(
  cors({
    origin: isProduction ? FRONTEND_URL : `https://localhost:5173`, // Use environment variable for production
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(helmetMiddleware);

// Middleware for parsing JSON and cookies
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  if (req.headers["x-forwarded-proto"] === "https") {
    req.secure = true;
  }
  next();
});

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
    key: fs.readFileSync(path.resolve("localhost-key.pem")),
    cert: fs.readFileSync(path.resolve("localhost.pem")),
  };

  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`🔐 Dev HTTPS running at https://localhost:${PORT}/api`);
  });
} else {
  // Production: Ensure HTTPS is enabled for secure connections
  app.listen(PORT, () => {
    console.log(`🚀 Production backend running on port ${PORT}`);
  });
}
