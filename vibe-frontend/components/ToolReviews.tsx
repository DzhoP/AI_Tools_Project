'use client';

import { useEffect, useState, useCallback } from 'react';
import { reviewsApi, Review } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';

function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-0.5" role={onChange ? 'radiogroup' : undefined} aria-label="Оценка">
      {[1, 2, 3, 4, 5].map(star => (
        onChange ? (
          <button key={star} type="button" onClick={() => onChange(star)}
            aria-label={`${star} от 5 звезди`}
            className={`text-2xl leading-none transition-colors ${
              star <= value ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600 hover:text-amber-300'
            }`}>
            ★
          </button>
        ) : (
          <span key={star} className={`text-base leading-none ${
            star <= value ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600'
          }`}>★</span>
        )
      ))}
    </div>
  );
}

export default function ToolReviews({ toolId }: { toolId: number | string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = useCallback(() => {
    reviewsApi.list(toolId).then(setReviews).catch(() => {});
  }, [toolId]);

  useEffect(() => { load(); }, [load]);

  // Ако потребителят вече е оставял отзив — формата се попълва с него
  useEffect(() => {
    if (!user) return;
    const mine = reviews.find(r => r.user.id === user.id);
    if (mine) { setRating(mine.rating); setComment(mine.comment ?? ''); }
  }, [reviews, user]);

  const myReview = user ? reviews.find(r => r.user.id === user.id) : undefined;
  const avg = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { toast('Избери брой звезди.', 'error'); return; }
    setSaving(true);
    try {
      await reviewsApi.submit(toolId, { rating, comment });
      toast(myReview ? 'Отзивът е обновен.' : 'Благодарим за отзива!');
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Грешка', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (deleteId === null) return;
    try {
      await reviewsApi.remove(deleteId);
      setReviews(prev => prev.filter(r => r.id !== deleteId));
      toast('Отзивът е изтрит.');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Грешка', 'error');
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <section className="mb-8">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Отзиви</h2>
        {reviews.length > 0 && (
          <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Stars value={Math.round(avg)} />
            <strong className="text-gray-900 dark:text-gray-100">{avg.toFixed(1)}</strong>
            от {reviews.length} {reviews.length === 1 ? 'отзив' : 'отзива'}
          </span>
        )}
      </div>

      {/* Форма — само за логнати */}
      {user ? (
        <form onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-6 space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {myReview ? 'Твоят отзив (можеш да го промениш):' : 'Остави отзив:'}
          </p>
          <Stars value={rating} onChange={setRating} />
          <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
            maxLength={2000}
            placeholder="Сподели опита си с този инструмент (по желание)..."
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500" />
          <button type="submit" disabled={saving}
            className="px-5 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors">
            {saving ? 'Записва…' : myReview ? 'Обнови отзива' : 'Публикувай'}
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          <a href="/login" className="text-amber-700 dark:text-amber-400 hover:underline">Влез</a>, за да оставиш отзив.
        </p>
      )}

      {/* Списък */}
      {reviews.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Все още няма отзиви — бъди първият!</p>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <div key={review.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{review.user.name}</span>
                  {review.user.role && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                      {review.user.role.label}
                    </span>
                  )}
                  <Stars value={review.rating} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString('bg-BG')}
                  </span>
                  {user && (review.user.id === user.id || user.role?.name === 'owner') && (
                    <button onClick={() => setDeleteId(review.id)}
                      className="text-xs text-red-500 dark:text-red-400 hover:underline">
                      Изтрий
                    </button>
                  )}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={deleteId !== null}
        title="Изтриване на отзив"
        message="Сигурен ли си, че искаш да изтриеш този отзив?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </section>
  );
}
