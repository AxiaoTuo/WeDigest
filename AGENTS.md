# WeDigest 代理编码指南

## 命令

### 开发与构建
- `npm run dev` - 启动开发服务器（带数据库初始化）
- `npm run build` - 构建生产版本
- `npm start` - 启动生产服务器

### 代码检查
- `npm run lint` - 运行 ESLint 检查代码质量

### 数据库
- `npx prisma generate` - 生成 Prisma 客户端
- `npx prisma db push` - 推送数据库 schema 到数据库
- `npm run db:init` - 初始化数据库

### 注意
- 此项目目前没有测试配置，无需运行测试

---

## 代码风格指南

### 导入规则
- 使用 `@/*` 路径别名导入项目文件
- 第三方库按字母顺序排列
- React 导入：`import { useState } from 'react'`
- UI 组件：`import { Button } from '@/components/ui/button'`
- 类型导入：`import { Article } from '@/types/article'`

### TypeScript
- 使用严格模式（已在 tsconfig.json 中配置）
- 避免使用 `any`，使用具体类型或 `unknown`
- 接口定义：`export interface Article { ... }`
- 类型定义：`export type AIProviderType = 'openai' | 'deepseek' | 'zhipu'`

### 命名约定
- **组件**：PascalCase - `HomePage`, `Button`, `AuthGuard`
- **函数/方法**：camelCase - `handleFetch`, `setArticle`, `encrypt`
- **常量**：UPPER_SNAKE_CASE - `ALGORITHM`, `IV_LENGTH`, `DEFAULT_PROVIDER`
- **类型/接口**：PascalCase - `Article`, `SummaryOptions`, `AppState`
- **文件名**：
  - 组件：PascalCase - `page.tsx`, `HomePage.tsx`
  - 工具/库：kebab-case - `crypto.ts`, `ai-providers/index.ts`

### React 组件
- 使用函数组件和 Hooks
- 客户端组件：在文件顶部添加 `'use client'`
- Props 解构：`function Button({ className, variant, ...props }) { ... }`
- 事件处理器：使用 `handle` 前缀 - `handleFetch`, `handleSubmit`

### 错误处理
- API 路由：使用 try-catch 包裹，返回统一的 JSON 响应格式
- 成功：`{ success: true, data: {...} }`
- 失败：`{ success: false, error: '错误信息' }`
- Zod 验证：`catch (error) { if (error instanceof z.ZodError) { ... } }`
- 错误日志：使用 `console.error` 记录错误
- 用户通知：使用 `toast.error()` 显示用户友好的错误信息

### API 路由
- 使用 Next.js App Router
- 文件位置：`src/app/api/[route]/route.ts`
- 导出命名函数：`export async function POST(request: NextRequest) { ... }`
- 认证检查：`const session = await auth(); if (!session?.user?.id) { return NextResponse.json(..., { status: 401 }) }`
- 请求体验证：使用 Zod schema
- 响应：使用 `NextResponse.json()`

### 状态管理
- 使用 Zustand 进行全局状态管理
- Store 文件位置：`src/store/[name]-store.ts`
- Store 定义：定义接口，使用 `create()` 创建 store
- 状态更新：使用 setter 函数 - `setArticle(article)`, `setIsLoading(true)`

### 数据库操作
- 使用 Prisma ORM
- 模型定义：`prisma/schema.prisma`
- 数据库客户端：从 `@/lib/db` 导入 `prisma` 实例
- 查询：使用 Prisma Client API - `prisma.summary.create()`, `prisma.apiKey.findUnique()`

### 样式
- 使用 TailwindCSS
- 工具类：优先使用 Tailwind 原生类
- 类合并：使用 `cn()` 工具函数 - `cn('base-class', conditionalClass)`
- UI 组件：使用 shadcn/ui 组件库
- 组件变体：使用 `class-variance-authority` 定义变体

### 代码组织
- **app/**：Next.js 页面和 API 路由
  - `api/`：API 路由
  - `[page]/page.tsx`：页面组件
- **components/**：React 组件
  - `ui/`：shadcn/ui 组件
- **lib/**：核心逻辑和工具
  - `ai-providers/`：AI 供应商适配层
  - `scraper/`：文章抓取模块
- **store/**：Zustand 状态管理
- **types/**：TypeScript 类型定义

### 安全
- API Key 加密存储：使用 `@/lib/crypto` 的 `encrypt()` 和 `decrypt()`
- 认证：使用 NextAuth.js，从 `@/lib/auth` 导入 `auth()`
- 环境变量：敏感信息存储在 `.env`，不要提交到版本控制
- 不要在日志中暴露敏感信息

### 注释
- 避免添加过多注释，代码应自解释
- 复杂逻辑可以添加简短注释
- 不添加函数文档注释（如 JSDoc），除非必要

### 通用原则
- 保持代码简洁，避免冗余
- 遵循现有代码风格和模式
- 优先考虑代码可读性和可维护性
- 使用现有工具和库，避免引入不必要的依赖
