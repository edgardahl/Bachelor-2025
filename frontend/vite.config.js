import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig(({ mode }) => ({
  plugins: [react(), mkcert()],
  server: {
    https: true,
    proxy: {
      "/api": "https://localhost:5001",
    },
  },
  build: {
    outDir: "dist",
  },
  define: {
    __API_BASE__: JSON.stringify(
      mode === "development" ? "/api" : process.env.VITE_API_URL
    ),
  },
}));
