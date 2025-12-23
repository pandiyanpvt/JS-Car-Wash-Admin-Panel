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
  status: 'pending' | 'completed'
  order_at: string
  is_active: boolean
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

export interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  vehicleType: string
  vehicleModel: string
  vehiclePlate: string
  orderDate: string
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
  totalAmount: number
  services: OrderServiceDetail[]
  products: OrderProductDetail[]
  extraWorks: OrderExtraWork[]
  paymentStatus: 'pending' | 'paid' | 'refunded'
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
    status: backend.status === 'completed' ? 'completed' : 'pending',
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
}

