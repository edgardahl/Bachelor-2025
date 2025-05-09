import { useState, useEffect, useRef } from "react";
import axios from "../api/axiosInstance";
import { AuthContext } from "./AuthContext";

// Funksjon for å sjekke om token er utløpt
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const skipNextFetch = useRef(false);

  const setUser = (userData) => {
    skipNextFetch.current = true;
    setUserState(userData);
  };

  useEffect(() => {
    const fetchUser = async () => {
      let token = localStorage.getItem("accessToken");

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

      if (!token) {
        setUserState(null);
        setLoading(false);
        return;
      }

      if (skipNextFetch.current) {
        skipNextFetch.current = false;
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("/auth/me");
        setUserState(res.data.user);
      } catch (err) {
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

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
