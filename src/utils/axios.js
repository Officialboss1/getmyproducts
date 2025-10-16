import axios from "axios";

// Dynamic backend URL from environment variable
const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development'
    ? "/api" // Use Vite proxy in development
    : baseURL, // Use environment variable in production
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
