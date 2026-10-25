import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { User, Mail, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (password && password.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const payload = { name };
      if (password) payload.password = password;

      const res = await authApi.updateProfile(payload);
      if (res.success && res.data) {
        updateUser(res.data);
        setSuccess('Profile updated successfully!');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page py-5">
      <div className="container" style={{ maxWidth: 600 }}>
        <div className="glass-panel p-4 p-md-5">
          <div className="d-flex align-items-center gap-3 mb-4">
            <div
              className="d-flex align-items-center justify-content-center p-3 rounded-circle"
              style={{ background: 'rgba(255, 183, 3, 0.15)', color: 'var(--cinema-gold)' }}
            >
              <User size={32} />
            </div>
            <div>
              <h3 className="text-white fw-bold mb-0">{user?.name}</h3>
              <div className="d-flex align-items-center gap-2 text-secondary small">
                <span>{user?.email}</span>
                <span className="badge bg-danger text-uppercase" style={{ fontSize: '0.65rem' }}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {success && (
            <div className="alert alert-success d-flex align-items-center gap-2 mb-3 small">
              <CheckCircle size={16} />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-3 small">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleUpdate}>
            <div className="mb-3">
              <label className="form-label text-secondary small">Full Name</label>
              <input
                type="text"
                className="form-control form-control-cinema"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-secondary small">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-control form-control-cinema opacity-50"
                value={user?.email || ''}
                disabled
              />
            </div>

            <hr className="border-secondary opacity-20 my-4" />
            <h6 className="text-white fw-bold mb-3">Change Password (Optional)</h6>

            <div className="mb-3">
              <label className="form-label text-secondary small">New Password</label>
              <input
                type="password"
                className="form-control form-control-cinema"
                placeholder="Leave blank to keep current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-secondary small">Confirm New Password</label>
              <input
                type="password"
                className="form-control form-control-cinema"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-cinema w-100 py-3"
            >
              {loading ? 'Saving Changes...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
