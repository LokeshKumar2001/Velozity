# Velozity API

Backend service for the Velozity project management dashboard. Handles authentication, role-based project and task management, real-time activity streaming, and automated background jobs for overdue tasks.

---

## Tech Stack

- **Runtime & Language**: Node.js (v20+), TypeScript
- **Web Framework**: Express 5
- **Database & ORM**: PostgreSQL with Prisma ORM
- **Real-Time Layer**: Socket.io (with room-based permission segregation)
- **Background Jobs**: BullMQ on Redis (with in-process interval fallback)
- **Validation & Docs**: Zod, Swagger / OpenAPI 3.0

---

## System Overview

```
[ Browser / Client ]
      │         ▲
  REST API   Socket.io (Duplex)
      │         │
      ▼         ▼
[ Express API & Socket Server ]
      │               │
  Prisma ORM     Redis (BullMQ & Cache)
      │               │
      ▼               ▼
[ PostgreSQL ]   [ Task Worker ]
```

- **REST API**: Handles CRUD for authentication, projects, tasks, clients, and notifications.
- **WebSocket (Socket.io)**: Authenticates clients on handshake and places them into authorization rooms (`global:admin`, `project:{id}`, `user:{id}`) to deliver real-time task updates and user presence.
- **Background Worker**: Periodically checks for tasks that crossed their due date without reaching `DONE` status, flags them as overdue, writes an activity log entry, and emits real-time alerts.

---

## Role-Based Access Control (RBAC)

Authorization is verified server-side on every request through JWT claims and database entity ownership:

| Resource / Action | Admin | Project Manager | Developer | Enforcement |
| :--- | :---: | :---: | :---: | :--- |
| **Manage Users & Clients** | Full | No | No | `requireRole('ADMIN')` |
| **Create Projects** | Yes | Yes | No | `requireRole('ADMIN', 'PROJECT_MANAGER')` |
| **Edit / Delete Projects** | Any | Owned projects only | No | PM ownership check (`managerId === user.id`) |
| **View Projects** | All | Owned projects | Projects with assigned tasks | Repository query scoping |
| **Create / Edit Tasks** | Yes | Owned projects only | No | Project manager ownership check |
| **Update Task Status** | Yes | Owned projects | Assigned tasks only | Assignment check (`assignedTo === user.id`) |
| **Global Activity Feed** | Yes | No | No | `global:admin` socket room & scoped feed query |
| **Project Activity Feed** | All | Owned projects | No | `project:{id}` room |
| **Personal Task Alerts** | Yes | Yes | Yes | `user:{id}` private room |
| **Online Presence Roster** | Full list | Count only | Count only | Admin socket channel broadcast |

---

## Database Design & Indexes

The relational schema is configured in PostgreSQL via Prisma. Key indexes are set up to support common query patterns:

- `users(email)`: Unique index for fast login lookups.
- `projects(manager_id)`: Speeds up project queries by manager.
- `tasks(project_id)`: Quick task lookups per project board.
- `tasks(assigned_to)`: Speeds up developer task dashboard views.
- `tasks(status)` & `tasks(priority)`: Supports board filtering by status and priority.
- `tasks(due_date)`: Used by the overdue background worker (`due_date < NOW() AND status != 'DONE'`).
- `activity_logs(project_id, created_at DESC)`: Reverse-chronological activity feed per project.
- `activity_logs(user_id, created_at DESC)`: Rapid offline catchup feed for assigned developers.
- `notifications(user_id, is_read, created_at DESC)`: Rapid unread count and notification listing.
- `refresh_tokens(user_id)` & `refresh_tokens(expires_at)`: Efficient session rotation and token cleanup.

---

## Real-Time Architecture

### Room Segmentation
To prevent unauthorized users from receiving sensitive project events, client sockets join specific rooms on connection:
- `global:admin`: Joined by Admins to monitor platform-wide actions.
- `project:{projectId}`: Joined by the PM managing the project and any user viewing that project's board.
- `user:{userId}`: Private room for user-specific alerts (e.g., direct task assignments, overdue warnings).

When a task transitions (e.g. `TODO` -> `IN_PROGRESS`):
1. The status change and activity log are saved in PostgreSQL.
2. The event is broadcast to `global:admin`, `project:{projectId}`, and `user:{assignedTo}`.
3. If moved to `IN_REVIEW`, a dedicated notification is delivered to the PM's room.

### Live Presence
Active browser connections are mapped in-memory (`userId -> Set<socketId>`). When a user's first tab opens, an online event is broadcast. When all tabs close, an offline event fires. Admins receive active user rosters and online counts.

---

## Local Setup

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

