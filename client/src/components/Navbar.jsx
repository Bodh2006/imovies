import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, Ticket, User as UserIcon, Shield, LogOut, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg glass-nav sticky-top py-3">
      <div className="container">
        {/* Brand */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #e50914 0%, #b8050e 100%)',
              boxShadow: '0 0 15px rgba(229, 9, 20, 0.5)',
            }}
          >
            <Film size={22} color="#ffffff" />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.6rem',
              fontWeight: 800,
              letterSpacing: '-0.5px',
            }}
          >
            <span style={{ color: '#ffffff' }}>I</span>
            <span style={{ color: 'var(--cinema-red)' }}>Movies</span>
          </span>
        </Link>

        {/* Mobile toggle button */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ filter: 'invert(1)' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-lg-1">
            <li className="nav-item">
              <Link
                to="/"
                className={`nav-link px-3 ${isActive('/') ? 'text-white fw-bold' : 'text-secondary'}`}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/movies"
                className={`nav-link px-3 ${isActive('/movies') ? 'text-white fw-bold' : 'text-secondary'}`}
              >
                Explore Movies
              </Link>
            </li>
            {isAdmin && (
              <li className="nav-item">
                <Link
                  to="/admin"
                  className="nav-link px-3 d-flex align-items-center gap-1"
                  style={{ color: 'var(--cinema-gold)', fontWeight: 600 }}
                >
                  <Shield size={16} /> Admin Portal
                </Link>
              </li>
            )}
          </ul>

          {/* User actions */}
          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-cinema-outline dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <UserIcon size={18} color="var(--cinema-gold)" />
                  <span className="fw-semibold">{user?.name || 'My Account'}</span>
                  {isAdmin && (
                    <span className="badge bg-danger ms-1" style={{ fontSize: '0.65rem' }}>
                      ADMIN
                    </span>
                  )}
                  <ChevronDown size={14} />
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-end shadow-lg py-2 mt-2"
                  aria-labelledby="userDropdown"
                  style={{
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12,
                    minWidth: 200,
                  }}
                >
                  <li>
                    <Link
                      to="/my-bookings"
                      className="dropdown-item d-flex align-items-center gap-2 text-white py-2"
                      style={{ fontSize: '0.9rem' }}
                    >
                      <Ticket size={16} color="var(--cinema-red)" />
                      My Bookings
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/profile"
                      className="dropdown-item d-flex align-items-center gap-2 text-white py-2"
                      style={{ fontSize: '0.9rem' }}
                    >
                      <UserIcon size={16} color="var(--cinema-gold)" />
                      Profile Settings
                    </Link>
                  </li>
                  {isAdmin && (
                    <>
                      <li><hr className="dropdown-divider border-secondary opacity-25" /></li>
                      <li>
                        <Link
                          to="/admin"
                          className="dropdown-item d-flex align-items-center gap-2 text-warning py-2"
                          style={{ fontSize: '0.9rem' }}
                        >
                          <Shield size={16} />
                          Admin Dashboard
                        </Link>
                      </li>
                    </>
                  )}
                  <li><hr className="dropdown-divider border-secondary opacity-25" /></li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item d-flex align-items-center gap-2 text-danger py-2 w-100 border-0 bg-transparent"
                      style={{ fontSize: '0.9rem' }}
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-cinema-outline">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-cinema">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
