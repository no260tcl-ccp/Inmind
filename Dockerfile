FROM node:22-slim AS build
LABEL "language"="nodejs"
LABEL "framework"="vite"
WORKDIR /src
COPY . .
RUN npm install
RUN npm run build          # ✅ 構建靜態檔案，而不是啟動開發伺服器

FROM zeabur/caddy-static
COPY --from=build /src/dist /usr/share/caddy  # ✅ 提供靜態檔案