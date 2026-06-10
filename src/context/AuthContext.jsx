import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) fetchProfile()
    else setLoading(false)
  }, [])

  const fetchProfile = async () => {
    try {
      const { data } = await authAPI.profile()
      setUser(data)
    } catch {
      localStorage.clear()
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      await authAPI.logout({ refresh })
    } catch {}
    localStorage.clear()
    setUser(null)
  }

  const register = async (formData) => {
    const { data } = await authAPI.register(formData)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setUser(data.user)
    return data.user
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
