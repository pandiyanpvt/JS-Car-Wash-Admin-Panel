import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import type { UserRole } from './AuthContext'

interface RoleContextType {
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  currentRole: UserRole | undefined
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user, hasRole } = useAuth()

  const hasPermission = (permission: string): boolean => {
    // Implement permission checking logic here
    // For now, basic role-based check
    if (!user) return false
    // Add your permission logic based on roles
    return true
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some((perm) => hasPermission(perm))
  }

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every((perm) => hasPermission(perm))
  }

  return (
    <RoleContext.Provider
      value={{
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        currentRole: user?.role,
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}

