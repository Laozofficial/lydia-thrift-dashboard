import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/products', label: 'Products' },
  { to: '/users', label: 'Users' },
  { to: '/enrollments', label: 'Plans' },
  { to: '/transactions', label: 'Transactions' },
];

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col border-r border-stone-200 bg-white">
        <div className="border-b border-stone-200 px-5 py-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">Lydia&apos;s Thrift</p>
          <h1 className="font-display mt-1 text-lg font-bold text-stone-900">Admin</h1>
        </div>
        <nav className="flex flex-1 flex-col gap-0 p-0">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `border-b border-stone-100 px-5 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'border-l-4 border-l-brand bg-cream text-brand'
                    : 'text-stone-600 hover:bg-cream-bg hover:text-brand'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-stone-200 p-4">
          <p className="truncate text-sm font-medium text-stone-800">{user?.name}</p>
          <p className="truncate text-xs text-stone-500">{user?.email}</p>
          <button
            type="button"
            onClick={() => logout()}
            className="mt-3 w-full border border-stone-200 px-3 py-2 text-sm font-medium text-stone-600 hover:border-brand hover:text-brand"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
