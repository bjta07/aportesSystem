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
        const profile = profileResp && profileResp.data ? profileResp.data : profileResp

        if (profile) {
          setUser(profile)
        } else {
          localStorage.removeItem('token')
          setUser(null)
        }
      } catch (error) {
        console.error('Error al verificar autenticaci\u00f3n:', error)
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
      const userObj = response?.user || response?.usuario || response?.data || null

      if (!token) {
        throw new Error('Respuesta de login inv\u00e1lida: no token')
      }

      localStorage.setItem('token', token)
      setUser(userObj)

      // Determine role safely
      const role = (userObj && (userObj.rol || userObj.role)) || null
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
