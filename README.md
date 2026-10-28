# 🎬 IMovies — Full-Stack Cinema Ticketing & Reservation Engine

[![GitHub stars](https://img.shields.io/github/stars/Bodh2006/imovies?style=flat-square&color=6366f1)](https://github.com/Bodh2006/imovies/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-06b6d4.svg?style=flat-square)](LICENSE)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%2024%20%2B%20Express-22c55e?style=flat-square&logo=nodedotjs)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%208-10b981?style=flat-square&logo=mongodb)](https://www.mongodb.com)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FBodh2006%2Fimovies&env=MONGO_URI,JWT_SECRET)

> **IMovies** is a modern, high-throughput movie ticket booking web platform engineered to deliver cinema reservation experiences with zero seat-contention race conditions. Features atomic seat locking, interactive multiplex seat layouts, dynamic show scheduling, instant QR-code digital boarding passes, and a comprehensive theater administration suite.

---

## 📑 Table of Contents
- [Core Highlights](#-core-highlights)
- [Interactive Preview](#-interactive-preview)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Seat Lock & Concurrency Model](#-seat-lock--concurrency-model)
- [Quick Start Guide](#-quick-start-guide)
- [Default Demo Credentials](#-default-demo-credentials)
- [REST API Endpoints](#-rest-api-endpoints)
- [Deployment](#-deployment)
- [Author & License](#-author--license)

---

## ⚡ Core Highlights

### 🎟️ Customer Booking Experience
- **Interactive Auditorium Projection Map**: Visualized curved auditorium seating featuring real-time state feedback (Available, In-Checkout Hold, Booked, and Selected).
- **5-Minute Atomic Seat Isolation**: Selected seats are automatically reserved exclusively for 5 minutes with a live countdown timer, preventing race-condition conflicts across simultaneous buyers.
- **Dynamic Showtimes & Filters**: Browse movies by release date, language, auditorium tech (*IMAX 3D, Dolby Atmos, 4DX*), and city.
- **Contactless QR E-Tickets**: Generates scannable, cryptographically validated SVG QR codes with unique reference identifiers (`IMV-XXXX-XXXX`) ready for print or mobile presentation.
- **Automated Cancellations**: Cancel tickets up to 2 hours before showtime with automated instant seat replenishment.

### 💼 Cinema Operator & Admin Control
- **Executive Revenue Metrics**: Real-time tracking of box-office gross receipts, reservation volume, occupancy rates, and top-grossing movie leaderboards.
- **Movie Catalog Management**: Full CRUD controls with high-definition posters, synopsis, age classifications, and trailer links.
- **Screen Collision Detection**: Automatic validation prevents scheduling overlapping shows in the same auditorium hall.
- **Unified Transaction Ledger**: Comprehensive audit log of all bookings across every screen and customer.

---

## 📸 Interactive Preview

<div align="center">
  <img src="./demo_walkthrough.webp" alt="IMovies Interface Walkthrough" width="100%" style="border-radius: 8px; border: 1px solid #222;" />
</div>

---

## 🛠️ Architecture & Tech Stack

```
[ Client: React 19 + Vite + Bootstrap ]
                  │
                  ▼ (RESTful JSON / Stateless JWT)
[ Server: Express.js API + Middleware Pipeline ]
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
 [ MongoDB Database ]  [ Scheduled Lock Expiry Worker ]
 (Mongoose Schemas)    (Clears orphaned seat holds)
```

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Lucide React, Bootstrap 5, Axios, Canvas Confetti |
| **Backend** | Node.js 24, Express.js, Mongoose 8, JSON Web Tokens (JWT), Bcrypt.js, Helmet |
| **Database** | MongoDB 8 with atomic conditional array updates and text indexing |
| **Hosting** | Vercel Serverless Functions + Single Page Application Routing |

---

## 🛡️ Seat Lock & Concurrency Model

Seat booking conflicts are prevented at the database driver level using MongoDB atomic filters rather than memory-locking, making the architecture horizontally scalable across serverless containers:

```javascript
// Atomically acquires seat locks ONLY if no selected seat is already booked or held by an active session
const lockResult = await Show.updateOne(
  {
    _id: showId,
    seats: {
      $not: {
        $elemMatch: {
          seatId: { $in: requestedSeatIds },
          $or: [
            { status: 'booked' },
            {
              status: 'locked',
              lockedBy: { $ne: currentUserId },
              lockExpiresAt: { $gt: new Date() },
            },
          ],
        },
      },
    },
  },
  {
    $set: {
      'seats.$[elem].status': 'locked',
      'seats.$[elem].lockedBy': currentUserId,
      'seats.$[elem].lockExpiresAt': calculatedExpiryDate,
    },
  },
  {
    arrayFilters: [{ 'elem.seatId': { $in: requestedSeatIds } }],
  }
);
```

When 50 simultaneous clients target the same seat, exactly **one** receives `200 OK` while the remaining **49** gracefully receive `409 Conflict`.

---

## 🚀 Quick Start Guide

### 1. Clone & Enter Repository
```bash
git clone https://github.com/Bodh2006/imovies.git
cd imovies
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Environment Setup
Configure `.env` in `server/`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/imovies
JWT_SECRET=super_secret_jwt_key_2026
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
SEAT_LOCK_MINUTES=5
```

Configure `.env` in `client/`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Seed Database
Injects 9 blockbuster movies, multi-tier auditoriums, active show schedules, and pre-seeded test accounts:
```bash
npm run seed
```

### 5. Launch Development Environment
```bash
npm run dev
```
- **Web App**: [http://localhost:5173](http://localhost:5173)
- **API Server**: [http://localhost:5000](http://localhost:5000)

---

## 🔑 Default Demo Credentials

| Role | Username / Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Cinema Administrator** | `admin@imovies.com` | `Admin@12345` | Full administrative, movie catalogue, and revenue analytics controls |
| **Standard Customer** | `user@imovies.com` | `User@12345` | Movie discovery, live seat booking, and digital ticket management |

*(Convenient 1-click login buttons are also accessible on the `/login` screen)*

---

## 📡 REST API Endpoints

### 🔐 Authentication & Profile
| Endpoint | Method | Auth | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/register` | `POST` | Public | Register customer account |
| `/api/auth/login` | `POST` | Public | Authenticate user & return JWT token |
| `/api/auth/me` | `GET` | User | Fetch active session profile |
| `/api/users/me` | `PUT` | User | Update personal details & credentials |

### 🎬 Movies & Showtimes
| Endpoint | Method | Auth | Description |
| :--- | :---: | :---: | :--- |
| `/api/movies` | `GET` | Public | List movies with genre, language, & search filters |
| `/api/movies/:id` | `GET` | Public | Retrieve full movie details & cast |
| `/api/movies/:id/shows` | `GET` | Public | Get shows grouped by theater & schedule |
| `/api/movies` | `POST` | Admin | Create movie in platform catalog |
| `/api/movies/:id` | `PUT` | Admin | Modify movie listing |
| `/api/movies/:id` | `DELETE`| Admin | Delete movie entry |

### 🎟️ Seat Reservation & Tickets
| Endpoint | Method | Auth | Description |
| :--- | :---: | :---: | :--- |
| `/api/shows/:id` | `GET` | Public | Fetch live seat availability matrix |
| `/api/shows/:id/lock` | `POST` | User | Atomically hold seats for 5 minutes |
| `/api/shows/:id/unlock` | `POST` | User | Voluntarily release held seats |
| `/api/bookings` | `POST` | User | Complete reservation with mock checkout |
| `/api/bookings/my` | `GET` | User | Retrieve personal ticket history |
| `/api/bookings/:id` | `GET` | User | View digital pass with QR code |
| `/api/bookings/:id/cancel`| `PUT` | User | Cancel reservation & restore seats |

### 📊 Admin Operations
| Endpoint | Method | Auth | Description |
| :--- | :---: | :---: | :--- |
| `/api/admin/stats` | `GET` | Admin | Summary metrics (revenue, tickets, top movies) |
| `/api/admin/bookings` | `GET` | Admin | Searchable audit ledger of all platform bookings |
| `/api/shows` | `POST` | Admin | Add show with screen collision checking |
| `/api/theatres` | `POST` | Admin | Register new multiplex venue & halls |

---

## ☁️ Deployment

### Deploy to Vercel in 1 Click
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FBodh2006%2Fimovies&env=MONGO_URI,JWT_SECRET)

Ensure `MONGO_URI` (MongoDB Atlas connection string) and `JWT_SECRET` are added to your Vercel Project Environment Variables.

---

## 📄 Author & License

Developed and maintained by **[Bodh2006](https://github.com/Bodh2006)**.  
Distributed under the **MIT License**.
