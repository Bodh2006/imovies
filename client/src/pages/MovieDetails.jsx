import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieApi } from '../api/movieApi';
import {
  Star,
  Clock,
  Globe,
  Calendar,
  MapPin,
  Play,
  Ticket,
  ChevronRight,
  Info,
  Tv,
} from 'lucide-react';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedCity, setSelectedCity] = useState('');
  const [trailerOpen, setTrailerOpen] = useState(false);

  // Generate next 5 dates for the date selector
  const availableDates = Array.from({ length: 5 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() + idx);
    return {
      iso: d.toISOString().split('T')[0],
      dayName: idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

  useEffect(() => {
    const fetchMovieAndShows = async () => {
      try {
        setLoading(true);
        const [movieRes, showsRes] = await Promise.all([
          movieApi.getMovieById(id),
          movieApi.getMovieShows(id, { date: selectedDate, city: selectedCity }),
        ]);

        if (movieRes.success) setMovie(movieRes.data);
        if (showsRes.success) setShows(showsRes.data);
      } catch (err) {
        console.error('Failed to fetch movie details or shows:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieAndShows();
  }, [id, selectedDate, selectedCity]);

  // Group shows by Theatre -> Screen
  const groupedTheatres = shows.reduce((acc, show) => {
    const screen = show.screenId;
    const theatre = screen?.theatreId;
    if (!theatre) return acc;

    const theatreId = theatre._id;
    if (!acc[theatreId]) {
      acc[theatreId] = {
        theatre,
        screens: {},
      };
    }

    const screenId = screen._id;
    if (!acc[theatreId].screens[screenId]) {
      acc[theatreId].screens[screenId] = {
        screen,
        shows: [],
      };
    }

    acc[theatreId].screens[screenId].shows.push(show);
    return acc;
  }, {});

  const theatresList = Object.values(groupedTheatres);

  if (loading && !movie) {
    return (
      <div className="text-center py-5 my-5">
        <div className="spinner-border text-danger" role="status"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container py-5 text-center text-secondary">
        <h3>Movie Not Found</h3>
        <Link to="/movies" className="btn btn-cinema mt-3">Back to Movies</Link>
      </div>
    );
  }

  return (
    <div className="movie-details-page pb-5">
      {/* Backdrop Header */}
      <div
        className="position-relative py-5 mb-5"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(9, 10, 15, 0.75), var(--bg-deep) 95%), url(${movie.posterUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
        }}
      >
        <div className="container position-relative pt-4" style={{ zIndex: 2 }}>
          <div className="row g-4 align-items-center">
            {/* Poster Column */}
            <div className="col-md-4 col-lg-3 text-center text-md-start">
              <div
                className="rounded-4 overflow-hidden shadow-lg border border-secondary border-opacity-25 mx-auto"
                style={{ maxWidth: 280 }}
              >
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-100 d-block"
                  style={{ aspectRatio: '2/3', objectFit: 'cover' }}
                />
              </div>
            </div>

            {/* Movie Info Column */}
            <div className="col-md-8 col-lg-9">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className="badge bg-danger text-uppercase fw-bold">
                  {movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
                </span>
                {movie.genres?.map((g) => (
                  <span key={g} className="badge bg-dark border border-secondary border-opacity-50 text-light fw-normal">
                    {g}
                  </span>
                ))}
              </div>

              <h1 className="display-5 fw-bold text-white mb-2">{movie.title}</h1>

              <div className="d-flex flex-wrap align-items-center gap-3 text-secondary mb-3">
                {movie.rating > 0 && (
                  <div className="d-flex align-items-center gap-1 text-warning fw-bold">
                    <Star size={18} fill="var(--cinema-gold)" color="var(--cinema-gold)" />
                    <span>{movie.rating.toFixed(1)} / 10</span>
                  </div>
                )}
                <span>&bull;</span>
                <span className="d-flex align-items-center gap-1 text-light">
                  <Clock size={16} /> {movie.durationMin} Minutes
                </span>
                <span>&bull;</span>
                <span className="d-flex align-items-center gap-1 text-light">
                  <Globe size={16} /> {movie.language}
                </span>
                <span>&bull;</span>
                <span className="text-light">
                  {new Date(movie.releaseDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <p className="text-light opacity-80 mb-4" style={{ maxWidth: 720, lineHeight: 1.6 }}>
                {movie.description}
              </p>

              {movie.cast && movie.cast.length > 0 && (
                <div className="mb-4">
                  <span className="text-secondary small fw-bold text-uppercase d-block mb-1">
                    Starring
                  </span>
                  <div className="d-flex flex-wrap gap-2">
                    {movie.cast.map((actor, idx) => (
                      <span key={idx} className="badge bg-secondary bg-opacity-25 text-white py-1 px-2 fw-normal">
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {movie.trailerUrl && (
                <button
                  onClick={() => setTrailerOpen(true)}
                  className="btn btn-cinema-outline d-inline-flex align-items-center gap-2"
                >
                  <Play size={18} fill="#ffffff" /> Watch Official Trailer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal (if open) */}
      {trailerOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1050 }}
          onClick={() => setTrailerOpen(false)}
        >
          <div
            className="glass-panel p-3 w-100"
            style={{ maxWidth: 800 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="text-white m-0">{movie.title} - Official Trailer</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setTrailerOpen(false)}
              ></button>
            </div>
            <div className="ratio ratio-16x9 rounded overflow-hidden">
              <iframe
                src={
                  movie.trailerUrl.includes('watch?v=')
                    ? movie.trailerUrl.replace('watch?v=', 'embed/')
                    : movie.trailerUrl
                }
                title="Trailer"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Showtimes & Booking Section */}
      <div className="container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h3 className="text-white fw-bold m-0">Select Showtimes</h3>
            <p className="text-secondary small m-0">Pick your preferred theatre, screen format, and slot.</p>
          </div>

          {/* City Filter */}
          <div className="d-flex align-items-center gap-2">
            <MapPin size={18} color="var(--cinema-red)" />
            <select
              className="form-select form-select-cinema"
              style={{ width: 180 }}
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">All Cities</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Delhi NCR">Delhi NCR</option>
            </select>
          </div>
        </div>

        {/* Date Selector Pills */}
        <div className="d-flex gap-2 overflow-x-auto pb-3 mb-4">
          {availableDates.map((item) => (
            <button
              key={item.iso}
              onClick={() => setSelectedDate(item.iso)}
              className={`btn text-center p-2 px-3 rounded-3 transition ${
                selectedDate === item.iso
                  ? 'btn-danger shadow-sm'
                  : 'btn-cinema-outline text-secondary'
              }`}
              style={{ minWidth: 95 }}
            >
              <div className="small fw-semibold text-uppercase">{item.dayName}</div>
              <div className="fs-5 fw-bold text-white">{item.dateNum}</div>
              <div className="small opacity-75">{item.month}</div>
            </button>
          ))}
        </div>

        {/* Grouped Showtimes List */}
        {theatresList.length === 0 ? (
          <div className="glass-panel p-5 text-center text-secondary">
            <Info size={40} className="mb-2 text-warning" />
            <h5>No shows available for the selected date & city.</h5>
            <p className="small mb-0">Try selecting another date or check back later.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {theatresList.map(({ theatre, screens }) => (
              <div key={theatre._id} className="glass-panel p-4">
                <div className="mb-3">
                  <h5 className="text-white fw-bold mb-1">{theatre.name}</h5>
                  <p className="text-secondary small mb-0 d-flex align-items-center gap-1">
                    <MapPin size={14} color="var(--cinema-gold)" />
                    {theatre.address}, {theatre.city}
                  </p>
                </div>

                <hr className="border-secondary opacity-15 my-3" />

                {/* Screens in this Theatre */}
                <div className="d-flex flex-column gap-3">
                  {Object.values(screens).map(({ screen, shows }) => (
                    <div key={screen._id} className="row g-2 align-items-center">
                      <div className="col-md-3">
                        <span className="text-light fw-semibold d-flex align-items-center gap-2">
                          <Tv size={16} color="var(--cinema-blue)" />
                          {screen.name}
                        </span>
                      </div>

                      <div className="col-md-9">
                        <div className="d-flex flex-wrap gap-2">
                          {shows.map((show) => {
                            const timeStr = new Date(show.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            });
                            const minPrice = Math.min(
                              show.prices?.regular || 150,
                              show.prices?.premium || 250,
                              show.prices?.recliner || 400
                            );

                            return (
                              <Link
                                key={show._id}
                                to={`/shows/${show._id}/seats`}
                                className="btn btn-cinema-outline text-decoration-none d-flex flex-column align-items-center py-2 px-3"
                                style={{ minWidth: 105 }}
                              >
                                <span className="text-white fw-bold" style={{ fontSize: '0.95rem' }}>
                                  {timeStr}
                                </span>
                                <span className="text-success small" style={{ fontSize: '0.72rem' }}>
                                  from ₹{minPrice}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;
