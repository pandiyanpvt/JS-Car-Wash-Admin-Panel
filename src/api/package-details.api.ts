import axiosInstance from './axiosInstance'

interface BackendPackageDetail {
  id: number
  package_id: number
  package_includes_id: number
  is_active: boolean
}

export interface PackageDetail {
  id: string
  packageId: string
  includeId: string
  status: 'active' | 'inactive'
}

const mapBackendToFrontend = (backend: BackendPackageDetail): PackageDetail => ({
  id: String(backend.id),
  packageId: String(backend.package_id),
  includeId: String(backend.package_includes_id),
  status: backend.is_active ? 'active' : 'inactive',
})

const mapFrontendToBackend = (frontend: Partial<PackageDetail>): Partial<BackendPackageDetail> => {
  const payload: Partial<BackendPackageDetail> = {}
  if (frontend.packageId !== undefined) payload.package_id = Number(frontend.packageId)
  if (frontend.includeId !== undefined) payload.package_includes_id = Number(frontend.includeId)
  if (frontend.status !== undefined) payload.is_active = frontend.status === 'active'
  return payload
}

export const packageDetailsApi = {
  getByPackage: async (packageId: string): Promise<PackageDetail[]> => {
    const response = await axiosInstance.get(`/package-details/package/${packageId}`)
    const backendItems: BackendPackageDetail[] = response.data.data || response.data
    return Array.isArray(backendItems) ? backendItems.map(mapBackendToFrontend) : []
  },

  create: async (data: Omit<PackageDetail, 'id'>): Promise<PackageDetail> => {
    const payload = mapFrontendToBackend(data)
    const response = await axiosInstance.post('/package-details', payload)
    const backendItem: BackendPackageDetail = response.data.data || response.data
    return mapBackendToFrontend(backendItem)
  },

  update: async (id: string, data: Partial<PackageDetail>): Promise<PackageDetail> => {
    const payload = mapFrontendToBackend(data)
    const response = await axiosInstance.put(`/package-details/${id}`, payload)
    const backendItem: BackendPackageDetail = response.data.data || response.data
    return mapBackendToFrontend(backendItem)
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/package-details/${id}`)
  },
}


