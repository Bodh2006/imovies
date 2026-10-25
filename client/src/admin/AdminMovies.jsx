import React, { useState, useEffect } from 'react';
import { movieApi } from '../api/movieApi';
import { Film, Plus, Edit, Trash2, CheckCircle, AlertCircle, X } from 'lucide-react';

const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [feedback, setFeedback] = useState({ success: '', error: '' });

  const initialFormState = {
    title: '',
    description: '',
    genres: '',
    language: 'English',
    durationMin: 120,
    rating: 8.0,
    posterUrl: '',
    trailerUrl: '',
    cast: '',
    releaseDate: new Date().toISOString().split('T')[0],
    status: 'now_showing',
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await movieApi.getMovies({ limit: 50 });
      if (res.success) {
        setMovies(res.data);
      }
    } catch (err) {
      setFeedback({ error: 'Failed to load movies.', success: '' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleOpenAddModal = () => {
    setEditingMovie(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const handleOpenEditModal = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description,
      genres: movie.genres?.join(', ') || '',
      language: movie.language,
      durationMin: movie.durationMin,
      rating: movie.rating,
      posterUrl: movie.posterUrl,
      trailerUrl: movie.trailerUrl || '',
      cast: movie.cast?.join(', ') || '',
      releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : '',
      status: movie.status,
    });
    setShowModal(true);
  };

  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie? Associated showtimes may be affected.')) {
      return;
    }

    try {
      const res = await movieApi.deleteMovie(id);
      if (res.success) {
        setFeedback({ success: 'Movie deleted successfully.', error: '' });
        fetchMovies();
      }
    } catch (err) {
      setFeedback({ error: err.response?.data?.message || 'Failed to delete movie.', success: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFeedback({ success: '', error: '' });

      const payload = {
        ...formData,
        genres: formData.genres.split(',').map((g) => g.trim()).filter(Boolean),
        cast: formData.cast.split(',').map((c) => c.trim()).filter(Boolean),
        durationMin: Number(formData.durationMin),
        rating: Number(formData.rating),
      };

      if (editingMovie) {
        await movieApi.updateMovie(editingMovie._id, payload);
        setFeedback({ success: 'Movie updated successfully!', error: '' });
      } else {
        await movieApi.createMovie(payload);
        setFeedback({ success: 'Movie created successfully!', error: '' });
      }

      setShowModal(false);
      fetchMovies();
    } catch (err) {
      setFeedback({
        error: err.response?.data?.message || 'Failed to save movie.',
        success: '',
      });
    }
  };

  return (
    <div className="admin-movies">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="text-white fw-bold m-0">Movies Management</h4>
          <p className="text-secondary small m-0">Add, edit, or remove catalog titles.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="btn btn-cinema d-flex align-items-center gap-2"
        >
          <Plus size={18} /> Add New Movie
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

      {/* Movies Table */}
      <div className="glass-panel p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status"></div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
              <thead>
                <tr className="text-secondary small border-secondary border-opacity-25">
                  <th>POSTER</th>
                  <th>TITLE</th>
                  <th>GENRES</th>
                  <th>LANGUAGE</th>
                  <th>DURATION</th>
                  <th>RATING</th>
                  <th>STATUS</th>
                  <th className="text-end">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((m) => (
                  <tr key={m._id} className="border-secondary border-opacity-10 small">
                    <td>
                      <img
                        src={m.posterUrl}
                        alt={m.title}
                        className="rounded-2"
                        style={{ width: 40, height: 56, objectFit: 'cover' }}
                      />
                    </td>
                    <td className="fw-bold text-white">{m.title}</td>
                    <td className="text-secondary">{m.genres?.slice(0, 2).join(', ')}</td>
                    <td className="text-light">{m.language}</td>
                    <td className="text-light">{m.durationMin}m</td>
                    <td className="text-warning fw-bold">★ {m.rating}</td>
                    <td>
                      <span className={`badge ${m.status === 'now_showing' ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {m.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(m)}
                          className="btn btn-cinema-outline btn-sm p-1 px-2"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteMovie(m._id)}
                          className="btn btn-outline-danger btn-sm p-1 px-2"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Add / Edit */}
      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1050 }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="glass-panel p-4 w-100"
            style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="text-white fw-bold m-0">
                {editingMovie ? 'Edit Movie' : 'Add New Movie'}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowModal(false)}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-secondary small">Movie Title</label>
                <input
                  type="text"
                  className="form-control form-control-cinema"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small">Description / Synopsis</label>
                <textarea
                  rows="3"
                  className="form-control form-control-cinema"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label className="form-label text-secondary small">Genres (comma separated)</label>
                  <input
                    type="text"
                    className="form-control form-control-cinema"
                    placeholder="Action, Sci-Fi"
                    value={formData.genres}
                    onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-secondary small">Language</label>
                  <input
                    type="text"
                    className="form-control form-control-cinema"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-4">
                  <label className="form-label text-secondary small">Duration (minutes)</label>
                  <input
                    type="number"
                    className="form-control form-control-cinema"
                    value={formData.durationMin}
                    onChange={(e) => setFormData({ ...formData, durationMin: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-secondary small">Rating (0 - 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control form-control-cinema"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-secondary small">Status</label>
                  <select
                    className="form-select form-select-cinema"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="now_showing">Now Showing</option>
                    <option value="coming_soon">Coming Soon</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small">Poster Image URL</label>
                <input
                  type="url"
                  className="form-control form-control-cinema"
                  value={formData.posterUrl}
                  onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small">Trailer URL (YouTube)</label>
                <input
                  type="url"
                  className="form-control form-control-cinema"
                  value={formData.trailerUrl}
                  onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small">Cast (comma separated)</label>
                <input
                  type="text"
                  className="form-control form-control-cinema"
                  placeholder="Actor 1, Actor 2"
                  value={formData.cast}
                  onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-cinema-outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-cinema">
                  {editingMovie ? 'Save Changes' : 'Create Movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMovies;
