import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config();

const isDev = process.env.NODE_ENV === "development";

let mkcert;
if (isDev) {
  try {
    mkcert = require("vite-plugin-mkcert").default;
    require("child_process").execSync("mkcert -version", { stdio: "ignore" });
  } catch (error) {
    console.error(
      "Error: mkcert is not installed or not available in PATH. Please install mkcert and ensure it is properly configured."
    );
    process.exit(1);
  }
}

export default defineConfig({
  plugins: [react(), ...(isDev && mkcert ? [mkcert()] : [])],
  server: isDev
    ? {
        https: true,
        proxy: {
          "/api": {
            target: "https://localhost:5001",
            changeOrigin: true,
            secure: false,
          },
        },
      }
    : undefined,
  build: {
    outDir: "dist",
  },
  define: {
    __API_BASE__: JSON.stringify(isDev ? "/api" : process.env.VITE_API_URL),
  },
});
