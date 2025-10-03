# Multi-stage build for production optimization
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force
RUN cd server && npm ci --only=production && npm cache clean --force
RUN cd client && npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy package files and install all dependencies (including devDependencies)
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
RUN npm ci
RUN cd server && npm ci
RUN cd client && npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run the server
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astroluna

# Copy built application
COPY --from=builder --chown=astroluna:nodejs /app/server/dist ./server/dist
COPY --from=builder --chown=astroluna:nodejs /app/client/dist ./client/dist
COPY --from=deps --chown=astroluna:nodejs /app/server/node_modules ./server/node_modules
COPY --from=builder --chown=astroluna:nodejs /app/server/package*.json ./server/

# Copy production package.json files
COPY --chown=astroluna:nodejs package*.json ./

USER astroluna

# Expose the port the app runs on
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["npm", "start"]