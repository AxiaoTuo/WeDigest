# 使用 Node.js 20 Alpine 作为基础镜像
FROM node:20-alpine

# 安装 Python 和构建工具 (better-sqlite3 需要)
RUN apk add --no-cache python3 make g++

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 先复制 Prisma schema (postinstall 需要它)
COPY prisma ./prisma/

# 安装依赖 (prisma generate 在 postinstall 中执行)
RUN npm ci

# 复制剩余项目文件
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 构建应用
RUN npm run build

# 创建数据目录用于持久化数据库
RUN mkdir -p /app/data

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/data/dev.db"

# 启动脚本
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]
