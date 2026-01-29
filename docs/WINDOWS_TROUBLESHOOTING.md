# Windows 故障排除指南

本指南帮助解决 Windows 环境下 WeDigest 项目可能遇到的数据库问题。

## 常见问题

### 1. better-sqlite3 编译失败

**错误信息:**
```
gyp ERR! stack FetchError: request to https://npm.taobao.org/dist/...
```

**原因:**
- node-gyp 使用了淘宝镜像，但该镜像的证书已过期
- 缺少 Visual C++ 构建工具

**解决方案:**

1. **创建 `.npmrc` 文件** (项目根目录):
```ini
registry=https://registry.npmjs.org/
disturl=https://nodejs.org/dist
python=C:\Program Files\Python312\python.exe
```

2. **安装 Visual C++ Redistributable**:
   - 下载: https://aka.ms/vs/17/release/vc_redist.x64.exe
   - 安装后重启电脑

3. **重新编译 better-sqlite3**:
```bash
npm run db:rebuild
```

### 2. Prisma Schema Engine 崩溃

**错误信息:**
```
Error: Schema engine crashed (exit code: 3221225794)
```

**解决方案:**

1. 使用 better-sqlite3 适配器 (已配置在 `src/lib/db.ts`)
2. 确保数据库文件已正确初始化:
```bash
npm run db:setup
```

### 3. Prisma Client 未生成

**错误信息:**
```
Error: @prisma/client did not initialize yet
```

**解决方案:**

```bash
npm run db:generate
```

### 4. 数据库表结构未初始化

**错误信息:**
```
Query failed: no such table
```

**解决方案:**

```bash
npm run db:push
```

或重新运行完整初始化:
```bash
npm run db:setup
```

## 环境检查

运行环境检查脚本诊断问题:

```bash
node scripts/check-env.js
```

## 完整初始化流程

首次安装或遇到问题时，按顺序执行:

1. **清理旧文件** (可选):
```bash
rd /s /q node_modules
rd /s /q prisma\dev.db
del package-lock.json
```

2. **安装依赖**:
```bash
npm install
```

3. **重新编译 better-sqlite3**:
```bash
npm run db:rebuild
```

4. **初始化数据库**:
```bash
npm run db:setup
```

5. **启动开发服务器**:
```bash
npm run dev
```

## 手动步骤

如果自动化脚本失败，可手动执行:

### 生成 Prisma Client
```bash
npx prisma generate
```

### 推送数据库结构
```bash
npx prisma db push
```

### 查看数据库结构
```bash
npx prisma studio
```

## 验证安装

### 1. 检查 better-sqlite3
```bash
node -e "console.log(require('better-sqlite3'))"
```

### 2. 检查 Prisma Client
```bash
node -e "console.log(require('@prisma/client'))"
```

### 3. 测试数据库连接
```bash
node -e "const {PrismaClient} = require('@prisma/client'); const prisma = new PrismaClient(); prisma.$connect().then(() => console.log('✓ Database connected')).catch(e => console.error('✗ Connection failed:', e))"
```

## 系统要求

- **Node.js**: >= 18.0.0
- **Python**: >= 3.6 (用于编译 native 模块)
- **Visual C++ Redistributable**: 2015-2022

## 获取帮助

如果以上方法都无法解决问题:

1. 检查 Node.js 版本: `node --version`
2. 检查 npm 版本: `npm --version`
3. 运行环境检查: `node scripts/check-env.js`
4. 查看详细日志: `npm run db:setup -- --verbose`

## 回退方案

如果 better-sqlite3 仍有问题，代码会自动回退到默认驱动。

检查 `src/lib/db.ts` 中的 try-catch 逻辑。
