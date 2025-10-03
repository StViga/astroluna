#!/usr/bin/env node

import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import { app, initializeDatabase } from './app';
import { SystemLogger } from './services/LoggingService';
import { emailService } from './services/EmailService';

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    console.log('🚀 Starting AstroLuna API Server...');
    
    // Initialize database connection
    console.log('📦 Connecting to database...');
    await initializeDatabase();
    
    // Verify email service configuration
    console.log('📧 Verifying email service...');
    const emailConnected = await emailService.verifyConnection();
    if (!emailConnected) {
      console.warn('⚠️ Email service connection failed. Email functionality may not work properly.');
    } else {
      console.log('✅ Email service connected successfully');
    }
    
    // Start the server
    const server = app.listen(PORT, '0.0.0.0', () => {
      SystemLogger.serverStart(PORT as number);
      
      console.log(`
🌟 AstroLuna API Server Successfully Started!
┌─────────────────────────────────────────┐
│  🚀 Server: http://localhost:${PORT}         │
│  🌍 Environment: ${NODE_ENV.padEnd(11)}         │  
│  📦 Database: Connected                 │
│  📧 Email: ${emailConnected ? 'Connected' : 'Disconnected'}                 │
│  ⏰ Started: ${new Date().toLocaleString()}     │
└─────────────────────────────────────────┘

📍 API Endpoints:
┌─────────────────────────────────────────┐
│  GET  /health               - Health    │
│  POST /api/auth/register    - Register  │
│  POST /api/auth/login       - Login     │
│  POST /api/auth/logout      - Logout    │
│  GET  /api/auth/me          - Profile   │
│  POST /api/auth/forgot-password         │
│  POST /api/auth/reset-password          │  
│  GET  /api/auth/verify-email            │
│  POST /api/auth/refresh-token           │
└─────────────────────────────────────────┘

🛡️ Security Features:
┌─────────────────────────────────────────┐
│  ✅ Rate Limiting                       │
│  ✅ CORS Protection                     │
│  ✅ Helmet Security Headers            │
│  ✅ JWT Authentication                  │
│  ✅ Password Hashing (bcrypt)          │
│  ✅ Input Validation (zod)             │
│  ✅ SQL Injection Protection           │
│  ✅ Request Logging                    │
└─────────────────────────────────────────┘

🔧 Development Commands:
┌─────────────────────────────────────────┐
│  npm run dev        - Development mode  │
│  npm run build      - Build production  │
│  npm run start      - Production mode   │
│  npm run db:migrate - Run migrations   │
│  npm run db:seed    - Seed database    │
└─────────────────────────────────────────┘

Ready to accept connections! 🎉
      `);
      
      if (NODE_ENV === 'development') {
        console.log('\n🔧 Development Mode Active');
        console.log('📝 Logs will be verbose');
        console.log('🐛 Stack traces included in errors');
        console.log('🔄 Auto-restart enabled via nodemon');
      }
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

      switch (error.code) {
        case 'EACCES':
          console.error(`❌ ${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`❌ ${bind} is already in use`);
          console.log('\n💡 Try these solutions:');
          console.log('   1. Kill existing process: fuser -k 5000/tcp');
          console.log('   2. Use different port: PORT=5001 npm run dev');
          console.log('   3. Check running processes: lsof -ti:5000');
          process.exit(1);
          break;
        default:
          console.error('❌ Server error:', error);
          throw error;
      }
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal: string) => {
      console.log(`\n📨 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async (err) => {
        if (err) {
          console.error('❌ Error closing server:', err);
          process.exit(1);
        }
        
        console.log('✅ Server closed');
        
        try {
          // Add any cleanup logic here
          console.log('🧹 Cleanup completed');
          console.log('👋 Shutdown complete');
          process.exit(0);
        } catch (cleanupError) {
          console.error('❌ Cleanup error:', cleanupError);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    SystemLogger.apiError('server-start', 'START', 500, error.message);
    process.exit(1);
  }
}

// Handle startup errors
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer().catch((error) => {
  console.error('❌ Server startup failed:', error);
  process.exit(1);
});

export default app;