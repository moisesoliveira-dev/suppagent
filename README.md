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
| `VITE_APP_ENV` | `dev` ou `prod` — em **dev**, Entrar no login libera o painel sem e-mail/senha; em **prod**, exige autenticação real |
| `VITE_AUTH_REQUIRED` | `true` (padrão) mostra a tela de login; `false` abre o painel direto |

Não commitar `.env`.

Login (frontend): `features/auth/`. Em `VITE_APP_ENV=dev`, o botão **Entrar** entra sem credenciais. Em `prod`, chama `POST /auth/login` `{ email, password }` → `{ token, user }`. Sem OAuth/Google por enquanto.## Como rodar

### Só o banco (dev no host)

```bash
pnpm install
pnpm docker:up:db
pnpm --filter backend prisma:generate
pnpm --filter backend prisma:migrate
pnpm --filter backend build
pnpm --filter backend prisma:seed
pnpm dev:backend    # http://localhost:3000
pnpm dev:frontend   # http://localhost:5173
```

Health do backend (inclui ping no PostgreSQL): `GET http://localhost:3000/health`

API de chamados (sem auth ainda; agente atual via `?agent=`, padrão `c.reis`):

| Método | Rota | Uso |
|---|---|---|
| `GET` | `/tickets?filter=…&search=&page=&pageSize=` | lista + `counts` + paginação |
| `GET` | `/tickets/:id` | detalhe (`history[].author`: `requester` \| `agent`) |
| `POST` | `/tickets` | abre chamado |
| `POST` | `/tickets/:id/replies` | `{ "text", "note"?, "replyToId"? }` |
| `POST` | `/tickets/:id/transfer` | `{ "agent": "b.alves" \| null }` |
| `POST` | `/tickets/:id/close` | encerra |
| `POST` | `/tickets/:id/reopen` | `{ "reason" }` reabre com justificativa |
| `PATCH` | `/tickets/:id/messages/:messageId` | edita `{ "text" }` |
| `DELETE` | `/tickets/:id/messages/:messageId` | apaga (soft delete) |
| `POST` | `/tickets/:id/messages/:messageId/pin` | fixa / desafixa |
| `POST` | `/tickets/:id/messages/:messageId/forward` | `{ "targetTicketId" }` encaminha |

API de bate-papo da equipe:

| Método | Rota | Uso |
|---|---|---|
| `GET` | `/team-chats` | lista canais |
| `POST` | `/team-chats` | cria canal `{ "name" }` |
| `DELETE` | `/team-chats/:id` | remove canal |
| `GET` | `/team-chats/:id` | detalhe + mensagens |
| `POST` | `/team-chats/:id/messages` | envia `{ text, replyToId? }` |
| `PATCH` / `DELETE` / `POST …/pin` | `/team-chats/:id/messages/:messageId` | edita / apaga / fixa |
| `POST` | `/team-chats/:id/messages/:messageId/forward` | encaminha para chat ou chamado |
| `POST` | `/team-chats/:id/forward-from-ticket` | recebe mensagem de um chamado |

API de usuários (Cadastros → usuários):

| Método | Rota | Uso |
|---|---|---|
| `GET` | `/users?role=usuario\|tecnico` | lista (filtro opcional) |
| `POST` | `/users` | `{ "name", "email", "role", "handle"? }` — `handle` obrigatório para técnico |
| `DELETE` | `/users/:id` | remove |

Perfis por enquanto: **usuário** (normal) e **técnico** (com identificador de agente, ex. `c.reis`).

Aba **equipe** (frontend): lista técnicos via `/users?role=tecnico` e carga de chamados via `/tickets?filter=meus&agent=…`. Cadastro de pessoas continua em Cadastros → usuários.

API de relatórios:

| Método | Rota | Uso |
|---|---|---|
| `GET` | `/reports/summary` | totais + por status/prioridade/categoria/agente + base de conhecimento |

API de notificações (sino no topbar; prefs em Configurações):

| Método | Rota | Uso |
|---|---|---|
| `GET` | `/notifications?agent=` | lista + `unread` |
| `POST` | `/notifications/:id/read?agent=` | marca lida |
| `POST` | `/notifications/read-all?agent=` | marca todas |
| `GET` / `PATCH` | `/notifications/preferences?agent=` | preferências (`assigned`, `sla`, `digest`, `sound`) |

API de automações (gestão → automações; Cadastros → automações):

| Método | Rota | Uso |
|---|---|---|
| `GET` | `/automations` | lista regras |
| `GET` | `/automations/:id` | detalhe |
| `POST` | `/automations` | cria `{ name, trigger, condition, action, authorName, enabled? }` |
| `PATCH` | `/automations/:id` | atualiza campos |
| `POST` | `/automations/:id/toggle` | ativa / desativa |
| `POST` | `/automations/:id/run` | registra execução (`runCount` + `lastRunAt`) |
| `DELETE` | `/automations/:id` | remove |

O motor de gatilhos em tempo real ainda não dispara ações sozinho — a aba gerencia regras e contadores.

API de SLA (gestão → sla; Cadastros → prioridades):

| Método | Rota | Uso |
|---|---|---|
| `GET` | `/sla/board` | políticas com % cumprimento + chamados abertos e relógios |
| `GET` | `/sla/policies` | lista metas por prioridade |
| `PATCH` | `/sla/policies/:priority` | `{ responseMinutes, resolutionMinutes }` (`urgente`/`urgent`, …) |

Chamados — ações extras:

| Método | Rota | Uso |
|---|---|---|
| `POST` | `/tickets/:id/claim` | `{ "agent" }` assume o chamado |
| `POST` | `/tickets/:id/waiting` | marca aguardando cliente |

API da base de conhecimento:

| Método | Rota | Uso |
|---|---|---|
| `GET` | `/knowledge?category=&q=` | lista artigos |
| `GET` | `/knowledge/:id` | detalhe (incrementa visualizações) |
| `POST` | `/knowledge` | `{ title, category, body, author, tags?, published? }` |
| `POST` | `/knowledge/from-ticket` | cria a partir de chamado **encerrado** (`ticketId`, `author`, …) |
| `PATCH` | `/knowledge/:id` | atualiza título/corpo/tags/publicação |

O seed (`pnpm --filter backend prisma:seed`) grava os chamados de exemplo do painel. No Docker, o start do backend resolve o CLI do Prisma pelo `node_modules` do pacote (não pelo `.bin` da raiz do workspace), aplica `migrate deploy`, roda o seed compilado e sobe o Nest.

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

No backend: `pnpm --filter backend prisma:generate`, `pnpm --filter backend prisma:migrate`, `pnpm --filter backend build` e `pnpm --filter backend prisma:seed` (o seed usa o client compilado em `dist/`).

## Arquitetura (resumo)

O frontend (`pnpm dev:frontend`) abre o **painel Balcão**: shell com sidebar, lista split-flap e telas por feature em `apps/frontend/src/features/`. A lista de **chamados** lê e altera só o PostgreSQL via `GET/POST /tickets` (`VITE_API_URL`).

Modular monolith, DDD + Clean/Hexagonal, features em `apps/backend/src/modules/<feature>/{domain,application,infrastructure,presentation}`. Persistência: Prisma no adapter, PostgreSQL. UI: Tailwind para espaçamento e layout (beleza livre). Convenções detalhadas em `.cursor/rules/`.

