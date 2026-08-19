FROM node:22-bookworm-slim AS deps
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/backend/prisma apps/backend/prisma
COPY apps/backend/prisma.config.ts apps/backend/prisma.config.ts
ENV DATABASE_URL=postgresql://suppagent:suppagent@postgres:5432/suppagent?schema=public
RUN pnpm install --frozen-lockfile
RUN pnpm --filter backend exec prisma generate

FROM deps AS build
COPY apps/backend apps/backend
RUN pnpm --filter backend exec prisma generate
RUN pnpm --filter backend build

FROM node:22-bookworm-slim AS runner
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=build /app/apps/frontend/package.json ./apps/frontend/package.json
COPY --from=build /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=build /app/apps/backend/prisma.config.ts ./apps/backend/prisma.config.ts
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/backend/node_modules ./apps/backend/node_modules
WORKDIR /app/apps/backend
EXPOSE 3000
CMD ["sh", "-c", "../../node_modules/.bin/prisma migrate deploy && ../../node_modules/.bin/ts-node --transpile-only prisma/seed.ts && node dist/main.js"]
