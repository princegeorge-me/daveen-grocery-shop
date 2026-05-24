import { cn } from '@/lib/utils'

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-2xl border border-border overflow-hidden', className)}>
      <div className="aspect-square shimmer-bg" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-20 shimmer-bg rounded" />
        <div className="h-4 w-full shimmer-bg rounded" />
        <div className="h-4 w-3/4 shimmer-bg rounded" />
        <div className="h-6 w-24 shimmer-bg rounded mt-3" />
        <div className="h-10 w-full shimmer-bg rounded-full mt-2" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
