import axios from "axios";

const api = axios.create({
  // Locally: set VITE_API_URL in frontend/.env.local
  // Production (Vercel): set VITE_API_URL in Vercel environment variables
  baseURL: import.meta.env.VITE_API_URL || "https://minishop-production-0016.up.railway.app/api",
});

export default api;