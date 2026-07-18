import { Suspense } from 'react';
import RegisterPageContent from './RegisterPageContent';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="page-loading">Loading…</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
