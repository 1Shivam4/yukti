# API Dockerfile
FROM node:22-alpine AS base

# Install bun
RUN npm install -g bun

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json bun.lock ./
COPY turbo.json ./

# Copy workspace packages
COPY packages ./packages
COPY apps/api ./apps/api

# Install dependencies
RUN bun install --frozen-lockfile

# Generate Prisma client
RUN cd packages/database && bun run db:generate

# Build stage (if needed for production)
FROM base AS production

WORKDIR /app/apps/api

# Expose the port
EXPOSE 9000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=9000

# Start the application
CMD ["bun", "run", "start"]
