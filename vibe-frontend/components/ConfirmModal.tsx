'use client';

import { useEffect } from 'react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open, title, message, confirmLabel = 'Изтрий', onConfirm, onCancel,
}: Props) {
  // Escape затваря модала
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop — клик отвън затваря */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      <div role="dialog" aria-modal="true" aria-labelledby="modal-title"
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6">
        <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} autoFocus
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
            Отказ
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
