# IMovies - Online Movie Ticket Booking Platform

[![Stack](https://img.shields.io/badge/Stack-MERN-red.svg)](https://react.dev)
[![Database](https://img.shields.io/badge/Database-MongoDB-green.svg)](https://www.mongodb.com)
[![Auth](https://img.shields.io/badge/Auth-JWT%20Stateless-blue.svg)](https://jwt.io)
[![Style](https://img.shields.io/badge/Style-Dark%20Cinema%20Theme-gold.svg)](https://getbootstrap.com)

**IMovies** is a full-stack, enterprise-grade online cinema ticket booking platform built strictly in accordance with the Software Requirements Specification (SRS v1.0). It features real-time atomic seat reservation, 5-minute seat locking to prevent double-booking, live multiplex schedules, mock payment checkout, printable QR e-tickets, and a comprehensive platform operator admin portal.

---

## 🎬 Key Features

- **Atomic Seat Locking & Concurrency Protection**:
  - Seats are locked atomically in MongoDB for **5 minutes** per checkout session.
  - Two simultaneous requests for the same seat result in **exactly one 200 OK and one 409 Conflict** (`unavailable: [...]`).
  - Automatic background job (`releaseExpiredLocks`) and lazy cleanup guarantee abandoned seats are freed automatically.
- **Cinema Hall Seat Selection**:
  - Curved screen visualization with glowing ambiance.
  - Seat colors strictly comply with the SRS:
    - 🟢 **Green**: Available
    - 🔵 **Blue**: Selected (up to 8 seats per booking with running total)
    - 🟠 **Orange**: Locked (active in another user's checkout)
    - ⚪ **Grey**: Booked
  - Live 5-second polling synchronization.
- **Digital E-Tickets with QR Codes**:
  - Instant generation of unique references (`IMV-XXXX-XXXX`).
  - Scannable QR code using `qrcode.react`.
  - Printable / savable e-ticket admission pass.
- **Flexible Cancellations**:
  - Customers can cancel reservations up to **2 hours before showtime** for an instant release and refund.
- **Admin Center**:
  - Real-time revenue metrics, ticket sales, and top movies analytics.
  - Movie catalog management (Add/Edit/Delete movies with posters, trailers, genres, ratings).
  - Multi-theatre and multi-screen auditorium configuration.
  - Show scheduler with **automated schedule overlap prevention** on the same screen.
  - Complete booking audit ledger.

---

## 🏗️ Project Architecture

```
imovies/
|-- server/
|   |-- src/
|   |   |-- config/          # db.js (MongoDB Mongoose), env.js
|   |   |-- models/          # User, Movie, Theatre, Screen, Show, Booking
|   |   |-- controllers/     # auth, movie, theatre, show, booking, admin
|   |   |-- services/        # seatLockService.js, bookingService.js
|   |   |-- routes/          # auth, user, movie, theatre, screen, show, booking, admin
|   |   |-- middleware/      # auth (JWT), role (admin/user), validate, errorHandler
|   |   |-- jobs/            # releaseExpiredLocks.js (periodic lock expiry job)
|   |   |-- utils/           # asyncHandler.js, generateReference.js
|   |   |-- app.js           # Express app, Helmet, CORS, Rate Limiters
|   |   |-- server.js        # Server listener and startup
|   |-- seed/                # seed.js (Database seeder: 9 movies, 3 theatres, 6 screens, 36 shows)
|   |-- test/                # test-concurrency.js (Concurrency & lock unit tests)
|   |-- .env.example
|   |-- .env
|-- client/
|   |-- src/
|   |   |-- api/             # axiosClient, authApi, movieApi, theatreApi, showApi, bookingApi, adminApi
|   |   |-- context/         # AuthContext.jsx (session persistence, token handling)
|   |   |-- components/      # Navbar, Footer, MovieCard, SeatGrid, Timer, ProtectedRoute
|   |   |-- pages/           # Home, Movies, MovieDetails, SeatSelection, Checkout, BookingConfirmation, MyBookings, Login, Register, Profile
|   |   |-- admin/           # AdminLayout, AdminDashboard, AdminMovies, AdminTheatres, AdminShows, AdminBookings
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   |-- index.css        # Cinema Dark theme styling & animations
|   |-- .env.example
|   |-- .env
|-- package.json             # Root runner scripts (concurrently)
|-- README.md
```

---

## 🔑 Default Seed Accounts

The database comes pre-seeded with 9 movies, 3 theatres (Mumbai, Bengaluru, Delhi NCR), 6 screens, 36 shows, and pre-configured test credentials:

| Role | Email | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@imovies.com` | `Admin@12345` | Full administrative access to dashboard, movies, theatres, screens, shows, and all bookings |
| **Customer** | `user@imovies.com` | `User@12345` | Browse movies, select seats, book tickets, view e-tickets, cancel bookings |

*(Note: The Login page also features 1-click Quick Login buttons for both accounts for effortless testing!)*

---

## ⚙️ Environment Configuration

### Backend (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/imovies
JWT_SECRET=imovies_super_secure_jwt_secret_key_2026!
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
SEAT_LOCK_MINUTES=5
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: v18+ (verified on Node v24)
- **MongoDB**: v6+ running locally on port 27017 or MongoDB Atlas connection string.

### 2. Install Dependencies
From the root directory:
```bash
npm run install:all
```

### 3. Seed Database
Seed 9 blockbuster titles, 3 multiplexes, 6 auditoriums, 36 showtimes, and admin accounts:
```bash
npm run seed
```

### 4. Run Concurrency Acceptance Tests
Verify atomic seat locking, lock timeouts, and race conditions:
```bash
cd server
node test/test-concurrency.js
```

### 5. Start Development Servers
Run both backend REST API and React client concurrently:
```bash
# In the root imovies folder:
npm run dev
```

- **Client Web App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Verification & Acceptance Criteria

- **User Authentication**: Register a user, login, session persists across refresh; tokens expire and redirect to login automatically.
- **Atomic Double-Booking Prevention**: Two users attempting to lock the same seat will strictly result in 1 success and 1 `409 Conflict`.
- **5-Minute Countdown**: Seat selection triggers a live 5-minute lock timer. Expired holds release seats automatically.
- **Seat Legend**: Green (Available), Blue (Selected), Orange (Locked), Grey (Booked).
- **Cancellations**: Bookings can be cancelled up to 2 hours before showtime; seats are returned to availability immediately.
- **Admin Access Control**: Non-admin users are barred with 403 Forbidden on all administrative endpoints.
