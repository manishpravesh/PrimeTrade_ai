# PrimeTrade AI Assignment

Simple full-stack assignment project with:
- Node.js + Express REST API
- JWT authentication with role-based access (`user` / `admin`)
- CRUD APIs for tasks
- Basic frontend UI (vanilla JS) to test APIs

## Tech Stack
- Backend: Express, Mongoose, bcryptjs, jsonwebtoken, express-validator
- Security: helmet, rate limiting, input validation
- Docs: Swagger UI (`/api-docs`)
- Frontend: Static HTML/CSS/JS served by Express
- Tests: Node test runner + supertest

## Setup
```bash
npm install
cp .env.example .env # optional
npm start
```

Server starts at: `http://localhost:3000`

## Environment Variables
| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | API server port |
| `JWT_SECRET` | `change-me-in-production` | JWT signing secret |
| `MONGODB_URI` | _(empty)_ | MongoDB connection string (optional) |
| `DEFAULT_ADMIN_EMAIL` | `admin@primetrade.ai` | Seed admin email |
| `DEFAULT_ADMIN_PASSWORD` | `Admin@12345` | Seed admin password |

When `MONGODB_URI` is not provided, the app uses in-memory storage for quick local testing.

## API Overview (v1)
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/tasks` (auth required)
- `POST /api/v1/tasks` (auth required)
- `PUT /api/v1/tasks/:id` (auth required; owner/admin)
- `DELETE /api/v1/tasks/:id` (auth required; owner/admin)
- `GET /api/v1/admin/users` (admin only)
- `GET /api/v1/health`
- Swagger docs: `GET /api-docs`

## Frontend
Open `http://localhost:3000` to:
- Register user
- Login
- Create/list/delete tasks
- See API error/success messages

Demo screenshot:
- https://github.com/user-attachments/assets/c5a9e18b-bb15-404d-a15e-ee7a0f5cccf7

## Build & Test
```bash
npm run build
npm test
```

## Scalability Note
- API is versioned (`/api/v1`) for future non-breaking upgrades.
- Code is split by feature (routes, middleware, services, config) to scale into additional modules.
- Stateless JWT auth supports horizontal scaling behind a load balancer.
- MongoDB support allows moving from in-memory local mode to persistent production storage.
