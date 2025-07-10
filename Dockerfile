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

# No build output, so skip /dist
# COPY --from=build /app/dist ./dist

COPY --from=build /app/src ./src
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules ./node_modules

ENV NODE_ENV=production
CMD ["node", "src/server.js"]
