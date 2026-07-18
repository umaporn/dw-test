'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, ApiClientError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { AuthResponse } from '@/types';

interface LoginFormProps {
  variant?: 'admin' | 'user';
}

export function LoginForm({ variant = 'user' }: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = (await authApi.login(email, password)) as AuthResponse;
      login(response);
      showToast('Welcome back!', 'success');
      router.push(response.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : 'Unable to log in right now';
      showToast(message, 'error');

      if (error instanceof ApiClientError && error.details.length) {
        const nextErrors: Record<string, string> = {};
        error.details.forEach((detail) => {
          if (detail.toLowerCase().includes('email')) nextErrors.email = detail;
          if (detail.toLowerCase().includes('password')) {
            nextErrors.password = detail;
          }
        });
        setFieldErrors(nextErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        {fieldErrors.email && (
          <span className="field-error">{fieldErrors.email}</span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
        />
        {fieldErrors.password && (
          <span className="field-error">{fieldErrors.password}</span>
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Signing in…' : 'Log in'}
      </button>

      <p className="form-footnote">
        No account yet?{' '}
        <Link href={`/register?role=${variant.toUpperCase()}`}>Register</Link>
      </p>
    </form>
  );
}
