'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatCard } from '@/components/StatCard';
import { Modal } from '@/components/Modal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { concertsApi, ApiClientError } from '@/lib/api';
import { Concert } from '@/types';

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminHome />
    </ProtectedRoute>
  );
}

function AdminHome() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Concert | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [totalSeats, setTotalSeats] = useState(50);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stats = useMemo(() => {
    const totalSeats = concerts.reduce((sum, c) => sum + c.totalSeats, 0);
    const reservedSeats = concerts.reduce((sum, c) => sum + c.reservedSeats, 0);
    return {
      totalConcerts: concerts.length,
      reservedSeats,
      availableSeats: totalSeats - reservedSeats,
    };
  }, [concerts]);

  const loadData = useCallback(async () => {
    if (!token) return;

    try {
      const concertData = (await concertsApi.list(token)) as Concert[];
      setConcerts(concertData);
    } catch (error) {
      showToast(
        error instanceof ApiClientError
          ? error.message
          : 'Failed to load concerts',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await concertsApi.create(token, { name, description, totalSeats });
      setName('');
      setDescription('');
      setTotalSeats(50);
      setCreateOpen(false);
      showToast('Concert created', 'success');
      await loadData();
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : 'Unable to create concert';
      showToast(message, 'error');

      if (error instanceof ApiClientError && error.details.length) {
        const nextErrors: Record<string, string> = {};
        error.details.forEach((detail) => {
          if (detail.toLowerCase().includes('name')) nextErrors.name = detail;
          if (detail.toLowerCase().includes('description')) {
            nextErrors.description = detail;
          }
          if (detail.toLowerCase().includes('seat')) {
            nextErrors.totalSeats = detail;
          }
        });
        setFieldErrors(nextErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!token || !deleteTarget) return;

    try {
      await concertsApi.remove(token, deleteTarget.id);
      showToast('Concert deleted', 'success');
      setDeleteTarget(null);
      await loadData();
    } catch (error) {
      showToast(
        error instanceof ApiClientError
          ? error.message
          : 'Unable to delete concert',
        'error',
      );
    }
  }

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loader" aria-hidden="true" />
        <p>Loading admin dashboard…</p>
      </div>
    );
  }

  return (
    <AdminLayout title="Home" subtitle="Manage concerts and availability">
      <div className="stats-row">
        <StatCard label="Total Concerts" value={stats.totalConcerts} tone="orange" />
        <StatCard label="Reserved Seats" value={stats.reservedSeats} tone="blue" />
        <StatCard label="Available Seats" value={stats.availableSeats} tone="green" />
      </div>

      <section className="data-panel">
        <div className="data-panel-header">
          <h2>Concerts</h2>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setCreateOpen(true)}
          >
            + Create
          </button>
        </div>

        <div className="table-wrap">
          {concerts.length === 0 ? (
            <p className="table-empty">No concerts yet. Create your first listing.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Total Seats</th>
                  <th>Reserved</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {concerts.map((concert) => (
                  <tr key={concert.id}>
                    <td>{concert.name}</td>
                    <td>{concert.description}</td>
                    <td>{concert.totalSeats}</td>
                    <td>{concert.reservedSeats}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          concert.isFullyBooked ? 'sold-out' : 'available'
                        }`}
                      >
                        {concert.availableSeats}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteTarget(concert)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <Modal
        open={createOpen}
        title="Create concert"
        onClose={() => setCreateOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-concert-form"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating…' : 'Create'}
            </button>
          </>
        }
      >
        <form id="create-concert-form" className="auth-form" onSubmit={handleCreate}>
          <div className="form-field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            {fieldErrors.name && (
              <span className="field-error">{fieldErrors.name}</span>
            )}
          </div>
          <div className="form-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
            {fieldErrors.description && (
              <span className="field-error">{fieldErrors.description}</span>
            )}
          </div>
          <div className="form-field">
            <label htmlFor="totalSeats">Total seats</label>
            <input
              id="totalSeats"
              type="number"
              min={1}
              value={totalSeats}
              onChange={(event) => setTotalSeats(Number(event.target.value))}
              required
            />
            {fieldErrors.totalSeats && (
              <span className="field-error">{fieldErrors.totalSeats}</span>
            )}
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete concert"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger-solid"
              onClick={confirmDelete}
            >
              Delete
            </button>
          </>
        }
      >
        <p className="delete-copy">
          Are you sure you want to delete{' '}
          <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </AdminLayout>
  );
}
