import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../api/bookingApi';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancellingId, setCancellingId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.getMyBookings();
      if (res.success) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const now = new Date();

  // Filter bookings into Upcoming vs Past/Cancelled
  const upcomingBookings = bookings.filter((b) => {
    if (b.status === 'cancelled') return false;
    const startTime = new Date(b.showId?.startTime);
    return startTime > now;
  });

  const pastBookings = bookings.filter((b) => {
    if (b.status === 'cancelled') return true;
    const startTime = new Date(b.showId?.startTime);
    return startTime <= now;
  });

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  // Handle cancellation
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will immediately free your seats.')) {
      return;
    }

    try {
      setCancellingId(bookingId);
      setActionError('');
      setActionSuccess('');

      const res = await bookingApi.cancelBooking(bookingId);
      if (res.success) {
        setActionSuccess('Booking cancelled successfully and seats have been released.');
        fetchBookings();
      }
    } catch (err) {
      setActionError(
        err.response?.data?.message || 'Failed to cancel booking. Notice: Bookings can only be cancelled up to 2 hours before showtime.'
      );
    } finally {
      setCancellingId(null);
    }
  };

  // Check if booking is cancelable (>= 2 hours before showtime)
  const isCancelable = (booking) => {
    if (booking.status === 'cancelled') return false;
    if (!booking.showId?.startTime) return false;
    const showTime = new Date(booking.showId.startTime).getTime();
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    return showTime - Date.now() >= twoHoursInMs;
  };

  return (
    <div className="my-bookings-page py-5">
      <div className="container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h2 className="text-white fw-bold m-0 d-flex align-items-center gap-2">
              <Ticket size={24} color="var(--cinema-red)" />
              My Bookings
            </h2>
            <p className="text-secondary small m-0">
              Manage your cinema reservations, download tickets, or cancel seats.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="btn-group p-1 bg-dark rounded-pill border border-secondary border-opacity-25">
            <button
              className={`btn btn-sm rounded-pill px-3 ${
                activeTab === 'upcoming' ? 'btn-danger fw-bold' : 'text-secondary'
              }`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming ({upcomingBookings.length})
            </button>
            <button
              className={`btn btn-sm rounded-pill px-3 ${
                activeTab === 'past' ? 'btn-danger fw-bold' : 'text-secondary'
              }`}
              onClick={() => setActiveTab('past')}
            >
              Past & Cancelled ({pastBookings.length})
            </button>
          </div>
        </div>

        {actionSuccess && (
          <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
            <CheckCircle size={18} />
            <span>{actionSuccess}</span>
          </div>
        )}

        {actionError && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
            <AlertTriangle size={18} />
            <span>{actionError}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5 my-5">
            <div className="spinner-border text-danger" role="status"></div>
          </div>
        ) : displayedBookings.length === 0 ? (
          <div className="glass-panel p-5 text-center text-secondary">
            <h5>No {activeTab} bookings found.</h5>
            <p className="small mb-4">You have no reservations under this section.</p>
            <Link to="/movies" className="btn btn-cinema">Book a Movie Now</Link>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {displayedBookings.map((b) => {
              const show = b.showId;
              const movie = show?.movieId;
              const screen = show?.screenId;
              const theatre = screen?.theatreId;

              const showDate = show?.startTime
                ? new Date(show.startTime).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'N/A';

              const showTime = show?.startTime
                ? new Date(show.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'N/A';

              const canCancel = isCancelable(b);

              return (
                <div key={b._id} className="glass-panel p-4">
                  <div className="row g-3 align-items-center">
                    {/* Poster */}
                    <div className="col-sm-3 col-md-2 text-center text-sm-start">
                      <img
                        src={movie?.posterUrl}
                        alt={movie?.title}
                        className="rounded-3 shadow-sm w-100"
                        style={{ maxWidth: 110, aspectRatio: '2/3', objectFit: 'cover' }}
                      />
                    </div>

                    {/* Movie & Show Info */}
                    <div className="col-sm-9 col-md-6">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="text-secondary small fw-bold">
                          REF: {b.reference}
                        </span>
                        <span
                          className={`badge ${
                            b.status === 'confirmed' ? 'bg-success' : 'bg-danger'
                          }`}
                        >
                          {b.status.toUpperCase()}
                        </span>
                      </div>

                      <h5 className="text-white fw-bold mb-1">{movie?.title}</h5>
                      <p className="text-secondary small mb-2 d-flex align-items-center gap-1">
                        <MapPin size={13} color="var(--cinema-gold)" />
                        {theatre?.name} ({screen?.name})
                      </p>

                      <div className="d-flex flex-wrap gap-3 text-light small mb-2">
                        <span className="d-flex align-items-center gap-1">
                          <Calendar size={13} /> {showDate}
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <Clock size={13} /> {showTime}
                        </span>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <span className="text-secondary small">Seats:</span>
                        <div className="d-flex flex-wrap gap-1">
                          {b.seats?.map((seat) => (
                            <span key={seat} className="badge bg-primary">
                              {seat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Actions */}
                    <div className="col-md-4 text-md-end pt-3 pt-md-0 border-top border-md-0 border-secondary border-opacity-25">
                      <div className="mb-3">
                        <span className="text-secondary small d-block">Paid Amount</span>
                        <span className="text-warning fw-bold fs-4">₹{b.totalAmount}</span>
                      </div>

                      <div className="d-flex flex-wrap justify-content-md-end gap-2">
                        <Link
                          to={`/bookings/${b._id}`}
                          className="btn btn-cinema-outline btn-sm d-flex align-items-center gap-1"
                        >
                          <Eye size={15} /> View E-Ticket
                        </Link>

                        {canCancel && (
                          <button
                            onClick={() => handleCancelBooking(b._id)}
                            disabled={cancellingId === b._id}
                            className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                          >
                            {cancellingId === b._id ? (
                              'Cancelling...'
                            ) : (
                              <>
                                <XCircle size={15} /> Cancel Booking
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
