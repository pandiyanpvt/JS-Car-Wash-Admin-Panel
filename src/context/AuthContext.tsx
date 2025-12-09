import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi } from '../api/auth.api'

export type UserRole = 'Admin' | 'Developer' | 'Manager' | 'Worker'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  isActive: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasRole: (role: UserRole | UserRole[]) => boolean
  isDeveloper: () => boolean
  isAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Map backend role names to frontend role types
const mapBackendRole = (backendRole: string): UserRole => {
  const roleMap: Record<string, UserRole> = {
    'developer': 'Developer',
    'admin': 'Admin',
    'manager': 'Manager',
    'worker': 'Worker',
  }
  return roleMap[backendRole.toLowerCase()] || 'Worker'
}

// Map backend user data to frontend User format
const mapBackendUser = (backendUser: any): User => {
  return {
    id: String(backendUser.id),
    name: backendUser.user_name || backendUser.email_address || 'User',
    email: backendUser.email_address || '',
    role: mapBackendRole(backendUser.role?.role_name || backendUser.role || 'worker'),
    avatar: backendUser.avatar || undefined,
    isActive: backendUser.is_active ?? true,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem('admin_user')
    const storedToken = localStorage.getItem('auth_token')
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('admin_user')
        localStorage.removeItem('auth_token')
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Backend accepts identifier (email, phone, or username) and password
      const response = await authApi.login({ identifier: email, password })
      
      if (response.token && response.user) {
        // Store token for axios interceptor
        localStorage.setItem('auth_token', response.token)
        
        // Map and store user
        const mappedUser = mapBackendUser(response.user)
        setUser(mappedUser)
        localStorage.setItem('admin_user', JSON.stringify(mappedUser))
        
        return true
      }
      return false
    } catch (error: any) {
      console.error('Login error:', error)
      // Handle error response from backend
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('admin_user')
      localStorage.removeItem('auth_token')
    }
  }

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    return user.role === role
  }

  const isDeveloper = (): boolean => {
    return user?.role === 'Developer'
  }

  const isAdmin = (): boolean => {
    return user?.role === 'Admin' || user?.role === 'Developer'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole, isDeveloper, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

