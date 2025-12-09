import axiosInstance from './axiosInstance'

// Backend OurProduct model structure
interface BackendProduct {
  id: number
  product_name: string
  description: string | null
  amount: number
  stock: number
  img_url: string | null
  product_category_id: number | null
  is_active: boolean
}

// Frontend Product interface
export interface Product {
  id: string
  name: string
  description: string
  price: number
  categoryId: string
  category?: string
  image?: string
  status: 'active' | 'inactive'
  stock: number
}

// Helper function to map backend to frontend
const mapBackendToFrontend = (backend: BackendProduct): Product => {
  return {
    id: String(backend.id),
    name: backend.product_name,
    description: backend.description || '',
    price: parseFloat(String(backend.amount)) || 0,
    categoryId: backend.product_category_id ? String(backend.product_category_id) : '',
    image: backend.img_url || undefined,
    status: backend.is_active ? 'active' : 'inactive',
    stock: backend.stock || 0,
  }
}

// Helper function to map frontend to backend
const mapFrontendToBackend = (frontend: Partial<Product>): any => {
  const backend: any = {}
  
  if (frontend.name !== undefined) backend.product_name = frontend.name
  if (frontend.description !== undefined) backend.description = frontend.description || null
  if (frontend.price !== undefined) backend.amount = frontend.price
  if (frontend.stock !== undefined) backend.stock = frontend.stock
  if (frontend.categoryId !== undefined) backend.product_category_id = frontend.categoryId ? parseInt(frontend.categoryId) : null
  if (frontend.status !== undefined) backend.is_active = frontend.status === 'active'
  
  return backend
}

export interface ProductCategory {
  id: string
  name: string
  description: string
  productCount: number
}

export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await axiosInstance.get('/products')
    const backendProducts: BackendProduct[] = response.data.data || response.data
    return Array.isArray(backendProducts) 
      ? backendProducts.map(mapBackendToFrontend)
      : []
  },

  getById: async (id: string): Promise<Product> => {
    const response = await axiosInstance.get(`/products/${id}`)
    const backendProduct: BackendProduct = response.data.data || response.data
    return mapBackendToFrontend(backendProduct)
  },

  create: async (data: Omit<Product, 'id'>): Promise<Product> => {
    const backendData = mapFrontendToBackend(data)
    const formData = new FormData()
    
    Object.keys(backendData).forEach(key => {
      if (key === 'image' && data.image instanceof File) {
        formData.append('image', data.image)
      } else if (backendData[key] !== undefined && backendData[key] !== null) {
        formData.append(key, String(backendData[key]))
      }
    })
    
    const response = await axiosInstance.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    const backendProduct: BackendProduct = response.data.data || response.data
    return mapBackendToFrontend(backendProduct)
  },

  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    const backendData = mapFrontendToBackend(data)
    const formData = new FormData()
    
    Object.keys(backendData).forEach(key => {
      if (key === 'image' && data.image instanceof File) {
        formData.append('image', data.image)
      } else if (backendData[key] !== undefined && backendData[key] !== null) {
        formData.append(key, String(backendData[key]))
      }
    })
    
    const response = await axiosInstance.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    const backendProduct: BackendProduct = response.data.data || response.data
    return mapBackendToFrontend(backendProduct)
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/products/${id}`)
    // Backend returns { success, message }
  },

  getCategories: async (): Promise<ProductCategory[]> => {
    const response = await axiosInstance.get('/product-categories')
    // Backend returns { success, message, data }
    return response.data.data || response.data
  },

  createCategory: async (data: Omit<ProductCategory, 'id' | 'productCount'>): Promise<ProductCategory> => {
    const response = await axiosInstance.post('/product-categories', data)
    // Backend returns { success, message, data }
    return response.data.data || response.data
  },

  updateCategory: async (id: string, data: Partial<ProductCategory>): Promise<ProductCategory> => {
    const response = await axiosInstance.put(`/product-categories/${id}`, data)
    // Backend returns { success, message, data }
    return response.data.data || response.data
  },

  deleteCategory: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/product-categories/${id}`)
    // Backend returns { success, message }
  },
}

