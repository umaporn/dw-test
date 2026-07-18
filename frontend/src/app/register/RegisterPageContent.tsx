'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi, ApiClientError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { AuthResponse, UserRole } from '@/types';

export default function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'USER';
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(
    initialRole === 'ADMIN' ? 'ADMIN' : 'USER',
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = (await authApi.register(
        email,
        password,
        role,
      )) as AuthResponse;
      login(response);
      showToast('Account created successfully', 'success');
      router.push(response.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : 'Unable to register right now';
      showToast(message, 'error');

      if (error instanceof ApiClientError && error.details.length) {
        const nextErrors: Record<string, string> = {};
        error.details.forEach((detail) => {
          if (detail.toLowerCase().includes('email')) nextErrors.email = detail;
          if (detail.toLowerCase().includes('password')) {
            nextErrors.password = detail;
          }
          if (detail.toLowerCase().includes('role')) nextErrors.role = detail;
        });
        setFieldErrors(nextErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-badge">{role}</span>
        <h1>Create account</h1>
        <p>Choose your role and start using Concert Ticket.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
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
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
            {fieldErrors.password && (
              <span className="field-error">{fieldErrors.password}</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="role">Account type</label>
            <select
              id="role"
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
            >
              <option value="USER">User — reserve tickets</option>
              <option value="ADMIN">Admin — manage concerts</option>
            </select>
            {fieldErrors.role && (
              <span className="field-error">{fieldErrors.role}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>

          <p className="form-footnote">
            Already registered? <Link href="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
