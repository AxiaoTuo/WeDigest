# ========================================
# Stage 1: Dependencies
# ========================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++ openssl

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# ========================================
# Stage 2: Builder
# ========================================
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat python3 make g++ openssl

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Generate Prisma Client and build application
RUN npx prisma generate
RUN npm run build

# ========================================
# Stage 3: Runner
# ========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install runtime dependencies (minimal set for Next.js + @sparticuz/chromium)
RUN apk add --no-cache \
    ca-certificates \
    nss \
    wget \
    libc6-compat \
    && rm -rf /var/cache/apk/*

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copy Prisma files
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3

# Copy @sparticuz/chromium and puppeteer-core with their dependencies
COPY --from=builder /app/node_modules/@sparticuz ./node_modules/@sparticuz
COPY --from=builder /app/node_modules/puppeteer-core ./node_modules/puppeteer-core
COPY --from=builder /app/node_modules/puppeteer-* ./node_modules/

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create data and cache directories with proper permissions
USER root
RUN mkdir -p /app/data /app/.cache/chromium /app/tmp && \
    chown -R nextjs:nodejs /app/data /app/.cache /app/tmp

# Set permissions for nextjs user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV DATABASE_URL="file:/app/data/dev.db"
ENV PUPPETEER_EXECUTABLE_PATH=/app/node_modules/@sparticuz/chromium/chromium.br
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Startup script
USER root
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
