import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

import healthRoutes from './features/health/health.routes';
import authRoutes from './features/auth/auth.routes';
import userRoutes from './features/user/user.routes';
import experimentRoutes from './features/experiment/experiment.routes';
import progressRoutes from './features/progress/progress.routes';
import simulationRoutes from './features/simulation/simulation.routes';
import quizRoutes from './features/quiz/quiz.routes';
import dashboardRoutes from './features/dashboard/dashboard.routes';
import miniOsRoutes from './features/mini-os/mini-os.routes';
import adminRoutes from './features/admin/admin.routes';

const app = express();

// Security Headers
app.use(helmet());

// CORS configuration
const configuredOrigins = env.FRONTEND_URL
  ? env.FRONTEND_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, Postman, health check)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, '');

      if (
        configuredOrigins.includes('*') ||
        configuredOrigins.includes(normalizedOrigin) ||
        (env.NODE_ENV !== 'production' && normalizedOrigin.startsWith('http://localhost:')) ||
        normalizedOrigin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsers & Request Limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiters
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'test' ? 10000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
  skip: () => env.NODE_ENV === 'test',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'test' ? 10000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
  skip: () => env.NODE_ENV === 'test',
});

// Route Registrations
app.use('/api', healthRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/experiments', apiLimiter, experimentRoutes);
app.use('/api/progress', apiLimiter, progressRoutes);
app.use('/api/simulations', apiLimiter, simulationRoutes);
app.use('/api/quizzes', apiLimiter, quizRoutes);
app.use('/api/dashboard', apiLimiter, dashboardRoutes);
app.use('/api/mini-os', apiLimiter, miniOsRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);

// 404 Route Handler for API & Unknown Routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Central Error Handler
app.use(errorHandler);

export default app;
