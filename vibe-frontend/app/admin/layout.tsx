'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

const SIDEBAR_ITEMS = [
  { href: '/admin/tools',    label: 'Инструменти',  icon: '🧰' },
  { href: '/admin/users',    label: 'Потребители',  icon: '👥' },
  { href: '/admin/activity', label: 'Одит лог',     icon: '📋' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }
    if (user.role?.name !== 'owner') router.replace('/dashboard');
  }, [user, loading, router]);

  if (loading || !user || user.role?.name !== 'owner') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="md:w-48 flex-shrink-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-3">
            Админ панел
          </p>
          <nav className="flex md:flex-col gap-1">
            {SIDEBAR_ITEMS.map(item => (
              <Link key={item.href} href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}>
                <span className="mr-2">{item.icon}</span>{item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
