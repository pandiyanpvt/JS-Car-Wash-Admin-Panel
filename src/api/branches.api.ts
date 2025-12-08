import axiosInstance from './axiosInstance'

export interface Branch {
  id: string
  name: string
  address: string
  phone: string
  manager: string
  managerEmail: string
  status: 'active' | 'inactive'
}

export const branchesApi = {
  getAll: async (): Promise<Branch[]> => {
    const response = await axiosInstance.get('/branches')
    return response.data
  },

  getById: async (id: string): Promise<Branch> => {
    const response = await axiosInstance.get(`/branches/${id}`)
    return response.data
  },

  create: async (data: Omit<Branch, 'id'>): Promise<Branch> => {
    const response = await axiosInstance.post('/branches', data)
    return response.data
  },

  update: async (id: string, data: Partial<Branch>): Promise<Branch> => {
    const response = await axiosInstance.put(`/branches/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/branches/${id}`)
  },
}

