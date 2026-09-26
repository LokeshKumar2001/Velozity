# Velozity API — Real-Time Project Management Engine

Backend API service for the Velozity project management dashboard. Built with Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, Socket.io, and BullMQ background workers.

---

## 🏗️ Architecture & Technology Stack

- **Runtime & Language**: Node.js (v20+), TypeScript
- **API Framework**: Express 5
- **Database & ORM**: PostgreSQL with Prisma ORM
- **Real-Time Layer**: Socket.io (with room-based permission segregation)
- **Background Job Queue**: BullMQ on Redis (with automatic in-process interval fallback)
- **Input Validation & API Spec**: Zod schemas, OpenAPI 3.0 / Swagger UI (`/api/docs`)

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

## 🔐 Role-Based Access Control (RBAC)

Role permissions are enforced server-side on every request via JWT claims and database entity ownership checks.

| Action / Endpoint | Admin | Project Manager | Developer | Server-Side Enforcement |
| :--- | :---: | :---: | :---: | :--- |
| **User & Client Management** | Full | No | No | `requireRole('ADMIN')` |
| **Create Projects** | Yes | Yes | No | `requireRole('ADMIN', 'PROJECT_MANAGER')` |
| **Edit / Delete Projects** | Any | Owned projects only | No | Ownership check (`managerId === user.id`) |
| **View Projects** | All | Owned projects | Projects with assigned tasks | Query level scoping |
| **Create / Edit Tasks** | Yes | Owned projects only | No | Manager project ownership check |
| **Update Task Status** | Yes | Owned projects | Assigned tasks only | Assignment check (`assignedTo === user.id`) |
| **Global Activity Feed** | Yes | No | No | Joined `global:admin` socket room & DB query |
| **Project Activity Feed** | All | Owned projects | No | Joined `project:{id}` room |
| **Personal Task Alerts** | Yes | Yes | Yes | Joined `user:{id}` private socket room |
| **Live Presence Count** | Full Roster | Count Only | Count Only | Presence manager socket broadcast |

---

## 🗄️ Database Design & Indexes

Relational PostgreSQL schema configured via Prisma ORM (`prisma/schema.prisma`). Key indexes optimize frequent query patterns:

- `users(email)`: Unique index for $O(1)$ login lookups.
- `projects(manager_id)`: Speeds up PM project filtering.
- `tasks(project_id)`: Fast board queries per project.
- `tasks(assigned_to)`: Optimizes developer task queries.
- `tasks(status)` & `tasks(priority)`: Speeds up Kanban filter queries.
- `tasks(due_date)`: Used by the overdue background worker (`due_date < NOW() AND status != 'DONE'`).
- `activity_logs(project_id, created_at DESC)`: Reverse-chronological activity feed per project.
- `activity_logs(user_id, created_at DESC)`: Fast offline catchup queries for missed events.
- `notifications(user_id, is_read, created_at DESC)`: Fast unread notification listings and count aggregation.

---

## ⚡ Architectural Decisions & Justifications

### 1. WebSockets (`Socket.io`) vs Native WebSockets / SSE
- **Choice**: `Socket.io`
- **Justification**: Socket.io provides room abstraction (`socket.join`), automatic reconnection handling, heartbeat pinging, and fallback transports. Room segregation (`global:admin`, `project:{id}`, `user:{id}`) ensures role permission boundaries are preserved during real-time broadcasts without leaking data client-side.

### 2. Background Jobs: `BullMQ` vs `node-cron`
- **Choice**: `BullMQ` (on Redis) with graceful in-process fallback
- **Justification**: BullMQ provides persistent queue management, job deduplication, retry exponential backoff, and distributed worker scaling. In local environments where Redis is omitted, an automated `setInterval` fallback ensures overdue tasks are reliably flagged without crashing the application.

### 3. Token Storage Approach
- **Choice**: Access Tokens (Memory/Bearer Header) + Refresh Tokens (`HttpOnly` Cookie)
- **Justification**: Storing refresh tokens in `HttpOnly`, `SameSite=Lax` cookies prevents XSS attacks from stealing session tokens. Short-lived (15m) access tokens in memory limit exposure if intercepted.

---

## ⚠️ Known Limitations

1. **Single-Instance WebSocket Adapter**: The Socket.io server runs with an in-memory adapter. Scaling horizontally across multiple server processes behind a load balancer requires attaching `@socket.io/redis-adapter` for multi-node event fanout.
2. **In-Process Job Queue Fallback**: When Redis is unavailable, BullMQ falls back to a single-node `setInterval` scheduler. In high-concurrency production deployments, standalone Redis-backed BullMQ worker processes should handle queue execution.
3. **DB Catchup Polling on Reconnect**: Offline clients catching up on missed activity logs execute a indexed SQL query (`LIMIT 20`). Under heavy reconnect spikes, adding a Redis Sorted Set per project would offload database read queries.

---

## 🚀 Local Setup & Quick Start (Docker Preferred)

### Prerequisites
- Node.js (v20+)
- pnpm (v9+)
- Docker & Docker Compose

### 1. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 2. Start PostgreSQL & Redis Containers
```bash
docker compose up -d
```

### 3. Run Database Migrations & Seed Data
```bash
pnpm prisma migrate dev --name init
pnpm prisma db seed
```

### 4. Start Server
```bash
pnpm dev
```
The server will start at `http://localhost:5000`. Interactive Swagger UI is available at `http://localhost:5000/api/docs`.

---

## 👥 Seed Accounts & Default Logins

All pre-configured seed users use the default password: `Password@123`

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
