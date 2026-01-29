const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const dbPath = path.join(__dirname, 'prisma', 'dev.db')
const prismaDir = path.join(__dirname, 'prisma')

console.log('='.repeat(50))
console.log('数据库初始化脚本')
console.log('='.repeat(50))

// 1. 确保 prisma 目录存在
if (!fs.existsSync(prismaDir)) {
  console.log('\n[1/4] 创建 prisma 目录...')
  fs.mkdirSync(prismaDir, { recursive: true })
  console.log('✓ prisma 目录已创建')
} else {
  console.log('\n[1/4] prisma 目录已存在')
}

// 2. 创建数据库文件
if (!fs.existsSync(dbPath)) {
  console.log('\n[2/4] 创建数据库文件...')
  try {
    fs.writeFileSync(dbPath, '')
    console.log(`✓ 数据库文件已创建: ${dbPath}`)
  } catch (err) {
    console.error('✗ 创建数据库文件失败:', err.message)
    process.exit(1)
  }
} else {
  console.log('\n[2/4] 数据库文件已存在')
}

// 3. 生成 Prisma Client
console.log('\n[3/4] 生成 Prisma Client...')
try {
  execSync('npx prisma generate', { stdio: 'inherit' })
  console.log('✓ Prisma Client 已生成')
} catch (err) {
  console.error('✗ Prisma Client 生成失败:', err.message)
  console.log('\n提示: 如果遇到 better-sqlite3 错误，请运行:')
  console.log('  npm run db:rebuild')
  process.exit(1)
}

// 4. 初始化表结构
console.log('\n[4/4] 初始化数据库表结构...')
try {
  // 先尝试使用 Prisma db push
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit', stdio: 'pipe' })
  console.log('✓ 数据库表结构已初始化')
} catch (err) {
  // 如果失败，使用备用脚本
  console.log('⚠ Prisma db push 失败，使用备用脚本...')
  try {
    execSync('node scripts/create-tables.js', { stdio: 'inherit' })
    console.log('✓ 数据库表结构已初始化 (备用脚本)')
  } catch (err2) {
    console.error('✗ 数据库表结构初始化失败:', err2.message)
    process.exit(1)
  }
}

console.log('\n' + '='.repeat(50))
console.log('数据库初始化完成!')
console.log('='.repeat(50))
