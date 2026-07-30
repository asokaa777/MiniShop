import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import api from '../services/api';
import { tokenStorage } from '../services/tokenStorage';
import { AuthState, AuthUser } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  socialLogin: (provider: 'google' | 'facebook', providerToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  // Restore session from secure storage on app launch
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const storedToken = await tokenStorage.load();
      if (!storedToken) {
        setState({ user: null, token: null, isLoading: false });
        return;
      }

      // Verify token is still valid by fetching current user
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      const { data } = await api.get<AuthUser>('/auth/me');

      setState({ user: data, token: storedToken, isLoading: false });
    } catch {
      // Token expired or invalid — clear it
      await tokenStorage.clear();
      delete api.defaults.headers.common['Authorization'];
      setState({ user: null, token: null, isLoading: false });
    }
  };

  const saveSession = useCallback(async (user: AuthUser, token: string) => {
    await tokenStorage.save(token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setState({ user, token, isLoading: false });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    await saveSession(data.user, data.token);
  }, [saveSession]);

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    phone?: string,
  ) => {
    const { data } = await api.post('/auth/register', { name, email, password, phone });
    await saveSession(data.user, data.token);
  }, [saveSession]);

  const socialLogin = useCallback(async (
    provider: 'google' | 'facebook',
    providerToken: string,
  ) => {
    const { data } = await api.post(`/auth/social/${provider}`, { token: providerToken });
    await saveSession(data.user, data.token);
  }, [saveSession]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      await tokenStorage.clear();
      delete api.defaults.headers.common['Authorization'];
      setState({ user: null, token: null, isLoading: false });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, socialLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
