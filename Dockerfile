# --- build stage: needs devDependencies (tsc, vite) ---
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- runtime stage: prod deps + built output only ---
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=7860
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 7860
CMD ["node", "dist/main.js"]
