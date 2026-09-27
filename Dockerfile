# ---- base ----
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# ---- deps ----
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# ---- builder ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma client for the postgres schema (default)
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runner ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY docker-entrypoint.sh ./docker-entrypoint.sh
# Pre-warm the Prisma schema-engine cache: `db push` runs at container boot as
# the non-root `nextjs` user, which cannot populate the engine cache on first
# use. `migrate diff` exercises the engine download without needing a database.
ENV XDG_CACHE_HOME=/app/.cache
RUN mkdir -p /app/.cache /app/uploads && \
    node ./node_modules/prisma/build/index.js migrate diff --from-empty --to-schema-datamodel ./prisma/schema.prisma --script > /dev/null && \
    chmod +x ./docker-entrypoint.sh && \
    chown -R nextjs:nodejs /app/.cache ./uploads ./docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
