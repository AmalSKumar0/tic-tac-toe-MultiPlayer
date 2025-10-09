import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Flag to avoid multiple simultaneous refresh requests
let isRefreshing = false;
let refreshSubscribers = [];

// Subscribe to refresh
const subscribeTokenRefresh = (cb) => refreshSubscribers.push(cb);
const onRefreshed = (token) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

// Request interceptor: add access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token && !config.url.includes("/token/")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        const refresh = localStorage.getItem(REFRESH_TOKEN);

        if (!refresh) {
          window.location.href = "/login";
          return Promise.reject(error);
        }

        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/token/refresh/`,
            { refresh }
          );

          localStorage.setItem(ACCESS_TOKEN, res.data.access);
          isRefreshing = false;
          onRefreshed(res.data.access);
        } catch (err) {
          isRefreshing = false;
          localStorage.removeItem(ACCESS_TOKEN);
          localStorage.removeItem(REFRESH_TOKEN);
          window.location.href = "/login";
          return Promise.reject(err);
        }
      }

      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

// Optional: Periodically refresh access token proactively
setInterval(async () => {
  const refresh = localStorage.getItem(REFRESH_TOKEN);
  if (!refresh) return;

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/token/refresh/`,
      { refresh }
    );
    localStorage.setItem(ACCESS_TOKEN, res.data.access);
  } catch (err) {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    window.location.href = "/login";
  }
}, 4 * 60 * 1000); // every 4 minutes

export default api;
