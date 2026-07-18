import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/LoginForm';
import { authApi } from '@/lib/api';
import { renderWithProviders } from '@/test/test-utils';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock('@/lib/api', () => ({
  authApi: {
    login: jest.fn(),
  },
  ApiClientError: class ApiClientError extends Error {
    statusCode: number;
    details: string[];

    constructor(message: string, statusCode: number, details: string[] = []) {
      super(message);
      this.name = 'ApiClientError';
      this.statusCode = statusCode;
      this.details = details;
    }
  },
}));

const loginMock = authApi.login as jest.MockedFunction<typeof authApi.login>;

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email and password fields', () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
  });

  it('links to register with user role by default', () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute(
      'href',
      '/register?role=USER',
    );
  });

  it('links to register with admin role for admin variant', () => {
    renderWithProviders(<LoginForm variant="admin" />);

    expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute(
      'href',
      '/register?role=ADMIN',
    );
  });

  it('logs in admin and redirects to /admin', async () => {
    const user = userEvent.setup();

    loginMock.mockResolvedValue({
      accessToken: 'token-admin',
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
    });

    renderWithProviders(<LoginForm variant="admin" />);

    await user.type(screen.getByLabelText('Email'), 'admin@test.com');
    await user.type(screen.getByLabelText('Password'), 'secret1');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('admin@test.com', 'secret1');
      expect(pushMock).toHaveBeenCalledWith('/admin');
    });
  });

  it('logs in user and redirects to /dashboard', async () => {
    const user = userEvent.setup();

    loginMock.mockResolvedValue({
      accessToken: 'token-user',
      user: { id: '2', email: 'user@test.com', role: 'USER' },
    });

    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'user@test.com');
    await user.type(screen.getByLabelText('Password'), 'secret1');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows validation error message from API', async () => {
    const user = userEvent.setup();
    const { ApiClientError } = jest.requireMock('@/lib/api');

    loginMock.mockRejectedValue(
      new ApiClientError('Validation failed', 400, [
        'Please provide a valid email address',
      ]),
    );

    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'user@invalid.com');
    await user.type(screen.getByLabelText('Password'), 'secret1');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(
        screen.getByText('Please provide a valid email address'),
      ).toBeInTheDocument();
    });
  });
});
