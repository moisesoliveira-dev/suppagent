FROM node:22-bookworm-slim AS deps
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
ARG VITE_API_URL=http://localhost:3000
ARG VITE_AUTH_REQUIRED=true
ARG VITE_APP_ENV=dev
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AUTH_REQUIRED=$VITE_AUTH_REQUIRED
ENV VITE_APP_ENV=$VITE_APP_ENV
COPY apps/frontend apps/frontend
RUN pnpm --filter frontend build

FROM nginx:1.27-alpine AS runner
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
