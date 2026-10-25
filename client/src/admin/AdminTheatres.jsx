import React, { useState, useEffect } from 'react';
import { theatreApi } from '../api/theatreApi';
import { Building2, Plus, Trash2, MapPin, Tv, CheckCircle, AlertCircle } from 'lucide-react';

const AdminTheatres = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTheatreModal, setShowTheatreModal] = useState(false);
  const [showScreenModal, setShowScreenModal] = useState(false);
  const [selectedTheatreId, setSelectedTheatreId] = useState(null);
  const [feedback, setFeedback] = useState({ success: '', error: '' });

  const [theatreForm, setTheatreForm] = useState({ name: '', city: 'Mumbai', address: '' });
  const [screenForm, setScreenForm] = useState({ name: '', reclinerRows: 2, premiumRows: 3, regularRows: 3 });

  const fetchTheatres = async () => {
    try {
      setLoading(true);
      const res = await theatreApi.getTheatres();
      if (res.success) {
        setTheatres(res.data);
      }
    } catch (err) {
      setFeedback({ error: 'Failed to load theatres.', success: '' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheatres();
  }, []);

  const handleCreateTheatre = async (e) => {
    e.preventDefault();
    try {
      const res = await theatreApi.createTheatre(theatreForm);
      if (res.success) {
        setFeedback({ success: 'Theatre created successfully!', error: '' });
        setShowTheatreModal(false);
        setTheatreForm({ name: '', city: 'Mumbai', address: '' });
        fetchTheatres();
      }
    } catch (err) {
      setFeedback({ error: err.response?.data?.message || 'Failed to create theatre.', success: '' });
    }
  };

  const handleDeleteTheatre = async (theatreId) => {
    if (!window.confirm('Delete this theatre and all associated screens?')) return;
    try {
      await theatreApi.deleteTheatre(theatreId);
      setFeedback({ success: 'Theatre deleted successfully.', error: '' });
      fetchTheatres();
    } catch (err) {
      setFeedback({ error: 'Failed to delete theatre.', success: '' });
    }
  };

  const handleOpenAddScreen = (theatreId) => {
    setSelectedTheatreId(theatreId);
    setScreenForm({ name: 'Screen - Dolby Atmos', reclinerRows: 2, premiumRows: 3, regularRows: 3 });
    setShowScreenModal(true);
  };

  const handleCreateScreen = async (e) => {
    e.preventDefault();
    try {
      // Build seat layout rows
      const rows = [];
      let rowCharCode = 65; // 'A'

      for (let i = 0; i < screenForm.reclinerRows; i++) {
        rows.push({ label: String.fromCharCode(rowCharCode++), seats: 8, category: 'recliner' });
      }
      for (let i = 0; i < screenForm.premiumRows; i++) {
        rows.push({ label: String.fromCharCode(rowCharCode++), seats: 10, category: 'premium' });
      }
      for (let i = 0; i < screenForm.regularRows; i++) {
        rows.push({ label: String.fromCharCode(rowCharCode++), seats: 12, category: 'regular' });
      }

      const res = await theatreApi.createScreen({
        theatreId: selectedTheatreId,
        name: screenForm.name,
        seatLayout: { rows },
      });

      if (res.success) {
        setFeedback({ success: 'Screen added successfully with seat layout!', error: '' });
        setShowScreenModal(false);
        fetchTheatres();
      }
    } catch (err) {
      setFeedback({ error: err.response?.data?.message || 'Failed to add screen.', success: '' });
    }
  };

  const handleDeleteScreen = async (screenId) => {
    if (!window.confirm('Delete this screen?')) return;
    try {
      await theatreApi.deleteScreen(screenId);
      setFeedback({ success: 'Screen removed successfully.', error: '' });
      fetchTheatres();
    } catch (err) {
      setFeedback({ error: 'Failed to remove screen.', success: '' });
    }
  };

  return (
    <div className="admin-theatres">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="text-white fw-bold m-0">Theatres & Auditoriums</h4>
          <p className="text-secondary small m-0">Manage cinema locations and auditorium seating grids.</p>
        </div>
        <button
          onClick={() => setShowTheatreModal(true)}
          className="btn btn-cinema d-flex align-items-center gap-2"
        >
          <Plus size={18} /> Add New Theatre
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

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status"></div>
        </div>
      ) : (
        <div className="row g-4">
          {theatres.map((t) => (
            <div key={t._id} className="col-lg-6">
              <div className="glass-panel p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="text-white fw-bold m-0">{t.name}</h5>
                    <button
                      onClick={() => handleDeleteTheatre(t._id)}
                      className="btn btn-outline-danger btn-sm p-1"
                      title="Delete Theatre"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <p className="text-secondary small mb-3 d-flex align-items-center gap-1">
                    <MapPin size={14} color="var(--cinema-gold)" />
                    {t.address}, <span className="text-white fw-semibold">{t.city}</span>
                  </p>

                  <div className="border-top border-secondary border-opacity-20 pt-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-secondary small fw-bold text-uppercase">
                        Screens ({t.screens?.length || 0})
                      </span>
                      <button
                        onClick={() => handleOpenAddScreen(t._id)}
                        className="btn btn-cinema-outline btn-sm py-1 px-2 d-flex align-items-center gap-1"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <Plus size={14} /> Add Screen
                      </button>
                    </div>

                    <div className="d-flex flex-column gap-2">
                      {t.screens?.map((scr) => (
                        <div
                          key={scr._id}
                          className="d-flex justify-content-between align-items-center p-2 rounded-2"
                          style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                        >
                          <div className="d-flex align-items-center gap-2 small">
                            <Tv size={15} color="var(--cinema-blue)" />
                            <strong className="text-white">{scr.name}</strong>
                            <span className="text-secondary" style={{ fontSize: '0.72rem' }}>
                              ({scr.seatLayout?.rows?.length || 0} rows)
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteScreen(scr._id)}
                            className="btn btn-link text-danger p-0 border-0"
                            title="Remove Screen"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Theatre Modal */}
      {showTheatreModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1050 }}
          onClick={() => setShowTheatreModal(false)}
        >
          <div className="glass-panel p-4 w-100" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <h5 className="text-white fw-bold mb-3">Add New Theatre</h5>
            <form onSubmit={handleCreateTheatre}>
              <div className="mb-3">
                <label className="form-label text-secondary small">Theatre Name</label>
                <input
                  type="text"
                  className="form-control form-control-cinema"
                  placeholder="e.g. Cinepolis VIP Forum"
                  value={theatreForm.name}
                  onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-secondary small">City</label>
                <input
                  type="text"
                  className="form-control form-control-cinema"
                  placeholder="e.g. Mumbai"
                  value={theatreForm.city}
                  onChange={(e) => setTheatreForm({ ...theatreForm, city: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label text-secondary small">Address / Landmark</label>
                <input
                  type="text"
                  className="form-control form-control-cinema"
                  placeholder="e.g. High Street Phoenix, Lower Parel"
                  value={theatreForm.address}
                  onChange={(e) => setTheatreForm({ ...theatreForm, address: e.target.value })}
                  required
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-cinema-outline" onClick={() => setShowTheatreModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-cinema">Create Theatre</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Screen Modal */}
      {showScreenModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1050 }}
          onClick={() => setShowScreenModal(false)}
        >
          <div className="glass-panel p-4 w-100" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <h5 className="text-white fw-bold mb-3">Add Screen Auditorium</h5>
            <form onSubmit={handleCreateScreen}>
              <div className="mb-3">
                <label className="form-label text-secondary small">Screen Name</label>
                <input
                  type="text"
                  className="form-control form-control-cinema"
                  value={screenForm.name}
                  onChange={(e) => setScreenForm({ ...screenForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="row g-2 mb-4">
                <div className="col-4">
                  <label className="form-label text-secondary small">Recliner Rows</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    className="form-control form-control-cinema"
                    value={screenForm.reclinerRows}
                    onChange={(e) => setScreenForm({ ...screenForm, reclinerRows: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label text-secondary small">Premium Rows</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    className="form-control form-control-cinema"
                    value={screenForm.premiumRows}
                    onChange={(e) => setScreenForm({ ...screenForm, premiumRows: parseInt(e.target.value, 10) || 1 })}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label text-secondary small">Regular Rows</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="form-control form-control-cinema"
                    value={screenForm.regularRows}
                    onChange={(e) => setScreenForm({ ...screenForm, regularRows: parseInt(e.target.value, 10) || 1 })}
                  />
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-cinema-outline" onClick={() => setShowScreenModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-cinema">Generate Layout & Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTheatres;
