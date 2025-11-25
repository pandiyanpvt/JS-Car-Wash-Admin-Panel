export type UserRole = 'developer' | 'admin' | 'booking'

export const roleLabels: Record<UserRole, string> = {
  developer: 'Developer',
  admin: 'Admin',
  booking: 'Booking',
}

type RolePermissionConfig = {
  navigation: string[]
  assignableRoles: UserRole[]
}

export const rolePermissions: Record<UserRole, RolePermissionConfig> = {
  developer: {
    navigation: ['dashboard', 'adminManagement', 'bookings', 'services', 'media', 'reviews', 'feedback', 'reports', 'settings', 'profile', 'logout'],
    assignableRoles: ['admin', 'booking'],
  },
  admin: {
    navigation: ['dashboard', 'bookings', 'services', 'media', 'reviews', 'feedback', 'reports', 'settings', 'profile', 'logout'],
    assignableRoles: ['booking'],
  },
  booking: {
    navigation: ['dashboard', 'bookings', 'profile', 'logout'],
    assignableRoles: [],
  },
}

export const resolveUserRole = (role?: string | null): UserRole => {
  if (role === 'developer' || role === 'admin' || role === 'booking') {
    return role
  }
  return 'admin'
}

