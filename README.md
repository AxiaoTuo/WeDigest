# WeDigest

> 微信公众号文章智能学习笔记 - 使用 AI 自动生成结构化、易读的学习笔记

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

使用 AI 自动将微信公众号文章转化为结构清晰、易于阅读和整理的学习笔记，支持多种 AI 模型（OpenAI、DeepSeek、智谱AI）。

## ✨ 功能特性

### 🎯 核心功能

- **智能文章抓取** - 自动抓取微信公众号文章内容，支持动态渲染页面
- **AI 学习笔记生成** - 将文章转化为结构化的学习笔记，而非简单摘要
- **多种笔记风格** - 简洁版、详细版、要点版，满足不同学习需求
- **自定义 AI 配置** - 支持自定义 API 地址和模型名称
- **历史记录管理** - 自动保存所有生成的笔记，支持查看和管理
- **Markdown 导出** - 导出为 Markdown 格式，便于复制到笔记工具
- **安全认证** - NextAuth.js 身份验证，多用户隔离
- **API Key 加密** - AES 加密存储敏感信息，保护用户数据

### 📚 学习笔记特性

- **结构清晰** - 层次分明，易于理解和记忆
- **适当总结和拓展** - 用自己的话重新组织，添加必要的注释
- **关键概念解释** - 提供背景信息和概念说明
- **思考与启发** - 提炼文章中的思考、感悟和行动建议
- **实践建议** - 从文章中提炼可操作的建议
- **Markdown 格式** - 支持 Notion、Obsidian 等笔记工具导入

### 🤖 AI 模型支持

- **DeepSeek** (推荐) - 性价比极高的国产 AI 模型
- **OpenAI** - GPT-4 等强大的国际模型
- **智谱AI** - 国产领先的 AI 供应商

### 🔒 安全特性

- **用户认证** - NextAuth.js v5 身份验证系统
- **API Key 加密** - AES-256-GCM 加密存储 API 密钥
- **密码哈希** - bcryptjs 密码加密
- **数据隔离** - 每个用户的数据完全隔离
- **HTTPS 支持** - 生产环境强制 HTTPS

## 🛠️ 技术栈

### 前端技术
- **框架**: Next.js 16.1 (App Router, Server Components)
- **UI 库**: React 19.2
- **样式**: Tailwind CSS 4
- **组件库**: shadcn/ui (Radix UI)
- **状态管理**: Zustand
- **主题**: next-themes
- **Markdown**: react-markdown + remark-gfm
- **通知**: sonner

### 后端技术
- **运行时**: Next.js API Routes (Edge & Node)
- **数据库**: SQLite + Prisma ORM
- **认证**: NextAuth.js v5
- **加密**: crypto (Node.js built-in)
- **抓取**: Puppeteer + Cheerio + @sparticuz/chromium

### AI 集成
- **SDK**: OpenAI SDK (兼容 OpenAI 兼容接口)
- **模型**: 支持自定义 Base URL 和模型名称
- **超时与重试**: 60 秒超时，2 次重试机制
- **请求头**: 模拟浏览器请求，绕过常见防护

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- Python >= 3.6 (Windows 编译 native 模块需要，可选)
- npm / yarn / pnpm

### 安装步骤

#### 1. 克隆仓库

```bash
git clone https://github.com/your-username/wedigest.git
cd wedigest
```

#### 2. 安装依赖

```bash
npm install
```

#### 3. 配置环境变量

编辑 `.env` 文件：

```env
# 数据库
DATABASE_URL="file:./dev.db"

# NextAuth 密钥（生产环境必须更换）
AUTH_SECRET="your-secret-key-change-in-production"

# API Key 加密密钥 (任意字符串)
ENCRYPTION_KEY="your-encryption-key-change-in-production"

# AI Provider API Keys (可选，用户也可以在界面配置)
OPENAI_API_KEY=""
OPENAI_BASE_URL=""
DEEPSEEK_API_KEY=""
DEEPSEEK_BASE_URL="https://api.deepseek.com"
ZHIPU_API_KEY=""

# 默认 AI 供应商
DEFAULT_AI_PROVIDER="deepseek"
```

#### 4. 初始化数据库

```bash
npm run db:init
```

#### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

#### 6. 首次使用

1. 点击右上角"登录"按钮
2. 切换到"注册"标签页注册新账号
3. 登录后进入"设置"页面
4. 配置至少一个 AI Provider 的 API Key（支持自定义 API 地址和模型名称）
5. 返回首页输入微信文章链接
6. 选择 AI 模型和笔记风格
7. 开始生成学习笔记

## 🔑 获取 API Key

### DeepSeek (推荐)

