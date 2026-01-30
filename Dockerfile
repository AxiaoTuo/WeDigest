# 使用 Node.js 20 Alpine 作为基础镜像
FROM node:20-alpine

# 安装构建工具、OpenSSL 和 Chromium 运行依赖
RUN apk add --no-cache \
    python3 make g++ openssl-dev openssl \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    wqy-zenhei \
    && \
    ln -s /lib/libssl.so.3 /lib/libssl.so && \
    ln -s /lib/libcrypto.so.3 /lib/libcrypto.so || true

# 设置 Chromium 环境变量 - 使用系统 Chromium
ENV CHROMIUM_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

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

# 重新编译 better-sqlite3 以兼容 Alpine
RUN npm rebuild better-sqlite3

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
