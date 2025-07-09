# --- Stage 1: Build Stage ---
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Run prisma generate during build
RUN npx prisma generate

# --- Stage 2: Production Image ---
FROM node:18-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

# Copy generated Prisma client + app code
COPY --from=build /app .

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "src/index.js"]
