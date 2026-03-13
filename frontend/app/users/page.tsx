"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainNav } from "@/shared/components/layout/main-nav"
import { useRoleAccess } from "@/shared/hooks/use-role-access"
import { ROLES } from "@/shared/constants"
import { UsersManager } from "@/features/users/components/users-manager"

export default function UsersPage() {
  const router = useRouter()
  const { hasRole, loading } = useRoleAccess()

  useEffect(() => {
    if (!loading && !hasRole([ROLES.ADMIN])) {
      router.push('/')
    }
  }, [hasRole, loading, router])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>جاري التحميل...</p>
      </main>
    )
  }

  if (!hasRole([ROLES.ADMIN])) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <MainNav />
      <div className="p-4">
        <UsersManager />
      </div>
    </main>
  )
}
