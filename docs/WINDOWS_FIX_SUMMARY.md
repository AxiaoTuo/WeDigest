# Windows 数据库兼容性修复总结

## 已完成的更改

### 1. 安装的依赖
- `@prisma/adapter-better-sqlite3` - Prisma 的 better-sqlite3 适配器
- `better-sqlite3` - 高性能的 SQLite 数据库驱动
- `@types/better-sqlite3` - TypeScript 类型定义

### 2. 修改的文件

#### `src/lib/db.ts`
- 添加了 `PrismaBetterSQLite3` 适配器
- 实现了回退机制：如果 better-sqlite3 失败，自动回退到默认驱动
- 保持了原有的全局单例模式和日志配置

#### `package.json`
- 添加了新的 npm scripts:
  - `db:setup` - 完整的数据库初始化流程
  - `db:generate` - 生成 Prisma Client
  - `db:push` - 推送数据库结构
  - `db:rebuild` - 重新编译 better-sqlite3
  - `db:create-tables` - 使用备用脚本创建表
  - `db:check` - 环境检查
  - `postinstall` - 自动生成 Prisma Client

#### `init-db.js`
- 完全重写，实现了完整的初始化流程
- 添加了错误处理和回退机制
- 如果 Prisma db push 失败（Windows Schema Engine 问题），自动使用备用 SQL 脚本

### 3. 新建的文件

#### `.npmrc`
- 配置 npm 使用官方源，避免淘宝镜像证书问题
- 设置正确的 disturl 和 Python 路径

#### `scripts/check-env.js`
- 环境检查工具
- 验证 Node.js、Python、Visual C++ Redistributable 等依赖
- 检查数据库和 Prisma Client 状态

#### `scripts/create-tables.js`
- 备用数据库表创建脚本
- 直接使用 SQL 创建表结构，绕过 Prisma Schema Engine
- 在 Windows 上 Prisma db push 失败时使用

#### `docs/WINDOWS_TROUBLESHOOTING.md`
- 完整的 Windows 故障排除指南
- 包含常见问题和解决方案
- 提供完整的初始化流程说明

## 工作原理

### better-sqlite3 适配器
使用 Prisma 官方推荐的 `@prisma/adapter-better-sqlite3` 适配器，它提供了：
- 更好的 Windows 兼容性
- 同步 API，更易调试
- 更好的性能

### 回退机制
在 `src/lib/db.ts` 中实现了 try-catch 回退：
```typescript
try {
  // 尝试使用 better-sqlite3 适配器
  const adapter = new PrismaBetterSQLite3(datasource)
  prisma = new PrismaClient({ adapter })
} catch {
  // 回退到默认驱动
  prisma = new PrismaClient()
}
```

### 备用表创建脚本
当 Prisma Schema Engine 在 Windows 上崩溃时，`scripts/create-tables.js` 使用 better-sqlite3 直接执行 SQL 创建表，完全绕过 Schema Engine。

## 验证步骤

1. **环境检查**:
   ```bash
   npm run db:check
   ```

2. **数据库初始化**:
   ```bash
   npm run db:setup
   ```

3. **启动应用**:
   ```bash
   npm run dev
   ```

## 故障排除

如果遇到问题，请参考 `docs/WINDOWS_TROUBLESHOOTING.md`。

常见问题：
- better-sqlite3 编译失败 → 运行 `npm run db:rebuild`
- Schema Engine 崩溃 → 自动使用备用脚本
- 数据库连接失败 → 运行 `npm run db:check` 诊断

## 兼容性

- ✅ Windows 10/11
- ✅ Node.js >= 18.0.0
- ✅ better-sqlite3 预编译二进制文件
- ✅ 自动回退到默认驱动
