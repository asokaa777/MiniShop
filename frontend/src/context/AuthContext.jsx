import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../services/api";

const TOKEN_KEY = "minishop_token";
const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app mount
  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
    api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      // Token expired or invalid
      localStorage.removeItem(TOKEN_KEY);
      delete api.defaults.headers.common["Authorization"];
    } finally {
      setIsLoading(false);
    }
  }

  const saveSession = useCallback((userData, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    saveSession(data.user, data.token);
  }, [saveSession]);

  const register = useCallback(async (name, email, password, phone) => {
    const { data } = await api.post("/auth/register", { name, email, password, phone });
    saveSession(data.user, data.token);
  }, [saveSession]);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
