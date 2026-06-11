import { createContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/authApi'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const tryRefresh = useCallback(async () => {
    try {
      const { data } = await authApi.refreshToken()
      localStorage.setItem('accessToken', data.accessToken)
      return true
    } catch {
      localStorage.removeItem('accessToken')
      return false
    }
  }, [])

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      const refreshed = await tryRefresh()
      if (!refreshed) {
        setLoading(false)
        return
      }
    }
    try {
      const { data } = await authApi.getMe()
      setUser(data.data.user)
      setIsAuthenticated(true)
    } catch {
      const refreshed = await tryRefresh()
      if (refreshed) {
        try {
          const { data } = await authApi.getMe()
          setUser(data.data.user)
          setIsAuthenticated(true)
        } catch {
          setUser(null)
          setIsAuthenticated(false)
        }
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } finally {
      setLoading(false)
    }
  }, [tryRefresh])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials)
    localStorage.setItem('accessToken', data.accessToken)
    setUser(data.data.user)
    setIsAuthenticated(true)
    return data
  }

  const register = async (userData) => {
    const { data } = await authApi.register(userData)
    return data
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // proceed with local logout even if API fails
    }
    localStorage.removeItem('accessToken')
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    loadUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
