import axiosInstance from './axiosInstance'

// Backend Branch Price structure
interface BackendBranchPrice {
  id: number
  extra_works_id: number
  branch_id: number
  amount: number
  is_active: boolean
  branch?: {
    id: number
    branch_name: string
  }
}

// Backend ExtraWork model structure
interface BackendExtraWork {
  id: number
  name: string
  description: string | null
  is_active: boolean
  branch_prices?: BackendBranchPrice[]
}

// Frontend Branch Price interface
export interface BranchPrice {
  branch_id: string
  branch_name?: string
  amount: number
  is_active: boolean
}

// Frontend ExtraWork interface
export interface ExtraWork {
  id: string
  name: string
  description: string
  branchPrices: BranchPrice[]
  duration: number
  status: 'active' | 'inactive'
}

// Helper function to map backend to frontend
const mapBackendToFrontend = (backend: BackendExtraWork): ExtraWork => {
  return {
    id: String(backend.id),
    name: backend.name,
    description: backend.description || '',
    branchPrices: (backend.branch_prices || []).map((bp) => ({
      branch_id: String(bp.branch_id),
      branch_name: bp.branch?.branch_name,
      amount: parseFloat(String(bp.amount)) || 0,
      is_active: bp.is_active,
    })),
    duration: 0, // Backend doesn't have duration field
    status: backend.is_active ? 'active' : 'inactive',
  }
}

// Helper function to map frontend to backend
const mapFrontendToBackend = (frontend: Partial<ExtraWork>): any => {
  const backend: any = {}
  
  if (frontend.name !== undefined) backend.name = frontend.name
  if (frontend.description !== undefined) backend.description = frontend.description || null
  if (frontend.status !== undefined) backend.is_active = frontend.status === 'active'
  if (frontend.branchPrices !== undefined) {
    backend.branchPrices = frontend.branchPrices.map((bp) => ({
      branch_id: parseInt(bp.branch_id),
      amount: bp.amount,
      is_active: bp.is_active !== false,
    }))
  }
  
  return backend
}

export const extraWorksApi = {
  getAll: async (): Promise<ExtraWork[]> => {
    const response = await axiosInstance.get('/extra-works')
    const backendWorks: BackendExtraWork[] = response.data.data || response.data
    return Array.isArray(backendWorks) 
      ? backendWorks.map(mapBackendToFrontend)
      : []
  },

  getById: async (id: string): Promise<ExtraWork> => {
    const response = await axiosInstance.get(`/extra-works/${id}`)
    const backendWork: BackendExtraWork = response.data.data || response.data
    return mapBackendToFrontend(backendWork)
  },

  create: async (data: Omit<ExtraWork, 'id'>): Promise<ExtraWork> => {
    const backendData = mapFrontendToBackend(data)
    const response = await axiosInstance.post('/extra-works', backendData)
    const backendWork: BackendExtraWork = response.data.data || response.data
    return mapBackendToFrontend(backendWork)
  },

  update: async (id: string, data: Partial<ExtraWork>): Promise<ExtraWork> => {
    const backendData = mapFrontendToBackend(data)
    const response = await axiosInstance.put(`/extra-works/${id}`, backendData)
    const backendWork: BackendExtraWork = response.data.data || response.data
    return mapBackendToFrontend(backendWork)
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/extra-works/${id}`)
  },
}

