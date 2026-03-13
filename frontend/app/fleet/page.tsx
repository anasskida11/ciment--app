"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FleetManager } from "@/features/trucks/components/fleet-manager"
import { MainNav } from "@/shared/components/layout/main-nav"
import { useRoleAccess } from "@/shared/hooks/use-role-access"
import { ROLES } from "@/shared/constants"

export default function FleetPage() {
  const router = useRouter()
  const { hasRole, loading } = useRoleAccess()

  useEffect(() => {
    // Rediriger si pas ADMIN ou GESTIONNAIRE_TRUCKS
    if (!loading && !hasRole([ROLES.ADMIN, ROLES.GESTIONNAIRE_TRUCKS])) {
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

  if (!hasRole([ROLES.ADMIN, ROLES.GESTIONNAIRE_TRUCKS])) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <MainNav />
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold" dir="rtl">
            إدارة أسطول السيارات
          </h1>
          <p className="text-gray-600 mt-2" dir="rtl">
            تتبع حالة السيارات والكيلومترات والصيانة
          </p>
        </div>
        <FleetManager />
      </div>
    </main>
  )
}
