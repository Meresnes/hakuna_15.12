import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Database
import { testConnection } from './db/pool.js';
import { initializeDatabase } from './db/init.js';

// Routes
import healthRouter from './routes/health.js';
import stateRouter from './routes/state.js';
import submitRouter from './routes/submit.js';
import choiceRouter, { setLiveNamespace } from './routes/choice.js';
import adminRouter from './routes/admin.js';

// Socket.IO
import { setupSocketHandlers } from './socket.js';

// Load environment variables
dotenv.config();

const app: Express = express();
const httpServer = createServer(app);

// Environment variables
const PORT = parseInt(process.env.PORT ?? '3001', 10);
const CORS_ORIGIN_RAW = process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://localhost:5174';
const NODE_ENV = process.env.NODE_ENV ?? 'development';

// Parse CORS origins (support comma-separated list)
const CORS_ORIGINS = CORS_ORIGIN_RAW.split(',').map(s => s.trim());

// Socket.IO setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: CORS_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  path: '/socket.io',
  transports: ['websocket', 'polling'],
});

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
  })
);
app.use(
  cors({
    origin: CORS_ORIGINS,
    credentials: true,
  })
);
app.use(express.json());

// Request logging in development
if (NODE_ENV === 'development') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.info(`${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/state', stateRouter);
app.use('/api/submit', submitRouter);
app.use('/api/choice', choiceRouter);
app.use('/api/admin', adminRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Socket.IO namespace for live updates
const liveNamespace = io.of('/live');

// Set namespace reference for choice route
setLiveNamespace(liveNamespace);

// Setup Socket.IO handlers
setupSocketHandlers(liveNamespace);

// Start server
async function startServer(): Promise<void> {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Run migrations
    await initializeDatabase();

    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.info(`🚀 Server running on http://localhost:${PORT}`);
      console.info(`📡 Socket.IO listening on /live namespace`);
      console.info(`🌍 Environment: ${NODE_ENV}`);
      console.info(`🔗 CORS origins: ${CORS_ORIGINS.join(', ')}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.info('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    console.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.info('SIGINT received. Shutting down gracefully...');
  httpServer.close(() => {
    console.info('Server closed');
    process.exit(0);
  });
});

void startServer();

export { app, io, liveNamespace };
