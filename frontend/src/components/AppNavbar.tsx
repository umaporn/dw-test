'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const HIDDEN_PREFIXES = ['/admin', '/dashboard', '/login', '/register'];

export function AppNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const hideNavbar = HIDDEN_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (hideNavbar) return null;

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand-mark">
          <span className="sidebar-logo" aria-hidden="true">
            ♪
          </span>
          <span>Concert Ticket</span>
        </Link>

        <nav className="header-nav">
          {user ? (
            <>
              <Link
                href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                className="btn btn-primary"
              >
                Go to dashboard
              </Link>
              <button type="button" className="btn btn-outline" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline">
                Log in
              </Link>
              <Link href="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
