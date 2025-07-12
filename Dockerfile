# --- Build Stage ---
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# --- Production Stage ---
FROM node:18-alpine AS production

WORKDIR /app

# Only install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built files, Prisma client, and environment config
COPY --from=build /app/src ./src
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules ./node_modules

# ✅ Copy deploy.sh script and make it executable
COPY ./deploy.sh ./deploy.sh
RUN chmod +x deploy.sh

# Environment
ENV NODE_ENV=production

# Optional: expose port if needed
EXPOSE 5000

# Start app
CMD ["node", "src/server.js"]
