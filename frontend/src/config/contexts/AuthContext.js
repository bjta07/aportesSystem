'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '../api/userApi'
const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Verificar token al cargar la app
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        if (!token) {
          // No token: set loading false and keep user null
          setLoading(false)
          return
        }

        const profileResp = await authApi.getProfile()
        // authApi.getProfile may return either { data: { ... } } or the user object directly
        const profile = profileResp?.data || profileResp

        if (profile) {
          const normalizedProfile = {
          ...profile,
          id_colegio: profile?.id_colegio ?? null,
          rol: profile?.rol || profile?.role || 'user'
        }
        setUser(normalizedProfile)
        } else {
          localStorage.removeItem('token')
          setUser(null)
        }
      } catch (error) {
        console.error('Error al verificar autenticacion:', error)
        localStorage.removeItem('token')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials)

      // backend may return { token, user } or { token, usuario }
      const token = response?.token || response?.data?.token
      const userObj = response?.user || response?.usuario || response?.data?.user || response?.data || null

      if (!token) {
        throw new Error('Respuesta de login inv\u00e1lida: no token')
      }

      const normalizedUser = {
      ...userObj,
      id_colegio: userObj?.id_colegio ?? null,
      rol: userObj?.rol || userObj?.role || 'user'
    }
    setUser(normalizedUser)
    
      localStorage.setItem('token', token)
      console.log('🔐 Token guardado:', token)
      // Determine role safely
      const role = normalizedUser.rol
      const redirectPath = role === 'admin' ? '/admin' : '/users'
      router.push(redirectPath)

      return { success: true }
    } catch (error) {
      console.error('Error en login:', error)
      return { success: false, error: error.message || 'Error al iniciar sesi\u00f3n' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }))
  }

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
