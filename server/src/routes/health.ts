import { Router } from 'express';
import { SystemLogger } from '../services/LoggingService';
import { Database } from '../config/database';

const router = Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check database connectivity
    let dbStatus = 'healthy';
    let dbResponseTime = 0;
    
    try {
      const dbStart = Date.now();
      await Database.query('SELECT 1 as test');
      dbResponseTime = Date.now() - dbStart;
    } catch (error) {
      dbStatus = 'unhealthy';
      SystemLogger.error('Health check: Database connection failed', error);
    }
    
    // Check memory usage
    const memUsage = process.memoryUsage();
    const memoryMB = Math.round(memUsage.rss / 1024 / 1024);
    
    // Get system info
    const uptime = Math.round(process.uptime());
    const totalResponseTime = Date.now() - startTime;
    
    const healthData = {
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: `${uptime}s`,
      memory: {
        used: `${memoryMB}MB`,
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external
      },
      database: {
        status: dbStatus,
        responseTime: `${dbResponseTime}ms`
      },
      responseTime: `${totalResponseTime}ms`,
      railway: !!process.env.RAILWAY_ENVIRONMENT_NAME,
      services: {
        api: 'healthy',
        static: 'healthy'
      }
    };
    
    // Return appropriate status code
    const statusCode = healthData.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json(healthData);
    
  } catch (error) {
    SystemLogger.error('Health check failed', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Simple ping endpoint
router.get('/ping', (req, res) => {
  res.status(200).json({ 
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

// Ready endpoint (for Kubernetes-style readiness checks)
router.get('/ready', async (req, res) => {
  try {
    // Quick database connectivity check
    await Database.query('SELECT 1');
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      message: 'Service is ready to accept traffic'
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      message: 'Service is not ready to accept traffic'
    });
  }
});

export default router;