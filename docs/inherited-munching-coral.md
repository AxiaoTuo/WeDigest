# WeDigest 全面扩展开发计划

你选择了全部四个方向：页面/UI 优化、功能增强、AI 体验提升、代码质量 & 架构。以下是按实施顺序整理的详细计划。

---

## 实施路线图

```
Phase 1 (基础体验)     Phase 2 (功能完善)     Phase 3 (高级功能)     Phase 4 (架构优化)
    ↓                      ↓                      ↓                      ↓
深色模式               历史搜索筛选            AI 流式输出            自动化测试
404/错误页面           批量操作                自定义 Prompt          统一错误处理
骨架屏加载             收藏/星标               多模型对比             API 客户端抽象
键盘快捷键             更多导出格式            标签管理系统           性能优化
```

---

## Phase 1: 基础体验优化

### 1.1 深色模式
**文件改动**:
- `src/app/layout.tsx` - 添加 ThemeProvider
- `src/components/theme-toggle.tsx` - 新增主题切换组件
- `src/app/globals.css` - 添加 dark mode CSS 变量
- 导航栏组件 - 添加切换按钮

**实现要点**:
```tsx
// layout.tsx
import { ThemeProvider } from 'next-themes'
<ThemeProvider attribute="class" defaultTheme="system">
  {children}
</ThemeProvider>
```

### 1.2 404/错误页面
**新增文件**:
- `src/app/not-found.tsx` - 404 页面
- `src/app/error.tsx` - 全局错误边界
- `src/app/global-error.tsx` - 根布局错误边界

**设计**:
- 统一视觉风格（渐变背景 + 插图）
- 返回首页按钮
- 错误详情（开发环境显示）

### 1.3 骨架屏加载
**新增组件**:
- `src/components/ui/skeleton.tsx` - 骨架屏基础组件
- `src/components/skeleton/history-skeleton.tsx` - 历史列表骨架
- `src/components/skeleton/result-skeleton.tsx` - 结果页骨架

**应用位置**:
- `src/app/history/page.tsx` - 列表加载时
- `src/app/result/page.tsx` - 详情加载时

### 1.4 键盘快捷键
**新增文件**:
- `src/hooks/use-keyboard-shortcuts.ts` - 快捷键 hook
- `src/components/command-palette.tsx` - 命令面板 (Cmd+K)

**快捷键设计**:
| 快捷键 | 功能 |
|--------|------|
| `Cmd/Ctrl + K` | 打开命令面板 |
| `Cmd/Ctrl + /` | 聚焦搜索框 |
| `Cmd/Ctrl + N` | 新建笔记 |
| `Cmd/Ctrl + H` | 跳转历史 |
| `Escape` | 关闭弹窗 |

---

## Phase 2: 功能完善

### 2.1 历史搜索筛选
**后端改动** (`src/app/api/history/route.ts`):
```ts
// 新增查询参数
interface HistoryQuery {
  page?: number
  limit?: number
  search?: string      // 标题/作者模糊搜索
  provider?: string    // AI 供应商筛选
  favorite?: boolean   // 收藏筛选
  startDate?: string   // 日期范围
  endDate?: string
  sortBy?: 'createdAt' | 'title'
  sortOrder?: 'asc' | 'desc'
}
```

**前端改动** (`src/app/history/page.tsx`):
- 搜索输入框（防抖 300ms）
- 供应商下拉筛选
- 日期范围选择器
- 排序切换按钮

### 2.2 批量操作
**后端新增** (`src/app/api/history/batch/route.ts`):
```ts
// DELETE: 批量删除
POST /api/history/batch
Body: { action: 'delete', ids: string[] }

// POST: 批量导出
POST /api/history/batch
Body: { action: 'export', ids: string[], format: 'zip' | 'json' }
```

**前端改动**:
- 多选 checkbox（每行 + 全选）
- 底部操作栏（选中 N 项 | 删除 | 导出）
- 确认对话框

### 2.3 收藏/星标功能
**数据库改动** (`prisma/schema.prisma`):
```prisma
model Summary {
  // ... existing fields
  isFavorite Boolean @default(false)
}
```

**API 新增** (`src/app/api/history/[id]/favorite/route.ts`):
```ts
PATCH /api/history/:id/favorite
Body: { isFavorite: boolean }
```

