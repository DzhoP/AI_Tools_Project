'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toolsApi, categoriesApi, rolesApi, AiTool, Category, Role, ToolStatus } from '@/lib/api';
import { useToast } from '@/components/Toast';

const STATUS_TABS: { value: string; label: string }[] = [
  { value: 'all',      label: 'Всички' },
  { value: 'pending',  label: 'Чакащи' },
  { value: 'approved', label: 'Одобрени' },
  { value: 'rejected', label: 'Отказани' },
];

const STATUS_BADGE: Record<ToolStatus, { label: string; cls: string }> = {
  pending:  { label: '⏳ Чакащ',   cls: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' },
  approved: { label: '✓ Одобрен',  cls: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' },
  rejected: { label: '✕ Отказан',  cls: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' },
};

const selectCls = 'w-full sm:w-auto px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500';

export default function AdminToolsPage() {
  const { toast } = useToast();
  const [tools, setTools] = useState<AiTool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('');
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // stale-флагът пази от race condition при бързо писане в търсачката
  useEffect(() => {
    let stale = false;
    setLoading(true);
    toolsApi.list({
      status,
      category: category || undefined,
      role: role || undefined,
      search: search || undefined,
    })
      .then(data => { if (!stale) setTools(data); })
      .catch(e => { if (!stale) toast(e instanceof Error ? e.message : 'Грешка при зареждане', 'error'); })
      .finally(() => { if (!stale) setLoading(false); });
    return () => { stale = true; };
  }, [status, category, role, search, toast]);

  useEffect(() => {
    Promise.all([categoriesApi.list(), rolesApi.list()])
      .then(([cats, rls]) => { setCategories(cats); setRoles(rls); });
  }, []);

  async function changeStatus(tool: AiTool, newStatus: ToolStatus) {
    try {
      const updated = await toolsApi.setStatus(tool.id, newStatus);
      setTools(prev => prev.map(t => (t.id === tool.id ? { ...t, status: updated.status } : t)));
      toast(newStatus === 'approved' ? `"${tool.name}" е одобрен.` : `"${tool.name}" е отказан.`);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Грешка', 'error');
    }
  }

  const pendingCount = tools.filter(t => t.status === 'pending').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Инструменти</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {tools.length} в изгледа{status === 'all' && pendingCount > 0 && ` · ${pendingCount} чакат одобрение`}
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1 mb-4">
        {STATUS_TABS.map(tab => (
          <button key={tab.value} onClick={() => setStatus(tab.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              status === tab.value
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input type="text" placeholder="Търси по име..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500" />
        <select className={selectCls} value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">Всички категории</option>
          {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select className={selectCls} value={role} onChange={e => setRole(e.target.value)}>
          <option value="">Всички роли</option>
          {roles.map(r => <option key={r.id} value={r.name}>{r.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3 font-medium">Инструмент</th>
                <th className="px-4 py-3 font-medium">Автор</th>
                <th className="px-4 py-3 font-medium">Категории</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Зарежда…</td></tr>
              ) : tools.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Няма инструменти в този изглед</td></tr>
              ) : tools.map(tool => (
                <tr key={tool.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <Link href={`/tools/${tool.id}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-amber-700 dark:hover:text-amber-400">
                      {tool.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {tool.user?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {tool.categories.map(c => c.name).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_BADGE[tool.status].cls}`}>
                      {STATUS_BADGE[tool.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {/* Решението е финално — бутони има само докато инструментът чака одобрение */}
                    {tool.status === 'pending' ? (
                      <>
                        <button onClick={() => changeStatus(tool, 'approved')}
                          className="px-2.5 py-1 text-xs font-medium rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 mr-1">
                          ✓ Одобри
                        </button>
                        <button onClick={() => changeStatus(tool, 'rejected')}
                          className="px-2.5 py-1 text-xs font-medium rounded bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60">
                          ✕ Откажи
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">финално</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
