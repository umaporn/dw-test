import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ToastContainer } from '@/components/ToastContainer';
import { AppNavbar } from '@/components/AppNavbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Concert Ticket | Free Concert Tickets',
  description:
    'Discover free concerts, reserve one seat per show, and manage reservations with role-based access.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>
            <AppNavbar />
            <main>{children}</main>
            <ToastContainer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
