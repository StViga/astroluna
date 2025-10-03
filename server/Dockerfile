# Railway optimized Dockerfile for server only
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with faster options
RUN npm ci --only=production --silent --no-audit --no-fund

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port (Railway will override this)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]