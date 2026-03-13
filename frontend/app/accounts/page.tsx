"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AccountsManager } from "@/features/accounts/components/accounts-manager"
import { MainNav } from "@/shared/components/layout/main-nav"
import { useRoleAccess } from "@/shared/hooks/use-role-access"
import { ROLES } from "@/shared/constants"

export default function AccountsPage() {
  const router = useRouter()
  const { hasRole, loading } = useRoleAccess()

  useEffect(() => {
    // Rediriger si pas ADMIN ou COMPTABLE
    if (!loading && !hasRole([ROLES.ADMIN, ROLES.COMPTABLE])) {
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

  if (!hasRole([ROLES.ADMIN, ROLES.COMPTABLE])) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <MainNav />
      <div className="p-4">
        <AccountsManager />
      </div>
    </main>
  )
}
