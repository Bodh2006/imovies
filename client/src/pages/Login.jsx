import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, Lock, Mail, AlertCircle, Shield, User } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    login(demoEmail, demoPassword)
      .then(() => navigate(redirectPath, { replace: true }))
      .catch((err) => setError(err.response?.data?.message || 'Quick login failed'));
  };

  return (
    <div className="login-page py-5 my-auto">
      <div className="container" style={{ maxWidth: 460 }}>
        <div className="glass-panel p-4 p-md-5">
          {/* Header */}
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle mb-3 shadow"
              style={{ background: 'linear-gradient(135deg, #e50914 0%, #b8050e 100%)' }}
            >
              <Film size={28} color="#ffffff" />
            </div>
            <h3 className="text-white fw-bold mb-1">Welcome Back</h3>
            <p className="text-secondary small">
              Sign in to reserve seats and view your bookings.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-3 small" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-secondary small">Email Address</label>
              <div className="position-relative">
                <Mail size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                <input
                  type="email"
                  className="form-control form-control-cinema ps-5"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label text-secondary small">Password</label>
              <div className="position-relative">
                <Lock size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                <input
                  type="password"
                  className="form-control form-control-cinema ps-5"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-cinema w-100 py-3 mb-4"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25 mb-4">
            <span className="text-secondary small fw-bold d-block text-uppercase mb-2" style={{ fontSize: '0.72rem' }}>
              Instant Demo Access
            </span>
            <div className="d-grid gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('user@imovies.com', 'User@12345')}
                className="btn btn-cinema-outline btn-sm d-flex align-items-center justify-content-center gap-2"
              >
                <User size={15} color="var(--cinema-gold)" /> Login as Customer (Demo)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@imovies.com', 'Admin@12345')}
                className="btn btn-cinema-outline btn-sm d-flex align-items-center justify-content-center gap-2"
              >
                <Shield size={15} color="var(--cinema-red)" /> Login as Admin (Full Control)
              </button>
            </div>
          </div>

          <div className="text-center text-secondary small">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-danger fw-bold text-decoration-none">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
