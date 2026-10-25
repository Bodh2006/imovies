import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Heart, ShieldCheck, Zap, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto border-top border-secondary border-opacity-10 py-5" style={{ background: '#07080c' }}>
      <div className="container">
        <div className="row g-4 justify-content-between">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #e50914 0%, #b8050e 100%)',
                }}
              >
                <Film size={20} color="#ffffff" />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800 }}>
                <span className="text-white">I</span>
                <span style={{ color: 'var(--cinema-red)' }}>Movies</span>
              </span>
            </div>
            <p className="text-secondary small mb-3">
              Next-generation cinema ticketing platform with real-time atomic seat reservation, 
              live hall previews, and instant QR e-ticketing.
            </p>
            <div className="d-flex gap-2">
              <span className="badge bg-dark border border-secondary border-opacity-25 text-secondary">
                MERN Stack
              </span>
              <span className="badge bg-dark border border-secondary border-opacity-25 text-secondary">
                JWT Auth
              </span>
              <span className="badge bg-dark border border-secondary border-opacity-25 text-secondary">
                Bootstrap Grid
              </span>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white fw-bold mb-3">Navigation</h6>
            <ul className="list-unstyled text-secondary small d-flex flex-column gap-2 mb-0">
              <li><Link to="/" className="text-decoration-none text-secondary hover-white">Now Showing</Link></li>
              <li><Link to="/movies?status=coming_soon" className="text-decoration-none text-secondary hover-white">Coming Soon</Link></li>
              <li><Link to="/movies" className="text-decoration-none text-secondary hover-white">All Movies</Link></li>
              <li><Link to="/my-bookings" className="text-decoration-none text-secondary hover-white">My Bookings</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-3 col-6">
            <h6 className="text-white fw-bold mb-3">Cinema Experience</h6>
            <ul className="list-unstyled text-secondary small d-flex flex-column gap-2 mb-0">
              <li className="d-flex align-items-center gap-2">
                <ShieldCheck size={14} color="#10b981" /> 100% Guaranteed Seats
              </li>
              <li className="d-flex align-items-center gap-2">
                <Zap size={14} color="var(--cinema-gold)" /> Instant 5-Min Seat Hold
              </li>
              <li className="d-flex align-items-center gap-2">
                <Award size={14} color="var(--cinema-blue)" /> IMAX & Dolby Atmos
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-4 border-secondary opacity-10" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-secondary small">
          <div>
            &copy; {new Date().getFullYear()} IMovies Entertainment Inc. All rights reserved.
          </div>
          <div className="mt-2 mt-md-0 d-flex align-items-center gap-1">
            Engineered with <Heart size={14} color="var(--cinema-red)" fill="var(--cinema-red)" /> for the ultimate movie-goer experience.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
