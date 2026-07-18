'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="app-shell admin-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo" aria-hidden="true">
            ♪
          </span>
          <div>
            <strong>Concert Ticket</strong>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link
            href="/admin"
            className={`sidebar-link${pathname === '/admin' ? ' active' : ''}`}
          >
            Home
          </Link>
          <Link
            href="/admin/history"
            className={`sidebar-link${
              pathname === '/admin/history' ? ' active' : ''
            }`}
          >
            History
          </Link>
        </nav>

        <button type="button" className="sidebar-logout" onClick={logout}>
          Log out
        </button>
      </aside>

      <div className="shell-main">
        <header className="shell-header">
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className="shell-user">
            <span>{user?.email}</span>
            <em>ADMIN</em>
          </div>
        </header>
        <div className="shell-content">{children}</div>
      </div>
    </div>
  );
}
