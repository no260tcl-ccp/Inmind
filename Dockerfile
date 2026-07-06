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
ENV PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "http-server dist -p ${PORT} -c-1"]
