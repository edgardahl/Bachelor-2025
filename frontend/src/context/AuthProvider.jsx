import { useState, useEffect, useRef } from "react";
import axios from "../api/axiosInstance";
import { AuthContext } from "./AuthContext";

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
      const token = localStorage.getItem("accessToken");

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
        console.error("[AuthProvider] /auth/me failed:", err?.response?.data || err.message);
        localStorage.removeItem("accessToken");
        setUserState(null);
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
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
