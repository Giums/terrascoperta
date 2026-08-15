# Solo il backend (server/index.ts) — il frontend è una build statica servita
# direttamente da Nginx sull'host, non da questo container (vedi DEPLOY_TODO.md
# Fase 1). server:prod gira via tsx, che transpila TS al volo: non serve una
# fase di compilazione separata per il backend, solo node_modules installati.
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server ./server
COPY src/data ./src/data

ENV NODE_ENV=production
EXPOSE 3001

CMD ["npm", "run", "server:prod"]
