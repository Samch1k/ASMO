# Desk Booking Service

A full-stack desk booking system for office space management.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: SQLite
- **Auth**: Simple name/email (no password)

## Features

- **Visual Office Map**: Interactive grid showing desk availability
- **Desk Booking**: Select desk, choose date/time, create reservation
- **My Bookings**: View and manage your reservations
- **Simple Auth**: Login with name and email

## Project Structure

```
demo/DeskBooking/
├── frontend/          # React application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Express API
│   ├── src/
│   ├── database/
│   └── package.json
└── README.md
```

## Getting Started

### Backend

```bash
cd backend
npm install
npm run dev          # Starts on http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev          # Starts on http://localhost:5173
```

## API Endpoints

- `POST /api/auth/login` - Login with name/email
- `GET /api/desks` - Get all desks with availability
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `DELETE /api/bookings/:id` - Cancel booking

## Database Schema

### Users
- id, name, email, created_at

### Desks
- id, number, floor, zone, status

### Bookings
- id, user_id, desk_id, start_time, end_time, created_at
