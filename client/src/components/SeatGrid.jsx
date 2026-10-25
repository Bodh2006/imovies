import React from 'react';
import { Sparkles, Armchair, AlertCircle } from 'lucide-react';

const SeatGrid = ({
  seats = [],
  prices = { regular: 150, premium: 250, recliner: 400 },
  selectedSeats = [],
  onSeatToggle,
  currentUserId,
}) => {
  // Group seats by row letter (e.g. 'A', 'B', 'C')
  const groupedRows = seats.reduce((acc, seat) => {
    const rowLetter = seat.seatId.match(/[A-Z]+/)?.[0] || 'A';
    if (!acc[rowLetter]) {
      acc[rowLetter] = {
        label: rowLetter,
        category: seat.category,
        seats: [],
      };
    }
    acc[rowLetter].seats.push(seat);
    return acc;
  }, {});

  const rows = Object.values(groupedRows);

  const getSeatStatus = (seat) => {
    if (selectedSeats.includes(seat.seatId)) {
      return 'selected';
    }
    if (seat.status === 'booked') {
      return 'booked';
    }
    if (seat.status === 'locked') {
      // If locked by the current user, it can be treated as selected or locked
      return 'locked';
    }
    return 'available';
  };

  const handleSeatClick = (seat) => {
    const status = getSeatStatus(seat);
    if (status === 'booked' || status === 'locked') {
      return;
    }
    onSeatToggle(seat);
  };

  return (
    <div className="seat-grid-container text-center py-4">
      {/* Cinema Screen Curve */}
      <div className="cinema-screen-container">
        <div className="cinema-screen"></div>
        <div className="cinema-screen-glow"></div>
        <p className="text-secondary small fw-semibold tracking-wider text-uppercase mt-2 mb-4">
          All Eyes This Way &bull; Screen
        </p>
      </div>

      {/* Seat Rows by Category */}
      <div className="d-flex flex-column gap-3 align-items-center mb-4">
        {rows.map((row) => (
          <div key={row.label} className="w-100 d-flex flex-column align-items-center">
            {/* Show Category separator header if row category changes */}
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-dark border border-secondary border-opacity-25 text-capitalize text-secondary px-2 py-1" style={{ fontSize: '0.72rem' }}>
                {row.category} (₹{prices[row.category] || 150})
              </span>
            </div>

            <div className="d-flex align-items-center justify-content-center gap-1 gap-sm-2 flex-wrap">
              {/* Row Label Left */}
              <div
                className="text-secondary fw-bold me-2 user-select-none"
                style={{ width: 22, fontSize: '0.85rem' }}
              >
                {row.label}
              </div>

              {/* Seats in Row */}
              {row.seats.map((seat) => {
                const status = getSeatStatus(seat);
                return (
                  <div
                    key={seat.seatId}
                    className={`seat-box ${status}`}
                    onClick={() => handleSeatClick(seat)}
                    title={`Seat ${seat.seatId} (${seat.category}) - ₹${prices[seat.category] || 150}`}
                  >
                    {seat.seatId.replace(/^[A-Z]+/, '')}
                  </div>
                );
              })}

              {/* Row Label Right */}
              <div
                className="text-secondary fw-bold ms-2 user-select-none"
                style={{ width: 22, fontSize: '0.85rem' }}
              >
                {row.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Seat Legend per SRS requirements */}
      <div className="glass-panel p-3 d-inline-flex flex-wrap justify-content-center gap-4 align-items-center mx-auto">
        <div className="seat-legend-item">
          <div className="seat-box available" style={{ width: 20, height: 20, fontSize: '0.65rem' }}></div>
          <span className="text-secondary">Available</span>
        </div>
        <div className="seat-legend-item">
          <div className="seat-box selected" style={{ width: 20, height: 20, fontSize: '0.65rem' }}></div>
          <span className="text-secondary">Selected</span>
        </div>
        <div className="seat-legend-item">
          <div className="seat-box locked" style={{ width: 20, height: 20, fontSize: '0.65rem' }}></div>
          <span className="text-secondary">Locked (In Checkout)</span>
        </div>
        <div className="seat-legend-item">
          <div className="seat-box booked" style={{ width: 20, height: 20, fontSize: '0.65rem' }}></div>
          <span className="text-secondary">Booked</span>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
