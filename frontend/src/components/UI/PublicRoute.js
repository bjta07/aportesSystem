'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/config/contexts/AuthContext'

export function PublicRoute({ children, redirectTo = '/' }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Si ya está autenticado, redirigir al dashboard.
    if (!loading && user) {
      // Si no se pasa redirectTo, elegir según el rol del usuario
      const role = user?.rol || user?.role
      const target = redirectTo && redirectTo !== '/' ? redirectTo : (role === 'admin' ? '/admin' : '/users')
      // Evitar push repetido si ya estamos en la misma ruta
      if (typeof window !== 'undefined' && window.location.pathname !== target) {
        router.push(target)
      }
    }
  }, [user, loading, router, redirectTo])

  // Mostrar loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Cargando...</div>
      </div>
    )
  }

  // Si ya está autenticado, no mostrar la página pública
  if (user) {
    return null
  }

  return children
}