**前端改动**:
- 星标图标按钮（结果页 + 历史列表）
- 收藏筛选选项

### 2.4 更多导出格式
**新增文件**:
- `src/lib/export/pdf.ts` - PDF 导出（puppeteer 服务端渲染）
- `src/lib/export/html.ts` - HTML 导出（带内联样式）
- `src/lib/export/json.ts` - JSON 结构化导出
- `src/lib/export/notion.ts` - Notion 兼容格式

**API 改动** (`src/app/api/export/route.ts`):
```ts
GET /api/export?id=xxx&format=md|pdf|html|json|notion
```

---

## Phase 3: AI 体验提升

### 3.1 流式输出
**后端改动**:
- `src/lib/ai-providers/base.ts` - 新增 `summarizeStream()` 抽象方法
- `src/lib/ai-providers/openai.ts` - 实现 OpenAI streaming
- `src/lib/ai-providers/deepseek.ts` - 实现 DeepSeek streaming
- `src/lib/ai-providers/zhipu.ts` - 实现智谱 streaming

```ts
// 新增方法签名
async *summarizeStream(
  content: string,
  options: SummaryOptions,
  apiKey: string,
  baseUrl?: string,
  modelName?: string
): AsyncGenerator<string>
```

**API 改动** (`src/app/api/summarize/route.ts`):
```ts
// 新增 streaming 模式
POST /api/summarize?stream=true
Response: ReadableStream (text/event-stream)
```

**前端改动** (`src/app/app/page.tsx`):
- 实时显示生成文本
- 打字机效果
- 停止生成按钮

### 3.2 自定义 Prompt 模板
**数据库新增** (`prisma/schema.prisma`):
```prisma
model PromptTemplate {
  id        String   @id @default(cuid())
  userId    String
  name      String
  content   String   // Prompt 内容
  isDefault Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(...)
}
```

**新增页面** (`src/app/settings/prompts/page.tsx`):
- Prompt 模板列表
- 创建/编辑/删除模板
- 设置默认模板
- 预览效果

**API 新增**:
- `GET/POST /api/settings/prompts` - 列表/创建
- `GET/PUT/DELETE /api/settings/prompts/[id]` - 单个操作

### 3.3 多模型对比
**新增页面** (`src/app/compare/page.tsx`):
- 同一篇文章使用多个模型生成
- 并排对比展示
- 差异高亮
- 选择最佳版本保存

**API 新增** (`src/app/api/compare/route.ts`):
```ts
POST /api/compare
Body: {
  content: string,
  providers: ['openai', 'deepseek', 'zhipu']
}
Response: {
  results: Array<{ provider, result, duration }>
}
```

### 3.4 标签管理系统
**数据库改动**:
```prisma
model Tag {
  id        String    @id @default(cuid())
  userId    String
  name      String
  color     String?   // 标签颜色
  summaries Summary[]
  user      User      @relation(...)

  @@unique([userId, name])
}

model Summary {
  // ... existing
  tags Tag[]
}
```

**API 新增**:
- `GET/POST /api/tags` - 标签 CRUD
- `PUT /api/history/[id]/tags` - 更新笔记标签

**前端改动**:
- 结果页标签编辑器
- 历史页按标签筛选
- 标签管理页面

---

## Phase 4: 架构优化

### 4.1 自动化测试
**配置文件**:
- `jest.config.js` - Jest 配置
- `playwright.config.ts` - E2E 配置

**测试文件结构**:
```
__tests__/
├── unit/
│   ├── lib/
│   │   ├── crypto.test.ts
│   │   ├── ai-providers.test.ts
│   │   └── scraper.test.ts
│   └── components/
│       └── ui/*.test.tsx
├── integration/
│   └── api/
│       ├── auth.test.ts
│       ├── history.test.ts
│       └── summarize.test.ts
└── e2e/
    ├── login.spec.ts
    ├── summarize.spec.ts
    └── history.spec.ts
```

**覆盖目标**: 核心路径 80%+

### 4.2 统一错误处理
**新增文件**:
- `src/lib/errors.ts` - 错误类型定义

```ts
// 错误类型
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message)
  }
}

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  AI_PROVIDER_ERROR: 'AI_PROVIDER_ERROR',
  SCRAPER_ERROR: 'SCRAPER_ERROR',
} as const
```

