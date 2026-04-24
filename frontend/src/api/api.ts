import axios from "axios";
import { useAuthStore } from "@/features/auth/store";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

api.interceptors.request.use((config) => {
  if (!config.headers.has('Authorization')) {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});
