import type { UserRole } from '../context/AuthContext'

export const ROLES: UserRole[] = ['Admin', 'Developer', 'Manager', 'Worker']

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  Developer: 4,
  Admin: 3,
  Manager: 2,
  Worker: 1,
}

export const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export const getRoleColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    Developer: 'purple',
    Admin: 'blue',
    Manager: 'green',
    Worker: 'gray',
  }
  return colors[role]
}