**应用**:
- API 路由统一错误响应格式
- 前端统一错误处理

### 4.3 API 客户端抽象
**新增文件**:
- `src/lib/api-client.ts` - 统一 API 客户端

```ts
// 使用示例
import { api } from '@/lib/api-client'

const { data, error } = await api.history.list({ page: 1 })
const { data } = await api.history.get(id)
await api.history.delete(id)
```

**新增 Hooks**:
- `src/hooks/use-history.ts` - 历史记录相关
- `src/hooks/use-settings.ts` - 设置相关
- `src/hooks/use-summarize.ts` - 总结相关

### 4.4 性能优化
**优化项**:

1. **SWR/React Query 集成**
   - 请求缓存
   - 自动重试
   - 乐观更新

2. **虚拟滚动** (`src/components/virtual-list.tsx`)
   - 历史列表超过 50 条时启用
   - 使用 `@tanstack/react-virtual`

3. **图片懒加载**
   - 使用 Next.js Image 组件
   - Intersection Observer

4. **代码分割**
   - 动态导入大组件（Markdown 渲染器）
   - 路由级代码分割

---

## 文件改动清单

### 新增文件（约 25 个）
```
src/
├── app/
│   ├── not-found.tsx
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── compare/page.tsx
│   ├── settings/
│   │   ├── account/page.tsx
│   │   └── prompts/page.tsx
│   └── api/
│       ├── history/batch/route.ts
│       ├── history/[id]/favorite/route.ts
│       ├── settings/prompts/route.ts
│       ├── settings/prompts/[id]/route.ts
│       ├── tags/route.ts
│       ├── compare/route.ts
│       └── user/route.ts
├── components/
│   ├── theme-toggle.tsx
│   ├── command-palette.tsx
│   ├── virtual-list.tsx
│   └── skeleton/
│       ├── history-skeleton.tsx
│       └── result-skeleton.tsx
├── hooks/
│   ├── use-keyboard-shortcuts.ts
│   ├── use-history.ts
│   ├── use-settings.ts
│   └── use-summarize.ts
├── lib/
│   ├── errors.ts
│   ├── api-client.ts
│   ├── rate-limit.ts
│   └── export/
│       ├── pdf.ts
│       ├── html.ts
│       ├── json.ts
│       └── notion.ts
__tests__/
└── (测试文件)
```

### 修改文件（约 15 个）
```
prisma/schema.prisma           # 新增 Tag, PromptTemplate 模型，Summary 添加字段
src/app/layout.tsx             # ThemeProvider
src/app/globals.css            # dark mode 变量
src/app/history/page.tsx       # 搜索筛选、批量操作、收藏
src/app/result/page.tsx        # 收藏、标签编辑、更多导出
src/app/app/page.tsx           # 流式输出
src/app/api/history/route.ts   # 搜索筛选参数
src/app/api/export/route.ts    # 多格式支持
src/lib/ai-providers/base.ts   # summarizeStream 方法
src/lib/ai-providers/openai.ts # streaming 实现
src/lib/ai-providers/deepseek.ts # streaming 实现
src/lib/ai-providers/zhipu.ts  # streaming 实现
package.json                   # 新增依赖
```

---

## 新增依赖

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.x",      // 数据获取
    "@tanstack/react-virtual": "^3.x",    // 虚拟滚动
    "cmdk": "^1.x",                        // 命令面板
    "date-fns": "^3.x"                     // 日期处理
  },
  "devDependencies": {
    "jest": "^29.x",
    "@testing-library/react": "^14.x",
    "playwright": "^1.x"
  }
}
```

---

## 验证方式

每个 Phase 完成后的验证步骤：

**Phase 1**:
- 切换深色/浅色模式，验证所有页面样式正确
- 访问 `/nonexistent` 确认 404 页面显示
- 刷新历史页面，观察骨架屏
- 按 Cmd+K 打开命令面板

**Phase 2**:
- 在历史页面搜索关键词
- 多选记录执行批量删除
- 收藏笔记，筛选已收藏
- 导出 PDF/HTML 格式

**Phase 3**:
- 生成笔记时观察流式输出
- 创建自定义 Prompt 并使用
- 同一文章对比多个模型结果

**Phase 4**:
- 运行 `npm test` 通过所有测试
- 检查错误响应格式一致性
- 历史列表 100+ 条滚动流畅
