import axiosInstance from './axiosInstance'

interface BackendPackageInclude {
  id: number
  includes_details: string
  service_type_id: number
  is_active: boolean
}

export interface PackageInclude {
  id: string
  name: string
  serviceTypeId: string
  status: 'active' | 'inactive'
}

const mapBackendToFrontend = (backend: BackendPackageInclude): PackageInclude => ({
  id: String(backend.id),
  name: backend.includes_details,
  serviceTypeId: String(backend.service_type_id),
  status: backend.is_active ? 'active' : 'inactive',
})

const mapFrontendToBackend = (frontend: Partial<PackageInclude>): Partial<BackendPackageInclude> => {
  const payload: Partial<BackendPackageInclude> = {}
  if (frontend.name !== undefined) payload.includes_details = frontend.name
  if (frontend.serviceTypeId !== undefined) payload.service_type_id = Number(frontend.serviceTypeId)
  if (frontend.status !== undefined) payload.is_active = frontend.status === 'active'
  return payload
}

export const packageIncludesApi = {
  getAll: async (): Promise<PackageInclude[]> => {
    const response = await axiosInstance.get('/package-includes')
    const backendItems: BackendPackageInclude[] = response.data.data || response.data
    return Array.isArray(backendItems) ? backendItems.map(mapBackendToFrontend) : []
  },

  getByServiceType: async (serviceTypeId: string): Promise<PackageInclude[]> => {
    const response = await axiosInstance.get(`/package-includes/service-type/${serviceTypeId}`)
    const backendItems: BackendPackageInclude[] = response.data.data || response.data
    return Array.isArray(backendItems) ? backendItems.map(mapBackendToFrontend) : []
  },

  create: async (data: Omit<PackageInclude, 'id'>): Promise<PackageInclude> => {
    const payload = mapFrontendToBackend(data)
    const response = await axiosInstance.post('/package-includes', payload)
    const backendItem: BackendPackageInclude = response.data.data || response.data
    return mapBackendToFrontend(backendItem)
  },

  update: async (id: string, data: Partial<PackageInclude>): Promise<PackageInclude> => {
    const payload = mapFrontendToBackend(data)
    const response = await axiosInstance.put(`/package-includes/${id}`, payload)
    const backendItem: BackendPackageInclude = response.data.data || response.data
    return mapBackendToFrontend(backendItem)
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/package-includes/${id}`)
  },
}


