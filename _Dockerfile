FROM node:20-alpine

WORKDIR /src

# 复制项目文件
COPY . .

# 进入项目目录
WORKDIR /src/Inmind/coffee-web-vite

# 安装依赖
RUN npm install --legacy-peer-deps

# 构建项目（生产构建，不是开发服务器）
RUN npm run build

# 使用轻量级 HTTP 服务器来提供静态文件
RUN npm install -g http-server

# 暴露端口
EXPOSE 8080

# 启动 HTTP 服务器
CMD ["http-server", "dist", "-p", "8080"]