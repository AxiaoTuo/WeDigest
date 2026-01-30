# WeDigest 快速开始指南

## 1. 安装依赖

```bash
npm install
```

## 2. 生成 Prisma 客户端

```bash
npx prisma generate
```

## 3. 配置环境变量

`.env` 文件已经预设了基本配置，你可以修改以下内容：

- `AUTH_SECRET`: 生产环境请使用 `openssl rand -base64 32` 生成新密钥
- `ENCRYPTION_KEY`: API Key 加密密钥，生产环境请更换

## 4. 初始化数据库

由于 Windows 环境下 Prisma migrate 可能遇到引擎问题，项目提供了两种初始化方式：

### 方式 1: 自动初始化（推荐）
直接运行开发服务器，会自动创建数据库文件：
```bash
npm run dev
```

### 方式 2: 手动初始化
```bash
npm run db:init
```

## 5. 首次使用

1. 访问 http://localhost:3000
2. 点击右上角"登录"按钮
3. 切换到"注册"标签页注册新账号
4. 登录后进入"设置"页面
5. 配置至少一个 AI Provider 的 API Key
6. 返回首页开始使用

## 获取 AI API Key

### DeepSeek (推荐，性价比最高)
1. 访问 https://platform.deepseek.com
2. 注册账号
3. 进入 API Keys 页面创建密钥
4. 复制 API Key 到设置页面

### OpenAI
1. 访问 https://platform.openai.com/api-keys
2. 登录或注册账号
3. 创建新的 API Key
4. 复制到设置页面

### 智谱AI
1. 访问 https://open.bigmodel.cn
2. 注册并实名认证
3. 进入控制台创建 API Key
4. 复制到设置页面

## 使用流程

1. **输入链接**: 粘贴微信公众号文章链接（格式：https://mp.weixin.qq.com/s/...）
2. **选择 AI 模型**: 选择已配置的 AI 供应商
3. **选择摘要风格**:
   - 简洁版：200字以内核心观点
   - 详细版：300-500字全面总结（推荐）
   - 要点版：5-7个关键要点列表
4. **生成摘要**: 点击按钮开始处理
5. **查看结果**: 自动跳转到结果页面
6. **导出下载**: 支持下载 Markdown 文件或复制到剪贴板

## 常见问题

### Q: 数据库初始化失败？
A: Windows 环境下如果 Prisma 引擎报错，运行 `npm run db:init` 创建数据库文件，然后手动创建表结构或直接启动应用（应用会在首次访问时初始化表）。

### Q: Puppeteer 启动失败？
A:
- 开发环境：确保已安装完整 `puppeteer` 包
- 生产环境：使用 `puppeteer-core` + `@sparticuz/chromium`

### Q: 文章抓取失败？
A:
- 检查链接是否为有效的微信公众号文章
- 某些文章可能有反爬保护，可以多试几次
- 检查网络连接

### Q: AI 总结失败？
A:
- 检查对应 Provider 的 API Key 是否正确配置
- 确认 API Key 有足够的额度
- 检查网络是否能访问对应的 API 服务

## 项目结构说明

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API 路由
│   │   ├── auth/           # NextAuth 认证
│   │   ├── fetch/          # 文章抓取
│   │   ├── summarize/      # AI 总结
│   │   ├── history/        # 历史记录
│   │   ├── settings/       # 设置管理
│   │   └── export/         # 导出下载
│   ├── page.tsx            # 首页
│   ├── result/page.tsx     # 结果展示页
│   ├── history/page.tsx    # 历史记录页
│   ├── settings/page.tsx   # 设置页
│   └── login/page.tsx      # 登录注册页
├── components/             # React 组件
│   ├── ui/                 # shadcn/ui 组件
│   ├── providers.tsx       # NextAuth Provider
│   └── auth-guard.tsx      # 认证守卫（备用）
├── lib/                    # 核心业务逻辑
│   ├── ai-providers/       # AI 供应商适配层
│   │   ├── base.ts         # 基础抽象类
│   │   ├── openai.ts       # OpenAI 实现
│   │   ├── deepseek.ts     # DeepSeek 实现
│   │   ├── zhipu.ts        # 智谱AI 实现
│   │   └── index.ts        # Provider 工厂
│   ├── scraper/            # 文章抓取
│   │   ├── puppeteer.ts    # Puppeteer 封装
│   │   ├── parser.ts       # 内容解析
│   │   └── index.ts        # 统一入口
│   ├── auth.ts             # NextAuth 配置
│   ├── db.ts               # Prisma 客户端
│   └── crypto.ts           # 加密工具
├── store/                  # 状态管理
│   └── app-store.ts        # Zustand store
└── types/                  # TypeScript 类型
    ├── article.ts
    ├── ai-provider.ts
    ├── api.ts
    └── next-auth.d.ts
```

## 开发提示

- 使用 `npm run dev` 启动开发服务器（自动初始化数据库）
- 数据库文件位于 `prisma/dev.db`
- 所有用户数据和 API Key 均加密存储
- 历史记录按用户隔离，自动关联
- 支持热重载，修改代码后自动刷新

## 部署说明

由于项目使用 SQLite 文件数据库和 Puppeteer，部署时需要注意：

1. **Railway/Render**: 需要挂载持久卷用于 SQLite 文件
2. **Vercel**: 不推荐（无持久化存储）
3. **VPS/自建**: 推荐，完全控制

详见主 README.md 的部署章节。
