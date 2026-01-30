# WeDigest 设计系统

基于 ui-ux-pro-max Skill 生成的设计系统

## 产品定位

**类型**: AI/Chatbot Platform + Productivity Tool  
**关键词**: AI, 文章总结, 生产力, 学习笔记, SaaS  
**目标用户**: 技术工作者、开发者、内容创作者、知识管理爱好者

## 设计风格

**推荐风格**: AI-Native UI + Minimalism  
**核心理念**: 简洁、专业、高效、信任感  
**避免风格**: 过度装饰、复杂动画、低对比度设计

## 配色方案

| 用途 | 颜色 | HSL | Tailwind | 说明 |
|------|------|-----|----------|------|
| Primary | #6366F1 | 239, 63%, 66% | `indigo-600` | AI品牌色，代表智能与科技 |
| Secondary | #9333EA | 270, 78%, 60% | `purple-600` | 渐变搭配，增强视觉吸引力 |
| Background | #F8FAFC | 210, 40%, 98% | `slate-50` | 柔和背景，减少眼睛疲劳 |
| Text Primary | #0F172A | 222, 47%, 11% | `slate-900` | 高对比度主文本 |
| Text Secondary | #475569 | 215, 16%, 41% | `slate-600` | 次要文本，降低视觉噪音 |
| Success | #10B981 | 158, 64%, 42% | `emerald-500` | 成功状态、完成标记 |
| Border | #E2E8F0 | 210, 40%, 88% | `slate-200` | 卡片边框，适度分隔 |

### 渐变方案

- **Hero标题**: `from-slate-900 via-indigo-800 to-purple-800`
- **CTA按钮**: `from-indigo-600 to-purple-600`
- **Logo图标**: `from-indigo-600 to-purple-600`
- **页面背景**: `from-slate-50 via-white to-indigo-50`

## 字体系统

**字族**: System Sans-Serif (Inter/San Francisco)  
**字重**: Regular (400), Medium (500), Semibold (600), Bold (700)

| 用途 | 大小 | 字重 | 行高 | 字母间距 |
|------|------|------|------|----------|
| Hero Title | 5xl (48px) | Bold | 1.1 | -0.02em |
| Section Title | 2xl (24px) | Semibold | 1.3 | normal |
| Card Title | Base (16px) | Semibold | 1.5 | normal |
| Body | Base (16px) | Regular | 1.6 | normal |
| Small | Sm (14px) | Regular | 1.5 | normal |

## 间距系统

基于 TailwindCSS 的 spacing scale:

| 用途 | 值 | 说明 |
|------|-----|------|
| Container Padding | px-6 (24px) | 移动端适配 |
| Section Spacing | py-16 (64px) | 区块分隔 |
| Card Spacing | p-6 (24px) | 卡片内边距 |
| Element Gap | gap-2 (8px) | 紧密元素 |
| Block Gap | gap-4 (16px) | 区块间距 |
| Section Gap | gap-6 (24px) | 大区块间距 |

## 圆角方案

| 元素类型 | 圆角 | Tailwind | 说明 |
|---------|------|----------|------|
| 按钮和输入框 | 8px | `rounded-lg` | 标准交互元素 |
| 卡片 | 12px | `rounded-xl` | 现代卡片风格 |
| Logo图标 | 8px | `rounded-lg` | 小型品牌元素 |
| 标签/徽章 | 9999px | `rounded-full` | 柔和标签 |

## 阴影系统

| 强度 | 值 | 用途 |
|------|-----|------|
| 轻微 | `shadow-sm` | 悬停状态 |
| 中等 | `shadow-md` | 卡片悬停 |
| 强烈 | `shadow-lg` | CTA按钮 |
| 超强 | `shadow-xl` | CTA按钮悬停 |

## 交互设计

### 动画时长

- 微交互: 150-200ms
- 状态切换: 200-300ms
- 复杂动画: 300-500ms

### 过渡效果

```css
/* 颜色变化 */
transition-colors duration-200

/* 阴影变化 */
transition-shadow duration-300

/* 综合过渡 */
transition-all duration-300
```

### 状态样式

