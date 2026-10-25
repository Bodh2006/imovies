const Show = require('../models/Show');

/**
 * Periodically release expired seat locks across all shows
 */
const startExpiredLocksJob = (intervalMs = 30000) => {
  const runCleanup = async () => {
    try {
      const now = new Date();
      const result = await Show.updateMany(
        {
          'seats.status': 'locked',
          'seats.lockExpiresAt': { $lte: now },
        },
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

      if (result.modifiedCount > 0) {
        console.log(`[Job] Released expired locks in ${result.modifiedCount} show(s).`);
      }
    } catch (err) {
      console.error('[Job Error] releaseExpiredLocks:', err.message);
    }
  };

  // Run on startup and on interval
  runCleanup();
  const timer = setInterval(runCleanup, intervalMs);

  return () => clearInterval(timer);
};

module.exports = startExpiredLocksJob;
