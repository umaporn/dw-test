'use client';

import { useAuth } from '@/context/AuthContext';

interface UserLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function UserLayout({ children, title, subtitle }: UserLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell user-shell">
      <header className="user-topbar">
        <div className="user-brand">
          <span className="sidebar-logo" aria-hidden="true">
            ♪
          </span>
          <strong>Concert Ticket</strong>
        </div>
        <div className="user-topbar-actions">
          <span className="user-email">{user?.email}</span>
          <button type="button" className="btn btn-outline" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <div className="user-main">
        <div className="user-heading">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
