'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ToolForm from '@/components/ToolForm';
import { toolsApi, AiTool } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function EditToolPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tool, setTool]         = useState<AiTool | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!id) return;
    toolsApi.get(Number(id))
      .then(setTool)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500 dark:text-gray-400">
        <p className="text-4xl mb-3">🔍</p>
        <p className="font-medium">Инструментът не е намерен</p>
        <Link href="/tools" className="mt-4 inline-block text-amber-700 dark:text-amber-400 hover:underline text-sm">← Назад</Link>
      </div>
    );
  }

  // UX проверка — реалната защита е в API-то, но няма смисъл да показваме
  // форма, чийто запис така или иначе ще бъде отказан с 403
  const canEdit = !!user && (user.role?.name === 'owner' || tool?.user?.id === user.id);
  if (tool && !canEdit) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500 dark:text-gray-400">
        <p className="text-4xl mb-3">🔒</p>
        <p className="font-medium">Само авторът или Owner може да редактира този инструмент</p>
        <Link href={`/tools/${id}`} className="mt-4 inline-block text-amber-700 dark:text-amber-400 hover:underline text-sm">← Към инструмента</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/tools" className="text-sm text-amber-700 dark:text-amber-400 hover:underline">← Назад към инструментите</Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">Редакция: {tool?.name}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Промени информацията за инструмента</p>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        {tool && <ToolForm initial={tool} />}
      </div>
    </div>
  );
}
