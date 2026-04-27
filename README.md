# PMS Monorepo

## Stack
- Frontend: React + TypeScript + Tailwind + React Router
- Backend: Express + TypeScript + Prisma + PostgreSQL
- Auth: JWT access/refresh with DB session store

## Run Locally
1. Install dependencies: `npm install`
2. Copy env files from `.env.example` in frontend/backend.
3. Run database and services: `docker compose up --build`
4. Run migrations and seed:
   - `npm run prisma:migrate -w backend`
   - `npm run prisma:seed -w backend`

## Key URLs
- Frontend: http://localhost:5173
- API: http://localhost:4000
- Swagger: http://localhost:4000/api/docs

## Auth Notes
- Access tokens are sent as `Authorization: Bearer ...`
- Refresh tokens support rotation and can be sent via body or secure httpOnly cookie (`REFRESH_COOKIE_NAME`)

## Seed Login
- admin@pms.local / Password123!
- manager@pms.local / Password123!
- employee@pms.local / Password123!
