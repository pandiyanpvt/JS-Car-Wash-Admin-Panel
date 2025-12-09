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
  createdAt?: string
  updatedAt?: string
  user_role_id: number
  role?: { role_name: string }
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
  createdAt: string
  password?: string
}

export interface UserLog {
  id: string
  userId: string
  action: string
  details?: string
  timestamp: string
}

const mapBackendRole = (backendRole?: string): UserRole => {
  const roleMap: Record<string, UserRole> = {
    developer: 'Developer',
    admin: 'Admin',
    manager: 'Manager',
    worker: 'Worker',
  }
  return backendRole ? roleMap[backendRole.toLowerCase()] || 'Worker' : 'Worker'
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
  isActive: backend.is_active,
  createdAt: backend.createdAt || '',
})

const mapFrontendToBackend = (frontend: Partial<User>) => {
  const payload: Partial<BackendUser> & { password?: string } = {}
  if (frontend.firstName !== undefined) payload.first_name = frontend.firstName
  if (frontend.lastName !== undefined) payload.last_name = frontend.lastName
  if (frontend.email !== undefined) payload.email_address = frontend.email
  if (frontend.phoneNumber !== undefined) payload.phone_number = frontend.phoneNumber
  if (frontend.userName !== undefined) payload.user_name = frontend.userName
  if (frontend.roleId !== undefined) payload.user_role_id = Number(frontend.roleId)
  if (frontend.isActive !== undefined) payload.is_active = frontend.isActive
  if (frontend.password !== undefined) payload.password = frontend.password
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
    }
  ): Promise<User> => {
    const payload = mapFrontendToBackend(data)
    // Password and username are required by backend register route
    const response = await axiosInstance.post('/users/register', payload)
    const backendUser: BackendUser = response.data.data || response.data
    return mapBackendToFrontend(backendUser)
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

  getLogs: async (userId?: string): Promise<UserLog[]> => {
    const url = userId ? `/user-logs/user/${userId}` : '/user-logs'
    const response = await axiosInstance.get(url)
    const backendLogs = response.data.data || response.data
    return backendLogs
  },
}

