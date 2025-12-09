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
    // Backend returns { success, message, data }
    return response.data.data || response.data
  },

  getById: async (id: string): Promise<User> => {
    const response = await axiosInstance.get(`/users/${id}`)
    // Backend returns { success, message, data }
    return response.data.data || response.data
  },

  create: async (data: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    // Note: Backend uses /users/register for registration
    const response = await axiosInstance.post('/users/register', data)
    // Backend returns { success, message, data }
    return response.data.data || response.data
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await axiosInstance.put(`/users/${id}`, data)
    // Backend returns { success, message, data }
    return response.data.data || response.data
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`)
    // Backend returns { success, message }
  },

  getLogs: async (userId?: string): Promise<UserLog[]> => {
    // Backend uses /user-logs endpoint
    const url = userId ? `/user-logs/user/${userId}` : '/user-logs'
    const response = await axiosInstance.get(url)
    // Backend returns { success, message, data }
    return response.data.data || response.data
  },
}

