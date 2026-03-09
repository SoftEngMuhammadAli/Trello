FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
COPY src ./src
COPY scripts ./scripts
COPY .env.example ./.env.example
RUN npm install --omit=dev

EXPOSE 5000
CMD ["node", "src/server.js"]