### 1. Install Dependencies
```bash
cd server
pnpm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default local variables:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/velozity_db?schema=public"

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_ACCESS_SECRET="velozity_access_super_secret_key_2026_at_least_32_chars"
JWT_REFRESH_SECRET="velozity_refresh_super_secret_key_2026_at_least_32_chars"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
OVERDUE_JOB_INTERVAL_MINUTES=5
```

### 3. Start Database and Redis
```bash
docker compose up -d
```

### 4. Run Migrations & Seed Database
```bash
pnpm prisma migrate dev --name init
pnpm prisma db seed
```

### 5. Start Development Server
```bash
pnpm dev
```
The API starts at `http://localhost:5000`. Interactive Swagger documentation is available at `http://localhost:5000/api/docs`.

---

## Seed Accounts & Default Logins

All seed users use the password: `Password@123`

| Name | Role | Email | Details |
| :--- | :--- | :--- | :--- |
| **Sarah Connor** | `ADMIN` | `admin@velozity.com` | Full administrative access, global feed & presence monitoring |
| **Priya Sharma** | `PROJECT_MANAGER` | `priya@velozity.com` | Manages *E-commerce Platform* |
| **Rahul Kumar** | `PROJECT_MANAGER` | `rahul@velozity.com` | Manages *Mobile App Redesign* and *CRM System* |
| **Ravi Teja** | `DEVELOPER` | `ravi@velozity.com` | Assigned tasks in *E-commerce Platform* |
| **Vikram Patel** | `DEVELOPER` | `vikram@velozity.com` | Assigned tasks in *Mobile App Redesign* |
| **Sneha Reddy** | `DEVELOPER` | `sneha@velozity.com` | Assigned tasks including overdue items in *E-commerce Platform* |
| **Alex Chen** | `DEVELOPER` | `alex@velozity.com` | Assigned tasks in *CRM System* |

---

## API Summary

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates credentials; returns Access Token & sets HttpOnly cookie |
| `POST` | `/api/auth/refresh` | Public | Issues a new Access Token using refresh cookie |
| `POST` | `/api/auth/logout` | Authenticated | Revokes refresh token in database and clears cookie |
| `GET` | `/api/auth/me` | Authenticated | Returns currently authenticated user details |
| `GET` | `/api/users` | Admin | Lists team members |
| `GET` | `/api/clients` | Admin | Lists client accounts |
| `GET` | `/api/projects` | Role-filtered | Lists accessible projects |
| `POST` | `/api/projects` | Admin, PM | Creates a new project |
| `GET` | `/api/projects/:id` | Role-filtered | Returns project details and task list |
| `POST` | `/api/tasks` | Admin, PM | Creates and assigns a task |
| `PATCH`| `/api/tasks/:id/status` | Dev, PM, Admin | Updates status (Dev restricted to assigned tasks) |
| `GET` | `/api/activity/feed` | Role-filtered | Returns latest activity feed entries |
| `GET` | `/api/notifications` | Authenticated | Returns user notifications and unread badge count |
| `PATCH`| `/api/notifications/read` | Authenticated | Marks notifications as read |
| `GET` | `/api/dashboard/metrics` | Authenticated | Role-tailored metrics, statistics, and presence counts |
| `GET` | `/api/docs` | Public | Interactive Swagger API documentation |
| `GET` | `/health` | Public | Basic uptime health check |

---

## Technical Reflection

**Key Challenge:**
The trickiest architectural problem was routing real-time task updates without either leaking data across permission tiers or grinding the database to a halt. In this system, Admins can view everything, Project Managers only see activity inside projects they manage, and Developers should only get notified about tasks assigned to them. Broadcasting every event to all connected clients and filtering client-side would violate role boundaries. On the flip side, performing database permission queries per connected socket on every status change would quickly create a bottleneck.

To solve this, I partitioned Socket.io connections into specific rooms during authentication handshake and login (`global:admin`, `project:{id}`, and `user:{id}`). When a task status changes, the server writes the immutable log entry to PostgreSQL within the request transaction and emits the event payload only to the authorized rooms. For clients reconnecting after being offline, they simply pull the latest logs from the `activity_logs` table using composite indexes (`(project_id, created_at DESC)` and `(user_id, created_at DESC)`), which keeps query response times consistently fast.

**What I'd Improve Next:**
Right now, real-time broadcasts are triggered right after the database write inside the request handler. If the server process crashes or Socket.io throws between the database commit and the broadcast, the DB updates but the live notification gets dropped. In production, I would decouple this using a Transactional Outbox Pattern with Redis Streams or RabbitMQ. An asynchronous worker would poll or stream new log entries and handle socket broadcasts reliably, ensuring at-least-once delivery even across multiple backend instances.
