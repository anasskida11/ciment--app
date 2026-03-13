"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { OrdersList } from "@/features/orders/components/orders-list"
import { MainNav } from "@/shared/components/layout/main-nav"
import { useRoleAccess } from "@/shared/hooks/use-role-access"
import { ROLES } from "@/shared/constants"

export default function OrdersPage() {
  const router = useRouter()
  const { hasRole, loading, user } = useRoleAccess()

  useEffect(() => {
    // Rediriger vers login si pas authentifié
    if (!loading && !user) {
      router.push('/login?redirect=/orders')
      return
    }

    // Rediriger si pas ADMIN ou GESTIONNAIRE_CLIENTELE
    if (!loading && user && !hasRole([ROLES.ADMIN, ROLES.GESTIONNAIRE_CLIENTELE])) {
      router.push('/')
    }
  }, [hasRole, loading, user, router])

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>جاري التحميل...</p>
      </main>
    )
  }

  // Ne pas afficher la page si pas autorisé
  if (!user || !hasRole([ROLES.ADMIN, ROLES.GESTIONNAIRE_CLIENTELE])) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <MainNav />
      <div className="p-4">
        <OrdersList />
      </div>
    </main>
  )
}
