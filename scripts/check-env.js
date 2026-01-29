const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('='.repeat(60))
console.log('WeDigest 环境检查工具')
console.log('='.repeat(60))

const checks = []

// 检查 Node.js 版本
function checkNodeVersion() {
  const version = process.version
  const major = parseInt(version.slice(1).split('.')[0])
  const passed = major >= 18

  checks.push({
    name: 'Node.js 版本',
    status: passed ? '✓' : '✗',
    message: passed ? `当前版本 ${version} (需要 >= 18.0.0)` : `当前版本 ${version} (需要 >= 18.0.0)`,
    passed
  })
}

// 检查 Python 安装
function checkPython() {
  try {
    execSync('python --version', { stdio: 'pipe' })
    checks.push({
      name: 'Python',
      status: '✓',
      message: '已安装',
      passed: true
    })
  } catch {
    checks.push({
      name: 'Python',
      status: '✗',
      message: '未安装 (编译 better-sqlite3 需要)',
      passed: false
    })
  }
}

// 检查 Visual C++ Redistributable
function checkVCRedist() {
  const programFiles = process.env.PROGRAMFILES || 'C:\\Program Files'
  const programFilesX86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)'

  const vcPaths = [
    path.join(programFiles, 'Microsoft Visual Studio'),
    path.join(programFilesX86, 'Microsoft Visual Studio'),
    path.join(programFiles, 'Windows Kits'),
    path.join(programFilesX86, 'Windows Kits')
  ]

  const hasVC = vcPaths.some(p => fs.existsSync(p))

  checks.push({
    name: 'Visual C++ Redistributable',
    status: hasVC ? '✓' : '⚠',
    message: hasVC ? '已安装' : '可能未安装，建议安装',
    passed: true
  })
}

// 检查数据库文件
function checkDatabase() {
  const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db')
  const exists = fs.existsSync(dbPath)

  checks.push({
    name: '数据库文件',
    status: exists ? '✓' : '⚠',
    message: exists ? '已存在' : '未初始化 (运行 npm run db:setup)',
    passed: true
  })
}

// 检查 Prisma Client
function checkPrismaClient() {
  const nodeModules = path.join(__dirname, '..', 'node_modules', '@prisma', 'client')
  const exists = fs.existsSync(nodeModules)

  checks.push({
    name: 'Prisma Client',
    status: exists ? '✓' : '✗',
    message: exists ? '已生成' : '未生成 (运行 npm run db:generate)',
    passed: exists
  })
}

// 检查 better-sqlite3
function checkBetterSqlite3() {
  try {
    require('better-sqlite3')
    checks.push({
      name: 'better-sqlite3',
      status: '✓',
      message: '已安装',
      passed: true
    })
  } catch {
    checks.push({
      name: 'better-sqlite3',
      status: '✗',
      message: '未安装或编译失败',
      passed: false
    })
  }
}

// 检查 .npmrc 配置
function checkNpmrc() {
  const npmrcPath = path.join(__dirname, '..', '.npmrc')
  const exists = fs.existsSync(npmrcPath)

  checks.push({
    name: '.npmrc 配置',
    status: exists ? '✓' : '⚠',
    message: exists ? '已配置' : '未配置 (建议创建以避免淘宝镜像问题)',
    passed: true
  })
}

// 运行所有检查
checkNodeVersion()
checkPython()
checkVCRedist()
checkDatabase()
checkPrismaClient()
checkBetterSqlite3()
checkNpmrc()

// 打印结果
console.log('')
console.log('检查结果:')
console.log('-'.repeat(60))

let allPassed = true
checks.forEach(check => {
  console.log(`${check.status} ${check.name.padEnd(25)} ${check.message}`)
  if (!check.passed) allPassed = false
})

console.log('='.repeat(60))

if (!allPassed) {
  console.log('')
  console.log('发现问题:')
  console.log('')
  checks.filter(c => !c.passed).forEach(check => {
    console.log(`  - ${check.name}: ${check.message}`)
  })
  console.log('')
  console.log('建议操作:')
  console.log('  1. 安装 Visual C++ Redistributable: https://aka.ms/vs/17/release/vc_redist.x64.exe')
  console.log('  2. 运行: npm install')
  console.log('  3. 运行: npm run db:rebuild')
  console.log('  4. 运行: npm run db:setup')
  process.exit(1)
} else {
  console.log('')
  console.log('✓ 所有检查通过!')
  console.log('')
  console.log('可以运行以下命令启动开发服务器:')
  console.log('  npm run dev')
}

console.log('='.repeat(60))
