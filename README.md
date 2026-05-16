# Cricket Premier League (CPL) Auction Platform

> Enterprise-grade real-time cricket auction platform with dynamic groups, spinning wheel player selection, live bidding, and multi-role access.

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase project (PostgreSQL)

### 1. Set up Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase/schema.sql`
3. Note your project URL and anon key from Settings → API

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials
npm install
npm run seed    # Creates admin/operator/viewer users
npm run dev     # Starts on port 4000
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev     # Starts on port 5173
```

### 4. Login

| Role     | Email              | Password    |
|----------|--------------------|-------------|
| Admin    | admin@cpl.com      | admin123    |
| Operator | operator@cpl.com   | operator123 |
| Viewer   | viewer@cpl.com     | viewer123   |

## Architecture

```
CPL-app/
├── frontend/          # React + Vite + TypeScript + TailwindCSS
├── backend/           # Node.js + Express + Socket.IO
├── supabase/          # Database schema
└── README.md
```

## Auction Flow

1. **Admin** creates Groups, Captains, and Players
2. **Operator** starts auction by selecting a Group
3. Spinning wheel randomly selects a player
4. Operator places bids on behalf of captains
5. Player is marked SOLD or UNSOLD
6. Purse is auto-deducted; all updates are real-time

## Key Features

- 🎯 **Spinning Wheel** — Random player selection with smooth animation
- ⚡ **Real-time** — Socket.IO for live bid updates across all clients
- 🔐 **Role-based Access** — Admin, Operator, Viewer roles
- 💰 **Purse Management** — Auto-deduction with overspend prevention
- 📺 **Live Screen** — `/live` route for projector/TV display
- 🎨 **Enterprise UI** — Dark mode, glassmorphism, neon accents

## Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
# Deploy dist/ to Vercel
# Set env: VITE_API_URL and VITE_SOCKET_URL to backend URL
```

### Backend → Render

1. Create a new Web Service on Render
2. Set build command: `cd backend && npm install && npm run build`
3. Set start command: `cd backend && npm start`
4. Add environment variables from `.env.example`
5. Set `CLIENT_ORIGIN` to your Vercel frontend URL

### Environment Variables

**Backend:**
```
PORT=4000
JWT_SECRET=your-secure-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
CLIENT_ORIGIN=https://your-frontend.vercel.app
```

**Frontend:**
```
VITE_API_URL=https://your-backend.onrender.com
VITE_SOCKET_URL=https://your-backend.onrender.com
```

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React, TypeScript, Vite, TailwindCSS, Framer Motion, Zustand |
| Backend  | Node.js, Express, Socket.IO, JWT |
| Database | Supabase PostgreSQL |
| Realtime | Socket.IO |
