# Trello Clone (MERN)

Complete Trello-style clone built with MongoDB, Express, React (Vite), and Node.js.
Backend is configured as native ESM (`"type": "module"`).

## Features

- JWT auth with refresh tokens (HTTP-only cookie)
- Workspaces, boards, lists, cards, comments
- Drag-and-drop list and card movement
- Real-time board sync with Socket.io
- File uploads for card attachments (Multer)
- Search endpoint (lists/cards/comments)
- Input validation with Joi
- Security middleware: Helmet, CORS, rate limiting, XSS clean, mongo sanitize
- Swagger API docs at `/api/docs` (OpenAPI 3)
- Tailwind frontend, Redux Toolkit state, router lazy loading
- Unit + integration tests
- Docker + deployment docs

## Project Structure

```text
.
├─ client/
│  ├─ src/
│  │  ├─ api/
│  │  ├─ app/
│  │  ├─ components/
│  │  ├─ features/
│  │  ├─ hooks/
│  │  ├─ layouts/
│  │  ├─ pages/
│  │  ├─ styles/
│  │  └─ utils/
│  ├─ Dockerfile
│  └─ ...
├─ server/
│  ├─ src/
│  │  ├─ config/
│  │  ├─ controllers/
│  │  ├─ middleware/
│  │  ├─ models/
│  │  ├─ routes/
│  │  ├─ services/
│  │  ├─ sockets/
│  │  ├─ utils/
│  │  └─ validators/
│  ├─ scripts/seed.js
│  ├─ tests/
│  └─ Dockerfile
├─ docs/DEPLOYMENT.md
└─ docker-compose.yml
```

## Environment Variables

### Backend (`server/.env`)

Copy from `server/.env.example` and update values:

```bash
NODE_ENV=development
PORT=3030
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/trello-clone
JWT_ACCESS_SECRET=change_me_access
JWT_REFRESH_SECRET=change_me_refresh
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
REFRESH_COOKIE_NAME=refreshToken
UPLOAD_DIR=uploads
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX=300
```

### Frontend (`client/.env`)

Copy from `client/.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:3030/api
VITE_SOCKET_URL=http://localhost:3030
```

## Installation

### Local Development

```bash
npm install
npm run dev
```

Backend: `http://localhost:3030`
Frontend: `http://localhost:5173`
Swagger Docs: `http://localhost:3030/api/docs`

### Seed Data (Optional)

```bash
npm run seed --workspace server
```

Demo login: `demo@trelloclone.dev / password123`

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run format
```

## Testing

- `server/tests/run.js`: backend unit + API integration flow tests (offline-safe with model mocking)
- `client/tests/run.js`: frontend unit test for board normalization logic

## API Endpoints

- Auth: `POST /api/auth/register`, `/login`, `/logout`, `/refresh`, `/forgot-password`
- Users: `GET /api/users/profile`, `PUT /api/users/update`
- Workspaces: `POST/GET /api/workspaces`, `GET/PUT/DELETE /api/workspaces/:id`
- Boards: `POST/GET /api/boards`, `GET /api/boards/:id`, `GET /api/boards/:id/full`, `PUT/DELETE /api/boards/:id`
- Lists: `POST /api/lists`, `PUT /api/lists/:id`, `PUT /api/lists/:id/position`, `DELETE /api/lists/:id`
- Cards: `POST /api/cards`, `GET /api/cards/:id`, `PUT /api/cards/:id`, `PUT /api/cards/:id/move`, `POST /api/cards/:id/attachments`, `DELETE /api/cards/:id`
- Comments: `POST /api/comments`, `GET /api/comments?cardId=`, `PUT /api/comments/:id`, `DELETE /api/comments/:id`
- Search: `GET /api/search?q=term&boardId=...`

## Docker

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
docker compose up --build
```

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
