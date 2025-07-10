# --- Build stage ---
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate

# --- Production stage ---
FROM node:18-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Copy app code + prisma client
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma

ENV NODE_ENV=production
CMD ["node", "src/server.js"]
