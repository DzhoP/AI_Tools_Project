'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const ToastContext = createContext<{
  toast: (message: string, type?: 'success' | 'error') => void;
}>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast stack — долу вдясно */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map(t => (
          <div key={t.id} role="status"
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white animate-[slideIn_.2s_ease-out] ${
              t.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            }`}>
            {t.type === 'success' ? '✓ ' : '✕ '}{t.message}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(1rem); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
