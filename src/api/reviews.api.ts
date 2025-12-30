import axiosInstance from './axiosInstance'

// Backend UserReview model structure
interface BackendReview {
  id: number
  order_id: number
  rating: number
  review: string | null
  is_show_others: boolean
  is_active: boolean
  createdAt: string
  order?: {
    id: number
    user?: {
      first_name: string
      last_name: string
      email_address: string
    }
  }
}

// Frontend Review interface
export interface Review {
  id: string
  customerName: string
  customerEmail: string
  rating: number
  comment: string
  orderId: string
  createdAt: string
  status: 'approved' | 'pending' | 'rejected'
  isShowOthers: boolean // Maps to backend is_show_others
}

// Helper function to map backend to frontend
const mapBackendToFrontend = (backend: BackendReview): Review => {
  const order = backend.order
  const user = order?.user
  const customerName =
    user && (user.first_name || user.last_name)
      ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
      : 'Customer'

  return {
    id: String(backend.id),
    customerName,
    customerEmail: user?.email_address || '',
    rating: backend.rating,
    comment: backend.review || '',
    orderId: String(backend.order_id),
    createdAt: backend.createdAt || new Date().toISOString(),
    status: backend.is_show_others ? 'approved' : 'pending',
    isShowOthers: backend.is_show_others,
  }
}

export const reviewsApi = {
  getAll: async (): Promise<Review[]> => {
    const response = await axiosInstance.get('/reviews')
    const backendReviews: BackendReview[] = response.data.data || response.data
    return Array.isArray(backendReviews) 
      ? backendReviews.map((review) => mapBackendToFrontend(review))
      : []
  },

  getById: async (id: string): Promise<Review> => {
    const response = await axiosInstance.get(`/reviews/${id}`)
    const backendReview: BackendReview = response.data.data || response.data
    return mapBackendToFrontend(backendReview)
  },

  update: async (id: string, data: Partial<Review>): Promise<Review> => {
    const backendData: Partial<BackendReview> = {}
    if (data.rating !== undefined) backendData.rating = data.rating
    if (data.comment !== undefined) backendData.review = data.comment || null
    if (data.status !== undefined) backendData.is_show_others = data.status === 'approved'
    
    const response = await axiosInstance.put(`/reviews/${id}`, backendData)
    const backendReview: BackendReview = response.data.data || response.data
    return mapBackendToFrontend(backendReview)
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/reviews/${id}`)
  },

  approve: async (id: string): Promise<Review> => {
    const response = await axiosInstance.put(`/reviews/${id}/approve`)
    const backendReview: BackendReview = response.data.data || response.data
    return mapBackendToFrontend(backendReview)
  },

  disapprove: async (id: string): Promise<Review> => {
    const response = await axiosInstance.put(`/reviews/${id}/disapprove`)
    const backendReview: BackendReview = response.data.data || response.data
    return mapBackendToFrontend(backendReview)
  },
}

