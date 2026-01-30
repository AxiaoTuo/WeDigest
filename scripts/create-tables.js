const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db')
const db = new Database(dbPath)

console.log('创建数据库表结构...')

// 创建 User 表
db.exec(`
  CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "password" TEXT,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );
`)

// 创建 ApiKey 表
db.exec(`
  CREATE TABLE IF NOT EXISTS "ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "encryptedKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  );
`)

// 创建 ApiKey 唯一索引
db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS "ApiKey_userId_provider_key" ON "ApiKey"("userId", "provider");
`)

// 创建 Summary 表
db.exec(`
  CREATE TABLE IF NOT EXISTS "Summary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "articleUrl" TEXT NOT NULL,
    "articleTitle" TEXT NOT NULL,
    "articleAuthor" TEXT,
    "originalContent" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  );
`)

// 创建 Summary 索引
db.exec(`
  CREATE INDEX IF NOT EXISTS "Summary_userId_createdAt_idx" ON "Summary"("userId", "createdAt");
`)

// 创建 _prisma_migrations 表（Prisma 需要）
db.exec(`
  CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "checksum" TEXT,
    "finished_at" DATETIME,
    "migration_name" TEXT,
    "logs" TEXT,
    "rolled_back_at" DATETIME,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
  );
`)

console.log('✓ 数据库表结构创建成功')

// 验证表是否创建
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
console.log('现有表:', tables.map(t => t.name).join(', '))

db.close()
