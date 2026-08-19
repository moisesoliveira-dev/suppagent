# SuppAgent

Monorepo do SuppAgent: backend NestJS, frontend Vite (React + TypeScript) e PostgreSQL. Gerenciador de pacotes: **somente pnpm**.

## Requisitos

- Node.js compatível com pnpm 11+
- [pnpm](https://pnpm.io) `>= 11` (`corepack enable` se necessário)
- Docker Desktop (para banco e stack containerizada)

## Estrutura

```
apps/backend     NestJS (hexagonal / features em src/modules)
apps/frontend    Vite + React + Tailwind — painel Balcão (features/)

packages/        shared kernel (quando existir)
compose.yaml     postgres + backend + frontend
```

Instalação e scripts **sempre na raiz**. Não rode `npm install` dentro de `apps/`.

## Configuração

```bash
cp .env.example .env
```

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Prisma / Nest (no host: `localhost:5432`) |
| `POSTGRES_*` | Serviço `postgres` no Compose |
| `PORT` | HTTP do backend (padrão `3000`) |
| `VITE_API_URL` | URL da API no build do frontend |

Não commitar `.env`.

## Como rodar

### Só o banco (dev no host)

```bash
pnpm install
pnpm docker:up:db
pnpm --filter backend prisma:generate
pnpm dev:backend    # http://localhost:3000
pnpm dev:frontend   # http://localhost:5173
```

Health do backend (inclui ping no PostgreSQL): `GET http://localhost:3000/health`

### Stack completa (Docker)

Docker Desktop precisa estar **aberto**.

```bash
pnpm docker:up
```

Na **primeira** subida, o Postgres imprime `initdb` (bootstrap, `CREATE DATABASE`, shutdown e start de novo). Isso é normal. O Compose só segue quando o healthcheck marca o banco como healthy.

Se o backend falhar com `Cannot find module dist/main.js`, reconstrua as imagens: `pnpm docker:up` (já usa `--build`).

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3000 |
| Health | http://localhost:3000/health |
| PostgreSQL | `localhost:5432` |

Parar: `pnpm docker:down`

## Scripts da raiz

| Script | O que faz |
|---|---|
| `pnpm install` | Instala o workspace |
| `pnpm dev:backend` | Nest em watch |
| `pnpm dev:frontend` | Vite dev |
| `pnpm test` | Testes de todos os pacotes que tiverem script `test` |
| `pnpm build` | Build recursivo |
| `pnpm docker:up` | Compose com build (`postgres`, `backend`, `frontend`) |
| `pnpm docker:up:db` | Só PostgreSQL |
| `pnpm docker:down` | Derruba o Compose |

No backend: `pnpm --filter backend prisma:generate` e `pnpm --filter backend prisma:migrate` (quando houver migrations).

## Arquitetura (resumo)

O frontend (`pnpm dev:frontend`) abre o **painel Balcão**: shell com sidebar, lista split-flap e telas por feature em `apps/frontend/src/features/`.

Modular monolith, DDD + Clean/Hexagonal, features em `apps/backend/src/modules/<feature>/{domain,application,infrastructure,presentation}`. Persistência: Prisma no adapter, PostgreSQL. UI: Tailwind para espaçamento e layout (beleza livre). Convenções detalhadas em `.cursor/rules/`.

