/**
 * Dette er en tilpasset Axios-instans som brukes til å gjøre alle API-kall i frontend-prosjektet.
 * Hvorfor bruker vi vår egen instans?
 *  For å håndtere autentisering og feilhåndtering sentralt.
 *  For å slippe å skrive `Authorization`-header og baseURL manuelt i hver forespørsel.
 *  For å sikre automatisk token-refresh uten å logge brukeren ut.
 */

import axios from "axios";

// Dynamisk baseURL basert på miljø (lokalt eller produksjon)
const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : import.meta.env.VITE_API_URL ||
      "https://bachelor-backend-production.up.railway.app/api";

// Logger feilmelding hvis baseURL ikke er satt (kun under utvikling)
if (!baseURL) {
  console.error("⚠️ API base URL er ikke definert");
}

// Oppretter en egen Axios-instans med baseURL og støtte for cookies
const instance = axios.create({
  baseURL,
  withCredentials: true, // Sørger for at cookies (f.eks. refresh-token) sendes med
});

/**
 * Request Interceptor
 * Legger automatisk til `Authorization`-header hvis accessToken finnes i localStorage
 */
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Kontrollflagg for å unngå flere samtidige refresh-forespørsler
let isRefreshing = false;
let failedQueue = [];

/**
 * Hjelpefunksjon for å prosessere alle forespørsler som feilet under token-refresh.
 * Når nytt token er klart, fortsetter alle forespørsler i køen.
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Response Interceptor
 * Håndterer 401-feil og forsøker automatisk å hente nytt accessToken med refresh-token.
 * Hvis token er utløpt og forespørselen ikke allerede er forsøkt på nytt, starter token-refresh.
 */
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const shouldRefresh =
      error.response?.status === 401 &&
      !originalRequest._retry &&
      error.response?.data?.error !== "Invalid credentials";

    if (shouldRefresh) {
      originalRequest._retry = true;

      // Hvis en annen refresh-token-forespørsel allerede er i gang, legg denne forespørselen i kø
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(instance(originalRequest)); // Prøv igjen med nytt token
            },
            reject: (err) => reject(err),
          });
        });
      }

      isRefreshing = true;

      try {
        // Hent nytt accessToken ved å bruke refresh-token (fra cookie)
        const res = await instance.post("/auth/refresh-token");
        const newAccessToken = res.data.accessToken;

        // Oppdater token i localStorage og i instansen
        localStorage.setItem("accessToken", newAccessToken);
        instance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken); // La alle forespørsler i køen fortsette

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance(originalRequest); // Prøv opprinnelig forespørsel på nytt
      } catch (refreshError) {
        processQueue(refreshError, null); // Avvis alle forespørsler i køen
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Returnerer feilen direkte hvis den skyldes ugyldige innloggingsdetaljer
    if (error.response?.data?.error === "Invalid credentials") {
      return Promise.reject(error);
    }

    // Hvis ikke noe annet gjelder, kast feilen som vanlig
    return Promise.reject(error);
  }
);

export default instance;
