'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ToolForm from '@/components/ToolForm';
import { useAuth } from '@/hooks/useAuth';

export default function NewToolPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/tools" className="text-sm text-amber-700 dark:text-amber-400 hover:underline">← Назад към инструментите</Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">Добави AI инструмент</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Попълни информацията за новия инструмент</p>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <ToolForm />
      </div>
    </div>
  );
}
