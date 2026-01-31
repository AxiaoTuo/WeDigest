# Docker 部署问题排查与解决方案

本文档记录 WeDigest 项目在 Docker 部署过程中遇到的问题及解决方案。

---

## 目录

1. [Prisma Schema 未找到](#1-prisma-schema-未找到)
2. [Prisma OpenSSL 兼容性问题](#2-prisma-openssl-兼容性问题)
3. [Alpine 包名错误](#3-alpine-包名错误)
4. [Puppeteer Chrome 下载失败](#4-puppeteer-chrome-下载失败)
5. [NextAuth UntrustedHost 错误](#5-nextauth-untrustedhost-错误)
6. [Chromium Target closed 错误](#6-chromium-target-closed-错误)
7. [内存占用优化](#7-内存占用优化)

---

## 1. Prisma Schema 未找到

### 错误信息

```
Error: Could not find Prisma Schema that is required for this command.
Checked following paths:
- prisma/schema.prisma: file not found
```

### 原因分析

Dockerfile 中 `npm ci` 在复制项目文件之前执行，而 `npm ci` 会触发 `postinstall` 钩子执行 `prisma generate`，此时 `prisma/schema.prisma` 文件还未被复制到容器中。

### 解决方案

调整 Dockerfile 中的复制顺序：

```dockerfile
# 错误顺序
COPY package*.json ./
RUN npm ci
COPY . .

# 正确顺序
COPY package*.json ./
COPY prisma ./prisma/  # 先复制 Prisma schema
RUN npm ci
COPY . .
```

---

## 2. Prisma OpenSSL 兼容性问题

### 错误信息

```
prisma:warn Prisma failed to detect the libssl/openssl version to use
Error: Could not parse schema engine response: SyntaxError: Unexpected token 'E'
```

### 原因分析

1. Alpine Linux 使用 musl libc，Prisma 的预编译二进制文件可能不兼容
2. `better-sqlite3` 需要重新编译以兼容 Alpine
3. OpenSSL 版本不匹配

### 解决方案

在 Dockerfile 中添加 OpenSSL 兼容库和重新编译：

```dockerfile
RUN apk add --no-cache python3 make g++ openssl-dev openssl && \
    ln -s /lib/libssl.so.3 /lib/libssl.so && \
    ln -s /lib/libcrypto.so.3 /lib/libcrypto.so || true

# 重新编译 better-sqlite3
RUN npm rebuild better-sqlite3
```

---

## 3. Alpine 包名错误

### 错误信息

```
ERROR: unable to select packages:
  openssl3-libs (no such package)
```

### 原因分析

Alpine Linux 包仓库中没有 `openssl3-libs` 这个包名。

### 解决方案

使用正确的包名：

```dockerfile
# 错误
RUN apk add --no-cache openssl3-libs

# 正确
RUN apk add --no-cache openssl openssl-dev
```

---

## 4. Puppeteer Chrome 下载失败

### 错误信息

```
Error: ERROR: Failed to set up chrome v144.0.7559.96!
Error: Client network socket disconnected before secure TLS connection
```

### 原因分析

1. 项目使用 `@sparticuz/chromium`（Lambda/serverless 优化版本）
2. `npm ci` 时 `puppeteer` postinstall 钩子尝试下载完整 Chrome
3. 网络问题或防火墙导致下载失败

### 解决方案

跳过 Puppeteer 的 Chrome 下载：

```dockerfile
RUN PUPPETEER_SKIP_DOWNLOAD=true npm ci
```

或者在 `.npmrc` 中配置：

```ini
PUPPETEER_SKIP_DOWNLOAD=true
```

---

## 5. NextAuth UntrustedHost 错误

### 错误信息

```
[auth][error] UntrustedHost: Host must be trusted.
URL was: http://192.168.9.19:3000/api/auth/error
```

### 原因分析

NextAuth.js 验证请求 Host 头与 `NEXTAUTH_URL` 是否匹配：
- 用户通过 `192.168.9.19:3000` 访问
- `.env` 中配置的是 Tailscale IP (`100.x.x.x:3000`)
- Host 不匹配导致认证失败

### 解决方案

添加 `AUTH_TRUST_HOST=true` 允许多网络访问：

```bash
# .env
AUTH_TRUST_HOST=true
NEXTAUTH_URL="http://192.168.9.19:3000"
```

或在 `docker-compose.yml` 中配置：

```yaml
environment:
  - AUTH_TRUST_HOST=true
  - NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3000}
```

---

## 6. Chromium Target closed 错误

### 错误信息

```
Error [TargetCloseError]: Protocol error (Target.setDiscoverTargets): Target closed
```

### 原因分析

1. Chromium 在 Alpine Linux 上运行不稳定
2. 容器内存不足导致 Chrome 崩溃
3. Puppeteer 缺少必要的运行参数

### 解决方案

#### 方案一：切换到 Debian 基础镜像（推荐）

使用 `node:20-slim` 替代 `node:20-alpine`：

```dockerfile
FROM node:20-slim

# 安装 Chromium 依赖
RUN apt-get update && apt-get install -y \
    libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libxrandr2 \
    libasound2 libatspi2.0-0 libgtk-3-0 libgbm1 \
    && rm -rf /var/lib/apt/lists/*
```

#### 方案二：优化 Chromium 参数

```typescript
// puppeteer.ts
browserInstance = await puppeteer.default.launch({
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-zygote',
    '--single-process',  // 内存受限时使用
  ],
  headless: true
})
```

#### 方案三：添加重试机制

```typescript
export async function fetchPageContent(url: string): Promise<string> {
  const maxRetries = 3
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // ... 抓取逻辑
      return content
    } catch (error) {
      if (error.message.includes('Target closed')) {
        await closeBrowser()  // 重置浏览器实例
      }
      if (attempt === maxRetries) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }
}
```

---

## 7. 内存占用优化

### 内存占用分析

| 组件 | 内存占用 |
|------|---------|
| Chromium 基础 | ~200-400MB |
| 每个页面 | ~100-200MB |
| Node.js + Next.js | ~200-400MB |
| Prisma + SQLite | ~50-100MB |
| **总计** | **600MB - 1GB** |

### 资源限制配置

根据服务器内存调整：

```yaml
# docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G     # 服务器 >= 2GB
      # memory: 768M  # 服务器 1GB
      # memory: 400M  # 服务器 512MB
    reservations:
      memory: 256M
```

### 降低内存占用的参数

```typescript
// 添加到 Chromium args
'--disable-background-networking',
'--disable-background-timer-throttling',
'--disable-extensions',
'--disable-gpu',
'--single-process',  // 最大程度降低，但可能不稳定
'--disable-dev-shm-usage',
```

---

## 最终 Dockerfile（推荐）

```dockerfile
FROM node:20-slim

# 安装依赖
RUN apt-get update && apt-get install -y \
    python3 make g++ openssl ca-certificates \
    libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 \
    libxrandr2 libasound2 libatspi2.0-0 libgtk-3-0 libgbm1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 先复制 Prisma schema
COPY prisma ./prisma/
COPY package*.json ./

# 安装依赖
RUN PUPPETEER_SKIP_DOWNLOAD=true npm ci

# 复制项目文件
COPY . .

# 构建应用
RUN npm run build

RUN mkdir -p /app/data
ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/data/dev.db"

EXPOSE 3000

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]
```

---

## 快速部署检查清单

- [ ] 使用 `node:20-slim` 基础镜像
- [ ] 设置 `AUTH_TRUST_HOST=true`
- [ ] 配置正确的 `NEXTAUTH_URL`
- [ ] 设置 `PUPPETEER_SKIP_DOWNLOAD=true`
- [ ] 添加内存限制（建议 1G）
- [ ] 数据库文件挂载到 volume

---

## 相关文件

- `Dockerfile` - 镜像构建配置
- `docker-compose.yml` - 容器编排配置
- `docker-entrypoint.sh` - 容器启动脚本
- `src/lib/scraper/puppeteer.ts` - Chromium 抓取逻辑
