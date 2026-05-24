import { SkeletonGrid } from '@/components/shared/SkeletonCard'

export default function Loading() {
  return (
    <div className="container-shop py-10">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
      <SkeletonGrid count={8} />
    </div>
  )
}
