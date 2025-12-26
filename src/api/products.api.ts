import axiosInstance from './axiosInstance'

// Stock entry structure (backend format)
interface BackendStockEntry {
  id?: number
  product_id?: number
  branch_id: number
  stock: number
  is_active?: boolean
  branch?: {
    id: number
    branch_name: string
    address: string
    phone_number: string
    email_address: string
    is_active: boolean
  }
}

// Frontend Stock entry structure
export interface StockEntry {
  id?: string
  product_id?: string
  branch_id: number
  stock: number
  is_active?: boolean
  branch?: {
    id: number
    branch_name: string
    address: string
    phone_number: string
    email_address: string
    is_active: boolean
  }
}

// Backend OurProduct model structure
interface BackendProduct {
  id: number
  product_name: string
  description: string | null
  amount: number
  stock?: number // Deprecated, use stock_entries instead
  img_url: string | null
  product_category_id: number | null
  is_active: boolean
  stock_entries?: BackendStockEntry[]
  category?: {
    id: number
    category: string
    is_active: boolean
  }
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
  stock?: number // Deprecated, use stockEntries instead
  stockEntries?: StockEntry[]
}

// Helper function to map backend to frontend
const mapBackendToFrontend = (backend: BackendProduct): Product => {
  const stockEntries: StockEntry[] = backend.stock_entries?.map(entry => ({
    id: entry.id !== undefined && entry.id !== null ? String(entry.id) : undefined,
    product_id: entry.product_id !== undefined && entry.product_id !== null ? String(entry.product_id) : undefined,
    branch_id: entry.branch_id,
    stock: entry.stock,
    is_active: entry.is_active,
    branch: entry.branch,
  })) || []

  return {
    id: String(backend.id),
    name: backend.product_name,
    description: backend.description || '',
    price: parseFloat(String(backend.amount)) || 0,
    categoryId: backend.product_category_id ? String(backend.product_category_id) : '',
    image: backend.img_url || undefined,
    status: backend.is_active ? 'active' : 'inactive',
    stock: backend.stock || 0, // Keep for backward compatibility
    stockEntries,
    category: backend.category?.category,
  }
}

// Helper function to map frontend to backend
const mapFrontendToBackend = (frontend: Partial<Product> & { stockEntries?: StockEntry[] }): any => {
  const backend: any = {}
  
  if (frontend.name !== undefined) backend.product_name = frontend.name
  if (frontend.description !== undefined) backend.description = frontend.description || null
  if (frontend.price !== undefined) backend.amount = frontend.price
  if (frontend.stock !== undefined) backend.stock = frontend.stock
  if (frontend.categoryId !== undefined) backend.product_category_id = frontend.categoryId ? parseInt(frontend.categoryId) : null
  if (frontend.status !== undefined) backend.is_active = frontend.status === 'active'
  if (frontend.stockEntries !== undefined) {
    // stock_entries will be handled separately in form data as JSON string
    backend.stock_entries = frontend.stockEntries
  }
  
  return backend
}

export interface ProductCategory {
  id: string
  name: string
  description: string
  productCount: number
  status?: 'active' | 'inactive'
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

  create: async (data: Omit<Product, 'id'> & { image?: string | File; stockEntries?: StockEntry[] }): Promise<Product> => {
    const backendData = mapFrontendToBackend(data)
    const formData = new FormData()
    
    // Handle image separately (can be File or URL string)
    if (data.image instanceof File) {
      formData.append('image', data.image)
    } else if (data.image && typeof data.image === 'string') {
      formData.append('img_url', data.image)
    }
    
    // Handle stock_entries as JSON string
    if (backendData.stock_entries && Array.isArray(backendData.stock_entries)) {
      const stockEntriesJson = JSON.stringify(
        backendData.stock_entries.map(entry => ({
          branch_id: entry.branch_id,
          stock: entry.stock,
        }))
      )
      formData.append('stock_entries', stockEntriesJson)
    }
    
    // Add other fields (excluding stock_entries as it's handled above)
    Object.keys(backendData).forEach(key => {
      if (key !== 'stock_entries' && backendData[key] !== undefined && backendData[key] !== null) {
        formData.append(key, String(backendData[key]))
      }
    })
    
    const response = await axiosInstance.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    const backendProduct: BackendProduct = response.data.data || response.data
    return mapBackendToFrontend(backendProduct)
  },

  update: async (id: string, data: Partial<Product> & { image?: string | File; stockEntries?: StockEntry[] }): Promise<Product> => {
    const backendData = mapFrontendToBackend(data)
    const formData = new FormData()
    
    // Handle image separately (can be File or URL string)
    if (data.image instanceof File) {
      formData.append('image', data.image)
    } else if (data.image !== undefined) {
      if (data.image === '' || data.image === null) {
        formData.append('img_url', '')
      } else if (typeof data.image === 'string') {
        formData.append('img_url', data.image)
      }
    }
    
    // Handle stock_entries as JSON string
    if (backendData.stock_entries && Array.isArray(backendData.stock_entries)) {
      const stockEntriesJson = JSON.stringify(
        backendData.stock_entries.map(entry => ({
          branch_id: entry.branch_id,
          stock: entry.stock,
        }))
      )
      formData.append('stock_entries', stockEntriesJson)
    }
    
    // Add other fields (excluding stock_entries as it's handled above)
    Object.keys(backendData).forEach(key => {
      if (key !== 'stock_entries' && backendData[key] !== undefined && backendData[key] !== null) {
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

  // Stock management methods
  getLowStock: async (threshold: number = 10, branchId?: number): Promise<Product[]> => {
    const params: any = { threshold }
    if (branchId) {
      params.branch_id = branchId
    }
    const response = await axiosInstance.get('/products/low-stock', { params })
    const backendProducts: BackendProduct[] = response.data.data || response.data
    return Array.isArray(backendProducts) 
      ? backendProducts.map(mapBackendToFrontend)
      : []
  },

  getProductStock: async (productId: string): Promise<StockEntry[]> => {
    const response = await axiosInstance.get(`/products/${productId}/stock`)
    const stockEntries: StockEntry[] = response.data.data || response.data
    return Array.isArray(stockEntries) ? stockEntries : []
  },

  getProductStockByBranch: async (productId: string, stockId: string): Promise<StockEntry> => {
    const response = await axiosInstance.get(`/products/${productId}/stock/${stockId}`)
    const stockEntries: StockEntry[] = response.data.data || response.data
    return Array.isArray(stockEntries) && stockEntries.length > 0 ? stockEntries[0] : stockEntries as any
  },

  updateProductStock: async (productId: string, stockId: string, stock: number): Promise<StockEntry> => {
    const response = await axiosInstance.put(`/products/${productId}/stock/${stockId}`, { stock })
    return response.data.data || response.data
  },
}

