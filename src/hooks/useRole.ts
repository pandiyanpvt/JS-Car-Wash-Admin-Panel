import { useAuth } from './useAuth'
import type { UserRole } from '../context/AuthContext'

export const useRole = () => {
  const { user, hasRole, isDeveloper, isAdmin } = useAuth()

  return {
    user,
    hasRole,
    isDeveloper,
    isAdmin,
    currentRole: user?.role as UserRole | undefined,
  }
}

