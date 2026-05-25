import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export const metadata: Metadata = {
  title: { template: '%s | Daveen Admin', default: 'Admin Dashboard | Daveen' },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { role: true, firstName: true, lastName: true, email: true },
  })

  if (!dbUser || !['ADMIN', 'SUPER_ADMIN'].includes(dbUser.role)) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar user={dbUser} />
      {/* mt-14 on mobile for the top bar, ml-64 on desktop for the sidebar */}
      <main className="flex-1 lg:ml-64 mt-14 lg:mt-0 p-4 sm:p-6 lg:p-8 min-w-0">
        {children}
      </main>
    </div>
  )
}
