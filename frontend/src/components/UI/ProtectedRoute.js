'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/config/contexts/AuthContext'

export function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const routeId = params?.id_colegio // <- viene de la URL dinámica /users/[id_colegio]

  useEffect(() => {
    if (!loading) {
      // 1️⃣ No autenticado
      if (!user) {
        router.push('/login')
        return
      }

      // 2️⃣ Verificar rol si es requerido
      if (requiredRole && user.rol !== requiredRole) {
        router.push('/unauthorized')
        return
      }

      // 3️⃣ Verificar que el id_colegio en la URL coincida con el del usuario
      if (routeId && user.id_colegio?.toString() !== routeId.toString()) {
        router.push('/unauthorized')
        return
      }
    }
  }, [user, loading, requiredRole, routeId, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Cargando...</div>
      </div>
    )
  }

  if (!user) return null
  if (requiredRole && user.rol !== requiredRole) return null
  if (routeId && user.id_colegio?.toString() !== routeId.toString()) return null

  return children
}
