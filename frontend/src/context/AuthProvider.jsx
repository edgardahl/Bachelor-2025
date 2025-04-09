import { useState, useEffect, useRef } from "react";
import axios from "../api/axiosInstance";
import { AuthContext } from "./AuthContext";

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now(); // exp is in seconds, so multiply by 1000 for milliseconds
  } catch {
    return true; // If decoding fails, assume the token is expired
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
      console.log("[AuthProvider] Access token:", token);
    
      if (!token || isTokenExpired(token)) {
        console.warn("[AuthProvider] Access token expired or missing, attempting to refresh.");
        console.log("[AuthProvider] Access token expired or missing, attempting to refresh.");
    
        // If token is expired, try to get a new access token with the refresh token
        const refreshToken = document.cookie.split("; ").find(row => row.startsWith("refreshToken="));
        if (refreshToken) {
          const refreshRes = await axios.post("/auth/refresh-token", null, { withCredentials: true });
    
          if (refreshRes.status === 200) {
            const newAccessToken = refreshRes.data.accessToken;
            localStorage.setItem("accessToken", newAccessToken); // Update access token in localStorage
            token = newAccessToken; // Update token for current session
            console.log("[AuthProvider] Access token refreshed successfully.");
          }
        }
      }
    
      // If there is no valid access token, log out
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
        // ✅ No need to manually add the Authorization header
        const res = await axios.get("/auth/me");
        setUserState(res.data.user);
        console.log("[AuthProvider] /auth/me response:", res.data);
      } catch (err) {
        console.error("[AuthProvider] /auth/me failed:", err);
        if (err.response?.status === 401) {
          console.warn("[AuthProvider] Access token expired, clearing session.");
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
