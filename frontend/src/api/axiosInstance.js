/**
 * Axios instance with built-in authentication logic.
 *
 * ✅ What it does:
 * 1. Sets a default baseURL for all API requests (e.g., '/api').
 * 2. Automatically includes cookies (like refreshToken) with each request via `withCredentials: true`.
 * 3. Automatically attaches the access token (stored in localStorage) as an Authorization header.
 * 4. Handles expired access tokens:
 *    - Intercepts 401 Unauthorized responses.
 *    - Silently sends a request to /api/auth/refresh-token using the refreshToken cookie.
 *    - Updates the access token in localStorage.
 *    - Retries the original request with the new token.
 *
 * ✅ Why it's useful:
 * - Centralized auth logic
 * - Reduces duplication and improves security
 * - Helps ensure refresh flow works consistently
 */

import axios from 'axios';

// ✅ Create the main axios instance
const instance = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// ✅ Attach access token to outgoing requests
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Create a bare axios instance (no interceptors) for refresh token call
const rawAxios = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// ✅ Handle 401 (Unauthorized) by refreshing access token
instance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.warn('[Axios] Access token expired. Trying refresh...');
        const res = await rawAxios.post('/auth/refresh-token');

        const newAccessToken = res.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);

        // Update and retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance(originalRequest);

      } catch (refreshError) {
        console.error('[Axios] Refresh token failed:', refreshError?.response?.data || refreshError.message);

        // Cleanup
        localStorage.removeItem('accessToken');

        // ⛔ Prevent redirect loop — just reject for now
        // window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);

export default instance;
