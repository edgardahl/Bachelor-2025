import axios from "axios";

const isDev = window.location.hostname === "localhost";

const baseURL =
  window.location.hostname === "localhost"
    ? "https://localhost:5001/api"
    : "/api";

const instance = axios.create({
  baseURL,
  withCredentials: true,
});

// Request interceptor to attach access token to requests
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle expired tokens and failed login attempts
let isRefreshing = false;
let failedQueue = [];

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

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is due to token expiration or other 401 errors that are not related to login failure
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      error.response?.data?.error !== "Invalid credentials"
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(instance(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      isRefreshing = true;

      try {
        // Attempt to refresh the access token
        const res = await instance.post("/auth/refresh-token");
        const newAccessToken = res.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);
        instance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // If it's a failed login attempt, don't trigger refresh token logic
    if (error.response?.data?.error === "Invalid credentials") {
      // Do not attempt to refresh the token here
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default instance;