1. 访问 [https://platform.deepseek.com](https://platform.deepseek.com)
2. 注册账号
3. 进入 API Keys 页面创建密钥
4. 复制 API Key 到设置页面

**优势：**
- 性价比极高（RMB 1/1000 tokens）
- 中文理解能力强
- 响应速度快

### OpenAI

1. 访问 [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. 登录或注册账号
3. 创建新的 API Key
4. 复制到设置页面

**优势：**
- 模型能力最强
- 生态完善
- 通用性强

### 智谱AI

1. 访问 [https://open.bigmodel.cn](https://open.bigmodel.cn)
2. 注册并实名认证
3. 进入控制台创建 API Key
4. 复制到设置页面

**优势：**
- 国产领先
- 支持中文优化
- 服务稳定

## 📖 使用指南

### 笔记风格说明

#### 简洁版
适用于快速浏览和回顾。

**包含：**
- 核心观点（2-3 句话）
- 关键要点（3-5 个）

**字数：** 控制在精简范围内

#### 详细版 ⭐
适用于深入学习和理解。

**包含：**
- 核心观点（完整概述）
- 详细要点（展开各个主要部分）
- 关键概念解释（提供背景信息）
- 重要细节/案例（关键数据和实例）
- 思考与启发（提炼的思考和行动建议）

**字数：** 1500 字以内

#### 要点版
适用于记忆和实践。

**包含：**
- 核心观点（一句话）
- 主要要点（6-8 个）
- 关键概念（简要解释）
- 实践建议（可操作）

**字数：** 1000 字以内

### 自定义 API 配置

支持配置第三方中转服务：

1. 进入"设置"页面
2. 选择对应的 AI 供应商标签
3. 填写 API Key
4. （可选）填写自定义 API 地址（如 `https://your-api.com/v1`）
5. （可选）填写自定义模型名称（如 `custom-model-name`）
6. 点击"保存"
7. 点击"测试连接"验证配置

**注意事项：**
- API 地址需要包含完整的路径
- 模型名称需要与 API 服务商提供的名称一致
- 某些第三方服务可能有防护，建议使用官方 API

## 📂 项目结构

```
wedigest/
├── prisma/                # Prisma 配置
│   ├── schema.prisma     # 数据库模型定义
│   └── dev.db            # SQLite 数据库文件（运行时生成）
├── public/                # 静态资源
├── scripts/               # 工具脚本
│   ├── check-env.js      # 环境检查
│   └── create-tables.js # 备用表创建脚本
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/        # API Routes
│   │   │   ├── auth/           # NextAuth 认证
│   │   │   ├── fetch/          # 文章抓取
│   │   │   ├── summarize/      # AI 笔记生成
│   │   │   ├── history/       # 历史记录
│   │   │   ├── settings/       # 设置管理
│   │   │   │   └── test-api/ # API 测试接口
│   │   │   └── export/        # 导出功能
│   │   ├── history/     # 历史记录页面
│   │   ├── login/       # 登录/注册页面
│   │   ├── result/      # 笔记结果页面
│   │   ├── settings/    # 设置页面
│   │   ├── layout.tsx   # 根布局
│   │   └── page.tsx     # 首页
│   ├── components/       # React 组件
│   │   ├── ui/         # shadcn/ui 组件
│   │   ├── providers.tsx # Provider 配置
│   │   └── auth-guard.tsx # 认证守卫
│   ├── lib/            # 核心业务逻辑
│   │   ├── ai-providers/    # AI 供应商适配层
│   │   │   ├── base.ts         # 基础抽象类
│   │   │   ├── openai.ts       # OpenAI 实现
│   │   │   ├── deepseek.ts     # DeepSeek 实现
│   │   │   ├── zhipu.ts        # 智谱AI 实现
│   │   │   └── index.ts        # Provider 工厂
│   │   ├── scraper/         # 文章抓取模块
│   │   │   ├── puppeteer.ts    # Puppeteer 封装
│   │   │   ├── parser.ts       # 内容解析
│   │   │   └── index.ts        # 统一入口
│   │   ├── auth.ts          # NextAuth 配置
│   │   ├── db.ts            # Prisma 客户端
│   │   ├── crypto.ts        # 加密工具
│   │   └── utils.ts         # 工具函数
│   ├── store/           # Zustand 状态管理
│   │   └── app-store.ts  # 应用状态
│   └── types/           # TypeScript 类型定义
│       ├── article.ts
│       ├── ai-provider.ts
│       ├── api.ts
│       └── next-auth.d.ts
├── .env                 # 环境变量
├── .env.example         # 环境变量示例
├── AGENTS.md            # 代理编码指南
├── API_BYPASS.md        # API 防护绕过说明
├── NOTE_FEATURE.md      # 学习笔记功能说明
└── README.md            # 项目说明
```

## 🗄️ 数据库管理

### 可用命令

```bash
# 初始化数据库
npm run db:init

# 生成 Prisma Client
npx prisma generate

# 推送数据库结构
npx prisma db push

# 重新编译 better-sqlite3 (Windows 上遇到问题)
npm run db:rebuild

# 使用备用脚本创建表
npm run db:create-tables

# 环境检查
npm run db:check
```

### 数据模型

- **User** - 用户信息
- **ApiKey** - 加密存储的 API 密钥（包含自定义配置）
- **Summary** - 学习笔记历史记录

## 🔌 API 端点

### 认证
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js 认证
- `POST /api/register` - 用户注册

### 文章处理
- `POST /api/fetch` - 抓取微信公众号文章
- `POST /api/summarize` - 生成 AI 学习笔记

### 历史记录
- `GET /api/history` - 获取历史记录
- `GET /api/history/[id]` - 获取单条记录
- `DELETE /api/history/[id]` - 删除记录

### 设置
- `GET /api/settings/api-key` - 获取 API Keys
- `POST /api/settings/api-key` - 保存 API Key
- `DELETE /api/settings/api-key` - 删除 API Key
- `POST /api/settings/test-api` - 测试 API 连接

### 导出
- `GET /api/export` - 导出学习笔记为 Markdown

## 🚢 部署

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

### 部署平台建议

#### Vercel (推荐)
- 零配置部署
- 自动 HTTPS
- 全球 CDN
- 注意：需要配置环境变量

#### Railway
- 支持 SQLite
- 自动持久化存储
- 简单易用

#### VPS / 自建 (最灵活)
- 完全控制
- 可使用任意数据库
- 适合高并发场景

### 生产环境注意事项

1. **更换密钥**
   - `AUTH_SECRET` - 使用 `openssl rand -base64 32` 生成
   - `ENCRYPTION_KEY` - 使用强随机字符串

2. **配置数据库**
   - 生产环境建议使用 PostgreSQL 或 MySQL
   - 修改 `DATABASE_URL` 环境变量
   - 运行 `npx prisma migrate deploy`

3. **设置环境变量**
   - 确保所有敏感信息通过环境变量配置
   - 不要将 `.env` 文件提交到版本控制

4. **HTTPS 配置**
   - 使用反向代理（Nginx、Caddy）
   - 配置 SSL 证书
   - 启用 HSTS

## 🧪 开发指南

### 运行开发服务器

```bash
npm run dev
```

### 代码检查

```bash
npm run lint
```

### 添加新的 AI 供应商

1. 在 `src/types/ai-provider.ts` 中添加供应商类型
2. 在 `src/lib/ai-providers/` 中创建新的供应商适配器
3. 继承 `BaseAIProvider` 抽象类
4. 实现 `summarize` 方法
5. 在 `src/lib/ai-providers/index.ts` 中注册供应商
6. 在 `src/app/page.tsx` 中添加 UI 选项

### 修改笔记提示词

编辑 `src/lib/ai-providers/base.ts` 中的 `buildPrompt` 方法，自定义：
- 笔记风格指导
- 输出格式要求
- 字数限制

## ❓ 常见问题

### 1. 数据库初始化失败

**问题：** Windows 上 Prisma 引擎报错

**解决方案：**
```bash
npm run db:init
```

如果仍然失败：
```bash
npm run db:rebuild
```

### 2. Puppeteer 抓取失败

**问题：** Chromium 下载失败或启动失败

**解决方案：**
- 确保已安装完整依赖：`npm install puppeteer`
- 检查网络连接
- 使用备用抓取方式

### 3. AI API 调用失败

**问题：** 连接超时或返回错误

**解决方案：**
- 检查 API Key 配置是否正确
- 确认 API 地址和模型名称
- 尝试使用官方 API（第三方服务可能有防护）
- 查看 `API_BYPASS.md` 了解防护绕过方案

### 4. Windows 上编译失败

**问题：** better-sqlite3 编译失败

**解决方案：**
- 安装 Visual C++ Redistributable: https://aka.ms/vs/17/release/vc_redist.x64.exe
- 运行 `npm run db:rebuild` 重新编译

### 5. 学习笔记格式不正确

**问题：** AI 返回的内容格式不符合预期

**解决方案：**
- 查看终端日志确认实际请求内容
- 尝试不同的 AI 模型
- 调整笔记风格（简洁版/详细版/要点版）

## 📚 相关文档

- [AGENTS.md](AGENTS.md) - 代理编码指南
- [QUICKSTART.md](QUICKSTART.md) - 快速开始指南
- [API_BYPASS.md](API_BYPASS.md) - API 防护绕过说明
- [API_TROUBLESHOOTING.md](API_TROUBLESHOOTING.md) - API 连接问题排查
- [NOTE_FEATURE.md](NOTE_FEATURE.md) - 学习笔记功能说明

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范

- 遵循现有的代码风格
- 添加必要的类型定义
- 编写清晰的提交信息
- 更新相关文档

## 📄 开源协议

本项目采用 [MIT](LICENSE) 开源协议。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Prisma](https://www.prisma.io/) - ORM 工具
- [Radix UI](https://www.radix-ui.com/) - UI 组件库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [shadcn/ui](https://ui.shadcn.com/) - 组件库
- [OpenAI](https://openai.com/) - AI SDK
- [DeepSeek](https://www.deepseek.com/) - AI 服务商
- [智谱AI](https://open.bigmodel.cn/) - AI 服务商

## 📮 联系方式

- 问题反馈：提交 [Issue](https://github.com/your-username/wedigest/issues)
- 功能建议：提交 [Feature Request](https://github.com/your-username/wedigest/issues)

---

**注意：** 本项目仅供学习和个人使用，请勿用于商业用途。使用本工具抓取和总结文章时，请遵守相关法律法规和服务条款。
