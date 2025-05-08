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
      env: process.env,
    });
    useHttps = true;
  } catch (error) {
    console.warn(
      "⚠️ mkcert not found or not in PATH. Falling back to HTTP server for development."
    );
  }
}

export default defineConfig({
  base: "/",
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
  test: {
    globals: true,
    environment: "jsdom",
    // setupFiles: "./src/setupTests.js",
    css: true,
  },
  publicDir: "public",
  plugins: [react(), ...(isDev && mkcert ? [mkcert()] : [])],
  server: {
    https: useHttps
      ? {
          key: "../pem/localhost-key.pem",
          cert: "../pem/localhost.pem",
        }
      : false,
    port: 5002,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/index.css";`,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  define: {
    __API_BASE__: JSON.stringify(isDev ? "/api" : process.env.VITE_API_URL),
  },
});
