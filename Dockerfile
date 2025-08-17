# --- Build Stage ---
FROM node:20-alpine AS build

# Install build tools (needed for node-canvas to compile)
RUN apk add --no-cache \
  python3 make g++ \
  cairo-dev jpeg-dev pango-dev giflib-dev librsvg-dev pixman-dev

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

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

# Only install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built files, Prisma client, and environment config
COPY --from=build /app/src ./src
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules ./node_modules

# Environment
ENV NODE_ENV=production

# Optional: expose port if needed
EXPOSE 5000

# Start app
CMD ["node", "src/server.js"]
