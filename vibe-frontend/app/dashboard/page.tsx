'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toolsApi, AiTool } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

const ROLE_TIPS: Record<string, string> = {
  owner:    'Имаш пълен достъп — управляваш всички инструменти в системата.',
  backend:  'Разгледай категориите "Код и разработка" и "DevOps и Инфраструктура".',
  frontend: 'Разгледай "Код и разработка" и "Дизайн и UI/UX".',
  pm:       'Категорията "Продуктивност" е добро начало за управление на задачи.',
  qa:       'Виж "Тестване и QA" за инструменти за автоматизация на тестове.',
  designer: 'Категориите "Дизайн и UI/UX" и "Изображения" са за теб.',
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tools, setTools] = useState<AiTool[]>([]);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) toolsApi.list().then(setTools).catch(() => {});
  }, [user]);

  if (loading || !user) return null;

  const myTools = tools.filter(t => t.user?.id === user.id);
  const forMyRole = tools.filter(t => t.roles.some(r => r.name === user.role?.name));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Добре дошъл, {user.name}!
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Ти си с роля{' '}
          <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-sm font-semibold">
            {user.role?.label ?? 'без роля'}
          </span>
        </p>
        {user.role && ROLE_TIPS[user.role.name] && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 inline-block">
            💡 {ROLE_TIPS[user.role.name]}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{tools.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">инструмента общо</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">{forMyRole.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">препоръчани за твоята роля</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <p className="text-3xl font-bold text-emerald-600">{myTools.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">добавени от теб</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-10">
        <Link href="/tools/new"
          className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors">
          + Добави инструмент
        </Link>
        <Link href={`/tools?role=${user.role?.name ?? ''}`}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Инструменти за моята роля
        </Link>
        <Link href="/profile"
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Моят профил
        </Link>
      </div>

      {/* My tools */}
      {myTools.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Моите инструменти</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTools.map(tool => (
              <Link key={tool.id} href={`/tools/${tool.id}`}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{tool.name}</p>
                {tool.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{tool.description}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
