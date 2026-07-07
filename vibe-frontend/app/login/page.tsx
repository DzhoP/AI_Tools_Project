'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const inputCls = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500';

export default function LoginPage() {
  const router = useRouter();
  const { login, verifyTwoFactor } = useAuth();
  const [step, setStep] = useState<'credentials' | 'code'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      setDemoCode(res.demo_code);
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при вход');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyTwoFactor(email, code);
      router.push('/tools');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Невалиден код');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          {step === 'credentials' ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Вход</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Влез в своя AI_Tools акаунт</p>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleCredentials} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Имейл</label>
                  <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                    required autoComplete="email" className={inputCls} placeholder="owner@vibe.test" />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Парола</label>
                  <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                    required autoComplete="current-password" className={inputCls} placeholder="••••••••" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {loading ? 'Влизане…' : 'Влез'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Потвърди входа</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Изпратихме 6-цифрен код на <strong>{email}</strong>
              </p>

              {demoCode && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300">
                  🧪 <strong>Демо режим:</strong> кодът ти е <code className="font-mono text-base font-bold">{demoCode}</code>
                  <span className="block text-xs mt-1 text-amber-700 dark:text-amber-400">
                    (в реална среда кодът пристига само по имейл)
                  </span>
                </div>
              )}

              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Код</label>
                  <input id="code" type="text" inputMode="numeric" maxLength={6} value={code}
                    onChange={e => setCode(e.target.value)} required autoFocus
                    className={`${inputCls} text-center text-2xl tracking-widest font-mono`} placeholder="000000" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {loading ? 'Проверява…' : 'Потвърди'}
                </button>
                <button type="button" onClick={() => { setStep('credentials'); setCode(''); setDemoCode(null); setError(''); }}
                  className="w-full text-sm text-gray-500 dark:text-gray-400 hover:underline">
                  ← Назад
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
