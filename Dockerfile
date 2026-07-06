FROM node:22-slim AS build
LABEL "language"="nodejs"
LABEL "framework"="vite"
WORKDIR /src
COPY . .
RUN npm install
RUN npm run build

FROM node:22-slim
WORKDIR /app
RUN npm install -g serve
COPY --from=build /src/dist /app/dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
