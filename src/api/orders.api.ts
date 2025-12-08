import axiosInstance from './axiosInstance'

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  branchId: string
  packageId?: string
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
  totalAmount: number
  createdAt: string
  scheduledDate?: string
}

export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    const response = await axiosInstance.get('/orders')
    return response.data
  },

  getById: async (id: string): Promise<Order> => {
    const response = await axiosInstance.get(`/orders/${id}`)
    return response.data
  },

  updateStatus: async (id: string, status: Order['status']): Promise<Order> => {
    const response = await axiosInstance.patch(`/orders/${id}/status`, { status })
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/orders/${id}`)
  },
}

