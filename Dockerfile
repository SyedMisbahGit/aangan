# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/
COPY package*.json ./

# Install dependencies
RUN cd backend && npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN cd backend && npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copy built files
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/start.sh ./backend/

# Install production dependencies
WORKDIR /app/backend
RUN npm ci --only=production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose the port the app runs on
EXPOSE 3001

# Make the startup script executable
RUN chmod +x ./start.sh

# Start the application
CMD ["./start.sh"]
