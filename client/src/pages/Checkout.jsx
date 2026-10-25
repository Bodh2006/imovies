import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { bookingApi } from '../api/bookingApi';
import { showApi } from '../api/showApi';
import Timer from '../components/Timer';
import {
  CreditCard,
  ShieldCheck,
  Film,
  Calendar,
  Clock,
  MapPin,
  Lock,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { showId, show, selectedSeats, lockExpiresAt, totalAmount } =
    location.state || {};

  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cardData, setCardData] = useState({
    name: 'Parv Khandelwal',
    number: '4242 •••• •••• 4242',
    expiry: '12/28',
    cvv: '888',
  });

  // If page accessed directly without state, redirect to movies
  if (!showId || !selectedSeats || !show) {
    return (
      <div className="container py-5 text-center text-secondary">
        <h5>No active checkout session found.</h5>
        <p className="small mb-4">Please select a movie and seats first.</p>
        <Link to="/movies" className="btn btn-cinema">Browse Movies</Link>
      </div>
    );
  }

  const movie = show.movieId;
  const screen = show.screenId;
  const theatre = screen?.theatreId;

  const handleTimerExpire = () => {
    alert('Your 5-minute seat hold has expired. The seats have been released.');
    navigate(`/shows/${showId}/seats`);
  };

  const handleCancelHold = async () => {
    try {
      await showApi.unlockSeats(showId, selectedSeats);
    } catch (e) {
      console.warn('Unlock failed or already expired');
    }
    navigate(`/shows/${showId}/seats`);
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    try {
      setPaymentProcessing(true);
      setErrorMessage('');

      // Call booking confirmation endpoint (simulated mock payment)
      const res = await bookingApi.createBooking({
        showId,
        seats: selectedSeats,
      });

      if (res.success && res.data) {
        navigate(`/bookings/${res.data._id}`, {
          state: { booking: res.data, isNew: true },
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment processing failed. Please try again.';
      setErrorMessage(msg);
      setPaymentProcessing(false);
    }
  };

  const convenienceFee = Math.round(totalAmount * 0.05); // 5% mock tax/fee
  const grandTotal = totalAmount + convenienceFee;

  return (
    <div className="checkout-page py-5">
      <div className="container">
        {/* Navigation & Timer Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <button
            onClick={handleCancelHold}
            className="btn btn-cinema-outline d-inline-flex align-items-center gap-2"
            style={{ width: 'fit-content' }}
          >
            <ChevronLeft size={16} /> Release Seats & Back
          </button>

          {/* Countdown timer */}
          {lockExpiresAt && (
            <Timer expiresAt={lockExpiresAt} onExpire={handleTimerExpire} />
          )}
        </div>

        {errorMessage && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="row g-4">
          {/* Order Breakdown Column */}
          <div className="col-lg-7">
            <div className="glass-panel p-4 mb-4">
              <h5 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
                <Film size={20} color="var(--cinema-red)" />
                Booking Summary
              </h5>

              <div className="d-flex gap-3 mb-4">
                <img
                  src={movie?.posterUrl}
                  alt={movie?.title}
                  className="rounded-3 shadow"
                  style={{ width: 85, height: 120, objectFit: 'cover' }}
                />
                <div>
                  <h5 className="text-white fw-bold mb-1">{movie?.title}</h5>
                  <p className="text-secondary small mb-2">{movie?.genres?.join(', ')}</p>
                  <p className="text-light small mb-1 d-flex align-items-center gap-1">
                    <MapPin size={14} color="var(--cinema-gold)" />
                    {theatre?.name} ({screen?.name})
                  </p>
                  <p className="text-secondary small mb-0 d-flex align-items-center gap-2">
                    <span>
                      <Calendar size={13} className="me-1" />
                      {new Date(show.startTime).toLocaleDateString()}
                    </span>
                    <span>
                      <Clock size={13} className="me-1" />
                      {new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </p>
                </div>
              </div>

              <hr className="border-secondary opacity-20 my-3" />

              {/* Seats and price breakdown */}
              <div className="mb-3">
                <div className="d-flex justify-content-between text-secondary small mb-2">
                  <span>Reserved Seats ({selectedSeats.length})</span>
                  <div className="d-flex gap-1">
                    {selectedSeats.map((s) => (
                      <span key={s} className="badge bg-primary">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="d-flex justify-content-between text-light small mb-2">
                  <span>Base Ticket Fare</span>
                  <span>₹{totalAmount}</span>
                </div>

                <div className="d-flex justify-content-between text-light small mb-2">
                  <span>Cinema Convenience Fee & GST (5%)</span>
                  <span>₹{convenienceFee}</span>
                </div>
              </div>

              <hr className="border-secondary opacity-20 my-3" />

              <div className="d-flex justify-content-between align-items-center">
                <span className="text-white fw-bold fs-5">Amount Payable</span>
                <span className="text-white fw-black fs-4" style={{ color: 'var(--cinema-gold)' }}>
                  ₹{grandTotal}
                </span>
              </div>
            </div>

            <div className="glass-panel p-3 d-flex align-items-center gap-3">
              <ShieldCheck size={28} color="#10b981" />
              <div className="small text-secondary">
                <strong className="text-white d-block">Guaranteed Seat Hold</strong>
                Seats are locked exclusively to your user account until the countdown expires.
              </div>
            </div>
          </div>

          {/* Mock Payment Gateway Column */}
          <div className="col-lg-5">
            <div className="glass-panel p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-white fw-bold m-0 d-flex align-items-center gap-2">
                  <CreditCard size={20} color="var(--cinema-gold)" />
                  Payment Gateway
                </h5>
                <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25 small">
                  Simulated
                </span>
              </div>

              <p className="text-secondary small mb-4">
                Enter simulated card details or click below to simulate instant payment confirmation.
              </p>

              <form onSubmit={handleConfirmPayment}>
                <div className="mb-3">
                  <label className="form-label text-secondary small">Cardholder Name</label>
                  <input
                    type="text"
                    className="form-control form-control-cinema"
                    value={cardData.name}
                    onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small">Card Number</label>
                  <input
                    type="text"
                    className="form-control form-control-cinema"
                    value={cardData.number}
                    onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                    required
                  />
                </div>

                <div className="row g-2 mb-4">
                  <div className="col-6">
                    <label className="form-label text-secondary small">Expiry</label>
                    <input
                      type="text"
                      className="form-control form-control-cinema"
                      value={cardData.expiry}
                      onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-secondary small">CVV</label>
                    <input
                      type="password"
                      className="form-control form-control-cinema"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="btn btn-cinema btn-lg w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                >
                  {paymentProcessing ? (
                    <>
                      <div className="spinner-border spinner-border-sm" role="status"></div>
                      <span>Authorizing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      <span>Pay ₹{grandTotal} & Confirm</span>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-3 text-secondary" style={{ fontSize: '0.75rem' }}>
                <CheckCircle2 size={13} className="text-success me-1" />
                End-to-End Encrypted Mock Payment Transaction
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
