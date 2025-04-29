// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [react(), mkcert()],
  server: {
    https: true,
    port: process.env.PORT || 5175,
  },
});
