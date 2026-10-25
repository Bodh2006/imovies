const mongoose = require('mongoose');
const { MONGO_URI } = require('../src/config/env');
const User = require('../src/models/User');
const Movie = require('../src/models/Movie');
const Theatre = require('../src/models/Theatre');
const Screen = require('../src/models/Screen');
const Show = require('../src/models/Show');
const Booking = require('../src/models/Booking');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB at', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Database connected. Clearing existing collections...');

    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.drop().catch(() => {});
    }
    console.log('[Seed] Dropped all collections & indexes. Creating collections...');

    // 1. Admin & Demo Users
    const adminUser = await User.create({
      name: 'Cinema Administrator',
      email: 'admin@imovies.com',
      password: 'Admin@12345',
      role: 'admin',
    });

    const demoUser = await User.create({
      name: 'Parv Khandelwal',
      email: 'user@imovies.com',
      password: 'User@12345',
      role: 'user',
    });

    console.log(`[Seed] Created admin: ${adminUser.email} & user: ${demoUser.email}`);

    // 2. Movies (8+ blockbuster titles with real posters & trailers)
    const moviesData = [
      {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
        genres: ['Action', 'Sci-Fi', 'Adventure'],
        language: 'English',
        durationMin: 166,
        rating: 8.6,
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
        releaseDate: new Date('2024-03-01'),
        status: 'now_showing',
      },
      {
        title: 'Oppenheimer',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring moral dilemmas and political fallout.',
        genres: ['Biography', 'Drama', 'History'],
        language: 'English',
        durationMin: 180,
        rating: 8.9,
        posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=800&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
        releaseDate: new Date('2023-07-21'),
        status: 'now_showing',
      },
      {
        title: 'Interstellar: Re-Release',
        description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
        genres: ['Adventure', 'Drama', 'Sci-Fi'],
        language: 'English',
        durationMin: 169,
        rating: 8.7,
        posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
        releaseDate: new Date('2024-09-15'),
        status: 'now_showing',
      },
      {
        title: 'Spider-Man: Across the Spider-Verse',
        description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When heroes clash on how to handle a threat, Miles must redefine what it means to be a hero.',
        genres: ['Animation', 'Action', 'Adventure'],
        language: 'English',
        durationMin: 140,
        rating: 8.8,
        posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=800&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
        cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac'],
        releaseDate: new Date('2023-06-02'),
        status: 'now_showing',
      },
      {
        title: 'Jawan',
        description: 'A high-octane action thriller outlining the emotional journey of a man who is set to rectify the wrongs in the society, with pulsating stunts and larger-than-life drama.',
        genres: ['Action', 'Thriller'],
        language: 'Hindi',
        durationMin: 169,
        rating: 7.5,
        posterUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=COv52Qyctws',
        cast: ['Shah Rukh Khan', 'Nayanthara', 'Vijay Sethupathi', 'Deepika Padukone'],
        releaseDate: new Date('2023-09-07'),
        status: 'now_showing',
      },
      {
        title: 'Avatar: The Way of Water',
        description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their home.',
        genres: ['Action', 'Adventure', 'Fantasy'],
        language: 'English',
        durationMin: 192,
        rating: 7.6,
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
        cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver'],
        releaseDate: new Date('2022-12-16'),
        status: 'now_showing',
      },
      {
        title: 'Gladiator II',
        description: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.',
        genres: ['Action', 'Adventure', 'Drama'],
        language: 'English',
        durationMin: 148,
        rating: 7.8,
        posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
        cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
        releaseDate: new Date('2026-11-20'),
        status: 'coming_soon',
      },
      {
        title: 'Deadpool & Wolverine',
        description: 'Deadpool\'s peaceful existence comes crashing down when the Time Variance Authority recruits him to help safeguard the multiverse, partnering him with a reluctant Wolverine.',
        genres: ['Action', 'Comedy', 'Sci-Fi'],
        language: 'English',
        durationMin: 128,
        rating: 7.9,
        posterUrl: 'https://images.unsplash.com/photo-1568876694728-451bbf694b83?q=80&w=800&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
        cast: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin'],
        releaseDate: new Date('2024-07-26'),
        status: 'now_showing',
      },
      {
        title: 'Mission: Impossible - The Final Reckoning',
        description: 'Ethan Hunt and his IMF team embark on their most dangerous mission yet: To track down a terrifying new weapon that threatens all of humanity before it falls into the wrong hands.',
        genres: ['Action', 'Adventure', 'Thriller'],
        language: 'English',
        durationMin: 160,
        rating: 8.1,
        posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
        trailerUrl: 'https://www.youtube.com/watch?v=2m1drlOZSDw',
        cast: ['Tom Cruise', 'Hayley Atwell', 'Ving Rhames', 'Simon Pegg'],
        releaseDate: new Date('2026-12-15'),
        status: 'coming_soon',
      },
    ];

    const movies = await Movie.insertMany(moviesData);
    console.log(`[Seed] Seeded ${movies.length} movies.`);

    // 3. Theatres (3 distinct premium locations)
    const theatresData = [
      {
        name: 'PVR ICON Grand Galleria',
        city: 'Mumbai',
        address: 'Level 4, High Street Phoenix, Lower Parel',
      },
      {
        name: 'INOX Megaplex Nexus',
        city: 'Bengaluru',
        address: 'Nexus Mall, Koramangala 7th Block',
      },
      {
        name: 'Cinépolis VIP Forum',
        city: 'Delhi NCR',
        address: 'DLF Avenue, Saket District Centre',
      },
    ];

    const theatres = await Theatre.insertMany(theatresData);
    console.log(`[Seed] Seeded ${theatres.length} theatres.`);

    // Standard screen layout template (Rows A-B: Recliner, C-E: Premium, F-H: Regular)
    const createLayout = (hasRecliner = true) => {
      const rows = [];
      if (hasRecliner) {
        rows.push({ label: 'A', seats: 8, category: 'recliner' });
        rows.push({ label: 'B', seats: 8, category: 'recliner' });
      }
      rows.push({ label: 'C', seats: 10, category: 'premium' });
      rows.push({ label: 'D', seats: 10, category: 'premium' });
      rows.push({ label: 'E', seats: 10, category: 'premium' });
      rows.push({ label: 'F', seats: 12, category: 'regular' });
      rows.push({ label: 'G', seats: 12, category: 'regular' });
      rows.push({ label: 'H', seats: 12, category: 'regular' });
      return { rows };
    };

    // 4. Screens (2 screens per theatre = 6 screens total)
    const screensData = [
      {
        theatreId: theatres[0]._id,
        name: 'Screen 1 - IMAX Laser 3D',
        seatLayout: createLayout(true),
      },
      {
        theatreId: theatres[0]._id,
        name: 'Screen 2 - Dolby Atmos 4K',
        seatLayout: createLayout(false),
      },
      {
        theatreId: theatres[1]._id,
        name: 'Screen 1 - Onyx Cinema LED',
        seatLayout: createLayout(true),
      },
      {
        theatreId: theatres[1]._id,
        name: 'Screen 2 - INSIGNIA Gold Class',
        seatLayout: createLayout(true),
      },
      {
        theatreId: theatres[2]._id,
        name: 'Screen 1 - 4DX Dynamic Experience',
        seatLayout: createLayout(false),
      },
      {
        theatreId: theatres[2]._id,
        name: 'Screen 2 - VIP Luxe Lounge',
        seatLayout: createLayout(true),
      },
    ];

    const screens = await Screen.insertMany(screensData);
    console.log(`[Seed] Seeded ${screens.length} screens.`);

    // 5. Shows (At least 30 shows across the next 3 days)
    const nowShowingMovies = movies.filter((m) => m.status === 'now_showing');
    const shows = [];
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);

    const timeSlots = [
      { startH: 10, startM: 0, endH: 12, endM: 45 },
      { startH: 13, startM: 30, endH: 16, endM: 15 },
      { startH: 17, startM: 0, endH: 19, endM: 45 },
      { startH: 20, startM: 30, endH: 23, endM: 15 },
    ];

    let showCounter = 0;

    for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
      for (let sIdx = 0; sIdx < screens.length; sIdx++) {
        const screen = screens[sIdx];

        for (let tIdx = 0; tIdx < timeSlots.length; tIdx++) {
          if (showCounter >= 36) break; // create 36 shows (exceeding 30 requirement)

          const slot = timeSlots[tIdx];
          const movie = nowShowingMovies[(showCounter + sIdx + dayOffset) % nowShowingMovies.length];

          const startTime = new Date(baseDate);
          startTime.setDate(baseDate.getDate() + dayOffset);
          startTime.setHours(slot.startH, slot.startM, 0, 0);

          const endTime = new Date(baseDate);
          endTime.setDate(baseDate.getDate() + dayOffset);
          endTime.setHours(slot.endH, slot.endM, 0, 0);

          // Build seats from screen layout
          const seats = [];
          for (const row of screen.seatLayout.rows) {
            for (let i = 1; i <= row.seats; i++) {
              seats.push({
                seatId: `${row.label}${i}`,
                category: row.category,
                status: 'available',
                lockedBy: null,
                lockExpiresAt: null,
                bookingId: null,
              });
            }
          }

          shows.push({
            movieId: movie._id,
            screenId: screen._id,
            startTime,
            endTime,
            prices: {
              regular: 180 + (sIdx % 2) * 20,
              premium: 280 + (sIdx % 2) * 40,
              recliner: 450 + (sIdx % 2) * 50,
            },
            seats,
          });

          showCounter++;
        }
      }
    }

    const createdShows = await Show.insertMany(shows);
    console.log(`[Seed] Seeded ${createdShows.length} shows.`);

    // 6. Pre-book a few sample seats for demo realism
    const sampleShow = createdShows[0];
    const bookedSeatIds = ['C3', 'C4', 'D5', 'D6'];
    const seatDetails = [];
    let totalAmt = 0;

    for (const seat of sampleShow.seats) {
      if (bookedSeatIds.includes(seat.seatId)) {
        seat.status = 'booked';
        const price = sampleShow.prices[seat.category] || 250;
        seatDetails.push({
          seatId: seat.seatId,
          category: seat.category,
          price,
        });
        totalAmt += price;
      }
    }

    const sampleBooking = await Booking.create({
      reference: 'IMV-DEMO-001',
      userId: demoUser._id,
      showId: sampleShow._id,
      seats: bookedSeatIds,
      seatDetails,
      totalAmount: totalAmt,
      status: 'confirmed',
      paymentStatus: 'paid',
    });

    for (const seat of sampleShow.seats) {
      if (bookedSeatIds.includes(seat.seatId)) {
        seat.bookingId = sampleBooking._id;
      }
    }
    await sampleShow.save();

    console.log(`[Seed] Created sample booking ${sampleBooking.reference} with 4 seats.`);
    console.log('\n=============================================');
    console.log(' DATABASE SEEDED SUCCESSFULLY!');
    console.log(' Admin credentials:');
    console.log('   Email:    admin@imovies.com');
    console.log('   Password: Admin@12345');
    console.log(' Demo User credentials:');
    console.log('   Email:    user@imovies.com');
    console.log('   Password: User@12345');
    console.log('=============================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

seedData();
