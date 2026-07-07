'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Role {
  id: number;
  name: string;
  label: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

interface LoginResponse {
  two_factor_required: boolean;
  email: string;
  demo_code: string | null;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  verifyTwoFactor: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    api.get<User>('/user')
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  // Стъпка 1: имейл + парола → бекендът изпраща 6-цифрен код (2FA)
  async function login(email: string, password: string) {
    return api.post<LoginResponse>('/login', { email, password });
  }

  async function verifyTwoFactor(email: string, code: string) {
    const data = await api.post<{ user: User; token: string }>('/login/verify-2fa', { email, code });
    localStorage.setItem('token', data.token);
    setUser(data.user);
  }

  async function logout() {
    await api.post('/logout', {});
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyTwoFactor, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth трябва да се използва вътре в <AuthProvider>');
  return ctx;
}
