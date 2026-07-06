FROM node:22-slim AS build
LABEL "language"="nodejs"
LABEL "framework"="vite"
WORKDIR /src
COPY . .
RUN npm install
RUN npm run build

FROM node:22-slim
WORKDIR /app
RUN npm install -g http-server
COPY --from=build /src/dist /app/dist
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["/app/start.sh"]