# 🚀 Mini Trello - Enterprise NestJS Backend API

[![NestJS](https://img.shields.io/badge/NestJS-v11.0-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

Production-grade, highly scalable backend API for Mini Trello built with **NestJS**, **PostgreSQL**, **Prisma ORM**, and **JWT Authentication**.

---

## 🌐 Live Deployments & Repository Links

- 🔗 **Live Backend API**: [https://trello-trellobackend-oh99sz-6fe50c-2-24-82-111.sslip.io/api](https://trello-trellobackend-oh99sz-6fe50c-2-24-82-111.sslip.io/api)
- 🖥️ **Live Frontend Application**: [https://trello-frontend-0bewi0-d3595b-2-24-82-111.sslip.io](https://trello-frontend-0bewi0-d3595b-2-24-82-111.sslip.io)
- 🐙 **GitHub Repository**: [https://github.com/parvesmosarof35/backend-Trello](https://github.com/parvesmosarof35/backend-Trello)

---

## 🔑 Pre-seeded Demo Credentials

| User Name | Email | Password | Role & Access |
| :--- | :--- | :--- | :--- |
| **Parves Mosarof** | `parves@trello.com` | `password123` | Owner of E-Commerce Platform V2 |
| **Rahim Ahmed** | `rahim@trello.com` | `password123` | Owner of Mobile App Roadmap |

---

## ✨ Features & Architecture

- 🛡️ **JWT Authentication & Role-Based Access Control**:
  - Secure bcrypt password hashing.
  - JWT strategy with passport, `JwtAuthGuard` & `BoardAccessGuard` (403 Forbidden protection).
  - Board member role management (`OWNER`, `MEMBER`, `VIEWER`).
- ⚡ **Atomic Drag & Drop Reordering**:
  - Dedicated `PATCH /api/tasks/:id/move` endpoint powered by Prisma transactions (`prisma.$transaction`) for same-column reordering and cross-column moves.
- 🏷️ **Priority, Labels & Due Dates**:
  - `Priority` enum (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
  - Due date tracking with automatic overdue detection.
  - Multi-tag labels (`Bug`, `Feature`, `Design`, `DevOps`, etc.).
- ☑️ **Interactive Subtasks Checklist**:
  - Subtask CRUD endpoints (`/api/tasks/:taskId/subtasks`) with completion status.
- 💬 **Task Comments & Discussion**:
  - Nested comments feed (`/api/tasks/:taskId/comments`) with author relations.
- ☁️ **Cloudinary CDN Image Support**:
  - Unsigned direct uploads with automatic image optimization.
- 🐳 **Production Docker Multi-stage Builds**:
  - Alpine lightweight runner with standalone entrypoints.

---

## 📚 REST API Reference

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | ❌ No |
| `POST` | `/api/auth/login` | Login with email & password | ❌ No |

### 2. Users (`/api/users`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/me` | Get currently logged-in user profile | 🔒 Bearer JWT |
| `GET` | `/api/users/search?q=email` | Search users by email for collaboration | 🔒 Bearer JWT |

### 3. Boards (`/api/boards`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/boards` | List all boards (owned & shared) | 🔒 Bearer JWT |
| `POST` | `/api/boards` | Create board (auto-generates 3 default columns) | 🔒 Bearer JWT |
| `GET` | `/api/boards/:id` | Get single board with columns, tasks, & members | 🔒 Bearer JWT |
| `PATCH` | `/api/boards/:id` | Rename / update board details | 🔒 Bearer JWT |
| `DELETE` | `/api/boards/:id` | Permanently delete board (Owner only) | 🔒 Bearer JWT |

### 4. Board Members (`/api/boards/:boardId/members`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/boards/:boardId/members` | Get board members | 🔒 Bearer JWT |
| `POST` | `/api/boards/:boardId/members` | Invite member by email | 🔒 Bearer JWT |
| `PATCH` | `/api/boards/:boardId/members/:memberId` | Update member role (`MEMBER`, `VIEWER`) | 🔒 Bearer JWT |
| `DELETE` | `/api/boards/:boardId/members/:memberId` | Remove member from board | 🔒 Bearer JWT |

### 5. Columns (`/api`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/boards/:boardId/columns` | Create a new column | 🔒 Bearer JWT |
| `PATCH` | `/api/columns/:id` | Rename column | 🔒 Bearer JWT |
| `DELETE` | `/api/columns/:id` | Delete column & cascade tasks | 🔒 Bearer JWT |

### 6. Tasks & Drag-and-Drop (`/api`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/columns/:columnId/tasks` | Create task with Priority, DueDate, Labels, Image | 🔒 Bearer JWT |
| `GET` | `/api/tasks/:id` | Get full task details | 🔒 Bearer JWT |
| `PATCH` | `/api/tasks/:id` | Update task details | 🔒 Bearer JWT |
| `PATCH` | `/api/tasks/:id/move` | **Atomic reorder / cross-column move** | 🔒 Bearer JWT |
| `DELETE` | `/api/tasks/:id` | Delete task and adjust position order | 🔒 Bearer JWT |

### 7. Subtasks Checklist (`/api/tasks/:taskId/subtasks`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/tasks/:taskId/subtasks` | Add subtask | 🔒 Bearer JWT |
| `PATCH` | `/api/tasks/:taskId/subtasks/:id` | Toggle completion / rename subtask | 🔒 Bearer JWT |
| `DELETE` | `/api/tasks/:taskId/subtasks/:id` | Delete subtask | 🔒 Bearer JWT |

### 8. Comments Feed (`/api/tasks/:taskId/comments`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks/:taskId/comments` | List all comments on a task | 🔒 Bearer JWT |
| `POST` | `/api/tasks/:taskId/comments` | Post comment | 🔒 Bearer JWT |
| `DELETE` | `/api/tasks/:taskId/comments/:id` | Delete comment | 🔒 Bearer JWT |

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- Node.js 20+
- PostgreSQL database (or Neon.tech)

### 2. Environment Variables (`Backend/.env`)
```env
PORT=5000
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
JWT_SECRET="your_jwt_secret_key"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="*"
```

### 3. Install Dependencies & Push Schema
```bash
npm install
npx prisma db push
npx prisma generate
```

### 4. Seed Database
```bash
npx ts-node prisma/seed.ts
```

### 5. Start Development Server
```bash
npm run start:dev
# Running on http://localhost:5000/api
```

---

## 🐳 Docker Deployment

```bash
docker build -t trello-backend .
docker run -p 5000:5000 --env-file .env trello-backend
```
