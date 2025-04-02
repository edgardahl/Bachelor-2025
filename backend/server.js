import express from "express";
import fs from "fs";
import https from "https";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import municipalityRoutes from "./routes/municipalityRoutes.js";
import qualificationRoutes from "./routes/qualificationRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;
const isProduction = process.env.NODE_ENV === "production";

// Enable secure cookies in production
if (isProduction) {
  app.set("trust proxy", 1); // Enable trust proxy for secure cookies in production
}

// CORS Setup: Allow only trusted origins in production
app.use(
  cors({
    origin: isProduction ? "https://your-frontend-domain.com" : "https://localhost:5173", // Change to the actual frontend URL in production
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Helmet security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Customize this based on your needs
        objectSrc: ["'none'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'", "https://your-backend-url.com"], // Add your backend URL for API calls in production
        upgradeInsecureRequests: [],
      },
    },
    frameguard: { action: "sameorigin" }, // Protect against clickjacking
    xssFilter: true, // Enable XSS filter
    hidePoweredBy: true, // Hide "X-Powered-By" header
    noSniff: true, // Prevent browsers from interpreting files as something else
  })
);

// Middleware for parsing JSON and cookies
app.use(express.json());
app.use(cookieParser());

// 🔐 Ensure req.secure is available (for HTTPS cookie logic)
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] === 'https') {
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

