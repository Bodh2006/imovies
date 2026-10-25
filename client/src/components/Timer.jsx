import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const Timer = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateRemaining = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();
      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateRemaining());

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire) {
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 60 && timeLeft > 0;

  return (
    <div
      className={`d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill ${
        isUrgent
          ? 'bg-danger bg-opacity-25 border border-danger text-danger'
          : 'bg-warning bg-opacity-20 border border-warning text-warning'
      }`}
      style={{
        fontWeight: 700,
        fontSize: '0.9rem',
        animation: isUrgent ? 'pulse 1s infinite' : 'none',
      }}
    >
      <Clock size={16} />
      <span>
        Seats locked: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

export default Timer;
