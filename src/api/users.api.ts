import axiosInstance from './axiosInstance'

export interface User {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Developer' | 'Manager' | 'Worker'
  avatar?: string
  isActive: boolean
  createdAt: string
}

export interface UserLog {
  id: string
  userId: string
  action: string
  details?: string
  timestamp: string
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await axiosInstance.get('/users')
    return response.data
  },

  getById: async (id: string): Promise<User> => {
    const response = await axiosInstance.get(`/users/${id}`)
    return response.data
  },

  create: async (data: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const response = await axiosInstance.post('/users', data)
    return response.data
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await axiosInstance.put(`/users/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`)
  },

  getLogs: async (userId?: string): Promise<UserLog[]> => {
    const url = userId ? `/users/logs?userId=${userId}` : '/users/logs'
    const response = await axiosInstance.get(url)
    return response.data
  },
}

