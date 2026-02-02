import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PRESET_TEMPLATES } from '@/lib/prompts/presets'
import { PromptCategory } from '@/types/prompt'

const createTemplateSchema = z.object({
  name: z.string().min(1, '模板名称不能为空').max(100),
  description: z.string().optional(),
  category: z.enum(['custom', 'technology', 'academic', 'product', 'news', 'tutorial', 'research']),
  prompt: z.string().min(1, 'Prompt内容不能为空'),
  variables: z.array(z.string()).optional()
})

// GET /api/prompt-templates - 获取模板列表
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const includePresets = searchParams.get('includePresets') !== 'false'

    // 获取用户自定义模板
    const where: any = { userId: session.user.id }
    if (category && category !== 'all') {
      where.category = category
    }

    const userTemplates = await prisma.promptTemplate.findMany({
      where,
      orderBy: [
        { isFavorite: 'desc' },
        { usageCount: 'desc' },
        { updatedAt: 'desc' }
      ]
    })

    let templates = userTemplates.map(t => ({
      ...t,
      variables: JSON.parse(t.variables)
    }))

    // 添加系统预设模板（仅当用户没有自定义模板且请求的类别匹配时）
    if (includePresets) {
      const presetTemplates = PRESET_TEMPLATES.map(t => ({
        ...t,
        id: `preset_${t.name}`,
        userId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))

      // 如果指定了分类，只返回该分类的预设模板
      const filteredPresets = category && category !== 'all'
        ? presetTemplates.filter(t => t.category === category)
        : presetTemplates

      templates = [...filteredPresets, ...templates]
    }

    return NextResponse.json({
      success: true,
      data: templates
    })
  } catch (error) {
    console.error('Get templates error:', error)
    return NextResponse.json(
      { success: false, error: '获取模板失败' },
      { status: 500 }
    )
  }
}

// POST /api/prompt-templates - 创建自定义模板
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, category, prompt, variables } = createTemplateSchema.parse(body)

    // 提取 prompt 中的变量
    const variablePattern = /\{(\w+)\}/g
    const extractedVars: string[] = []
    let match
    while ((match = variablePattern.exec(prompt)) !== null) {
      if (!extractedVars.includes(match[1])) {
        extractedVars.push(match[1])
      }
    }

    const template = await prisma.promptTemplate.create({
      data: {
        userId: session.user.id,
        name,
        description,
        category,
        prompt,
        variables: JSON.stringify(variables || extractedVars),
        isSystem: false,
        isFavorite: false,
        usageCount: 0
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...template,
        variables: JSON.parse(template.variables)
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Create template error:', error)
    return NextResponse.json(
      { success: false, error: '创建模板失败' },
      { status: 500 }
    )
  }
}
