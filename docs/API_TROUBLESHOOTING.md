# API 连接问题排查指南

## 错误：Connection error / ECONNRESET

这个错误表示 HTTP 请求连接被重置，通常是配置问题。

## 排查步骤

### 1. 检查 API 地址格式

**正确的格式示例：**
- ✅ `https://api.deepseek.com` (官方地址)
- ✅ `https://elysiver.h-e.top/v1` (第三方中转)
- ✅ `https://api.openai.com/v1` (OpenAI)

**常见错误：**
- ❌ `elysiver.h-e.top/v1` (缺少 https://)
- ❌ `https://elysiver.h-e.top` (可能缺少 /v1)

### 2. 测试 API 地址是否可访问

使用 curl 或浏览器测试：

```bash
# 测试 DeepSeek 官方 API
curl -I https://api.deepseek.com

# 测试你的第三方地址
curl -I https://elysiver.h-e.top/v1
```

如果无法访问，说明地址不正确或服务不可用。

### 3. 检查第三方中转服务

如果你使用第三方中转服务（如 `elysiver.h-e.top`），需要：

- 确认服务状态正常
- 确认 API Key 与该服务兼容
- 查看服务文档，确认正确的请求格式

### 4. 使用官方 API 测试

为了验证是否是代码问题，可以先用官方 API 测试：

**官方 API Key 获取：**
1. 访问 https://platform.deepseek.com
2. 注册账号
3. 创建 API Key

**配置：**
- API 地址：留空（使用默认）
- 模型名称：留空（使用默认 deepseek-chat）
- API Key：输入你的官方 API Key

### 5. 查看详细日志

启动应用后，在终端会看到详细日志：

```
[DeepSeek] 使用配置:
  - baseUrl: https://elysiver.h-e.top/v1
  - model: deepseek-chat
  - API Key: sk-xxxxxx...
```

确认这些配置是否正确。

## 常见问题

### Q: 为什么会连接失败？

A: 可能原因：
- API 地址不正确或服务不可用
- 网络问题（防火墙、代理）
- 第三方中转服务不稳定
- API Key 不适用于该地址

### Q: 如何确定是配置问题还是代码问题？

A: 使用官方 API 测试：
1. 如果官方 API 能用，说明代码没问题，是第三方地址的问题
2. 如果官方 API 也不能用，说明可能是网络或 API Key 问题

### Q: 第三方中转服务不稳定怎么办？

A: 建议：
- 使用官方 API（更稳定）
- 更换其他可靠的中转服务
- 检查服务提供商的状态页面

## 快速解决方案

**方案 1：使用官方 API**
- 地址：留空
- 模型：留空
- Key：官方 API Key

**方案 2：检查第三方服务**
- 确认服务文档
- 测试服务是否可访问
- 尝试使用不同的模型名称

**方案 3：联系服务提供商**
如果使用第三方服务，联系他们确认：
- 服务状态
- 正确的 API 地址格式
- API Key 是否需要特殊格式
