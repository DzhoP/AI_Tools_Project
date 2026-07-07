'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { categoriesApi, toolsApi, Category, AiTool } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<AiTool[]>([]);

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {});
    toolsApi.list().then(setTools).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-amber-50 dark:from-gray-900 to-white dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            AI инструментите на екипа —<br className="hidden sm:block" />
            <span className="text-amber-700 dark:text-amber-400"> на едно място</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Каталог с проверени AI инструменти, подбрани по роля и категория.
            Открий кое върши работа за твоята позиция — с инструкции и реални примери от колегите ти.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/tools"
              className="px-6 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors">
              Разгледай инструментите
            </Link>
            {!user && (
              <Link href="/login"
                className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Вход
              </Link>
            )}
            {user && (
              <Link href="/tools/new"
                className="px-6 py-3 bg-white dark:bg-gray-800 text-amber-700 dark:text-amber-400 font-medium rounded-xl border border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors">
                + Добави инструмент
              </Link>
            )}
          </div>
          <p className="mt-6 text-sm text-gray-400">
            {tools.length > 0 && `${tools.length} инструмента в ${categories.length} категории`}
          </p>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Категории</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map(cat => {
              const count = tools.filter(t => t.categories.some(c => c.id === cat.id)).length;
              return (
                <Link key={cat.id} href={`/tools?category=${cat.slug}`}
                  className="group border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500 transition-all bg-white dark:bg-gray-800">
                  <div className="w-3 h-3 rounded-full mb-3" style={{ backgroundColor: cat.color }} />
                  <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-amber-700 transition-colors">
                    {cat.name}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {count} {count === 1 ? 'инструмент' : 'инструмента'}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
