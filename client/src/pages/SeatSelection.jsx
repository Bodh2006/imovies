import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { showApi } from '../api/showApi';
import { useAuth } from '../context/AuthContext';
import SeatGrid from '../components/SeatGrid';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  AlertCircle,
  Ticket,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

const SeatSelection = () => {
  const { id: showId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locking, setLocking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch show details
  const fetchShowData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      else setIsRefreshing(true);

      const res = await showApi.getShowById(showId);
      if (res.success && res.data) {
        setShow(res.data);

        // Deselect any seat that has become booked or locked by someone else
        setSelectedSeats((prevSelected) => {
          const validSeats = prevSelected.filter((seatId) => {
            const foundSeat = res.data.seats.find((s) => s.seatId === seatId);
            if (!foundSeat) return false;
            if (foundSeat.status === 'booked') return false;
            if (
              foundSeat.status === 'locked' &&
              foundSeat.lockedBy &&
              foundSeat.lockedBy !== user?._id
            ) {
              return false;
            }
            return true;
          });
          return validSeats;
        });
      }
    } catch (err) {
      console.error('Error fetching show seat map:', err);
      setErrorMessage('Failed to load show seat layout. Please try again.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchShowData();

    // FR-14: Poll every 5 seconds for live updates
    const pollInterval = setInterval(() => {
      fetchShowData(true);
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [showId]);

  // Handle seat click toggle (up to 8 seats, FR-15)
  const handleSeatToggle = (seat) => {
    setErrorMessage('');
    const seatId = seat.seatId;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length >= 8) {
        setErrorMessage('You can select a maximum of 8 seats per booking.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  // Calculate running total
  const calculateTotal = () => {
    if (!show || selectedSeats.length === 0) return 0;
    return selectedSeats.reduce((sum, seatId) => {
      const seat = show.seats.find((s) => s.seatId === seatId);
      const price = show.prices?.[seat?.category] || 150;
      return sum + price;
    }, 0);
  };

  // Handle seat lock and proceed
  const handleProceedToCheckout = async () => {
    if (selectedSeats.length === 0) return;

    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: { pathname: `/shows/${showId}/seats` } },
      });
      return;
    }

    try {
      setLocking(true);
      setErrorMessage('');

      const res = await showApi.lockSeats(showId, selectedSeats);

      if (res.success) {
        // Navigate to checkout with lock info
        navigate('/checkout', {
          state: {
            showId,
            show,
            selectedSeats,
            lockExpiresAt: res.lockExpiresAt,
            totalAmount: calculateTotal(),
          },
        });
      }
    } catch (err) {
      const respData = err.response?.data;
      if (respData && respData.unavailable) {
        setErrorMessage(
          `Some seats are no longer available: ${respData.unavailable.join(', ')}. Please choose different seats.`
        );
        // Refresh live map
        fetchShowData(true);
      } else {
        setErrorMessage(
          respData?.message || 'Failed to lock seats. Please try again.'
        );
      }
    } finally {
      setLocking(false);
    }
  };

  if (loading && !show) {
    return (
      <div className="text-center py-5 my-5">
        <div className="spinner-border text-danger" role="status"></div>
        <p className="text-secondary mt-3">Loading cinema seat map...</p>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="container py-5 text-center text-secondary">
        <h5>Show details not found.</h5>
        <Link to="/movies" className="btn btn-cinema mt-3">Return to Movies</Link>
      </div>
    );
  }

  const movie = show.movieId;
  const screen = show.screenId;
  const theatre = screen?.theatreId;

  const formattedDate = new Date(show.startTime).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = new Date(show.startTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="seat-selection-page pb-5">
      {/* Show header banner */}
      <div className="glass-panel py-3 px-4 mb-4 rounded-0 border-start-0 border-end-0">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <Link
                to={`/movies/${movie?._id}`}
                className="btn btn-cinema-outline btn-sm p-2 d-flex align-items-center justify-content-center"
              >
                <ChevronLeft size={18} />
              </Link>
              <div>
                <h4 className="text-white fw-bold m-0">{movie?.title}</h4>
                <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small mt-1">
                  <span className="d-flex align-items-center gap-1">
                    <MapPin size={14} color="var(--cinema-red)" />
                    {theatre?.name} &bull; {screen?.name}
                  </span>
                  <span>&bull;</span>
                  <span className="d-flex align-items-center gap-1 text-light">
                    <Calendar size={14} /> {formattedDate}
                  </span>
                  <span>&bull;</span>
                  <span className="d-flex align-items-center gap-1 text-light">
                    <Clock size={14} /> {formattedTime}
                  </span>
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              {isRefreshing && (
                <span className="text-secondary small d-flex align-items-center gap-1 animate-pulse">
                  <RefreshCw size={13} className="spin" /> Syncing live seats...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Error banner */}
        {errorMessage && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Seat Map */}
        <div className="glass-panel p-4 mb-5">
          <SeatGrid
            seats={show.seats || []}
            prices={show.prices || {}}
            selectedSeats={selectedSeats}
            onSeatToggle={handleSeatToggle}
            currentUserId={user?._id}
          />
        </div>
      </div>

      {/* Floating Bottom Bar when seats are selected */}
      {selectedSeats.length > 0 && (
        <div
          className="position-fixed bottom-0 start-0 w-100 p-3 shadow-lg"
          style={{
            background: 'rgba(15, 18, 28, 0.95)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(229, 9, 20, 0.4)',
            zIndex: 1000,
          }}
        >
          <div className="container">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
              <div>
                <div className="small text-secondary mb-1">
                  Selected Seats ({selectedSeats.length} of 8 max):
                </div>
                <div className="d-flex flex-wrap gap-1 align-items-center">
                  {selectedSeats.map((s) => (
                    <span
                      key={s}
                      className="badge bg-primary px-2 py-1 fw-bold"
                      style={{ fontSize: '0.85rem' }}
                    >
                      {s}
                    </span>
                  ))}
                  <span className="text-secondary ms-2">&bull;</span>
                  <span className="text-white fw-bold ms-2 fs-5">
                    Total: ₹{calculateTotal()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                disabled={locking}
                className="btn btn-cinema btn-lg px-4 py-2 d-flex align-items-center gap-2"
              >
                {locking ? (
                  <>
                    <div className="spinner-border spinner-border-sm" role="status"></div>
                    <span>Locking Seats...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;
