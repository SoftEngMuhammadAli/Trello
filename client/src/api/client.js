import axios from 'axios';
import { clearAccessToken, getAccessToken, setAccessToken } from '../utils/authStorage';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3030/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest?.url?.includes('/auth/');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        const { data } = await refreshClient.post('/auth/refresh');
        setAccessToken(data.accessToken);
        window.dispatchEvent(new Event('auth:changed'));

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (_refreshError) {
        clearAccessToken();
        window.dispatchEvent(new Event('auth:changed'));
      }
    }

    return Promise.reject(error);
  },
);

export default api;
