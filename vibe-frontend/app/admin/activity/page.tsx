'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface ActivityLogEntry {
  id: number;
  action: 'created' | 'updated' | 'deleted' | 'pending' | 'approved' | 'rejected';
  tool_name: string;
  user: { id: number; name: string } | null;
  created_at: string;
}

const ACTION_LABELS: Record<ActivityLogEntry['action'], { label: string; cls: string }> = {
  created:  { label: 'Добавен',   cls: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' },
  updated:  { label: 'Редактиран', cls: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' },
  deleted:  { label: 'Изтрит',    cls: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
  pending:  { label: 'Върнат за преглед', cls: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' },
  approved: { label: 'Одобрен',   cls: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' },
  rejected: { label: 'Отказан',   cls: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' },
};

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ActivityLogEntry[]>('/activity')
      .then(setLogs)
      .catch(e => setError(e instanceof Error ? e.message : 'Грешка'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Одит лог</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Последните {logs.length} действия върху AI инструменти
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">{error}</div>
      )}

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3 font-medium">Кога</th>
                <th className="px-4 py-3 font-medium">Потребител</th>
                <th className="px-4 py-3 font-medium">Действие</th>
                <th className="px-4 py-3 font-medium">Инструмент</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Зарежда…</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Няма записана активност</td></tr>
              ) : logs.map(log => (
                <tr key={log.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {log.user?.name ?? '— (изтрит потребител)'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${ACTION_LABELS[log.action].cls}`}>
                      {ACTION_LABELS[log.action].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{log.tool_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
