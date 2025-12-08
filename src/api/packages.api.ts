import axiosInstance from './axiosInstance'

export interface PackageInclude {
  id: string
  packageId: string
  serviceName: string
  description: string
}

export interface PackageDetail {
  id: string
  packageId: string
  detailTitle: string
  detailDescription: string
}

export interface Package {
  id: string
  name: string
  price: number
  duration: number
  status: 'active' | 'inactive'
  includes: PackageInclude[]
  details: PackageDetail[]
}

export const packagesApi = {
  getAll: async (): Promise<Package[]> => {
    const response = await axiosInstance.get('/packages')
    return response.data
  },

  getById: async (id: string): Promise<Package> => {
    const response = await axiosInstance.get(`/packages/${id}`)
    return response.data
  },

  create: async (data: Omit<Package, 'id'>): Promise<Package> => {
    const response = await axiosInstance.post('/packages', data)
    return response.data
  },

  update: async (id: string, data: Partial<Package>): Promise<Package> => {
    const response = await axiosInstance.put(`/packages/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/packages/${id}`)
  },
}

