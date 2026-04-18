# SportStat - Sports Statistics App

A full-stack web application for tracking sports statistics, built with Node.js, Express, MongoDB, and React.

## Features

- User authentication (registration, login, JWT tokens)
- Team management
- Player statistics (goals, assists, faults, cards, passes, tackles, actions, minutes played, rating)
- Jersey numbers for players
- Game tracking
- RESTful API
- NB1 (Hungarian Premier League) teams and players data

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB with Mongoose
- **Frontend**: React with Vite
- **Database**: MongoDB

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or remote connection)
- npm or yarn

## Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

## Database Setup

For development, the app uses mock data instead of MongoDB. No database setup required!

If you want to use MongoDB:
1. Install MongoDB on your system
2. Start MongoDB service
3. Uncomment the MongoDB connection in `backend/server.js`
4. Run `npm run seed` to populate the database

## Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```
   Server will run on http://localhost:5000

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on http://localhost:5173 (or next available port)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After successful login/registration, you'll receive a token that should be included in the Authorization header for protected routes:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

Protected routes are marked with "(requires auth)" in the API documentation.

### Example Registration
```json
POST /api/auth/register
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Example Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login step 1 (email + password, sends OTP code by email)
- `POST /api/auth/verify-login` - Login step 2 (email + OTP code, returns JWT)
- `POST /api/auth/forgot-password` - Send password reset code by email
- `POST /api/auth/reset-password` - Reset password with email + code + new password
- `GET /api/auth/profile` - Get current user profile (requires auth)
- `PATCH /api/auth/profile` - Update user profile (requires auth)

### SMTP Configuration (Required for OTP and password reset emails)

Create a `backend/.env` file (you can copy from `backend/.env.example`) and set:

- `SMTP_HOST`
- `SMTP_PORT` (e.g. `587`)
- `SMTP_SECURE` (`true` for TLS/465, otherwise `false`)
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM` (optional, defaults to `SMTP_USER`)

Example:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@example.com
SMTP_PASS=your_app_password
SMTP_FROM=SportStat <you@example.com>
```

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create a new team
- `GET /api/teams/:id` - Get a specific team
- `PATCH /api/teams/:id` - Update a team
- `DELETE /api/teams/:id` - Delete a team

### Players
- `GET /api/players` - Get all players
- `POST /api/players` - Create a new player
- `GET /api/players/:id` - Get a specific player
- `PATCH /api/players/:id` - Update a player
- `DELETE /api/players/:id` - Delete a player

### Games
- `GET /api/games` - Get all games
- `POST /api/games` - Create a new game
- `GET /api/games/:id` - Get a specific game
- `PATCH /api/games/:id` - Update a game
- `DELETE /api/games/:id` - Delete a game

## Development

- Backend uses `nodemon` for development: `npm run dev`
- Frontend uses Vite for fast development