import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { movieApi } from '../api/movieApi';
import { Ticket, Search, Filter, Calendar, AlertCircle } from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [statusFilter, setStatusFilter] = useState('');
  const [movieFilter, setMovieFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (movieFilter) params.movieId = movieFilter;
      if (dateFilter) params.date = dateFilter;

      const [bookingsRes, moviesRes] = await Promise.all([
        adminApi.getBookings(params),
        movieApi.getMovies({ limit: 100 }),
      ]);

      if (bookingsRes.success) {
        setBookings(bookingsRes.data);
        setTotal(bookingsRes.total);
      }
      if (moviesRes.success) {
        setMovies(moviesRes.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, movieFilter, dateFilter]);

  return (
    <div className="admin-bookings">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="text-white fw-bold m-0">Platform Bookings Ledger</h4>
          <p className="text-secondary small m-0">Audit and filter customer ticket reservations.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <select
              className="form-select form-select-cinema"
              value={movieFilter}
              onChange={(e) => setMovieFilter(e.target.value)}
            >
              <option value="">All Movies</option>
              {movies.map((m) => (
                <option key={m._id} value={m._id}>{m.title}</option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <select
              className="form-select form-select-cinema"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="col-md-3">
            <input
              type="date"
              className="form-control form-control-cinema"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <button
              onClick={() => {
                setStatusFilter('');
                setMovieFilter('');
                setDateFilter('');
              }}
              className="btn btn-cinema-outline w-100"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="glass-panel p-4">
        <div className="mb-3 text-secondary small">
          Total Recorded Bookings: <strong className="text-white">{total}</strong>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-4 text-secondary">
            No bookings found matching the selected filters.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
              <thead>
                <tr className="text-secondary small border-secondary border-opacity-25">
                  <th>REFERENCE</th>
                  <th>BOOKED ON</th>
                  <th>CUSTOMER</th>
                  <th>MOVIE & SHOW</th>
                  <th>THEATRE</th>
                  <th>SEATS</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className="border-secondary border-opacity-10 small">
                    <td className="fw-bold text-white tracking-wider">{b.reference}</td>
                    <td className="text-secondary">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-light">
                      <strong className="d-block text-white">{b.userId?.name || 'Customer'}</strong>
                      <span className="text-secondary" style={{ fontSize: '0.72rem' }}>
                        {b.userId?.email}
                      </span>
                    </td>
                    <td className="text-light">
                      <span className="fw-semibold">{b.showId?.movieId?.title || 'Movie'}</span>
                      <span className="text-secondary d-block" style={{ fontSize: '0.72rem' }}>
                        {b.showId?.startTime ? new Date(b.showId.startTime).toLocaleString() : ''}
                      </span>
                    </td>
                    <td className="text-secondary">
                      {b.showId?.screenId?.theatreId?.name || 'Theatre'}
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {b.seats?.map((seat) => (
                          <span key={seat} className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>
                            {seat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-warning fw-bold">₹{b.totalAmount}</td>
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
  );
};

export default AdminBookings;
