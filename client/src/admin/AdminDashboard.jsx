import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import {
  DollarSign,
  Ticket,
  Users,
  Film,
  Calendar,
  TrendingUp,
  Award,
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <div className="spinner-border text-danger" role="status"></div>
      </div>
    );
  }

  const {
    totalRevenue = 0,
    totalBookings = 0,
    confirmedBookings = 0,
    cancelledBookings = 0,
    totalUsers = 0,
    totalMovies = 0,
    topMovies = [],
    recentBookings = [],
  } = stats || {};

  return (
    <div className="admin-dashboard">
      {/* Metric Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-sm-6">
          <div className="glass-panel p-4 h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-secondary small fw-bold">TOTAL REVENUE</span>
              <div
                className="p-2 rounded-3"
                style={{ background: 'rgba(255, 183, 3, 0.15)', color: 'var(--cinema-gold)' }}
              >
                <DollarSign size={20} />
              </div>
            </div>
            <h3 className="text-white fw-bold mb-1">₹{totalRevenue.toLocaleString()}</h3>
            <span className="text-success small d-flex align-items-center gap-1">
              <TrendingUp size={13} /> Paid Confirmed Bookings
            </span>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="glass-panel p-4 h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-secondary small fw-bold">TICKET BOOKINGS</span>
              <div
                className="p-2 rounded-3"
                style={{ background: 'rgba(229, 9, 20, 0.15)', color: 'var(--cinema-red)' }}
              >
                <Ticket size={20} />
              </div>
            </div>
            <h3 className="text-white fw-bold mb-1">{confirmedBookings}</h3>
            <span className="text-secondary small">
              {cancelledBookings} cancelled refunds
            </span>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="glass-panel p-4 h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-secondary small fw-bold">ACTIVE MOVIES</span>
              <div
                className="p-2 rounded-3"
                style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--cinema-blue)' }}
              >
                <Film size={20} />
              </div>
            </div>
            <h3 className="text-white fw-bold mb-1">{totalMovies}</h3>
            <span className="text-secondary small">Across 3 City Theatres</span>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="glass-panel p-4 h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-secondary small fw-bold">REGISTERED USERS</span>
              <div
                className="p-2 rounded-3"
                style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}
              >
                <Users size={20} />
              </div>
            </div>
            <h3 className="text-white fw-bold mb-1">{totalUsers}</h3>
            <span className="text-secondary small">Customer Accounts</span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Top Movies Leaderboard */}
        <div className="col-lg-5">
          <div className="glass-panel p-4 h-100">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Award size={20} color="var(--cinema-gold)" />
              <h5 className="text-white fw-bold m-0">Top Performing Movies</h5>
            </div>

            {topMovies.length === 0 ? (
              <p className="text-secondary small">No sales data recorded yet.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {topMovies.map((tm, idx) => (
                  <div
                    key={tm.movieId}
                    className="d-flex align-items-center justify-content-between p-2 rounded-3"
                    style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <span className="text-secondary fw-bold" style={{ width: 16 }}>
                        #{idx + 1}
                      </span>
                      <img
                        src={tm.posterUrl}
                        alt={tm.title}
                        className="rounded-2"
                        style={{ width: 36, height: 48, objectFit: 'cover' }}
                      />
                      <div>
                        <strong className="text-white small d-block text-truncate" style={{ maxWidth: 160 }}>
                          {tm.title}
                        </strong>
                        <span className="text-secondary" style={{ fontSize: '0.72rem' }}>
                          {tm.totalSeatsSold} seats booked
                        </span>
                      </div>
                    </div>
                    <div className="text-end">
                      <span className="text-warning fw-bold small d-block">
                        ₹{tm.totalRevenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="col-lg-7">
          <div className="glass-panel p-4 h-100">
            <h5 className="text-white fw-bold mb-3">Recent Bookings</h5>

            {recentBookings.length === 0 ? (
              <p className="text-secondary small">No bookings created yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                  <thead>
                    <tr className="text-secondary small border-secondary border-opacity-25">
                      <th>REFERENCE</th>
                      <th>CUSTOMER</th>
                      <th>MOVIE</th>
                      <th>SEATS</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => (
                      <tr key={b._id} className="border-secondary border-opacity-10 small">
                        <td className="fw-bold text-white">{b.reference}</td>
                        <td className="text-light">{b.userId?.name || 'Customer'}</td>
                        <td className="text-light text-truncate" style={{ maxWidth: 130 }}>
                          {b.showId?.movieId?.title || 'Movie'}
                        </td>
                        <td>
                          <span className="badge bg-secondary">{b.seats?.length}</span>
                        </td>
                        <td className="text-warning fw-semibold">₹{b.totalAmount}</td>
                        <td>
                          <span
                            className={`badge ${
                              b.status === 'confirmed' ? 'bg-success' : 'bg-danger'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
