'use client';

import { useCallback, useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { reservationsApi, ApiClientError } from '@/lib/api';
import { Reservation } from '@/types';

export default function AdminHistoryPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminHistory />
    </ProtectedRoute>
  );
}

function AdminHistory() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [auditTrail, setAuditTrail] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!token) return;

    try {
      const auditData = (await reservationsApi.audit(token)) as Reservation[];
      setAuditTrail(auditData);
    } catch (error) {
      showToast(
        error instanceof ApiClientError
          ? error.message
          : 'Failed to load history',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loader" aria-hidden="true" />
        <p>Loading reservation history…</p>
      </div>
    );
  }

  return (
    <AdminLayout
      title="History"
      subtitle="Full reservation audit trail across all users"
    >
      <section className="data-panel">
        <div className="data-panel-header">
          <h2>Reservation history</h2>
        </div>

        <div className="table-wrap">
          {auditTrail.length === 0 ? (
            <p className="table-empty">No reservations recorded yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Concert</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {auditTrail.map((item) => (
                  <tr key={item.id}>
                    <td>{item.concert?.name ?? '—'}</td>
                    <td>{item.user?.email ?? '—'}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          item.status === 'ACTIVE' ? 'active' : 'cancelled'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}
