#!/usr/bin/env node

/**
 * 清理 Next.js 缓存目录
 *
 * 解决问题：
 * - Turbopack 缓存损坏导致 panic 错误
 * - 构建产物异常
 * - 开发服务器启动失败
 */

const fs = require('fs');
const path = require('path');

function cleanCache() {
  const cacheDir = path.join(process.cwd(), '.next');

  try {
    if (fs.existsSync(cacheDir)) {
      // 递归删除目录
      fs.rmSync(cacheDir, { recursive: true, force: true });
      console.log('✓ Cleaned .next cache directory');
    } else {
      console.log('✓ No .next cache directory found');
    }
  } catch (error) {
    console.warn('⚠ Warning: Could not clean cache:', error.message);
    process.exit(1);
  }
}

cleanCache();
