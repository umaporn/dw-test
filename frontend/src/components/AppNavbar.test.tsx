import { render, screen } from '@testing-library/react';
import { AppNavbar } from '@/components/AppNavbar';

const usePathnameMock = jest.fn();
const useAuthMock = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}));

describe('AppNavbar', () => {
  beforeEach(() => {
    useAuthMock.mockReturnValue({ user: null, logout: jest.fn() });
  });

  it('is hidden on admin routes', () => {
    usePathnameMock.mockReturnValue('/admin');

    const { container } = render(<AppNavbar />);

    expect(container).toBeEmptyDOMElement();
  });

  it('is hidden on dashboard routes', () => {
    usePathnameMock.mockReturnValue('/dashboard');

    const { container } = render(<AppNavbar />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows login and register on landing page when logged out', () => {
    usePathnameMock.mockReturnValue('/');

    render(<AppNavbar />);

    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute(
      'href',
      '/login',
    );
    expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute(
      'href',
      '/register',
    );
  });

  it('shows dashboard link for authenticated admin', () => {
    usePathnameMock.mockReturnValue('/');
    useAuthMock.mockReturnValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
      logout: jest.fn(),
    });

    render(<AppNavbar />);

    expect(
      screen.getByRole('link', { name: 'Go to dashboard' }),
    ).toHaveAttribute('href', '/admin');
  });
});
