export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  avatar: string | null;
  phone: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
}
