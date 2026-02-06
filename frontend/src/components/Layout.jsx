import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/quiz', label: 'Interview Quiz' },
  { to: '/resume', label: 'AI Resume Generator' }
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="px-6 py-6 flex items-center gap-2 border-b border-slate-800">
          <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-semibold">
            AI
          </div>
          <div>
            <p className="text-sm font-semibold">AI Career Accelerator</p>
            <p className="text-xs text-slate-400">Level up your career</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                  isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-400">
          <p className="font-medium text-slate-200">{user?.name}</p>
          <p className="truncate">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-3 inline-flex items-center text-xs text-slate-300 hover:text-red-400"
          >
            Logout
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary-600 flex items-center justify-center text-white font-semibold">
              AI
            </div>
            <span className="text-sm font-semibold">AI Career Accelerator</span>
          </Link>
          <button
            onClick={logout}
            className="text-xs px-3 py-1 rounded-lg border border-slate-700 text-slate-200"
          >
            Logout
          </button>
        </header>
        <main className="flex-1 px-4 md:px-8 py-6 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

