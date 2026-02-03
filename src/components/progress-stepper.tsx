'use client'

import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ProgressStep = 'validate' | 'fetch' | 'analyze' | 'generate'

export interface ProgressStepperProps {
  currentStep: ProgressStep
  steps?: {
    id: ProgressStep
    label: string
    description: string
  }[]
  className?: string
}

const defaultSteps = [
  {
    id: 'validate' as ProgressStep,
    label: '验证链接',
    description: '检查链接格式和有效性'
  },
  {
    id: 'fetch' as ProgressStep,
    label: '抓取文章',
    description: '从微信公众号获取文章内容'
  },
  {
    id: 'analyze' as ProgressStep,
    label: '分析内容',
    description: 'AI 解析文章结构和关键信息'
  },
  {
    id: 'generate' as ProgressStep,
    label: '生成摘要',
    description: '生成深度研报级学习笔记'
  }
]

export function ProgressStepper({
  currentStep,
  steps = defaultSteps,
  className
}: ProgressStepperProps) {
  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  const getStepStatus = (index: number): 'pending' | 'active' | 'completed' => {
    if (index < currentStepIndex) return 'completed'
    if (index === currentStepIndex) return 'active'
    return 'pending'
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        {/* Progress Line Background */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700" />

        {/* Active Progress Line */}
        <div
          className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500 ease-out"
          style={{
            width: `${(currentStepIndex / (steps.length - 1)) * 100}%`
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(index)

            return (
              <div
                key={step.id}
                className="flex flex-col items-center gap-2"
                style={{ width: `${100 / steps.length}%` }}
              >
                {/* Step Icon */}
                <div
                  className={cn(
                    'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300',
                    status === 'completed' && 'border-indigo-600 bg-indigo-600 dark:border-indigo-400 dark:bg-indigo-400',
                    status === 'active' && 'border-indigo-600 bg-white dark:border-indigo-400 dark:bg-slate-800 animate-pulse',
                    status === 'pending' && 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'
                  )}
                >
                  {status === 'completed' && (
                    <CheckCircle2 className="w-5 h-5 text-white dark:text-slate-900" />
                  )}
                  {status === 'active' && (
                    <Loader2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
                  )}
                  {status === 'pending' && (
                    <Circle className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                  )}
                </div>

                {/* Step Labels */}
                <div className="flex flex-col items-center gap-0.5">
                  <span
                    className={cn(
                      'text-xs font-medium transition-colors duration-300',
                      status === 'completed' && 'text-indigo-600 dark:text-indigo-400',
                      status === 'active' && 'text-indigo-600 dark:text-indigo-400 font-semibold',
                      status === 'pending' && 'text-slate-500 dark:text-slate-500'
                    )}
                  >
                    {step.label}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] transition-colors duration-300 hidden sm:block',
                      status === 'active' ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500 dark:text-slate-600'
                    )}
                  >
                    {step.description}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Current Step Info (Mobile) */}
      <div className="mt-4 sm:hidden">
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
          {steps[currentStepIndex]?.description || '处理中...'}
        </p>
      </div>
    </div>
  )
}

// Compact version for smaller spaces
export function ProgressStepperCompact({
  currentStep,
  steps = defaultSteps,
  className
}: ProgressStepperProps) {
  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {steps.map((step, index) => {
        const isActive = index === currentStepIndex
        const isCompleted = index < currentStepIndex

        return (
          <div key={step.id} className="flex items-center">
            {/* Step Dot */}
            <div
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                isCompleted && 'bg-indigo-600 dark:bg-indigo-400',
                isActive && 'bg-indigo-600 dark:bg-indigo-400 animate-pulse',
                !isActive && !isCompleted && 'bg-slate-300 dark:bg-slate-600'
              )}
            />

            {/* Step Label for active step */}
            {isActive && (
              <span className="ml-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                {step.label}
              </span>
            )}

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-4 h-0.5 mx-1 transition-colors duration-300',
                  isCompleted ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-slate-200 dark:bg-slate-700'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
