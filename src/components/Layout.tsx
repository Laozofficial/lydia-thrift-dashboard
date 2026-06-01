import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/products', label: 'Products' },
  { to: '/users', label: 'Users' },
  { to: '/enrollments', label: 'Plans' },
  { to: '/transactions', label: 'Transactions' },
];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      {open ? (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </>
      )}
    </svg>
  );
}

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = navOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [navOpen]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-[48px] items-center border-b border-stone-100 px-5 text-base font-medium transition md:min-h-0 md:py-3 md:text-sm ${
      isActive
        ? 'border-l-4 border-l-brand bg-cream text-brand'
        : 'text-stone-600 hover:bg-cream-bg hover:text-brand'
    }`;

  const sidebar = (
    <>
      <div className="border-b border-stone-200 px-5 py-5 md:py-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">Lydia&apos;s Thrift</p>
        <h1 className="font-display mt-1 text-lg font-bold text-stone-900">Admin</h1>
      </div>
      <nav className="flex flex-1 flex-col overflow-y-auto">
        {nav.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass} onClick={() => setNavOpen(false)}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-stone-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <p className="truncate text-sm font-medium text-stone-800">{user?.name}</p>
        <p className="truncate text-xs text-stone-500">{user?.email}</p>
        <button
          type="button"
          onClick={() => logout()}
          className="mt-3 min-h-[44px] w-full border border-stone-200 px-3 py-2.5 text-sm font-medium text-stone-600 hover:border-brand hover:text-brand"
        >
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col md:flex-row">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex min-h-14 shrink-0 items-center justify-between border-b border-stone-200 bg-white px-4 pt-[env(safe-area-inset-top)] md:hidden">
        <button
          type="button"
          onClick={() => setNavOpen((o) => !o)}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center text-stone-800"
          aria-expanded={navOpen}
          aria-label={navOpen ? 'Close menu' : 'Open menu'}
        >
          <MenuIcon open={navOpen} />
        </button>
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-brand">Lydia&apos;s Thrift</p>
          <p className="font-display text-sm font-bold text-stone-900">Admin</p>
        </div>
        <div className="w-11" aria-hidden />
      </header>

      {/* Mobile drawer backdrop */}
      {navOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-stone-900/50 md:hidden"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      {/* Sidebar — drawer on mobile, fixed column on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(100vw,280px)] flex-col border-r border-stone-200 bg-white pt-[env(safe-area-inset-top)] transition-transform duration-200 ease-out md:static md:z-auto md:w-60 md:translate-x-0 md:pt-0 ${
          navOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebar}
      </aside>

      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
