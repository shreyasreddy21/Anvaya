# -- Stage 1: deps ------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# -- Stage 2: runtime ----------------------------------------------------------
FROM node:20-alpine AS runtime
WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Remove dev/test artifacts
RUN rm -rf seeds test main.py

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/health || exit 1

CMD ["node", "app.js"]
