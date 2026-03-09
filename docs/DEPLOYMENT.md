# Deployment Guide

## 1. MongoDB Atlas Setup

1. Create an Atlas cluster.
2. Create a database user and strong password.
3. Add your app IP to Network Access.
4. Copy connection string and place into `MONGO_URI` in server env.

## 2. Backend Deployment (Railway/Heroku)

1. Create a service from `server/` folder.
2. Set all `server/.env.example` variables.
3. Add persistent disk for `/app/uploads` (or use cloud object storage in production).
4. Start command: `npm start`.

## 3. Frontend Deployment (Vercel)

1. Import `client/` folder as project.
2. Set `VITE_API_BASE_URL` and `VITE_SOCKET_URL` to deployed backend URL.
3. Build command: `npm run build`.
4. Output directory: `dist`.

## 4. Production Hardening

- Move file attachments from local disk to S3/Cloudinary.
- Rotate JWT secrets regularly.
- Use HTTPS and secure cookies only.
- Add observability (Sentry + request logging).
