'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth, User } from '@/hooks/useAuth';

const inputCls = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500';

export default function ProfilePage() {
  const { user, loading, updateUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    if (user) { setName(user.name); setEmail(user.email); }
  }, [user, loading, router]);

  if (loading || !user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setMessage(''); setSaving(true);

    try {
      const updated = await api.put<User>('/user', {
        name,
        email,
        ...(password ? {
          current_password: currentPassword,
          password,
          password_confirmation: passwordConfirmation,
        } : {}),
      });
      // Иначе Navbar и Dashboard показват старото име до следващо презареждане
      updateUser(updated);
      setMessage('Профилът е обновен успешно.');
      setCurrentPassword(''); setPassword(''); setPasswordConfirmation('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при запис');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Моят профил</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Роля:{' '}
        <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-semibold">
          {user.role?.label ?? 'без роля'}
        </span>
        <span className="ml-2 text-gray-400">(ролята се променя само от Owner)</span>
      </p>

      {message && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm">{message}</div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Основна информация</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Име</label>
            <input required className={inputCls} value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Имейл</label>
            <input required type="email" className={inputCls} value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </div>

        {/* Password change */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Смяна на парола</h2>
          <p className="text-xs text-gray-400">Остави празно, ако не искаш да я сменяш.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Текуща парола</label>
            <input type="password" className={inputCls} value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)} autoComplete="current-password" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Нова парола</label>
              <input type="password" className={inputCls} value={password}
                onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Потвърди новата парола</label>
              <input type="password" className={inputCls} value={passwordConfirmation}
                onChange={e => setPasswordConfirmation(e.target.value)} autoComplete="new-password" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="px-6 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors">
          {saving ? 'Записва…' : 'Запази промените'}
        </button>
      </form>
    </div>
  );
}
