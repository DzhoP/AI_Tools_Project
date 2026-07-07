'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/components/ThemeToggle';

const NAV_ITEMS = [
  { href: '/tools',       label: 'AI Инструменти', roles: null },          // null = за всички (и нелогнати)
  { href: '/dashboard',   label: 'Табло',           roles: ['owner', 'backend', 'frontend', 'pm', 'qa', 'designer'] },
  { href: '/tools/new',   label: '+ Добави',        roles: ['owner', 'backend', 'frontend', 'pm', 'qa', 'designer'] },
  { href: '/admin/tools', label: 'Админ',           roles: ['owner'] },    // само Owner
];

function SofiaClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) return null;

  const time = now.toLocaleTimeString('bg-BG', {
    timeZone: 'Europe/Sofia', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const date = now.toLocaleDateString('bg-BG', {
    timeZone: 'Europe/Sofia', day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <div className="hidden md:block text-sm text-gray-500 dark:text-gray-400 text-right leading-tight">
      <div><span className="font-mono font-medium text-gray-700 dark:text-gray-300">{time}</span></div>
      <div className="font-mono text-xs text-gray-500 dark:text-gray-400">{date}</div>
    </div>
  );
}

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(item =>
    item.roles === null || (user && item.roles.includes(user.role?.name ?? ''))
  );

  async function handleLogout() {
    try { await logout(); } catch { /* токенът може вече да е невалиден */ }
    setMenuOpen(false);
    router.push('/');
  }

  const linkCls = (href: string) =>
    `px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
      pathname === href
        ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30'
        : 'text-gray-600 dark:text-gray-300 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/30'
    }`;

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: logo + desktop nav */}
        <div className="flex items-center gap-6 min-w-0">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0" onClick={() => setMenuOpen(false)}>
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100 hidden sm:block">AI_Tools</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {visibleItems.map(item => (
              <Link key={item.href} href={item.href} className={linkCls(item.href)}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center: greeting (desktop only) */}
        {!loading && user && (
          <div className="hidden lg:block text-center leading-tight flex-shrink-0">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Добре дошъл, {user.name}</div>
            {user.role && (
              <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                {user.role.label}
              </span>
            )}
          </div>
        )}

        {/* Right: clock + auth (desktop) + hamburger (mobile) */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <SofiaClock />
          <ThemeToggle />

          {!loading && (
            user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/profile" className={linkCls('/profile')}>Профил</Link>
                <button onClick={handleLogout}
                  className="px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  Изход
                </button>
              </div>
            ) : (
              <Link href="/login"
                className="hidden sm:block px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors">
                Вход
              </Link>
            )
          )}

          {/* Hamburger */}
          <button onClick={() => setMenuOpen(o => !o)}
            className="sm:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            aria-label="Меню">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="sm:hidden border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 space-y-1">
          {!loading && user && (
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 mb-2">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Добре дошъл, {user.name}</p>
              {user.role && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                  {user.role.label}
                </span>
              )}
            </div>
          )}
          {visibleItems.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
              className={`block ${linkCls(item.href)}`}>
              {item.label}
            </Link>
          ))}
          {!loading && (
            user ? (
              <>
                <Link href="/profile" onClick={() => setMenuOpen(false)} className={`block ${linkCls('/profile')}`}>
                  Профил
                </Link>
                <button onClick={handleLogout}
                  className="block w-full text-left px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 rounded-lg">
                  Изход
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)}
                className="block px-3 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg">
                Вход
              </Link>
            )
          )}
        </nav>
      )}
    </header>
  );
}
