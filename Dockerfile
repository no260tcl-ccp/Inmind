# Build stage
FROM node:22-slim AS builder

WORKDIR /src

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Runtime stage
FROM zeabur/caddy-static

COPY --from=builder /src/dist /www

EXPOSE 8080
