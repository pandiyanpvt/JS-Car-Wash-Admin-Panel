import axiosInstance from './axiosInstance'

interface BackendServiceType {
  id: number
  name: string
}

export interface ServiceType {
  id: string
  name: string
}

const mapBackendToFrontend = (backend: BackendServiceType): ServiceType => ({
  id: String(backend.id),
  name: backend.name,
})

export const serviceTypesApi = {
  getAll: async (): Promise<ServiceType[]> => {
    const response = await axiosInstance.get('/service-types')
    const backendItems: BackendServiceType[] = response.data.data || response.data
    return Array.isArray(backendItems) ? backendItems.map(mapBackendToFrontend) : []
  },
}


