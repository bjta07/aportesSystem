'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/config/contexts/AuthContext'

export function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }

      if (requiredRole && user.rol !== requiredRole) {
        router.push('/unauthorized')
        return
      }
    }
  }, [user, loading, requiredRole, router])

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Cargando...</div>
      </div>
    )
  }

  // No mostrar nada si no está autenticado (se redirige)
  if (!user) {
    return null
  }

  // Verificar rol si es requerido
  if (requiredRole && user.rol !== requiredRole) {
    return null
  }

  return children
}