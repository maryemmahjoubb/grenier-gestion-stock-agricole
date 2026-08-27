import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5226/api",
});

// Ajoute automatiquement le token JWT à chaque requête, s'il existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("grenier_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;