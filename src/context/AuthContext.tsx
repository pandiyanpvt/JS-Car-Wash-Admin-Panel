import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem('admin_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('admin_user')
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // TODO: Replace with actual API call
    // For now, using dummy authentication
    if (email === 'developer@jscarwash.com' && password === 'developer123') {
      const devUser: User = {
        id: '1',
        name: 'Developer User',
        email: 'developer@jscarwash.com',
        role: 'Developer',
        isActive: true,
      }
      setUser(devUser)
      localStorage.setItem('admin_user', JSON.stringify(devUser))
      return true
    } else if (email === 'admin@jscarwash.com' && password === 'admin123') {
      const adminUser: User = {
        id: '2',
        name: 'Admin User',
        email: 'admin@jscarwash.com',
        role: 'Admin',
        isActive: true,
      }
      setUser(adminUser)
      localStorage.setItem('admin_user', JSON.stringify(adminUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('admin_user')
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

