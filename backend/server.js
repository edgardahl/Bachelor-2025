import express from "express";
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

// Laster inn miljøvariabler fra .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 5002;
const isProduction = process.env.NODE_ENV === "production";

// Aktiverer "trust proxy" i produksjon for å støtte HTTPS og cookies bak proxyer (f.eks. Railway)
if (isProduction) {
  app.set("trust proxy", 1);
}

// Konfigurerer CORS-policy
// Tillater frontend (lokalt og i produksjon) å gjøre forespørsler med cookies og headers
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        `http://localhost:${FRONTEND_PORT}`,
        process.env.FRONTEND_URL,
      ];

      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true, // Tillater cookies
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Legger til sikkerhetsrelaterte headers via Helmet (XSS, CORS osv.)
app.use(helmetMiddleware);

// Parser JSON-body i forespørsler
app.use(express.json());

// Parser cookies i forespørsler
app.use(cookieParser());

// Autentisering (innlogging, token osv.)
app.use("/api/auth", authRoutes);

// Bruker-relaterte ruter (profil, kvalifikasjoner, sletting)
app.use("/api/users", userRoutes);

// Vakt-relaterte ruter
app.use("/api/shifts", shiftRoutes);

// Butikk-ruter
app.use("/api/stores", storeRoutes);

// Kommune-ruter
app.use("/api/municipalities", municipalityRoutes);

// Kvalifikasjonsruter
app.use("/api/qualifications", qualificationRoutes);

// Notifikasjoner
app.use("/api/notifications", notificationRoutes);

/**
 * Starter serveren på angitt port.
 * NB: '0.0.0.0' gjør den tilgjengelig for Railway og andre tjenester.
 */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend kjører på http://localhost:${PORT}/api`);
});
