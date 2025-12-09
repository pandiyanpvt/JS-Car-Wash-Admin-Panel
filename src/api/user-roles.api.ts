import axiosInstance from './axiosInstance'

// Backend UserRole model structure
interface BackendUserRole {
  id: number
  role_name: string
  is_active: boolean
}

// Frontend UserRole interface
export interface UserRole {
  id: string
  name: string
  status: 'active' | 'inactive'
}

// Helper function to map backend to frontend
const mapBackendToFrontend = (backend: BackendUserRole): UserRole => {
  return {
    id: String(backend.id),
    name: backend.role_name,
    status: backend.is_active ? 'active' : 'inactive',
  }
}

// Helper function to map frontend to backend
const mapFrontendToBackend = (frontend: Partial<UserRole>): Partial<BackendUserRole> => {
  const backend: Partial<BackendUserRole> = {}
  
  if (frontend.name !== undefined) backend.role_name = frontend.name
  if (frontend.status !== undefined) backend.is_active = frontend.status === 'active'
  
  return backend
}

export const userRolesApi = {
  getAll: async (): Promise<UserRole[]> => {
    const response = await axiosInstance.get('/user-roles')
    const backendRoles: BackendUserRole[] = response.data.data || response.data
    return Array.isArray(backendRoles) 
      ? backendRoles.map(mapBackendToFrontend)
      : []
  },

  getById: async (id: string): Promise<UserRole> => {
    const response = await axiosInstance.get(`/user-roles/${id}`)
    const backendRole: BackendUserRole = response.data.data || response.data
    return mapBackendToFrontend(backendRole)
  },

  create: async (data: Omit<UserRole, 'id'>): Promise<UserRole> => {
    const backendData = mapFrontendToBackend(data)
    const response = await axiosInstance.post('/user-roles', backendData)
    const backendRole: BackendUserRole = response.data.data || response.data
    return mapBackendToFrontend(backendRole)
  },

  update: async (id: string, data: Partial<UserRole>): Promise<UserRole> => {
    const backendData = mapFrontendToBackend(data)
    const response = await axiosInstance.put(`/user-roles/${id}`, backendData)
    const backendRole: BackendUserRole = response.data.data || response.data
    return mapBackendToFrontend(backendRole)
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/user-roles/${id}`)
  },
}

