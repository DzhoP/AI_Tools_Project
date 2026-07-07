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

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
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

  // 2FA временно е изключен на бекенда — login() влиза директно.
  // verifyTwoFactor() е запазена, за да се включи обратно без промяна тук.
  async function login(email: string, password: string) {
    const data = await api.post<{ user: User; token: string }>('/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
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
