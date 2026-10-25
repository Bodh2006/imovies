const Show = require('../models/Show');
const { SEAT_LOCK_MINUTES } = require('../config/env');

/**
 * Clean up expired seat locks on a show
 */
const cleanupExpiredLocksForShow = async (showId) => {
  const now = new Date();
  await Show.updateOne(
    { _id: showId },
    {
      $set: {
        'seats.$[elem].status': 'available',
        'seats.$[elem].lockedBy': null,
        'seats.$[elem].lockExpiresAt': null,
      },
    },
    {
      arrayFilters: [
        {
          'elem.status': 'locked',
          'elem.lockExpiresAt': { $lte: now },
        },
      ],
    }
  );
};

/**
 * Atomically lock an array of seats for a given user.
 * Validates that all requested seats are currently available (or expired locks).
 * If any seat is booked or currently locked by another user, rejects with unavailable list.
 */
const lockSeats = async (showId, seatIds, userId) => {
  if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    throw { statusCode: 400, message: 'Please provide at least one seat to lock.' };
  }
  if (seatIds.length > 8) {
    throw { statusCode: 400, message: 'Cannot lock more than 8 seats per booking.' };
  }

  // 1. Release any expired locks first for this show
  await cleanupExpiredLocksForShow(showId);

  const now = new Date();
  const lockExpiresAt = new Date(now.getTime() + SEAT_LOCK_MINUTES * 60 * 1000);

  // 2. Perform atomic conditional update:
  // Update seats that are in seatIds only if none of them are booked or locked by someone else
  const updateResult = await Show.updateOne(
    {
      _id: showId,
      seats: {
        $not: {
          $elemMatch: {
            seatId: { $in: seatIds },
            $or: [
              { status: 'booked' },
              {
                status: 'locked',
                lockedBy: { $ne: userId },
                lockExpiresAt: { $gt: now },
              },
            ],
          },
        },
      },
    },
    {
      $set: {
        'seats.$[elem].status': 'locked',
        'seats.$[elem].lockedBy': userId,
        'seats.$[elem].lockExpiresAt': lockExpiresAt,
      },
    },
    {
      arrayFilters: [{ 'elem.seatId': { $in: seatIds } }],
    }
  );

  // If update matched 0 documents, at least one seat is unavailable or show doesn't exist
  if (updateResult.matchedCount === 0) {
    const show = await Show.findById(showId);
    if (!show) {
      throw { statusCode: 404, message: 'Show not found' };
    }

    const unavailable = [];
    for (const sId of seatIds) {
      const seat = show.seats.find((s) => s.seatId === sId);
      if (
        !seat ||
        seat.status === 'booked' ||
        (seat.status === 'locked' &&
          seat.lockedBy &&
          seat.lockedBy.toString() !== userId.toString() &&
          seat.lockExpiresAt &&
          new Date(seat.lockExpiresAt) > now)
      ) {
        unavailable.push(sId);
      }
    }

    return {
      success: false,
      statusCode: 409,
      message: 'Seats unavailable',
      unavailable: unavailable.length > 0 ? unavailable : seatIds,
    };
  }

  return {
    success: true,
    statusCode: 200,
    lockExpiresAt: lockExpiresAt.toISOString(),
    seats: seatIds,
  };
};

/**
 * Unlock seats explicitly locked by a user
 */
const unlockSeats = async (showId, seatIds, userId) => {
  const filter = {
    'elem.status': 'locked',
    'elem.lockedBy': userId,
  };

  if (seatIds && Array.isArray(seatIds) && seatIds.length > 0) {
    filter['elem.seatId'] = { $in: seatIds };
  }

  await Show.updateOne(
    { _id: showId },
    {
      $set: {
        'seats.$[elem].status': 'available',
        'seats.$[elem].lockedBy': null,
        'seats.$[elem].lockExpiresAt': null,
      },
    },
    {
      arrayFilters: [filter],
    }
  );

  return { success: true, message: 'Seats unlocked successfully' };
};

module.exports = {
  lockSeats,
  unlockSeats,
  cleanupExpiredLocksForShow,
};
