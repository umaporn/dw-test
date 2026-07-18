import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-badge">User</span>
        <h1>Log in</h1>
        <p>Sign in to browse concerts and reserve your seat.</p>
        <LoginForm variant="user" />
      </div>
    </div>
  );
}
