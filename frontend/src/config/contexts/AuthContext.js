'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '../api/userApi'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // ✅ Verificar token y usuario guardado al cargar la app
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user')

        if (savedUser) setUser(JSON.parse(savedUser))
        if (!token) {
          setLoading(false)
          return
        }

        // 🔥 Intentamos validar el token con el backend
        const profileResp = await authApi.getProfile()
        const profile = profileResp?.data || profileResp

        if (profile) {
          const normalizedProfile = {
            ...profile,
            id_colegio: profile?.id_colegio ?? null,
            rol: profile?.rol || profile?.role || 'user',
            nombre_colegio: profile?.nombre_colegio ?? 'Administrador'
          }
          setUser(normalizedProfile)
          localStorage.setItem('user', JSON.stringify(normalizedProfile))
        }
      } catch (err) {
        // Provide richer diagnostic information so we can determine whether the
        // failure is an authentication issue (401/403) or a server/transient error.
        // Note: fetchApi attaches .status and .data to the thrown error when available.
        console.warn('⚠️ No se pudo validar el token. Manteniendo sesión local.', {
          message: err.message,
          status: err.status ?? 'unknown',
          data: err.data ?? null,
        })
        // Current behavior: keep local session. If desired, change here to force
        // logout when err.status === 401 || err.status === 403.
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // ✅ Login
  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials)
      const token = response?.token || response?.data?.token
      const userObj = response?.user || response?.usuario || response?.data?.user || response?.data || null

      if (!token) throw new Error('Respuesta inválida: sin token')

      const normalizedUser = {
        ...userObj,
        id_colegio: userObj?.id_colegio ?? null,
        rol: userObj?.rol || userObj?.role || 'user'
      }

      setUser(normalizedUser)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(normalizedUser))
      console.log('🔐 Token guardado:', token)

      const role = normalizedUser.rol
      const redirectPath = role === 'admin' ? '/admin' : `/users`
      router.push(redirectPath)
      return { success: true }
    } catch (error) {
      console.error('Error en login:', error)
      return { success: false, error: error.message || 'Error al iniciar sesión' }
    }
  }

  // ✅ Logout
  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const updateUser = (userData) => setUser(prev => ({ ...prev, ...userData }))

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
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
