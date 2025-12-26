import axiosInstance from './axiosInstance'

// Backend Order model structure
interface BackendOrder {
  id: number
  user_id: number
  user_full_name: string
  user_email_address: string
  user_phone_number: string
  branch_id: number
  total_amount: number
  status: 'pending' | 'in_progress' | 'in-progress' | 'completed'
  order_at: string
  started_at?: string | null
  completed_at?: string | null
  is_active: boolean
  work_start_inspections?: Array<{
    id: number
    order_id: number
    name: string
    notes: string | null
    photo_url: string
    photo_public_id: string
    is_active: boolean
    createdAt: string
    updatedAt: string
    completions?: Array<{
      id: number
      start_inspection_id: number
      notes: string | null
      photo_url: string
      photo_public_id: string
      verified: boolean
      is_active: boolean
      createdAt: string
      updatedAt: string
    }>
  }>
  service_details?: Array<{
    id: number
    package_id: number
    vehicle_type: string
    vehicle_number: string | null
    arrival_date: string | null
    arrival_time: string | null
    package?: {
      id: number
      package_name: string
      total_amount: number
    }
  }>
  product_details?: Array<{
    id: number
    product_id: number
    quantity: number
    amount: number
    product?: {
      id: number
      product_name: string
      amount: number
    }
  }>
  extra_work_details?: Array<{
    id: number
    extra_works_id: number
    extra_work?: {
      id: number
      name: string
      amount: number
    }
  }>
}

// Frontend Order interface
export interface OrderServiceDetail {
  id: string
  serviceName: string
  price: number
}

export interface OrderProductDetail {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
}

export interface OrderExtraWork {
  id: string
  workName: string
  price: number
}

export interface OrderInspection {
  id: string
  name: string
  notes: string | null
  photoUrl: string | null
  completions: Array<{
    id: string
    notes: string | null
    photoUrl: string | null
    verified: boolean
  }>
}

export interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  vehicleType: string
  vehicleModel: string
  vehiclePlate: string
  orderDate: string
  startedAt?: string | null
  completedAt?: string | null
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
  totalAmount: number
  services: OrderServiceDetail[]
  products: OrderProductDetail[]
  extraWorks: OrderExtraWork[]
  paymentStatus: 'pending' | 'paid' | 'refunded'
  branchId?: string
  inspections?: OrderInspection[]
}

// Helper function to map backend to frontend
const mapBackendToFrontend = (backend: BackendOrder): Order => {
  const firstService = backend.service_details?.[0]
  
  return {
    id: String(backend.id),
    customerName: backend.user_full_name,
    customerEmail: backend.user_email_address,
    customerPhone: backend.user_phone_number,
    vehicleType: firstService?.vehicle_type || '',
    vehicleModel: '', // Not in backend
    vehiclePlate: firstService?.vehicle_number || '',
    orderDate: backend.order_at,
    startedAt: backend.started_at || null,
    completedAt: backend.completed_at || null,
    status: backend.status === 'completed' ? 'completed' : (backend.status === 'in-progress' || backend.status === 'in_progress') ? 'in-progress' : 'pending',
    totalAmount: parseFloat(String(backend.total_amount)) || 0,
    services: (backend.service_details || []).map(s => ({
      id: String(s.id),
      serviceName: s.package?.package_name || 'Service',
      price: parseFloat(String(s.package?.total_amount || 0)),
    })),
    products: (backend.product_details || []).map(p => ({
      id: String(p.id),
      productId: String(p.product_id),
      productName: p.product?.product_name || 'Product',
      quantity: p.quantity,
      price: parseFloat(String(p.amount)),
    })),
    extraWorks: (backend.extra_work_details || []).map(ew => ({
      id: String(ew.id),
      workName: ew.extra_work?.name || 'Extra Work',
      price: parseFloat(String(ew.extra_work?.amount || 0)),
    })),
    paymentStatus: 'paid', // Backend doesn't track payment status
    branchId: backend.branch_id ? String(backend.branch_id) : undefined,
    inspections: backend.work_start_inspections ? backend.work_start_inspections.map((insp) => ({
      id: String(insp.id),
      name: insp.name,
      notes: insp.notes,
      photoUrl: insp.photo_url || null,
      completions: (insp.completions || []).map((comp) => ({
        id: String(comp.id),
        notes: comp.notes,
        photoUrl: comp.photo_url || null,
        verified: comp.verified,
      })),
    })) : undefined,
  }
}

export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    const response = await axiosInstance.get('/orders')
    const backendOrders: BackendOrder[] = response.data.data || response.data
    return Array.isArray(backendOrders) 
      ? backendOrders.map(mapBackendToFrontend)
      : []
  },

  getById: async (id: string): Promise<Order> => {
    const response = await axiosInstance.get(`/orders/${id}`)
    const backendOrder: BackendOrder = response.data.data || response.data
    return mapBackendToFrontend(backendOrder)
  },

  updateStatus: async (id: string, status: 'pending' | 'completed'): Promise<Order> => {
    const response = await axiosInstance.put(`/orders/${id}/status`, { status })
    const backendOrder: BackendOrder = response.data.data || response.data
    return mapBackendToFrontend(backendOrder)
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/orders/${id}`)
  },

  startWork: async (orderId: string, items: Array<{ name: string; notes: string | null; image: string }>, images: File[]): Promise<any> => {
    const formData = new FormData()
    
    // Add the data JSON string
    const dataPayload = {
      order_id: Number(orderId),
      items: items.map((item, index) => ({
        name: item.name,
        notes: item.notes,
        image: `item_image_${index + 1}`
      }))
    }
    formData.append('data', JSON.stringify(dataPayload))
    
    // Add image files
    images.forEach((image, index) => {
      if (image) {
        formData.append(`item_image_${index + 1}`, image)
      }
    })
    
    const response = await axiosInstance.post('/orders/start-work', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  completeWork: async (orderId: string, confirmations: Array<{ start_inspection_id: number; verified: boolean; notes: string | null; image: string }>, images: File[]): Promise<any> => {
    const formData = new FormData()
    
    // Add the data JSON string
    const dataPayload = {
      order_id: Number(orderId),
      confirmations: confirmations.map((confirmation, index) => ({
        start_inspection_id: confirmation.start_inspection_id,
        verified: confirmation.verified,
        notes: confirmation.notes,
        image: `confirm_image_${index + 1}`
      }))
    }
    formData.append('data', JSON.stringify(dataPayload))
    
    // Add image files
    images.forEach((image, index) => {
      if (image) {
        formData.append(`confirm_image_${index + 1}`, image)
      }
    })
    
    const response = await axiosInstance.post('/orders/complete-work', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getStartWorkInspections: async (orderId: string): Promise<Array<{ id: number; name: string; notes: string | null; image_url?: string }>> => {
    // Get inspections from order details (work_start_inspections)
    try {
      const response = await axiosInstance.get(`/orders/${orderId}`)
      const backendOrder: BackendOrder = response.data.data || response.data
      const inspections = backendOrder.work_start_inspections || []
      // Map backend format to frontend format
      return inspections.map((insp) => ({
        id: insp.id,
        name: insp.name,
        notes: insp.notes,
        image_url: insp.photo_url,
      }))
    } catch (err) {
      console.warn('Failed to fetch start work inspections:', err)
      return []
    }
  },
}

