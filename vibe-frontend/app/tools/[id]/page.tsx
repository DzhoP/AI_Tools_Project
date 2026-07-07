'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { toolsApi, AiTool } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { textOn } from '@/lib/color';
import { DIFFICULTY_LABELS } from '@/lib/difficulty';
import ToolReviews from '@/components/ToolReviews';

export default function ToolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [tool, setTool] = useState<AiTool | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    toolsApi.get(id)
      .then(setTool)
      .catch(e => setError(e instanceof Error ? e.message : 'Грешка'));
  }, [id]);

  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500 dark:text-gray-400">
      {error} — <Link href="/tools" className="text-amber-700 dark:text-amber-400 hover:underline">обратно към списъка</Link>
    </div>
  );

  if (!tool) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">Зарежда…</div>
  );

  const diff = DIFFICULTY_LABELS[tool.difficulty];
  const canEdit = !!user && (user.role?.name === 'owner' || tool.user?.id === user.id);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/tools" className="text-sm text-amber-700 dark:text-amber-400 hover:underline">← Назад към инструментите</Link>

      {/* Header */}
      <div className="flex items-start gap-4 mt-4 mb-6">
        {tool.logo_url ? (
          <img src={tool.logo_url} alt={tool.name}
            className="w-16 h-16 rounded-xl object-contain border border-gray-100 dark:border-gray-700"
            onError={e => (e.currentTarget.style.display = 'none')} />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <span className="text-amber-700 dark:text-amber-400 font-bold text-2xl">{tool.name[0]}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{tool.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${diff.color}`}>{diff.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${tool.is_free ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'}`}>
              {tool.is_free ? 'Безплатен' : 'Платен'}
            </span>
            {tool.categories.map(cat => (
              <span key={cat.id} className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: cat.color, color: textOn(cat.color) }}>{cat.name}</span>
            ))}
          </div>
        </div>
        {canEdit && (
          <Link href={`/tools/${tool.id}/edit`}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg flex-shrink-0">
            Редакция
          </Link>
        )}
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-3 mb-6">
        {tool.url && (
          <a href={tool.url} target="_blank" rel="noopener noreferrer"
            className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600">
            Посети сайта →
          </a>
        )}
        {tool.documentation_url && (
          <a href={tool.documentation_url} target="_blank" rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
            📚 Документация
          </a>
        )}
        {tool.video_url && (
          <a href={tool.video_url} target="_blank" rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
            🎬 Видео
          </a>
        )}
      </div>

      {/* Description */}
      {tool.description && (
        <p className="text-gray-600 dark:text-gray-300 mb-8">{tool.description}</p>
      )}

      {/* How to use — markdown */}
      {tool.how_to_use && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Как се използва</h2>
          <div className="prose prose-sm prose-amber max-w-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5
            [&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base [&_h1]:font-bold [&_h2]:font-semibold [&_h3]:font-semibold
            [&_h1]:mb-2 [&_h2]:mb-2 [&_h3]:mb-1 [&_p]:mb-2 [&_ul]:list-disc [&_ol]:list-decimal
            [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:mb-1 [&_a]:text-amber-700 [&_a]:underline
            [&_code]:bg-gray-100 [&_code]:text-gray-800 dark:[&_code]:bg-gray-700 dark:[&_code]:text-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
            [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto
            [&_blockquote]:border-l-4 [&_blockquote]:border-amber-300 [&_blockquote]:pl-4 [&_blockquote]:text-gray-500">
            <ReactMarkdown>{tool.how_to_use}</ReactMarkdown>
          </div>
        </section>
      )}

      {/* Recommended roles */}
      {tool.roles.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Препоръчано за</h2>
          <div className="flex flex-wrap gap-2">
            {tool.roles.map(role => (
              <span key={role.id} className="text-sm px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                {role.label}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Examples */}
      {(tool.examples?.length ?? 0) > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Реални примери</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tool.examples.map((ex, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
                {ex.image_url && (
                  <a href={ex.url || ex.image_url} target="_blank" rel="noopener noreferrer">
                    <img src={ex.image_url} alt={ex.title || 'пример'}
                      className="w-full h-40 object-cover hover:opacity-90 transition-opacity"
                      onError={e => (e.currentTarget.style.display = 'none')} />
                  </a>
                )}
                <div className="p-4">
                  {ex.title && <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{ex.title}</p>}
                  {ex.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{ex.description}</p>}
                  {ex.url && (
                    <a href={ex.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-amber-700 dark:text-amber-400 hover:underline mt-2 inline-block">
                      Виж примера →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <ToolReviews toolId={tool.id} />

      {/* Tags + author */}
      <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {tool.tags.map(tag => (
            <span key={tag.id} className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: tag.color, color: textOn(tag.color) }}>#{tag.name}</span>
          ))}
        </div>
        {tool.user && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Добавен от: <span className="font-medium text-gray-600 dark:text-gray-300">{tool.user.name}</span>
            {tool.user.role && <span> ({tool.user.role.label})</span>}
          </p>
        )}
      </div>
    </div>
  );
}
