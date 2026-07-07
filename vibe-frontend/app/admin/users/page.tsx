'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: { id: number; name: string; label: string } | null;
  ai_tools_count: number;
  created_at: string;
}

export default function AdminUsersPage() {
  // Достъпът (owner-only) се пази от app/admin/layout.tsx — тук няма нужда от втори guard
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<AdminUser[]>('/users')
      .then(setUsers)
      .catch(e => setError(e instanceof Error ? e.message : 'Грешка'));
  }, []);

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Потребители</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{users.length} регистрирани потребители</p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">{error}</div>
      )}

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3 font-medium">Име</th>
                <th className="px-4 py-3 font-medium">Имейл</th>
                <th className="px-4 py-3 font-medium">Роля</th>
                <th className="px-4 py-3 font-medium text-right">Добавени инструменти</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {u.name}
                    {u.id === user.id && <span className="ml-2 text-xs text-gray-400">(ти)</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.role ? (
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        u.role.name === 'owner' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                      }`}>
                        {u.role.label}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">без роля</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{u.ai_tools_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
