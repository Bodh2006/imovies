import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Globe } from 'lucide-react';

const MovieCard = ({ movie }) => {
  const isComingSoon = movie.status === 'coming_soon';

  return (
    <div className="movie-card h-100 d-flex flex-column">
      <Link to={`/movies/${movie._id}`} className="text-decoration-none">
        <div className="movie-poster-container">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop';
            }}
          />
          {movie.rating > 0 && (
            <div className="rating-badge">
              <Star size={14} fill="var(--cinema-gold)" color="var(--cinema-gold)" />
              <span>{movie.rating.toFixed(1)}</span>
            </div>
          )}
          {isComingSoon && (
            <div
              className="position-absolute bottom-0 start-0 m-2 px-2 py-1 rounded small fw-bold text-dark"
              style={{ background: 'var(--cinema-gold)', fontSize: '0.75rem' }}
            >
              COMING SOON
            </div>
          )}
        </div>
      </Link>

      <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
        <div>
          <Link to={`/movies/${movie._id}`} className="text-decoration-none">
            <h5
              className="card-title text-white mb-2 text-truncate"
              title={movie.title}
              style={{ fontSize: '1.05rem', fontWeight: 700 }}
            >
              {movie.title}
            </h5>
          </Link>

          <div className="d-flex align-items-center gap-3 text-secondary small mb-2">
            <span className="d-flex align-items-center gap-1">
              <Clock size={13} /> {movie.durationMin}m
            </span>
            <span className="d-flex align-items-center gap-1">
              <Globe size={13} /> {movie.language}
            </span>
          </div>

          <div className="d-flex flex-wrap gap-1 mb-3">
            {movie.genres?.slice(0, 3).map((genre, idx) => (
              <span
                key={idx}
                className="badge bg-secondary bg-opacity-25 text-light fw-normal"
                style={{ fontSize: '0.7rem', padding: '4px 7px', borderRadius: 6 }}
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        <div>
          <Link
            to={`/movies/${movie._id}`}
            className={`btn w-100 py-2 d-flex align-items-center justify-content-center gap-2 ${
              isComingSoon ? 'btn-cinema-outline' : 'btn-cinema'
            }`}
            style={{ fontSize: '0.9rem' }}
          >
            {isComingSoon ? 'View Details' : 'Book Tickets'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
