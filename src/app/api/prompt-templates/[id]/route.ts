import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  category: z.enum(['custom', 'technology', 'academic', 'product', 'news', 'tutorial', 'research']).optional(),
  prompt: z.string().min(1).optional(),
  variables: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional()
})

// GET /api/prompt-templates/[id] - 获取单个模板
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const { id } = params

    // 预设模板以 preset_ 开头
    if (id.startsWith('preset_')) {
      const { PRESET_TEMPLATES } = await import('@/lib/prompts/presets')
      const presetName = id.replace('preset_', '')
      const preset = PRESET_TEMPLATES.find(t => t.name === presetName)

      if (!preset) {
        return NextResponse.json(
          { success: false, error: '模板不存在' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          ...preset,
          id,
          userId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })
    }

    // 用户自定义模板
    const template = await prisma.promptTemplate.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!template) {
      return NextResponse.json(
        { success: false, error: '模板不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...template,
        variables: JSON.parse(template.variables)
      }
    })
  } catch (error) {
    console.error('Get template error:', error)
    return NextResponse.json(
      { success: false, error: '获取模板失败' },
      { status: 500 }
    )
  }
}

// PATCH /api/prompt-templates/[id] - 更新模板
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const { id } = params

    // 预设模板不允许修改
    if (id.startsWith('preset_')) {
      return NextResponse.json(
        { success: false, error: '预设模板不允许修改' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const updates = updateTemplateSchema.parse(body)

    // 如果更新了 prompt，重新提取变量
    let variables = updates.variables
    if (updates.prompt && !updates.variables) {
      const variablePattern = /\{(\w+)\}/g
      const extractedVars: string[] = []
      let match
      while ((match = variablePattern.exec(updates.prompt)) !== null) {
        if (!extractedVars.includes(match[1])) {
          extractedVars.push(match[1])
        }
      }
      variables = extractedVars
    }

    const template = await prisma.promptTemplate.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!template) {
      return NextResponse.json(
        { success: false, error: '模板不存在' },
        { status: 404 }
      )
    }

    const updated = await prisma.promptTemplate.update({
      where: { id },
      data: {
        ...updates,
        ...(variables && { variables: JSON.stringify(variables) })
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        variables: JSON.parse(updated.variables)
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Update template error:', error)
    return NextResponse.json(
      { success: false, error: '更新模板失败' },
      { status: 500 }
    )
  }
}

// DELETE /api/prompt-templates/[id] - 删除模板
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const { id } = params

    // 预设模板不允许删除
    if (id.startsWith('preset_')) {
      return NextResponse.json(
        { success: false, error: '预设模板不允许删除' },
        { status: 400 }
      )
    }

    // 验证模板属于当前用户
    const template = await prisma.promptTemplate.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!template) {
      return NextResponse.json(
        { success: false, error: '模板不存在' },
        { status: 404 }
      )
    }

    await prisma.promptTemplate.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      data: { id }
    })
  } catch (error) {
    console.error('Delete template error:', error)
    return NextResponse.json(
      { success: false, error: '删除模板失败' },
      { status: 500 }
    )
  }
}
