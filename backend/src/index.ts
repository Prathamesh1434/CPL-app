import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import groupRoutes from './routes/groups.routes';
import captainRoutes from './routes/captains.routes';
import playerRoutes from './routes/players.routes';
import auctionRoutes from './routes/auction.routes';
import analyticsRoutes from './routes/analytics.routes';
import { registerAuctionHandlers } from './socket/auction.handler';

const app = express();
const httpServer = createServer(app);

// CORS
app.use(cors({
  origin: env.CLIENT_ORIGIN,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/captains', captainRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/auction', auctionRoutes);
app.use('/api/analytics', analyticsRoutes);

// Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: env.CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  registerAuctionHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Start server
httpServer.listen(env.PORT, () => {
  console.log(`🚀 CPL Backend running on port ${env.PORT}`);
  console.log(`🔗 Client origin: ${env.CLIENT_ORIGIN}`);
});

export { app, httpServer, io };
