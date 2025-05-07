import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === "development";

let mkcert;
let useHttps = false;

if (isDev) {
  console.log("dev mode", isDev, process.env.NODE_ENV);
  try {
    const mkcertPlugin = await import("vite-plugin-mkcert");
    mkcert = mkcertPlugin.default;

    execSync("mkcert -version", { stdio: "ignore" });
    useHttps = true;
  } catch (error) {
    console.warn("⚠️ mkcert not found or not in PATH. Falling back to HTTP.");
  }
}

export default defineConfig({
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [react(), ...(isDev && mkcert ? [mkcert()] : [])],
  server: {
    https: useHttps
      ? {
          key: path.resolve(__dirname, "../pem/localhost-key.pem"),
          cert: path.resolve(__dirname, "../pem/localhost.pem"),
        }
      : false,
    port: 5002,
    proxy: {
      "/api": {
        target: "https://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
