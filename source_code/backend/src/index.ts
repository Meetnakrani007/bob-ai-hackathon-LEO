import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { logger } from './utils/logger';
import { connectDB } from './db';

// Load environment variables from src/.env or backend/.env or root
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export { logger };

// Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', {
  stream: { write: (message: string) => logger.info(message.trim()) },
}));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'supplyguard-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import shipmentsRoutes from './routes/shipmentsRoutes';
import fleetRoutes from './routes/fleetRoutes';
import portsRoutes from './routes/portsRoutes';
import disruptionsRoutes from './routes/disruptionsRoutes';
import actionsRoutes from './routes/actionsRoutes';
import auditRoutes from './routes/auditRoutes';
import notificationsRoutes from './routes/notificationsRoutes';
import mcpRoutes from './routes/mcpRoutes';
import copilotRoutes from './routes/copilotRoutes';

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shipments', shipmentsRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/ports', portsRoutes);
app.use('/api/disruptions', disruptionsRoutes);
app.use('/api/actions', actionsRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/mcp', mcpRoutes);
app.use('/api/copilot', copilotRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist',
    },
  });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message,
    },
  });
});

// Connect to MongoDB and start server if not in test
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      logger.info(`SupplyGuard Backend running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
    });
  }).catch((err) => {
    logger.error('Failed to start server due to DB connection error:', err);
  });
}

export default app;
