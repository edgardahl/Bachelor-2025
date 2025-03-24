import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet"; // ✅ Import helmet
import connectDB from "./database/index.js";
import userRoutes from "./routes/userRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// ✅ Trust proxy (required for cookies to work over HTTPS behind proxy - e.g., Render)
if (isProduction) {
  app.set("trust proxy", 1);
}

// ✅ Helmet middleware with custom config. helmet() sets various HTTP headers to help protect your app from common vulnerabilities like XSS, clickjacking, and more.
app.use(
  helmet({
    contentSecurityPolicy: false, // ⚠️ Disable CSP to avoid issues with inline styles/scripts in React
    frameguard: { action: "sameorigin" }, // ✅ Allow iframe usage from the same origin (useful for embedded content)
  })
);

// ✅ Other middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: isProduction
      ? "https://your-frontend.vercel.app" // replace with your Vercel frontend domain
      : "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/auth", authRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5001;
connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}/api/`)
  );
});
