import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config(); // Last inn env-variabler fra .env-filen

const isDev = process.env.NODE_ENV === "development"; // Sjekk om det er utviklingsmodus

let mkcert; // Variabel for mkcert-plugin
let useHttps = false; // Flag for om HTTPS skal brukes

if (isDev) {
  console.log("dev mode", isDev, process.env.NODE_ENV); // Logg ut utviklingsmodusinformasjon
  try {
    mkcert = require("vite-plugin-mkcert").default; // Prøv å last inn mkcert-plugin
    require("child_process").execSync("mkcert -version", {
      // Kjør mkcert kommando for å sjekke versjon
      stdio: "ignore",
      env: process.env,
    });
    useHttps = true; // Sett HTTPS til true dersom mkcert fungerer
  } catch (error) {
    console.warn(
      // Logg advarsel dersom mkcert ikke er tilgjengelig
      "⚠️ mkcert not found or not in PATH. Falling back to HTTP server for development."
    );
  }
}

export default defineConfig({
  // Eksporter Vite-konfigurasjon
  base: "/", // Angi base URL for applikasjonen
  resolve: {
    alias: {
      "@": "/src", // Definer alias for src-mappen
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"], // Optimaliser avhengigheter for tidlig innlasting
  },
  test: {
    globals: true, // Bruk globale testvariabler
    environment: "jsdom", // Sett testmiljø til jsdom
    // setupFiles: "./src/setupTests.js",
    css: true, // Tillat CSS i testene
  },
  publicDir: "public", // Angi mappen for offentlige filer
  plugins: [react(), ...(isDev && mkcert ? [mkcert()] : [])], // Legg til mkcert-plugin dersom vi er i utviklingsmodus og mkcert er tilgjengelig
  server: {
    https: useHttps
      ? {
          // Hvis HTTPS er aktivert, bruk lokal sertifikatfil
          key: "../pem/localhost-key.pem",
          cert: "../pem/localhost.pem",
        }
      : false, // Ellers bruk HTTP
    port: 5002, // Sett serverens port til 5002
    proxy: {
      // Konfigurer proxy for API
      "/api": {
        target: "http://localhost:5001", // API-serverens adresse
        changeOrigin: true, // Endre origin for forespørsel
        secure: false, // Deaktiver HTTPS-sjekk
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/index.css";`, // Importer global CSS for SCSS
      },
    },
  },
  build: {
    outDir: "dist", // Angi utgangsmappen for byggeprosessen
    sourcemap: false, // Deaktiver kildekartlegging i produksjon
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"], // Skille ut vendor-pakker i en egen chunk
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Sett grense for advarsel om chunk-størrelse
  },
  define: {
    __API_BASE__: JSON.stringify(isDev ? "/api" : process.env.VITE_API_URL), // Definer API-basen avhengig av om det er utviklings- eller produksjon modus
  },
});
