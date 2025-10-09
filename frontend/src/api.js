import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (
      token &&
      !config.url.includes("/token/") &&
      !config.url.includes("/token/refresh/")
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem(REFRESH_TOKEN);

        if (refresh) {
          const res = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/token/refresh/`,
            { refresh }
          );

          localStorage.setItem(ACCESS_TOKEN, res.data.access);

          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        }
      } catch (error) {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
