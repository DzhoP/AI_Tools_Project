import type { Difficulty } from '@/lib/api';

// Едно място за етикетите и цветовете на нивата на трудност —
// ползва се от списъка и от детайлната страница
export const DIFFICULTY_LABELS: Record<Difficulty, { label: string; color: string }> = {
  beginner:     { label: 'Начинаещ',  color: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' },
  intermediate: { label: 'Среден',    color: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' },
  advanced:     { label: 'Напреднал', color: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' },
};
