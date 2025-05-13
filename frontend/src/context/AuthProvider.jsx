import { useState, useEffect, useRef } from "react";
import axios from "../api/axiosInstance";
import { AuthContext } from "./AuthContext";

// Sjekker om accessToken er utløpt
const isTokenExpired = (token) => {
  try {
    // Dekoder JWT-token og sjekker om utløpstiden (exp) er før nåværende tidspunkt
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// Context-provider som gjør autentiseringsdata og funksjoner tilgjengelig for resten av appen
export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Setter bruker manuelt og hopper over neste automatiske fetch i useEffect for å unngå unødvendig dobbeltkall til /auth/me
  const skipNextFetch = useRef(false);

  // Setter bruker manuelt og hopper over neste fetch
  const setUser = (userData) => {
    skipNextFetch.current = true;
    setUserState(userData);
  };

  // Kjører en gang ved oppstart for å hente innlogget bruker
  useEffect(() => {
    const fetchUser = async () => {
      let token = localStorage.getItem("accessToken");

      // Forsøk å hente ny token hvis ingen finnes eller den er utløpt
      if (!token || isTokenExpired(token)) {
        const refreshToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("refreshToken="));
        if (refreshToken) {
          const refreshRes = await axios.post("/auth/refresh-token", null, {
            withCredentials: true,
          });

          if (refreshRes.status === 200) {
            const newAccessToken = refreshRes.data.accessToken;
            localStorage.setItem("accessToken", newAccessToken);
            token = newAccessToken;
          }
        }
      }

      // Hvis fortsatt ingen token, brukeren er ikke logget inn
      if (!token) {
        setUserState(null);
        setLoading(false);
        return;
      }

      // Unngå å hente bruker hvis vi nettopp satte den manuelt
      if (skipNextFetch.current) {
        skipNextFetch.current = false;
        setLoading(false);
        return;
      }

      // Hent innlogget bruker fra API
      try {
        const res = await axios.get("/auth/me");
        setUserState(res.data.user);
      } catch (err) {
        // Ved 401-feil, fjern token og logg ut bruker
        if (err.response?.status === 401) {
          localStorage.removeItem("accessToken");
          setUserState(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Logger ut brukeren og fjerner token
  const logout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("accessToken");
      setUserState(null);
    }
  };

  // Gjør brukerdata og funksjoner tilgjengelig via context
  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