- **默认**: 纯色，轻微阴影
- **悬停**: 颜色加深，阴影增强，轻微位移
- **激活**: 颜色更深，位移回原位
- **禁用**: 降低透明度，移除交互

## 组件规范

### 按钮

**主按钮 (CTA)**:
- 高度: h-12 (48px)
- 背景: 渐变 `from-indigo-600 to-purple-600`
- 悬停: `from-indigo-700 to-purple-700` + `shadow-xl`
- 圆角: `rounded-lg`
- 阴影: `shadow-lg`

**次按钮 (Ghost)**:
- 背景: 透明
- 悬停: `bg-slate-100`
- 颜色: `text-slate-700`

### 卡片

**输入卡片**:
- 边框: `border-2 border-slate-200`
- 阴影: `shadow-xl`
- 悬停: 保持原样（避免误触发）

**特性卡片**:
- 边框: `border-slate-200`
- 悬停: `border-indigo-300` + `shadow-md`
- 动画: `transition-all`

**信息卡片**:
- 背景: 渐变 `from-indigo-50 to-purple-50`
- 边框: `border-indigo-200`

### 输入框

- 高度: h-12 (48px)
- 占位符: text-slate-400
- 聚焦: ring-2 ring-indigo-600
- 圆角: rounded-lg

## 图标使用

- **图标库**: Lucide React
- **大小**: 
  - Logo/品牌: 24px (h-6 w-6)
  - 按钮内联: 20px (h-5 w-5)
  - 小型标记: 16px (h-4 w-4)
- **颜色**:
  - 主图标: 与文本同色
  - 彩色图标: 渐变背景 + 白色图标

## 响应式设计

### 断点

- 移动: < 768px
- 平板: 768px - 1024px
- 桌面: > 1024px

### 移动端优化

- 最小触摸目标: 44x44px
- 文本大小: 最小 16px
- 间距增加: 增大 padding 和 gap
- 按钮全宽: 移动端 CTA 占满宽度

## 可访问性

### 颜色对比

- 文本对比度: 最小 4.5:1 (WCAG AA)
- 大文本对比度: 最小 3:1 (WCAG AA)
- 交互元素对比度: 最小 3:1

### 键盘导航

- Tab 顺序: 符合视觉顺序
- 焦点可见: ring-2 ring-indigo-600
- Enter/Space: 激活交互元素

### 屏幕阅读器

- 语义化 HTML: 使用正确的标签
- aria-label: 图标按钮添加
- alt 文本: 图片提供描述

## 性能优化

- 图片优化: 使用 WebP 格式，懒加载
- 代码分割: Next.js 自动处理
- 字体优化: 使用 system fonts
- 减少重绘: 使用 transform/opacity 而非 width/height

## 反模式避免

❌ **不要做的**:
- 使用 emoji 作为图标（使用 SVG）
- 使用默认蓝色背景的玻璃效果（太透明）
- 悬停时使用 scale transform（导致布局偏移）
- 过度动画（> 300ms）
- 低对比度文本

✅ **应该做的**:
- 使用 Lucide SVG 图标
- 为可点击元素添加 cursor-pointer
- 悬停时提供视觉反馈
- 使用平滑过渡（150-300ms）
- 保持高对比度

## 设计检查清单

发布前检查:

- [ ] 无 emoji 图标
- [ ] 所有图标使用统一库 (Lucide)
- [ ] 悬停状态不导致布局偏移
- [ ] 使用主题颜色直接 (bg-indigo-600)
- [ ] 所有可点击元素有 cursor-pointer
- [ ] 悬停提供清晰视觉反馈
- [ ] 过渡时间在 150-300ms
- [ ] 焦点状态可见
- [ ] 浅色模式文本有足够对比度 (4.5:1)
- [ ] 浅色模式中玻璃/透明元素可见
- [ ] 边框在两种模式下可见
- [ ] 响应式在 375px, 768px, 1024px, 1440px 测试
- [ ] 移动端无水平滚动
- [ ] 所有图片有 alt 文本
- [ ] 表单输入有标签
- [ ] 颜色不是唯一指示器
- [ ] prefers-reduced-motion 被尊重
