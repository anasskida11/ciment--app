"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { OrderPlacementSystem } from "@/features/orders/components/order-placement-system"
import { MainNav } from "@/shared/components/layout/main-nav"
import { useRoleAccess } from "@/shared/hooks/use-role-access"
import { ROLES } from "@/shared/constants"

export default function Home() {
  const router = useRouter()
  const { hasRole, loading, user } = useRoleAccess()

  useEffect(() => {
    // Rediriger vers login si pas authentifié
    if (!loading && !user) {
      router.push('/login?redirect=/')
      return
    }

    // Rediriger si pas ADMIN ou GESTIONNAIRE_CLIENTELE
    if (!loading && user && !hasRole([ROLES.ADMIN, ROLES.GESTIONNAIRE_CLIENTELE])) {
      // Rediriger vers la première page autorisée pour ce rôle
      if (user.role === ROLES.GESTIONNAIRE_STOCK) {
        router.push('/stock')
      } else if (user.role === ROLES.COMPTABLE) {
        router.push('/accounts')
      } else if (user.role === ROLES.GESTIONNAIRE_TRUCKS) {
        router.push('/fleet')
      } else {
        router.push('/login')
      }
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
        <OrderPlacementSystem />
      </div>
    </main>
  )
}
