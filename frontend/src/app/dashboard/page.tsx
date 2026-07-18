'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserLayout } from '@/components/layout/UserLayout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  concertsApi,
  reservationsApi,
  ApiClientError,
} from '@/lib/api';
import { Concert, Reservation } from '@/types';

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['USER']}>
      <UserDashboard />
    </ProtectedRoute>
  );
}

function UserDashboard() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [history, setHistory] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const activeReservations = useMemo(
    () =>
      history
        .filter((item) => item.status === 'ACTIVE')
        .map((item) => item.concertId),
    [history],
  );

  const loadData = useCallback(async () => {
    if (!token) return;

    try {
      const [concertData, historyData] = await Promise.all([
        concertsApi.list(token) as Promise<Concert[]>,
        reservationsApi.myHistory(token) as Promise<Reservation[]>,
      ]);
      setConcerts(concertData);
      setHistory(historyData);
    } catch (error) {
      showToast(
        error instanceof ApiClientError
          ? error.message
          : 'Failed to load dashboard data',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleReserve(concertId: string) {
    if (!token) return;

    try {
      await reservationsApi.reserve(token, concertId);
      showToast('Seat reserved successfully', 'success');
      await loadData();
    } catch (error) {
      showToast(
        error instanceof ApiClientError
          ? error.message
          : 'Unable to reserve seat',
        'error',
      );
    }
  }

  async function handleCancel(reservationId: string) {
    if (!token) return;

    try {
      await reservationsApi.cancel(token, reservationId);
      showToast('Reservation cancelled', 'success');
      await loadData();
    } catch (error) {
      showToast(
        error instanceof ApiClientError
          ? error.message
          : 'Unable to cancel reservation',
        'error',
      );
    }
  }

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loader" aria-hidden="true" />
        <p>Loading concerts…</p>
      </div>
    );
  }

  return (
    <UserLayout
      title="Home"
      subtitle="Browse concerts and reserve one seat per show"
    >
      <div className="concert-list">
        {concerts.length === 0 ? (
          <div className="concert-row">
            <p className="concert-row-meta">No concerts available right now.</p>
          </div>
        ) : (
          concerts.map((concert) => {
            const activeReservation = history.find(
              (item) =>
                item.concertId === concert.id && item.status === 'ACTIVE',
            );

            return (
              <article key={concert.id} className="concert-row">
                <div className="concert-row-top">
                  <div>
                    <h3>{concert.name}</h3>
                    <p>{concert.description}</p>
                    <p className="concert-row-meta">
                      {concert.availableSeats} of {concert.totalSeats} seats
                      available
                    </p>
                  </div>
                  <span
                    className={`status-badge ${
                      concert.isFullyBooked ? 'sold-out' : 'available'
                    }`}
                  >
                    {concert.isFullyBooked ? 'Sold out' : 'Available'}
                  </span>
                </div>

                <div className="concert-row-actions">
                  {activeReservation ? (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleCancel(activeReservation.id)}
                    >
                      Cancel reservation
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={
                        concert.isFullyBooked ||
                        activeReservations.includes(concert.id)
                      }
                      onClick={() => handleReserve(concert.id)}
                    >
                      {concert.isFullyBooked ? 'Fully booked' : 'Reserve'}
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      <section className="history-section">
        <h2>My reservation history</h2>
        <div className="data-panel">
          <div className="table-wrap">
            {history.length === 0 ? (
              <p className="table-empty">No reservations yet.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Concert</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id}>
                      <td>{item.concert?.name ?? 'Concert'}</td>
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
        </div>
      </section>
    </UserLayout>
  );
}
