import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import { requestLogger, errorLogger } from './services/LoggingService';
import { SystemLogger } from './services/LoggingService';
import { Database } from './config/database';

// Import routes
import authRoutes from './routes/auth';
import aiRoutes from './routes/ai';
import healthRoutes from './routes/health';

// Import middleware
import { authenticate } from './middleware/auth';
import { apiRateLimit } from './middleware/rateLimiting';

const app = express();

// Trust proxy (important for rate limiting and IP detection)
app.set('trust proxy', true);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.tailwindcss.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:5173', // Vite dev server
      'https://astroluna.pages.dev',
      ...(process.env.ALLOWED_ORIGINS?.split(',') || [])
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Health check endpoints (before rate limiting)
app.use('/api', healthRoutes);
app.use('/', healthRoutes);

// API routes with rate limiting
app.use('/api', apiRateLimit);

// Authentication routes
app.use('/api/auth', authRoutes);

// Protected API routes (require authentication)
app.use('/api/protected', authenticateToken);

// AI generation routes  
app.use('/api/ai', aiRoutes);

// Library routes (will be implemented)  
// app.use('/api/library', authenticateToken, libraryRoutes);

// Billing routes (will be implemented)
// app.use('/api/billing', authenticateToken, billingRoutes);

// Static file serving for production
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(staticPath));
  
  // Serve React app for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use(errorLogger);
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Don't log error again as it's already logged by errorLogger
  
  // Send error response
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    success: false,
    error: isDevelopment ? error.message : 'Internal server error',
    ...(isDevelopment && { stack: error.stack })
  });
});

// Database initialization
async function initializeDatabase() {
  try {
    const db = Database.getInstance();
    await db.connect();
    SystemLogger.databaseConnection(true);
  } catch (error) {
    SystemLogger.databaseConnection(false, error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Gracefully shutting down server...');
  
  try {
    // Close database connections
    const db = Database.getInstance();
    await db.disconnect();
    
    console.log('✅ Database connections closed');
    console.log('👋 Server shutdown complete');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('📨 SIGTERM received, shutting down gracefully');
  
  try {
    const db = Database.getInstance();
    await db.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error during SIGTERM shutdown:', error);
    process.exit(1);
  }
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  SystemLogger.apiError('unhandled-rejection', 'PROMISE', 500, String(reason));
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception thrown:', error);
  SystemLogger.apiError('uncaught-exception', 'EXCEPTION', 500, error.message);
  process.exit(1);
});

export { app, initializeDatabase };