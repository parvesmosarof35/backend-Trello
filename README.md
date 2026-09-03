# Backend - Mini Trello (Kanban Board)

A scalable RESTful API built with **NestJS**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**.

## Features
- **Authentication**: JWT-based authentication with bcrypt password hashing.
- **Access Control**: Role-based board permissions and custom guards (Owner vs Member vs Viewer).
- **Boards Management**: Full CRUD operations for boards and automated default column generation.
- **Board Sharing**: Real-time member invite by email with roles and unauthorized access prevention (403 Forbidden).
- **Columns & Tasks**: Sequential position-based ordering.
- **Task Movement Engine**: Atomic, transaction-safe task reordering within columns and cross-column moves (`PATCH /api/tasks/:id/move`).
- **Containerization**: Multi-stage Dockerfile and Docker Compose support.

## Environment Variables
Create a `.env` file based on `.env.example`:
```env
PORT=5000
DATABASE_URL="postgres://postgres:password@localhost:5432/postgres"
JWT_SECRET="trello_super_secure_jwt_secret_key"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3000"
```

## API Endpoints Summary

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate and get JWT

### Users
- `GET /api/users/me` - Get current user profile
- `GET /api/users/search?q=query` - Search registered users by email or name

### Boards
- `POST /api/boards` - Create board
- `GET /api/boards` - Get all accessible boards
- `GET /api/boards/:id` - Get board details with columns and tasks
- `PATCH /api/boards/:id` - Update board name or description
- `DELETE /api/boards/:id` - Delete board (Owner only)

### Board Members
- `POST /api/boards/:boardId/members` - Invite member by email
- `GET /api/boards/:boardId/members` - List board members
- `PATCH /api/boards/:boardId/members/:memberId` - Update member role
- `DELETE /api/boards/:boardId/members/:memberId` - Remove member

### Columns
- `POST /api/boards/:boardId/columns` - Create column
- `GET /api/boards/:boardId/columns` - List columns
- `PATCH /api/columns/:id` - Update column name/position
- `DELETE /api/columns/:id` - Delete column

### Tasks
- `POST /api/columns/:columnId/tasks` - Create task
- `GET /api/columns/:columnId/tasks` - List column tasks
- `GET /api/tasks/:id` - Get task details
- `PATCH /api/tasks/:id` - Update task details
- `PATCH /api/tasks/:id/move` - Move/reorder task atomically
- `DELETE /api/tasks/:id` - Delete task
