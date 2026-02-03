#!/usr/bin/env node

/**
 * 清理 Next.js 开发服务器锁定文件
 *
 * 问题：当 next dev 进程异常退出时（如 Ctrl+C、系统崩溃、终端关闭等），
 * .next/dev/lock 文件可能不会被清理，导致下次启动时出现错误：
 * "Unable to acquire lock at .next/dev/lock, is another instance of next dev running?"
 *
 * 解决方案：在启动 next dev 之前自动检查并删除锁定文件
 */

const fs = require('fs');
const path = require('path');

const lockFilePath = path.join(process.cwd(), '.next', 'dev', 'lock');

function cleanDevLock() {
  try {
    if (fs.existsSync(lockFilePath)) {
      fs.unlinkSync(lockFilePath);
      console.log('✓ Cleaned Next.js dev lock file');
    }
  } catch (error) {
    // 忽略错误（文件可能不存在或无权限）
    if (error.code !== 'ENOENT') {
      console.warn('⚠ Warning: Could not clean dev lock file:', error.message);
    }
  }
}

cleanDevLock();
