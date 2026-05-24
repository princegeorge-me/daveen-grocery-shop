'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, Suspense } from 'react'
import { PostHogProvider } from './PostHogProvider'
import { PostHogPageview } from './PostHogPageview'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <PostHogProvider>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={null}>
          <PostHogPageview />
        </Suspense>
        {children}
      </QueryClientProvider>
    </PostHogProvider>
  )
}
