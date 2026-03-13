/**
 * Hook pour gérer l'authentification
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Charger l'utilisateur depuis localStorage
    const loadUser = () => {
      try {
        const token = localStorage.getItem('auth_token')
        const userStr = localStorage.getItem('user')
        
        if (token && userStr) {
          setUser(JSON.parse(userStr))
          // Optionnel: vérifier la validité du token avec le backend
          // verifyToken(token)
        }
      } catch (error) {
        console.error('Error loading user:', error)
        logout()
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = (token: string, userData: User) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/login')
  }

  const isAuthenticated = !!user
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  return {
    user,
    loading,
    isAuthenticated,
    token,
    login,
    logout,
  }
}
