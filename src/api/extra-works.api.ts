import axiosInstance from './axiosInstance'

// Backend ExtraWork model structure
interface BackendExtraWork {
  id: number
  name: string
  amount: number
  description: string | null
  is_active: boolean
}

// Frontend ExtraWork interface
export interface ExtraWork {
  id: string
  name: string
  description: string
  price: number
  duration: number
  status: 'active' | 'inactive'
}

// Helper function to map backend to frontend
const mapBackendToFrontend = (backend: BackendExtraWork): ExtraWork => {
  return {
    id: String(backend.id),
    name: backend.name,
    description: backend.description || '',
    price: parseFloat(String(backend.amount)) || 0,
    duration: 0, // Backend doesn't have duration field
    status: backend.is_active ? 'active' : 'inactive',
  }
}

// Helper function to map frontend to backend
const mapFrontendToBackend = (frontend: Partial<ExtraWork>): Partial<BackendExtraWork> => {
  const backend: Partial<BackendExtraWork> = {}
  
  if (frontend.name !== undefined) backend.name = frontend.name
  if (frontend.description !== undefined) backend.description = frontend.description || null
  if (frontend.price !== undefined) backend.amount = frontend.price
  if (frontend.status !== undefined) backend.is_active = frontend.status === 'active'
  
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

