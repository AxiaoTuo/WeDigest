import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ResultSkeleton() {
  return (
    <div className="space-y-6">
      {/* 标题区域 */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-3/4 rounded-md" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-24 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-32 rounded-md" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </div>

      {/* 内容区域 */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-full rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-5/6 rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-4/5 rounded-md" />

          <div className="space-y-2 pt-4">
            <Skeleton className="h-5 w-1/3 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-11/12 rounded-md" />
          </div>

          <div className="space-y-2 pt-4">
            <Skeleton className="h-5 w-1/4 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
          </div>

          {/* 列表项 */}
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-12 rounded-md" />
            <Skeleton className="h-3 w-full rounded-md pl-4" />
            <Skeleton className="h-3 w-11/12 rounded-md pl-4" />
            <Skeleton className="h-3 w-full rounded-md pl-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
