# API 防护绕过说明

## 问题说明

某些第三方 API 中转服务（如 Cloudflare 保护）会检测请求来源，如果是程序化请求（非浏览器），会返回验证页面或拒绝访问。

**常见防护措施：**
- Cloudflare Turnstile 验证
- User-Agent 检测
- Referer 检测
- 请求频率限制

## 解决方案

已在代码中添加以下请求头来模拟浏览器请求：

### 1. User-Agent 伪装
```javascript
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
```
模拟最新的 Chrome 浏览器。

### 2. Accept 系列请求头
```javascript
'Accept': 'application/json',
'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
'Accept-Encoding': 'gzip, deflate, br',
'Connection': 'keep-alive'
```

### 3. 缓存控制
```javascript
'Cache-Control': 'no-cache',
'Pragma': 'no-cache'
```

### 4. 超时和重试
```javascript
timeout: 60000,  // 60秒超时
maxRetries: 2     // 失败后重试2次
```

## 已修改的文件

### 1. src/lib/ai-providers/openai.ts
- 添加 `defaultHeaders` 配置
- 增加超时到 60 秒
- 添加重试机制

### 2. src/lib/ai-providers/deepseek.ts
- 添加 `defaultHeaders` 配置
- 增加超时到 60 秒
- 添加重试机制

### 3. src/lib/ai-providers/zhipu.ts
- 添加请求头到 fetch 调用
- 保持原有配置

## 测试建议

如果仍然遇到防护问题，可以尝试：

### 1. 使用官方 API
- DeepSeek: https://platform.deepseek.com
- OpenAI: https://platform.openai.com
- 智谱AI: https://open.bigmodel.cn

官方 API 通常更稳定，没有防护限制。

### 2. 更换第三方服务
如果第三方服务防护过严，考虑：
- 联系服务提供商获取白名单
- 使用其他可靠的中转服务
- 部署自己的 API 中转服务

### 3. 检查网络环境
- 确保网络稳定
- 检查是否有代理/防火墙干扰
- 尝试不同的网络环境

## 常见错误及解决

### 错误：返回 HTML 验证页面
**原因：** 防护检测到非浏览器请求
**解决：** 已添加浏览器请求头，如果仍有问题，联系服务提供商

### 错误：403 Forbidden
**原因：** IP 被限制或需要认证
**解决：**
- 检查 API Key 是否正确
- 尝试不同的网络
- 联系服务提供商

### 错误：Connection error / ECONNRESET
**原因：** 连接被重置
**解决：**
- 检查 API 地址是否正确
- 确认服务可用性
- 尝试使用官方 API

## 注意事项

1. **不要滥用请求** - 避免触发频率限制
2. **遵守服务条款** - 合法合规使用 API
3. **定期更新** - User-Agent 等可能需要更新
4. **监控日志** - 查看实际的响应内容

## 相关资源

- [Cloudflare Challenge Bypass](https://developers.cloudflare.com/turnstile/)
- [OpenAI API Best Practices](https://platform.openai.com/docs/guides/production-best-practices)
- [HTTP Headers Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
