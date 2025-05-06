import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config();

const isDev = process.env.NODE_ENV === "development";

let mkcert;
let useHttps = false;

if (isDev) {
  console.log("dev mode", isDev, process.env.NODE_ENV);
  try {
    mkcert = require("vite-plugin-mkcert").default;
    require("child_process").execSync("mkcert -version", {
      stdio: "ignore",
      env: {
        ...process.env,
        PATH: process.env.PATH + ":/opt/homebrew/bin",
      },
    });
    useHttps = true;
  } catch (error) {
    console.warn(
      "⚠️ mkcert not found or not in PATH. Falling back to HTTP server for development."
    );
  }
}

export default defineConfig({
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },

  plugins: [react(), ...(isDev && mkcert ? [mkcert()] : [])],
  server: {
    https: isDev
      ? {
          key: "../pem/localhost-key.pem",
          cert: "../pem/localhost.pem",
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
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  define: {
    __API_BASE__: JSON.stringify(isDev ? "/api" : process.env.VITE_API_URL),
  },
});
