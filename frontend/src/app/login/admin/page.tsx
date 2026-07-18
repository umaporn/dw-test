import { LoginForm } from '@/components/LoginForm';

export default function AdminLoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-badge">Admin</span>
        <h1>Log in</h1>
        <p>Sign in to manage concerts and view reservation history.</p>
        <LoginForm variant="admin" />
      </div>
    </div>
  );
}
