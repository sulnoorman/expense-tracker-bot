# Optimized Dockerfile for Canvas Package
# This approach minimizes final image size by removing build tools after installation

FROM node:20-alpine

# Install build tools and runtime libraries
RUN apk add --no-cache \
  python3 make g++ \
  cairo-dev jpeg-dev pango-dev giflib-dev librsvg-dev pixman-dev \
  cairo jpeg pango giflib librsvg pixman \
  fontconfig ttf-dejavu

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies and then remove build tools to reduce image size
RUN npm ci --omit=dev && \
  apk del python3 make g++ \
  cairo-dev jpeg-dev pango-dev giflib-dev librsvg-dev pixman-dev

# Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy fonts directory
COPY fonts ./fonts

# Copy source files
COPY src ./src

# Environment
ENV NODE_ENV=production

# Expose port
EXPOSE 5000

# Start app
CMD ["node", "src/server.js"]

