# WeDigest Docker 部署指南

本文档提供 WeDigest 项目的 Docker 部署指南，包括前置要求、快速启动、环境变量配置、SSL/TLS 设置和故障排查。

## 目录

- [前置要求](#前置要求)
- [快速启动](#快速启动)
- [环境变量配置](#环境变量配置)
- [SSL/TLS 设置](#ssltls-设置)
- [Nginx 反向代理](#nginx-反向代理)
- [故障排查](#故障排查)
- [更新和维护](#更新和维护)

---

## 前置要求

### 系统要求

- **操作系统**: Linux (Ubuntu 20.04+, Debian 11+, CentOS 8+) 或 macOS
- **内存**: 最低 512MB RAM，推荐 1GB+
- **磁盘空间**: 最低 500MB 可用空间
- **CPU**: 1 核心（推荐 2 核心）

### 软件要求

在开始之前，请确保您的系统已安装以下软件：

- **Docker**: 20.10 或更高版本
- **Docker Compose**: 2.0 或更高版本

#### 安装 Docker

**Ubuntu/Debian:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**macOS:**
```bash
brew install --cask docker
```

#### 安装 Docker Compose

**Linux:**
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**macOS:**
Docker Compose 已包含在 Docker Desktop 中。

---

## 快速启动

### 1. 克隆项目

```bash
git clone https://github.com/your-repo/wedigest.git
cd wedigest
```

### 2. 配置环境变量

复制示例环境变量文件并编辑：

```bash
cp .env.example .env
```

编辑 `.env` 文件，至少设置以下必需变量：

```bash
# 生成随机密钥（必须）
AUTH_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)

# 编辑 .env 文件
nano .env
```

### 3. 启动服务

```bash
# 构建并启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 检查服务状态
docker-compose ps
```

### 4. 访问应用

打开浏览器访问: `http://localhost:3000`

---

## 环境变量配置

### 必需环境变量

| 变量名 | 说明 | 生成方法 |
|--------|------|----------|
| `AUTH_SECRET` | NextAuth.js 密钥 | `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | API Key 加密密钥（32字节十六进制） | `openssl rand -hex 32` |

### 可选环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DATABASE_URL` | 数据库连接字符串 | `file:/app/data/dev.db` |
| `NEXTAUTH_URL` | NextAuth 完整 URL | `http://localhost:3000` |
| `DEFAULT_AI_PROVIDER` | 默认 AI 供应商 | `deepseek` |
| `OPENAI_API_KEY` | OpenAI API Key | - |
| `DEEPSEEK_API_KEY` | DeepSeek API Key | - |
| `ZHIPU_API_KEY` | 智谱AI API Key | - |
| `MEMORY_LIMIT` | Docker 内存限制 | `1G` |
| `CPU_LIMIT` | Docker CPU 限制 | `1` |

### 环境变量示例文件

```bash
# .env.example

# ==================== 必需配置 ====================
# 请使用以下命令生成随机密钥：
# AUTH_SECRET: openssl rand -base64 32
# ENCRYPTION_KEY: openssl rand -hex 32

AUTH_SECRET=your-auth-secret-here
ENCRYPTION_KEY=your-32-byte-hex-key-here

# ==================== 数据库配置 ====================
DATABASE_URL=file:/app/data/dev.db

# ==================== NextAuth 配置 ====================
AUTH_TRUST_HOST=true
NEXTAUTH_URL=http://localhost:3000

# ==================== AI 供应商配置 ====================
# 设置默认 AI 供应商 (openai/deepseek/zhipu)
DEFAULT_AI_PROVIDER=deepseek

# OpenAI 配置
OPENAI_API_KEY=
OPENAI_BASE_URL=

# DeepSeek 配置
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com

# 智谱AI 配置
ZHIPU_API_KEY=

# ==================== Docker 配置 ====================
PORT=3000
MEMORY_LIMIT=1G
MEMORY_RESERVATION=256M
CPU_LIMIT=1
CPU_RESERVATION=0.25
```

---

## SSL/TLS 设置

### 使用 Let's Encrypt（推荐）

#### 1. 安装 Certbot

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install certbot
```

**macOS:**
```bash
brew install certbot
```

#### 2. 获取 SSL 证书

```bash
# 停止 Nginx 容器（如果运行）
docker-compose --profile with-nginx down

# 生成证书
sudo certbot certonly --standalone -d your-domain.com

# 证书将保存在：
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem
```

#### 3. 复制证书到项目目录

```bash
mkdir -p ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/
sudo chown $USER:$USER ssl/*.pem
```

#### 4. 配置 Nginx

创建或编辑 `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream wedigest {
        server wedigest:3000;
    }

    # HTTP 重定向到 HTTPS
    server {
        listen 80;
        server_name your-domain.com;

        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS 配置
    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # SSL 优化
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        location / {
            proxy_pass http://wedigest;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

#### 5. 启动带 Nginx 的服务

```bash
docker-compose --profile with-nginx up -d
```

---

## Nginx 反向代理

生产环境推荐使用 Nginx 作为反向代理。

### 启动 Nginx

```bash
docker-compose --profile with-nginx up -d
```

### Nginx 配置选项

`nginx.conf` 支持以下配置选项：

- **负载均衡**: 配置多个后端服务器
- **缓存**: 静态资源缓存
- **压缩**: gzip 压缩
- **安全头**: XSS 保护、点击劫持保护
- **访问日志**: 自定义日志格式

---

## 故障排查

### 常见问题

#### 1. 容器无法启动

**症状**: `docker-compose up` 失败

**解决方案**:
```bash
# 查看详细日志
docker-compose logs wedigest

# 检查端口占用
sudo lsof -i :3000

# 清理并重新构建
docker-compose down -v
docker-compose up -d --build
```

#### 2. 数据库错误

**症状**: 应用报错 "Database not found"

**解决方案**:
```bash
# 检查数据目录权限
ls -la data/

# 重新初始化数据库
docker-compose exec wedigest npx prisma db push
```

#### 3. API Key 加密失败

**症状**: "Invalid encryption key" 错误

**解决方案**:
```bash
# 确保 ENCRYPTION_KEY 是 32 字节十六进制
openssl rand -hex 32

# 更新 .env 并重启
docker-compose down
docker-compose up -d
```

#### 4. 内存不足

**症状**: 容器频繁重启

**解决方案**:
```bash
# 在 .env 中增加内存限制
MEMORY_LIMIT=2G
MEMORY_RESERVATION=512M

# 重启服务
docker-compose down
docker-compose up -d
```

#### 5. SSL 证书错误

**症状**: 浏览器警告证书无效

**解决方案**:
```bash
# 检查证书有效期
sudo certbot certificates

# 续期证书
sudo certbot renew

# 复制新证书
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/

# 重启 Nginx
docker-compose restart nginx
```

### 健康检查

检查服务健康状态：

```bash
# 检查健康状态
docker-compose ps

# 手动健康检查
curl http://localhost:3000/api/health

# 预期响应：
# {
#   "status": "ok",
#   "timestamp": "2026-02-03T12:00:00.000Z",
#   "uptime": 123.456,
#   "environment": "production"
# }
```

### 日志查看

```bash
# 查看所有日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f wedigest
docker-compose logs -f nginx

# 查看最近 100 行日志
docker-compose logs --tail=100 wedigest
```

---

## 更新和维护

### 更新应用

```bash
# 拉取最新代码
git pull

# 重新构建镜像
docker-compose build

# 重启服务
docker-compose down
docker-compose up -d
```

### 数据备份

```bash
# 备份数据库
cp data/dev.db data/dev.db.backup.$(date +%Y%m%d)

# 自动备份脚本
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR
cp data/dev.db $BACKUP_DIR/dev.db.$(date +%Y%m%d_%H%M%S)
# 保留最近 7 天的备份
find $BACKUP_DIR -name "dev.db.*" -mtime +7 -delete
EOF

chmod +x backup.sh

# 添加到 crontab（每天凌晨 2 点备份）
crontab -e
# 添加: 0 2 * * * /path/to/wedigest/backup.sh
```

### 数据恢复

```bash
# 停止服务
docker-compose down

# 恢复数据库
cp data/dev.db.backup.YYYYMMDD data/dev.db

# 重启服务
docker-compose up -d
```

### 清理资源

```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的容器
docker container prune

# 清理未使用的卷
docker volume prune

# 一键清理所有
docker system prune -a --volumes
```

---

## 性能优化

### 资源限制

根据服务器配置调整 `.env` 中的资源限制：

```bash
# 小型服务器（1GB RAM）
MEMORY_LIMIT=512M
MEMORY_RESERVATION=128M
CPU_LIMIT=0.5
CPU_RESERVATION=0.25

# 中型服务器（2GB RAM）
MEMORY_LIMIT=1G
MEMORY_RESERVATION=256M
CPU_LIMIT=1
CPU_RESERVATION=0.5

# 大型服务器（4GB+ RAM）
MEMORY_LIMIT=2G
MEMORY_RESERVATION=512M
CPU_LIMIT=2
CPU_RESERVATION=1
```

### Puppeteer 优化

如果不需要 Chromium 功能（用于文章抓取），可以在 Dockerfile 中移除相关依赖以减小镜像大小。

---

## 安全建议

1. **定期更新**: 保持 Docker 和系统更新
2. **强密钥**: 使用生成的随机密钥，不要使用默认值
3. **防火墙**: 只开放必要的端口（80, 443）
4. **备份**: 定期备份数据库
5. **监控**: 设置日志监控和告警
6. **SSL**: 生产环境必须使用 HTTPS
7. **非 root 用户**: 容器已配置为非 root 用户运行

---

## 支持

如果遇到问题：

1. 查看日志: `docker-compose logs -f`
2. 检查健康状态: `curl http://localhost:3000/api/health`
3. 查看本文档的故障排查部分
4. 提交 Issue: https://github.com/your-repo/wedigest/issues
