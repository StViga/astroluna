# 🚆 Railway Deployment Guide

## Overview
This branch is optimized for Railway deployment with fullstack React + Node.js architecture.

## 🔧 Pre-Deployment Setup

### 1. Railway Project Setup
```bash
# Install Railway CLI (if not installed)
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project (or link existing)
railway init
```

### 2. Add PostgreSQL Database
```bash
# Add PostgreSQL service to your Railway project
railway add postgresql

# Railway will automatically provide DATABASE_URL
```

### 3. Environment Variables
Set these in Railway dashboard or via CLI:

**Required Variables:**
```bash
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters
railway variables set JWT_REFRESH_SECRET=your-refresh-secret-minimum-32-characters
railway variables set FRONTEND_URL=https://your-app.railway.app
railway variables set ALLOWED_ORIGINS=https://your-app.railway.app
```

**Optional Variables:**
```bash
# AI Services
railway variables set GEMINI_API_KEY=your-gemini-key
railway variables set OPENAI_API_KEY=your-openai-key

# Email Service
railway variables set EMAIL_HOST=smtp.gmail.com
railway variables set EMAIL_USER=your-email@gmail.com
railway variables set EMAIL_PASS=your-app-password
```

## 🚀 Deployment Commands

### Quick Deploy
```bash
# Deploy current railway branch
railway up
```

### Manual Deploy Steps
```bash
# 1. Build everything
npm run install:all
npm run build

# 2. Deploy to Railway
railway up

# 3. Monitor deployment
railway logs
```

## 📊 Health Monitoring

### Health Check Endpoints
- **Health**: `GET /api/health` - Comprehensive system status
- **Ping**: `GET /api/ping` - Simple connectivity test  
- **Ready**: `GET /api/ready` - Service readiness

### Example Health Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00Z",
  "version": "2.0.0",
  "environment": "production",
  "uptime": "3600s",
  "memory": {
    "used": "45MB"
  },
  "database": {
    "status": "healthy",
    "responseTime": "15ms"
  },
  "railway": true,
  "services": {
    "api": "healthy",
    "static": "healthy"
  }
}
```

## 🗄️ Database Management

### Initial Setup (Automatic on first deploy)
```bash
# Railway automatically runs these on deployment:
npm run db:setup     # Setup extensions and basic config
npm run db:migrate   # Apply all migrations
```

### Manual Database Operations
```bash
# Connect to Railway database
railway connect postgresql

# Run migrations manually
railway run npm run db:migrate

# Seed development data (NOT in production)
railway run npm run db:seed

# Reset database (development only)
railway run npm run db:reset
```

## 📁 Project Structure

```
webapp/
├── client/                 # React frontend
│   ├── dist/              # Built frontend (served by Express)
│   └── src/
├── server/                # Node.js backend  
│   ├── dist/              # Built backend
│   ├── src/
│   └── migrations/        # SQL migration files
├── railway.toml           # Railway configuration
└── package.json           # Root workspace config
```

## ⚙️ Railway Configuration

### railway.toml
```toml
[build]
cmd = "npm run install:all && npm run build"

[deploy]
startCommand = "npm run start:railway"
healthcheckPath = "/api/health"
healthcheckTimeout = 120
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 5

[variables]
NODE_ENV = "production"
PORT = "$PORT"
HOST = "0.0.0.0"
RAILWAY = "true"
```

## 🔐 Security Features

- ✅ **Authentication**: JWT with refresh tokens
- ✅ **Rate Limiting**: 100 requests per 15 minutes per IP
- ✅ **CORS Protection**: Configurable origins
- ✅ **Helmet Security**: HTTP security headers
- ✅ **Input Validation**: Zod schema validation
- ✅ **SQL Injection Protection**: Parameterized queries
- ✅ **Password Security**: bcrypt hashing (12 rounds)

## 🚨 Troubleshooting

### Common Issues

**1. Build Failures**
```bash
# Clear node_modules and reinstall
railway run "rm -rf node_modules && npm install"

# Check build logs
railway logs --filter build
```

**2. Database Connection Issues**
```bash
# Verify DATABASE_URL is set
railway variables

# Test database connection
railway run npm run db:setup
```

**3. Frontend 404 Errors**
```bash
# Ensure client build completed
railway run "ls -la client/dist"

# Check static file serving in logs
railway logs --filter static
```

**4. Environment Variable Issues**
```bash
# List all variables
railway variables

# Set missing variables
railway variables set JWT_SECRET=your-secret-here
```

### Deployment Verification

After deployment, verify these URLs work:
- `https://your-app.railway.app` - Frontend
- `https://your-app.railway.app/api/health` - Health check
- `https://your-app.railway.app/api/ping` - Simple ping

## 📈 Scaling & Performance

### Railway Automatic Features
- **Auto-scaling**: Based on CPU/memory usage
- **Health checks**: Automatic restart on failures
- **Logs**: Centralized logging with filtering
- **Metrics**: Built-in performance monitoring

### Optimization Tips
- Frontend assets are served by Express with compression
- Database connection pooling (max 20 connections)
- JWT tokens expire in 15 minutes for security
- Static assets cached with proper headers

## 🔄 CI/CD Integration

### GitHub Integration
```bash
# Connect repository to Railway project
railway connect --repo github.com/username/repo

# Auto-deploy on push to railway branch
# (Configure in Railway dashboard)
```

### Manual Updates
```bash
# Update existing deployment
git push origin railway
railway up
```

## 📞 Support Resources

- **Railway Docs**: https://docs.railway.app
- **Database Logs**: `railway logs --filter postgresql`
- **App Logs**: `railway logs --filter app`
- **System Status**: `GET /api/health`

---

## 🎯 Next Steps After Deployment

1. **Verify Health**: Check `/api/health` endpoint
2. **Test Authentication**: Register and login flow
3. **Configure Domain**: Add custom domain in Railway dashboard
4. **Monitor Performance**: Use Railway metrics dashboard
5. **Set up Alerts**: Configure notification webhooks

Railway deployment is now ready! 🚀