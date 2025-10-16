'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/config/contexts/AuthContext"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('Usuario no autenticado, redirigiendo al login')
        router.push('/login')
        return
      }
      console.log('Usuario autenticado: ', user)

      const role = user?.rol || user?.role
      if (role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/users')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return(
      <div>
        <div>
          <p>Cargando</p>
        </div>
      </div>
    )
  }
  return (
    <div>
      <div>
        <div>
          <p>Redirigiendo</p>
        </div>
      </div>
    </div>
  )
}
