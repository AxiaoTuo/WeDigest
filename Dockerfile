# 使用 Node.js 20 Slim (更稳定，但体积较大)
FROM node:20-slim

# 安装依赖
RUN apt-get update && apt-get install -y \
    python3 make g++ \
    openssl \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnss3 \
    libwayland-client0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 先复制 Prisma schema (postinstall 需要它)
COPY prisma ./prisma/

# 安装依赖 (跳过 Puppeteer Chrome 下载，项目使用 @sparticuz/chromium)
RUN PUPPETEER_SKIP_DOWNLOAD=true npm ci

# 复制剩余项目文件
COPY . .

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
