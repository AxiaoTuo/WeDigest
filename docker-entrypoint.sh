#!/bin/sh
set -e

echo "=========================================="
echo "WeDigest Docker Starting..."
echo "=========================================="

# 确保数据目录存在
mkdir -p /app/data

# 检查数据库是否存在
if [ ! -f "/app/data/dev.db" ]; then
  echo ""
  echo "[1/3] 数据库不存在，创建新数据库..."
  touch /app/data/dev.db
  echo "✓ 数据库文件已创建"
else
  echo ""
  echo "[1/3] 数据库已存在"
fi

# 生成 Prisma Client
echo ""
echo "[2/3] 生成 Prisma Client..."
npx prisma generate
echo "✓ Prisma Client 已生成"

# 初始化表结构
echo ""
echo "[3/3] 初始化数据库表..."
npx prisma db push --skip-generate --accept-data-loss
echo "✓ 数据库表已初始化"

echo ""
echo "=========================================="
echo "数据库初始化完成，启动应用..."
echo "=========================================="
echo ""

# 执行传入的命令
exec "$@"
