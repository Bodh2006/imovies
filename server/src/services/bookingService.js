const Show = require('../models/Show');
const Booking = require('../models/Booking');
const generateReference = require('../utils/generateReference');
const { cleanupExpiredLocksForShow } = require('./seatLockService');

/**
 * Confirm a booking from locked seats (mock payment)
 */
const confirmBooking = async ({ showId, seats, userId }) => {
  if (!seats || !Array.isArray(seats) || seats.length === 0) {
    throw { statusCode: 400, message: 'Please provide seats to book.' };
  }

  // Clean up any expired locks first
  await cleanupExpiredLocksForShow(showId);

  const show = await Show.findById(showId).populate('movieId screenId');
  if (!show) {
    throw { statusCode: 404, message: 'Show not found' };
  }

  const now = new Date();
  const seatDetails = [];
  let totalAmount = 0;

  for (const seatId of seats) {
    const seat = show.seats.find((s) => s.seatId === seatId);
    if (!seat) {
      throw { statusCode: 400, message: `Seat ${seatId} does not exist in this show.` };
    }

    // Must be locked by this exact user and lock must not be expired
    const isLockedByThisUser =
      seat.status === 'locked' &&
      seat.lockedBy &&
      seat.lockedBy.toString() === userId.toString() &&
      seat.lockExpiresAt &&
      new Date(seat.lockExpiresAt) > now;

    if (!isLockedByThisUser) {
      throw {
        statusCode: 409,
        message: `Seat ${seatId} is no longer locked by you or your session expired. Please reselect.`,
      };
    }

    const price = show.prices[seat.category] || show.prices.regular || 150;
    seatDetails.push({
      seatId,
      category: seat.category,
      price,
    });
    totalAmount += price;
  }

  const reference = generateReference();

  // Create booking
  const booking = await Booking.create({
    reference,
    userId,
    showId,
    seats,
    seatDetails,
    totalAmount,
    status: 'confirmed',
    paymentStatus: 'paid',
  });

  // Atomically mark seats as booked
  await Show.updateOne(
    { _id: showId },
    {
      $set: {
        'seats.$[elem].status': 'booked',
        'seats.$[elem].lockedBy': null,
        'seats.$[elem].lockExpiresAt': null,
        'seats.$[elem].bookingId': booking._id,
      },
    },
    {
      arrayFilters: [
        {
          'elem.seatId': { $in: seats },
          'elem.lockedBy': userId,
        },
      ],
    }
  );

  const populatedBooking = await Booking.findById(booking._id).populate({
    path: 'showId',
    populate: [{ path: 'movieId' }, { path: 'screenId', populate: { path: 'theatreId' } }],
  });

  return populatedBooking;
};

/**
 * Cancel a booking
 * Rules: up to 2 hours before showtime; seats are then freed immediately
 */
const cancelBooking = async (bookingId, userId, isAdmin = false) => {
  const booking = await Booking.findById(bookingId).populate('showId');
  if (!booking) {
    throw { statusCode: 404, message: 'Booking not found' };
  }

  if (!isAdmin && booking.userId.toString() !== userId.toString()) {
    throw { statusCode: 403, message: 'Not authorized to cancel this booking' };
  }

  if (booking.status === 'cancelled') {
    throw { statusCode: 400, message: 'Booking is already cancelled.' };
  }

  // Check 2-hour window unless admin
  if (!isAdmin && booking.showId) {
    const showStartTime = new Date(booking.showId.startTime).getTime();
    const now = Date.now();
    const twoHoursInMs = 2 * 60 * 60 * 1000;

    if (showStartTime - now < twoHoursInMs) {
      throw {
        statusCode: 400,
        message: 'Bookings can only be cancelled up to 2 hours before the showtime.',
      };
    }
  }

  // Update booking record
  booking.status = 'cancelled';
  booking.paymentStatus = 'refunded';
  await booking.save();

  // Free seats in show
  if (booking.showId) {
    await Show.updateOne(
      { _id: booking.showId._id },
      {
        $set: {
          'seats.$[elem].status': 'available',
          'seats.$[elem].lockedBy': null,
          'seats.$[elem].lockExpiresAt': null,
          'seats.$[elem].bookingId': null,
        },
      },
      {
        arrayFilters: [
          {
            'elem.seatId': { $in: booking.seats },
            'elem.bookingId': booking._id,
          },
        ],
      }
    );
  }

  return booking;
};

module.exports = {
  confirmBooking,
  cancelBooking,
};
