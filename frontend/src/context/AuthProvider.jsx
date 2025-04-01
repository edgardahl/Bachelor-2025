import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "../api/axiosInstance";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const skipNextFetch = useRef(false);
  const location = useLocation();

  const setUser = (userData) => {
    skipNextFetch.current = true;
    setUserState(userData);
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
  
    // If no token, don't attempt fetch
    if (!token) {
      console.log("[AuthProvider] No token found");
      setUserState(null);
      setLoading(false);
      return;
    }
  
    // Only try once unless login explicitly sets a user
    if (skipNextFetch.current) {
      console.log("[AuthProvider] Skipping /auth/me after login");
      skipNextFetch.current = false;
      setLoading(false);
      return;
    }
  
    console.log("[AuthProvider] Validating token with /auth/me...");
    axios
      .get("/auth/me")
      .then((res) => {
        console.log("[AuthProvider] ✅ User:", res.data.user);
        setUserState(res.data.user);
      })
      .catch((err) => {
        console.error("[AuthProvider] ❌ /auth/me failed:", err?.response?.data || err.message);
        localStorage.removeItem("accessToken"); // Clear token to avoid repeat
        setUserState(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [location.pathname]);
  

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
