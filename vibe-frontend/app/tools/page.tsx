'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { toolsApi, categoriesApi, rolesApi, tagsApi, AiTool, Category, Role, Tag, ToolFilters } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import { textOn } from '@/lib/color';

const DIFFICULTY_LABELS = {
  beginner:     { label: 'Начинаещ',  color: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' },
  intermediate: { label: 'Среден',    color: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' },
  advanced:     { label: 'Напреднал', color: 'bg-red-100 text-red-700 dark:text-red-300' },
};

function ToolCard({ tool, onDelete, canEdit }: { tool: AiTool; onDelete: (id: number) => void; canEdit: boolean }) {
  const diff = DIFFICULTY_LABELS[tool.difficulty];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {tool.logo_url ? (
            <img src={tool.logo_url} alt={tool.name}
              className="w-10 h-10 rounded-lg object-contain flex-shrink-0"
              onError={e => (e.currentTarget.style.display = 'none')} />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
              <span className="text-amber-700 dark:text-amber-400 font-bold text-lg">{tool.name[0]}</span>
            </div>
          )}
          <div className="min-w-0">
            <Link href={`/tools/${tool.id}`}>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate hover:text-amber-700 transition-colors">{tool.name}</h3>
            </Link>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${diff.color}`}>{diff.label}</span>
              {tool.reviews_count > 0 && (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium whitespace-nowrap">
                  ★ {Number(tool.reviews_avg_rating).toFixed(1)} ({tool.reviews_count})
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!tool.is_active && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">Неактивен</span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full ${tool.is_free ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'}`}>
            {tool.is_free ? 'Безплатен' : 'Платен'}
          </span>
        </div>
      </div>

      {/* Description */}
      {tool.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{tool.description}</p>
      )}

      {/* Categories */}
      {tool.categories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tool.categories.map(cat => (
            <span key={cat.id} className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: cat.color, color: textOn(cat.color) }}>
              {cat.name}
            </span>
          ))}
        </div>
      )}

      {/* Roles */}
      {tool.roles.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tool.roles.map(role => (
            <span key={role.id} className="text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              {role.label}
            </span>
          ))}
        </div>
      )}

      {/* Tags */}
      {tool.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tool.tags.map(tag => (
            <span key={tag.id} className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: tag.color, color: textOn(tag.color) }}>
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Examples preview */}
      {(tool.examples?.length ?? 0) > 0 && (
        <div className="flex gap-2 overflow-x-auto py-1">
          {(tool.examples ?? []).filter(e => e.image_url).slice(0, 3).map((ex, i) => (
            <a key={i} href={ex.url || ex.image_url} target="_blank" rel="noopener noreferrer"
              title={ex.title || 'Скрийншот'}>
              <img src={ex.image_url} alt={ex.title || 'пример'}
                className="h-16 w-24 object-cover rounded-lg border border-gray-100 dark:border-gray-700 flex-shrink-0 hover:opacity-80 transition-opacity"
                onError={e => (e.currentTarget.style.display = 'none')} />
            </a>
          ))}
          {(tool.examples?.length ?? 0) > 0 && (
            <span className="text-xs text-gray-400 self-center flex-shrink-0">
              {tool.examples?.length} {tool.examples?.length === 1 ? 'пример' : 'примера'}
            </span>
          )}
        </div>
      )}

      {/* Author */}
      {tool.user && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Добавен от: <span className="font-medium text-gray-600 dark:text-gray-300">{tool.user.name}</span>
          {tool.user.role && <span> ({tool.user.role.label})</span>}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
        {tool.url && (
          <a href={tool.url} target="_blank" rel="noopener noreferrer"
            className="text-xs text-amber-700 dark:text-amber-400 hover:underline">Посети →</a>
        )}
        {tool.documentation_url && (
          <a href={tool.documentation_url} target="_blank" rel="noopener noreferrer"
            className="text-xs text-gray-500 dark:text-gray-400 hover:underline">Документация</a>
        )}
        {canEdit && (
          <div className="ml-auto flex gap-2">
            <Link href={`/tools/${tool.id}/edit`}
              className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300">
              Редакция
            </Link>
            <button onClick={() => onDelete(tool.id)}
              className="text-xs px-2 py-1 rounded bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400">
              Изтрий
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ToolsPage() {
  const { user }                      = useAuth();
  const { toast }                     = useToast();
  const [deleteId, setDeleteId]       = useState<number | null>(null);
  const [tools, setTools]             = useState<AiTool[]>([]);
  const [categories, setCategories]   = useState<Category[]>([]);
  const [roles, setRoles]             = useState<Role[]>([]);
  const [tags, setTags]               = useState<Tag[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filters, setFilters]         = useState<ToolFilters>(() => {
    if (typeof window === 'undefined') return {};
    const p = new URLSearchParams(window.location.search);
    return {
      category: p.get('category') ?? undefined,
      role:     p.get('role') ?? undefined,
      tag:      p.get('tag') ?? undefined,
    };
  });

  const loadTools = useCallback(async () => {
    setLoading(true);
    try { setTools(await toolsApi.list(filters)); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { loadTools(); }, [loadTools]);

  useEffect(() => {
    Promise.all([categoriesApi.list(), rolesApi.list(), tagsApi.list()])
      .then(([cats, rls, tgs]) => { setCategories(cats); setRoles(rls); setTags(tgs); });
  }, []);

  function handleDelete(id: number) {
    setDeleteId(id);
  }

  async function confirmDelete() {
    if (deleteId === null) return;
    try {
      await toolsApi.remove(deleteId);
      setTools(prev => prev.filter(t => t.id !== deleteId));
      toast('Инструментът е изтрит.');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Грешка при изтриване', 'error');
    } finally {
      setDeleteId(null);
    }
  }

  const setFilter = (key: keyof ToolFilters, value: string) =>
    setFilters(prev => ({ ...prev, [key]: value || undefined }));

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Инструменти</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tools.length} инструмента</p>
        </div>
        {user && (
          <Link href="/tools/new"
            className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors">
            + Добави инструмент
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6 space-y-3">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <input
            type="text" placeholder="Търси по име или описание..."
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={filters.search ?? ''}
            onChange={e => setFilter('search', e.target.value)}
          />

          {/* Category */}
          <select
            className="w-full sm:w-auto px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={filters.category ?? ''} onChange={e => setFilter('category', e.target.value)}>
            <option value="">Всички категории</option>
            {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>

          {/* Role */}
          <select
            className="w-full sm:w-auto px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={filters.role ?? ''} onChange={e => setFilter('role', e.target.value)}>
            <option value="">Всички роли</option>
            {roles.map(r => <option key={r.id} value={r.name}>{r.label}</option>)}
          </select>

          {/* Difficulty */}
          <select
            className="w-full sm:w-auto px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={filters.difficulty ?? ''} onChange={e => setFilter('difficulty', e.target.value)}>
            <option value="">Всички нива</option>
            <option value="beginner">Начинаещ</option>
            <option value="intermediate">Среден</option>
            <option value="advanced">Напреднал</option>
          </select>

          {hasFilters && (
            <button onClick={() => setFilters({})}
              className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline">
              Изчисти
            </button>
          )}
        </div>

        {/* Tag pills filter */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map(tag => {
              const active = filters.tag === tag.slug;
              return (
                <button key={tag.id} type="button"
                  onClick={() => setFilter('tag', active ? '' : tag.slug)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    active ? 'text-white border-transparent' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400'
                  }`}
                  style={active ? { backgroundColor: tag.color, borderColor: tag.color } : {}}>
                  #{tag.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 h-48 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded" />
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : tools.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">Няма намерени инструменти</p>
          <p className="text-sm mt-1">Промени филтрите или добави нов инструмент</p>
          {user && (
            <Link href="/tools/new"
              className="mt-4 inline-block px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600">
              + Добави първия инструмент
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map(tool => (
            <ToolCard key={tool.id} tool={tool} onDelete={handleDelete}
              canEdit={!!user && (user.role?.name === 'owner' || tool.user?.id === user.id)} />
          ))}
        </div>
      )}

      <ConfirmModal
        open={deleteId !== null}
        title="Изтриване на инструмент"
        message="Сигурен ли си? Действието е необратимо — инструментът и примерите му ще бъдат изтрити."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
