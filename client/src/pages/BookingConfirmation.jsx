import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { bookingApi } from '../api/bookingApi';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Printer,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Tv,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const BookingConfirmation = () => {
  const { id } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);

  useEffect(() => {
    // Fire celebratory confetti if freshly booked
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // Confetti fallback
    }

    if (!booking) {
      const fetchBooking = async () => {
        try {
          const res = await bookingApi.getBookingById(id);
          if (res.success) {
            setBooking(res.data);
          }
        } catch (err) {
          console.error('Failed to load booking details:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchBooking();
    }
  }, [id, booking]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <div className="spinner-border text-danger" role="status"></div>
        <p className="text-secondary mt-2">Loading digital e-ticket...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center text-secondary">
        <h5>Booking Not Found</h5>
        <Link to="/my-bookings" className="btn btn-cinema mt-3">View My Bookings</Link>
      </div>
    );
  }

  const show = booking.showId;
  const movie = show?.movieId;
  const screen = show?.screenId;
  const theatre = screen?.theatreId;

  const formattedDate = show?.startTime
    ? new Date(show.startTime).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const formattedTime = show?.startTime
    ? new Date(show.startTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className="booking-confirmation-page py-5">
      <div className="container" style={{ maxWidth: 760 }}>
        {/* Success header */}
        <div className="text-center mb-4">
          <div
            className="d-inline-flex p-3 rounded-circle mb-3 shadow"
            style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}
          >
            <CheckCircle size={44} />
          </div>
          <h2 className="text-white fw-bold">Booking Confirmed!</h2>
          <p className="text-secondary small">
            Your seats are reserved and your digital e-ticket is ready for entry.
          </p>
        </div>

        {/* E-Ticket Card */}
        <div className="ticket-card p-4 p-md-5 mb-4 text-white">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-2">
              <Ticket size={24} color="var(--cinema-red)" />
              <span className="fw-bold tracking-wider fs-5" style={{ fontFamily: 'var(--font-heading)' }}>
                IMOVIES ADMISSION PASS
              </span>
            </div>
            <span className="badge bg-success px-3 py-2 fw-bold text-uppercase">
              {booking.status}
            </span>
          </div>

          <div className="row g-4 align-items-center">
            {/* Movie Info */}
            <div className="col-md-8">
              <h3 className="fw-bold text-white mb-2">{movie?.title}</h3>
              <p className="text-secondary small mb-3">
                {movie?.language} &bull; {movie?.genres?.join(', ')} &bull; {movie?.durationMin} mins
              </p>

              <div className="mb-3">
                <div className="d-flex align-items-center gap-2 text-warning fw-semibold mb-1">
                  <MapPin size={16} /> {theatre?.name}
                </div>
                <div className="text-secondary small ps-4">
                  {theatre?.address}, {theatre?.city}
                </div>
              </div>

              <div className="d-flex flex-wrap gap-4 text-light small mb-3">
                <div>
                  <span className="text-secondary d-block small">SCREEN</span>
                  <strong>{screen?.name}</strong>
                </div>
                <div>
                  <span className="text-secondary d-block small">DATE</span>
                  <strong>{formattedDate}</strong>
                </div>
                <div>
                  <span className="text-secondary d-block small">TIME</span>
                  <strong>{formattedTime}</strong>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-4 pt-2 border-top border-secondary border-opacity-25">
                <div>
                  <span className="text-secondary d-block small">RESERVED SEATS</span>
                  <div className="d-flex gap-1 mt-1">
                    {booking.seats?.map((seat) => (
                      <span key={seat} className="badge bg-primary fs-6 px-2 py-1">
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-secondary d-block small">TOTAL PAID</span>
                  <span className="fw-bold fs-5 text-warning">₹{booking.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* QR Code Column */}
            <div className="col-md-4 text-center border-start-md border-secondary border-opacity-20 ps-md-4">
              <div
                className="bg-white p-3 rounded-3 d-inline-block shadow-sm mb-2"
                style={{ width: 'fit-content' }}
              >
                <QRCodeSVG
                  value={`IMOVIES:${booking.reference}:${booking._id}`}
                  size={140}
                  level="H"
                />
              </div>
              <div className="small text-secondary mt-1">
                Booking Reference:
                <strong className="d-block text-white fw-bold tracking-wider fs-6">
                  {booking.reference}
                </strong>
              </div>
              <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                Scan at cinema turnstile
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <button
            onClick={handlePrint}
            className="btn btn-cinema-outline d-flex align-items-center gap-2"
          >
            <Printer size={18} /> Print / Save E-Ticket
          </button>

          <div className="d-flex gap-2">
            <Link to="/my-bookings" className="btn btn-cinema-outline">
              My Bookings
            </Link>
            <Link to="/" className="btn btn-cinema d-flex align-items-center gap-2">
              Browse More <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
