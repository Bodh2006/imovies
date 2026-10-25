import React, { useState, useEffect } from 'react';
import { movieApi } from '../api/movieApi';
import { theatreApi } from '../api/theatreApi';
import { showApi } from '../api/showApi';
import { CalendarDays, Plus, Trash2, Clock, MapPin, Tv, CheckCircle, AlertCircle } from 'lucide-react';

const AdminShows = () => {
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [feedback, setFeedback] = useState({ success: '', error: '' });

  const [form, setForm] = useState({
    movieId: '',
    theatreId: '',
    screenId: '',
    startTime: '',
    regularPrice: 180,
    premiumPrice: 280,
    reclinerPrice: 450,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [moviesRes, theatresRes] = await Promise.all([
        movieApi.getMovies({ limit: 100 }),
        theatreApi.getTheatres(),
      ]);

      if (moviesRes.success) setMovies(moviesRes.data);
      if (theatresRes.success) {
        setTheatres(theatresRes.data);
        if (theatresRes.data.length > 0) {
          setForm((prev) => ({
            ...prev,
            theatreId: theatresRes.data[0]._id,
            screenId: theatresRes.data[0].screens?.[0]?._id || '',
          }));
        }
      }

      // Fetch shows for first movie or generally
      if (moviesRes.data.length > 0) {
        const showsRes = await movieApi.getMovieShows(moviesRes.data[0]._id);
        if (showsRes.success) setShows(showsRes.data);
      }
    } catch (err) {
      console.error('Failed to load shows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMovieChangeForView = async (movieId) => {
    try {
      setLoading(true);
      const res = await movieApi.getMovieShows(movieId);
      if (res.success) setShows(res.data);
    } catch (err) {
      setFeedback({ error: 'Failed to filter shows by movie.', success: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShow = async (e) => {
    e.preventDefault();
    try {
      setFeedback({ success: '', error: '' });

      const payload = {
        movieId: form.movieId,
        screenId: form.screenId,
        startTime: new Date(form.startTime).toISOString(),
        prices: {
          regular: Number(form.regularPrice),
          premium: Number(form.premiumPrice),
          recliner: Number(form.reclinerPrice),
        },
      };

      const res = await showApi.createShow(payload);
      if (res.success) {
        setFeedback({ success: 'Show created successfully! Seats initialized.', error: '' });
        setShowModal(false);
        loadData();
      }
    } catch (err) {
      // Overlap or validation error
      const msg = err.response?.data?.message || 'Failed to create show.';
      setFeedback({ error: msg, success: '' });
    }
  };

  const handleDeleteShow = async (showId) => {
    if (!window.confirm('Delete this show? All locked seats will be cleared.')) return;
    try {
      await showApi.deleteShow(showId);
      setFeedback({ success: 'Show deleted successfully.', error: '' });
      loadData();
    } catch (err) {
      setFeedback({ error: 'Failed to delete show.', success: '' });
    }
  };

  // Find screens for selected theatre in modal form
  const currentTheatreScreens =
    theatres.find((t) => t._id === form.theatreId)?.screens || [];

  return (
    <div className="admin-shows">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="text-white fw-bold m-0">Show Scheduling</h4>
          <p className="text-secondary small m-0">
            Schedule auditorium screenings with overlap prevention.
          </p>
        </div>
        <button
          onClick={() => {
            if (movies.length > 0 && !form.movieId) {
              setForm((prev) => ({ ...prev, movieId: movies[0]._id }));
            }
            setShowModal(true);
          }}
          className="btn btn-cinema d-flex align-items-center gap-2"
        >
          <Plus size={18} /> Schedule New Show
        </button>
      </div>

      {feedback.success && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-3">
          <CheckCircle size={16} /> <span>{feedback.success}</span>
        </div>
      )}

      {feedback.error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
          <AlertCircle size={16} /> <span>{feedback.error}</span>
        </div>
      )}

      {/* Movie Filter Picker */}
      <div className="glass-panel p-3 mb-4 d-flex align-items-center gap-3">
        <span className="text-secondary small fw-bold text-nowrap">Filter by Movie:</span>
        <select
          className="form-select form-select-cinema"
          onChange={(e) => handleMovieChangeForView(e.target.value)}
        >
          {movies.map((m) => (
            <option key={m._id} value={m._id}>{m.title}</option>
          ))}
        </select>
      </div>

      {/* Shows List */}
      <div className="glass-panel p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status"></div>
          </div>
        ) : shows.length === 0 ? (
          <div className="text-center py-4 text-secondary">
            No showtimes scheduled for this movie. Click "Schedule New Show" above.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
              <thead>
                <tr className="text-secondary small border-secondary border-opacity-25">
                  <th>DATE & TIME</th>
                  <th>THEATRE</th>
                  <th>SCREEN</th>
                  <th>PRICING (REG / PREM / RECL)</th>
                  <th>SEATS TOTAL</th>
                  <th className="text-end">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {shows.map((s) => (
                  <tr key={s._id} className="border-secondary border-opacity-10 small">
                    <td className="fw-bold text-white">
                      {new Date(s.startTime).toLocaleDateString()}{' '}
                      <span className="text-warning">
                        {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="text-light">{s.screenId?.theatreId?.name || 'Theatre'}</td>
                    <td className="text-light">{s.screenId?.name || 'Screen'}</td>
                    <td className="text-secondary">
                      ₹{s.prices?.regular} / ₹{s.prices?.premium} / ₹{s.prices?.recliner}
                    </td>
                    <td>
                      <span className="badge bg-secondary">{s.seats?.length || 0} seats</span>
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => handleDeleteShow(s._id)}
                        className="btn btn-outline-danger btn-sm p-1 px-2"
                        title="Delete Show"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Show Modal */}
      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1050 }}
          onClick={() => setShowModal(false)}
        >
          <div className="glass-panel p-4 w-100" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <h5 className="text-white fw-bold mb-3">Schedule Show with Overlap Prevention</h5>
            <form onSubmit={handleCreateShow}>
              <div className="mb-3">
                <label className="form-label text-secondary small">Movie</label>
                <select
                  className="form-select form-select-cinema"
                  value={form.movieId}
                  onChange={(e) => setForm({ ...form, movieId: e.target.value })}
                  required
                >
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>{m.title} ({m.durationMin}m)</option>
                  ))}
                </select>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label text-secondary small">Theatre</label>
                  <select
                    className="form-select form-select-cinema"
                    value={form.theatreId}
                    onChange={(e) => {
                      const thId = e.target.value;
                      const screens = theatres.find((t) => t._id === thId)?.screens || [];
                      setForm({
                        ...form,
                        theatreId: thId,
                        screenId: screens[0]?._id || '',
                      });
                    }}
                    required
                  >
                    {theatres.map((t) => (
                      <option key={t._id} value={t._id}>{t.name} ({t.city})</option>
                    ))}
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label text-secondary small">Screen Auditorium</label>
                  <select
                    className="form-select form-select-cinema"
                    value={form.screenId}
                    onChange={(e) => setForm({ ...form, screenId: e.target.value })}
                    required
                  >
                    {currentTheatreScreens.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small">Show Start Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-control form-control-cinema"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  required
                />
              </div>

              <div className="row g-2 mb-4">
                <div className="col-4">
                  <label className="form-label text-secondary small">Regular (₹)</label>
                  <input
                    type="number"
                    className="form-control form-control-cinema"
                    value={form.regularPrice}
                    onChange={(e) => setForm({ ...form, regularPrice: e.target.value })}
                    required
                  />
                </div>
                <div className="col-4">
                  <label className="form-label text-secondary small">Premium (₹)</label>
                  <input
                    type="number"
                    className="form-control form-control-cinema"
                    value={form.premiumPrice}
                    onChange={(e) => setForm({ ...form, premiumPrice: e.target.value })}
                    required
                  />
                </div>
                <div className="col-4">
                  <label className="form-label text-secondary small">Recliner (₹)</label>
                  <input
                    type="number"
                    className="form-control form-control-cinema"
                    value={form.reclinerPrice}
                    onChange={(e) => setForm({ ...form, reclinerPrice: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-cinema-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-cinema">Schedule Show</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShows;
