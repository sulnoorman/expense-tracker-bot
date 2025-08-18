# --- Build Stage Dockerfile---
FROM node:20-alpine AS build

# Install build tools (needed for node-canvas to compile)
RUN apk add --no-cache \
  python3 make g++ \
  cairo-dev jpeg-dev pango-dev giflib-dev librsvg-dev pixman-dev

WORKDIR /app

# Install dependencies, including dev dependencies for building native modules like canvas
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# --- Production Stage ---
FROM node:20-alpine AS prod

# Install only runtime libs (no compilers here)
RUN apk add --no-cache \
  cairo jpeg pango giflib librsvg pixman \
  fontconfig ttf-dejavu

WORKDIR /app

# Copy package.json and package-lock.json to install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built node_modules from the build stage
COPY --from=build /app/node_modules ./node_modules

# Copy built files, Prisma client, and environment config
COPY --from=build /app/src ./src
COPY --from=build /app/prisma ./prisma

# Environment
ENV NODE_ENV=production

# Optional: expose port if needed
EXPOSE 5000

# Start app
CMD ["node", "src/server.js"]