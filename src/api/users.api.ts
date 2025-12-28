import axiosInstance from './axiosInstance'
import type { UserRole } from '../context/AuthContext'

// Backend representation
interface BackendUser {
  id: number
  email_address: string
  phone_number: string
  first_name: string
  last_name: string
  user_name: string
  is_active: boolean
  is_verified?: boolean
  verified_at?: string
  createdAt?: string
  updatedAt?: string
  user_role_id: number
  role?: { role_name: string }
  admin_branch?: {
    id: number
    user_id: number
    branch_id: number
    is_active: boolean
    createdAt?: string
    updatedAt?: string
    branch?: {
      id: number
      branch_name: string
      address: string
      phone_number: string
      email_address: string
      is_active: boolean
    }
  }
}

// Frontend representation used by UI
export interface User {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phoneNumber: string
  userName: string
  roleId: string
  roleName: UserRole
  isActive: boolean
  isVerified?: boolean
  verifiedAt?: string
  createdAt: string
  password?: string
  adminBranchId?: string
  adminBranchName?: string
}

export interface UserLog {
  id: string
  userId: string
  action: string
  details?: string
  timestamp: string
}

const mapBackendRole = (backendRole?: string): UserRole => {
  if (!backendRole) return 'Worker'
  
  const normalizedRole = backendRole.toLowerCase().trim()
  const roleMap: Record<string, UserRole> = {
    developer: 'Developer',
    admin: 'Admin',
    manager: 'Manager',
    worker: 'Worker',
    user: 'Worker', // Map "User" role to "Worker" as it's typically a base user role
    'user base': 'Worker',
    'base user': 'Worker',
    'user base role': 'Worker',
  }
  
  // Try exact match first
  if (roleMap[normalizedRole]) {
    return roleMap[normalizedRole]
  }
  
  // Try partial matches for variations
  if (normalizedRole.includes('developer')) return 'Developer'
  if (normalizedRole.includes('admin')) return 'Admin'
  if (normalizedRole.includes('manager')) return 'Manager'
  if (normalizedRole.includes('worker') || normalizedRole.includes('user') || normalizedRole.includes('base')) {
    return 'Worker'
  }
  
  // Default fallback
  console.warn(`Unknown role name from backend: "${backendRole}", defaulting to Worker`)
  return 'Worker'
}

const mapBackendToFrontend = (backend: BackendUser): User => ({
  id: String(backend.id),
  firstName: backend.first_name,
  lastName: backend.last_name,
  fullName: `${backend.first_name} ${backend.last_name}`.trim(),
  email: backend.email_address,
  phoneNumber: backend.phone_number,
  userName: backend.user_name,
  roleId: String(backend.user_role_id),
  roleName: mapBackendRole(backend.role?.role_name),
  isActive: backend.is_active ?? true, // Default to true if undefined
  isVerified: backend.is_verified ?? false,
  verifiedAt: backend.verified_at,
  createdAt: backend.createdAt || '',
  adminBranchId: backend.admin_branch?.branch_id ? String(backend.admin_branch.branch_id) : undefined,
  adminBranchName: backend.admin_branch?.branch?.branch_name,
})

const mapFrontendToBackend = (frontend: Partial<User> & { branchId?: string | null | undefined }) => {
  const payload: Partial<BackendUser> & { password?: string; branch_id?: number | null } = {}
  if (frontend.firstName !== undefined) payload.first_name = frontend.firstName
  if (frontend.lastName !== undefined) payload.last_name = frontend.lastName
  if (frontend.email !== undefined) payload.email_address = frontend.email
  if (frontend.phoneNumber !== undefined) payload.phone_number = frontend.phoneNumber
  if (frontend.userName !== undefined) payload.user_name = frontend.userName
  if (frontend.roleId !== undefined) payload.user_role_id = Number(frontend.roleId)
  if (frontend.isActive !== undefined) payload.is_active = frontend.isActive
  if (frontend.password !== undefined) payload.password = frontend.password
  // Handle branch_id: include it if provided, or set to null to remove assignment
  if (frontend.branchId !== undefined) {
    if (frontend.branchId === '' || frontend.branchId === null) {
      payload.branch_id = null // Explicitly set to null to remove assignment
    } else if (frontend.branchId) {
      payload.branch_id = Number(frontend.branchId)
    }
  }
  return payload
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await axiosInstance.get('/users')
    const backendUsers: BackendUser[] = response.data.data || response.data
    return Array.isArray(backendUsers) ? backendUsers.map(mapBackendToFrontend) : []
  },

  getById: async (id: string): Promise<User> => {
    const response = await axiosInstance.get(`/users/${id}`)
    const backendUser: BackendUser = response.data.data || response.data
    return mapBackendToFrontend(backendUser)
  },

  create: async (
    data: Pick<User, 'firstName' | 'lastName' | 'email' | 'phoneNumber' | 'userName' | 'roleId' | 'isActive'> & {
      password: string
      branchId?: string
    }
  ): Promise<User> => {
    const payload = mapFrontendToBackend(data)
    // Password and username are required by backend register route
    const response = await axiosInstance.post('/users/register', payload)
    // Backend register returns { id: user.id } in response.data.data
    // We need to fetch the full user object after registration
    const responseData = response.data.data
    const userId = typeof responseData === 'object' && responseData !== null 
      ? responseData.id 
      : responseData
    
    if (userId) {
      // Fetch the complete user object
      const userResponse = await axiosInstance.get(`/users/${userId}`)
      const backendUser: BackendUser = userResponse.data.data || userResponse.data
      return mapBackendToFrontend(backendUser)
    }
    // Fallback: if no id returned, throw error
    throw new Error('User registration succeeded but user ID was not returned')
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const payload = mapFrontendToBackend(data)
    const response = await axiosInstance.put(`/users/${id}`, payload)
    const backendUser: BackendUser = response.data.data || response.data
    return mapBackendToFrontend(backendUser)
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`)
  },

  verifyEmail: async (userId: string): Promise<User> => {
    // Verify user email by updating is_verified status
    // Backend expects snake_case field names
    const response = await axiosInstance.put(`/users/${userId}`, {
      is_verified: true,
      verified_at: new Date().toISOString(),
    })
    const backendUser: BackendUser = response.data.data || response.data
    return mapBackendToFrontend(backendUser)
  },

  getLogs: async (userId?: string): Promise<UserLog[]> => {
    const url = userId ? `/user-logs/user/${userId}` : '/user-logs'
    const response = await axiosInstance.get(url)
    const backendLogs = response.data.data || response.data
    return backendLogs
  },
}

