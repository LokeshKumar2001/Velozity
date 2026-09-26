# Velozity Global Solutions — Real-Time Client Project Dashboard

Full-stack project management platform and real-time activity feed engine designed for agency workflows. Features role-based access control (Admin, Project Manager, Developer), live WebSocket event fanout with channel-level room segregation, background overdue task inspection with BullMQ, and a modern React 19 single-page application.

---

## 🏗️ Architecture Overview

```
                           ┌───────────────────────────┐
                           │      Browser Client       │
                           │  (React 19 + Redux State) │
                           └─────────────┬─────────────┘
                                         │
                    REST APIs (JWT)      │      WebSocket (Socket.io)
                                         ▼
                           ┌───────────────────────────┐
                           │   Express 5 API Server &  │
                           │   Socket.io Event Gateway │
                           └──────┬─────────────┬──────┘
                                  │             │
              Prisma ORM (SQL)    │             │ BullMQ Background Jobs
                                  ▼             ▼
                          ┌──────────────┐   ┌──────────────┐
                          │  PostgreSQL  │   │ Redis Server │
                          │  Database    │   │  & Worker    │
                          └──────────────┘   └──────────────┘
```

---

## 📁 Workspace Layout

```
Velozity/
├── client/                     # Frontend Application (React 19 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/                # Axios instance & REST endpoints
│   │   ├── components/         # Shared UI components & Shadcn primitives
│   │   ├── pages/              # Route views (Login, Dashboard, Projects, Tasks, Activity, Users)
│   │   ├── redux/              # Redux slices (auth, projects, tasks, notifications, dashboard)
│   │   ├── hooks/              # Custom hooks (useSocket)
│   │   └── types/              # TypeScript interfaces
│   └── package.json
│
├── server/                     # Backend Application (Express 5 + TypeScript)
│   ├── modules/                # Domain-Driven Architecture (auth, projects, tasks, users, clients)
│   ├── infrastructure/         # BullMQ queue workers, Redis client, WebSocket server
│   ├── prisma/                 # PostgreSQL schema, migrations, and seed scripts
│   ├── middleware/             # RBAC auth, validation, rate limiting
│   └── package.json
│
├── docker-compose.yml          # Container configuration for PostgreSQL & Redis
├── pnpm-workspace.yaml         # Monorepo workspace configuration
└── package.json                # Root orchestrator scripts
```

---

## ⚡ Key Technical Decisions & Justifications

### 1. WebSockets (`Socket.io`) vs Native WebSockets / SSE
- **Choice**: `Socket.io`
- **Justification**: Socket.io provides room abstraction (`socket.join`), automatic reconnection handling, and heartbeat pinging. Room segregation (`global:admin`, `project:{id}`, `user:{id}`) ensures role permission boundaries are preserved during real-time broadcasts without leaking data to unauthorized clients.

### 2. Background Jobs: `BullMQ` vs `node-cron`
- **Choice**: `BullMQ` (on Redis) with graceful in-process interval fallback
- **Justification**: BullMQ provides persistent queue management, job deduplication, and retry exponential backoff. In local environments where Redis is omitted, an automated `setInterval` fallback ensures overdue tasks are reliably flagged without crashing the application.

### 3. Token Storage Approach
- **Choice**: Access Tokens (Memory/Bearer Header) + Refresh Tokens (`HttpOnly` Cookie)
- **Justification**: Storing refresh tokens in `HttpOnly`, `SameSite=Lax` cookies prevents XSS attacks from stealing session tokens. Short-lived (15m) access tokens in memory limit exposure if intercepted.

---

## ⚠️ Known Limitations

1. **Single-Instance WebSocket Adapter**: The Socket.io server runs with an in-memory adapter. Scaling horizontally across multiple server processes behind a load balancer requires attaching `@socket.io/redis-adapter` for multi-node event fanout.
2. **In-Process Job Queue Fallback**: When Redis is unavailable, BullMQ falls back to a single-node `setInterval` scheduler. In high-concurrency production deployments, standalone Redis-backed BullMQ worker processes should handle queue execution.
3. **DB Catchup Polling on Reconnect**: Offline clients catching up on missed activity logs execute a indexed SQL query (`LIMIT 20`). Under heavy reconnect spikes, adding a Redis Sorted Set per project would offload database read queries.

---

## 🚀 Quick Start Guide (Docker Preferred)

### 1. Prerequisites
- **Node.js**: v20 or higher
- **pnpm**: v9 or higher
- **Docker Desktop**: for running PostgreSQL and Redis containers

### 2. Install Workspace Dependencies
```bash
pnpm install
```

### 3. Spin Up PostgreSQL and Redis Containers
```bash
cd server
docker compose up -d
```

### 4. Configure Server Environment & Seed Database
```bash
cp .env.example .env
pnpm prisma migrate dev --name init
pnpm prisma db seed
cd ..
```

### 5. Launch Client & Server in Parallel
From the workspace root:
```bash
pnpm dev
```

- **Web Application**: `http://localhost:5173`
- **REST API**: `http://localhost:5000`
- **Interactive Swagger Documentation**: `http://localhost:5000/api/docs`

---

## 👥 Seed Accounts & Default Logins

All pre-configured seed accounts use the default password: `Password@123`

| Name | Role | Email | Scope in Seed Data |
| :--- | :--- | :--- | :--- |
| **Aarav Mehta** | `ADMIN` | `admin@velozity.com` | Complete access across all projects, clients, and real-time presence |
| **Priya Sharma** | `PROJECT_MANAGER` | `priya@velozity.com` | Manages *E-commerce Platform* |
| **Rahul Kumar** | `PROJECT_MANAGER` | `rahul@velozity.com` | Manages *Mobile App Redesign* and *CRM System* |
| **Ravi Teja** | `DEVELOPER` | `ravi@velozity.com` | Assigned tasks in *E-commerce Platform* |
| **Vikram Patel** | `DEVELOPER` | `vikram@velozity.com` | Assigned tasks in *Mobile App Redesign* |
| **Sneha Reddy** | `DEVELOPER` | `sneha@velozity.com` | Assigned tasks including overdue items in *E-commerce Platform* |
| **Ananya Roy** | `DEVELOPER` | `ananya@velozity.com` | Assigned tasks in *CRM System* |

---

## 💡 Technical Reflection & Engineering Decisions (150–250 Words)

**The Hardest Problem Solved & Real-Time Role-Filtered Feed Implementation:**
Routing real-time task updates without leaking data across permission tiers or bottlenecking database queries was the core challenge. Admins see everything, Project Managers see activity in owned projects, and Developers only receive updates on assigned tasks. Client-side filtering would breach security boundaries, while querying DB permissions per socket event creates scaling bottlenecks.

I solved this by partitioning Socket.io connections into permission rooms during the handshake and login (`global:admin`, `project:{id}`, and `user:{id}`). On task status changes, the transaction writes the log to PostgreSQL and emits events exclusively to authorized rooms. For offline clients reconnecting, missed events are fetched directly from PostgreSQL (`activity_logs`) using composite indexes `(project_id, created_at DESC)` and `(user_id, created_at DESC)`, ensuring database-level accuracy.

**What I'd Do Differently:**
Currently, Socket.io events fire in-process right after the database transaction. If the server process terminates mid-execution, database writes succeed but socket fanout is missed. In production, I would implement a Transactional Outbox Pattern using Redis Streams or Kafka. An outbox worker would read committed events from PostgreSQL and process WebSocket delivery asynchronously, guaranteeing at-least-once broadcast delivery.
