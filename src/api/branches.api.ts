import axiosInstance from './axiosInstance'

// Backend Branch model structure
interface BackendBranch {
  id: number
  branch_name: string
  address: string
  phone_number: string
  email_address: string | null
  is_active: boolean
}

// Frontend Branch interface
export interface Branch {
  id: string
  name: string
  address: string
  phone: string
  email: string
  status: 'active' | 'inactive'
}

// Helper function to map backend branch to frontend format
const mapBackendToFrontend = (backendBranch: BackendBranch): Branch => {
  return {
    id: String(backendBranch.id),
    name: backendBranch.branch_name,
    address: backendBranch.address,
    phone: backendBranch.phone_number,
    email: backendBranch.email_address || '',
    status: backendBranch.is_active ? 'active' : 'inactive',
  }
}

// Helper function to map frontend branch to backend format
const mapFrontendToBackend = (frontendBranch: Partial<Branch>): Partial<BackendBranch> => {
  const backendData: Partial<BackendBranch> = {}
  
  if (frontendBranch.name !== undefined) {
    backendData.branch_name = frontendBranch.name
  }
  if (frontendBranch.address !== undefined) {
    backendData.address = frontendBranch.address
  }
  if (frontendBranch.phone !== undefined) {
    backendData.phone_number = frontendBranch.phone
  }
  if (frontendBranch.email !== undefined) {
    backendData.email_address = frontendBranch.email || null
  }
  if (frontendBranch.status !== undefined) {
    backendData.is_active = frontendBranch.status === 'active'
  }
  
  return backendData
}

export const branchesApi = {
  getAll: async (): Promise<Branch[]> => {
    const response = await axiosInstance.get('/branches')
    // Backend returns { success, message, data }
    const backendBranches: BackendBranch[] = response.data.data || response.data
    return Array.isArray(backendBranches) 
      ? backendBranches.map(mapBackendToFrontend)
      : []
  },

  getById: async (id: string): Promise<Branch> => {
    const response = await axiosInstance.get(`/branches/${id}`)
    // Backend returns { success, message, data }
    const backendBranch: BackendBranch = response.data.data || response.data
    return mapBackendToFrontend(backendBranch)
  },

  create: async (data: Omit<Branch, 'id'>): Promise<Branch> => {
    const backendData = mapFrontendToBackend(data)
    const response = await axiosInstance.post('/branches', backendData)
    // Backend returns { success, message, data }
    const backendBranch: BackendBranch = response.data.data || response.data
    return mapBackendToFrontend(backendBranch)
  },

  update: async (id: string, data: Partial<Branch>): Promise<Branch> => {
    const backendData = mapFrontendToBackend(data)
    const response = await axiosInstance.put(`/branches/${id}`, backendData)
    // Backend returns { success, message, data }
    const backendBranch: BackendBranch = response.data.data || response.data
    return mapBackendToFrontend(backendBranch)
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/branches/${id}`)
    // Backend returns { success, message }
  },
}

