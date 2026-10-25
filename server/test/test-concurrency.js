const mongoose = require('mongoose');
const { MONGO_URI } = require('../src/config/env');
const User = require('../src/models/User');
const Show = require('../src/models/Show');
const { lockSeats, unlockSeats } = require('../src/services/seatLockService');
const { confirmBooking, cancelBooking } = require('../src/services/bookingService');

async function runTests() {
  console.log('=== STARTING IMOVIES CONCURRENCY & LOCK TESTS ===\n');

  await mongoose.connect(MONGO_URI);

  try {
    const userA = await User.findOne({ email: 'user@imovies.com' });
    const admin = await User.findOne({ email: 'admin@imovies.com' });
    const show = await Show.findOne({ 'seats.status': 'available' });

    if (!userA || !admin || !show) {
      throw new Error('Database must be seeded before running tests!');
    }

    console.log(`Testing with Show: ${show._id}`);
    const availableSeats = show.seats.filter((s) => s.status === 'available').slice(0, 4);
    const testSeatId = availableSeats[0].seatId;
    const testSeatId2 = availableSeats[1].seatId;

    console.log(`[Test 1] User A locks seat ${testSeatId}...`);
    const lock1 = await lockSeats(show._id, [testSeatId], userA._id);
    console.log('Result:', lock1.statusCode, lock1.success ? 'SUCCESS (Locked)' : 'FAILED');
    if (lock1.statusCode !== 200) throw new Error('Test 1 failed: lock should succeed');

    console.log(`\n[Test 2] User B (Admin) tries to lock the same seat ${testSeatId}...`);
    const lock2 = await lockSeats(show._id, [testSeatId], admin._id);
    console.log('Result:', lock2.statusCode, lock2.message, 'Unavailable:', lock2.unavailable);
    if (lock2.statusCode !== 409 || !lock2.unavailable.includes(testSeatId)) {
      throw new Error('Test 2 failed: conflicting seat must return 409 Conflict');
    }

    console.log(`\n[Test 3] Concurrent race condition: User A and User B lock ${testSeatId2} at the exact same millisecond...`);
    const [resA, resB] = await Promise.all([
      lockSeats(show._id, [testSeatId2], userA._id),
      lockSeats(show._id, [testSeatId2], admin._id),
    ]);

    const statuses = [resA.statusCode, resB.statusCode];
    console.log('Concurrent Results:', statuses);
    const count200 = statuses.filter((s) => s === 200).length;
    const count409 = statuses.filter((s) => s === 409).length;

    console.log(`200 OK count: ${count200}, 409 Conflict count: ${count409}`);
    if (count200 !== 1 || count409 !== 1) {
      throw new Error('Test 3 failed: Exactly one must succeed and one must return 409');
    }

    console.log('\n[Test 4] Unlock seat and verify it is released back to available...');
    await unlockSeats(show._id, [testSeatId], userA._id);
    const updatedShow = await Show.findById(show._id);
    const seatObj = updatedShow.seats.find((s) => s.seatId === testSeatId);
    console.log(`Seat ${testSeatId} status after unlock:`, seatObj.status);
    if (seatObj.status !== 'available') {
      throw new Error('Test 4 failed: Seat should be back to available');
    }

    console.log('\n=============================================');
    console.log(' ALL ACCEPTANCE CRITERIA TESTS PASSED! (4/4)');
    console.log('=============================================\n');
  } finally {
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error('[Test Failed]', err);
  process.exit(1);
});
