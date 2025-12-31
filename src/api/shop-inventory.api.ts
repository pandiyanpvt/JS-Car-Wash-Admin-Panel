import axiosInstance from './axiosInstance'

// Backend ShopInventoryStock model structure
interface BackendShopInventoryStock {
  id: number
  shop_inventory_id: number
  branch_id: number
  stock: number
  is_active: boolean
  createdAt: string
  updatedAt: string
  branch?: {
    id: number
    branch_name: string
  }
}

// Backend ShopInventoryStockLog model structure
interface BackendShopInventoryStockLog {
  id: number
  shop_inventory_stock_id: number
  user_id: number
  action: 'add' | 'remove'
  quantity: number
  stock_before: number
  stock_after: number
  notes: string | null
  created_at: string
  user?: {
    id: number
    first_name: string
    last_name: string
    user_name: string
    email_address: string
  }
}

// Backend ShopInventory model structure
interface BackendShopInventory {
  id: number
  product_name: string
  img_url: string | null
  is_active: boolean
  createdAt: string
  updatedAt: string
  stock_entries?: BackendShopInventoryStock[]
}

// Frontend ShopInventoryStock interface
export interface ShopInventoryStock {
  id: string
  shop_inventory_id: string
  branch_id: number
  stock: number
  is_active: boolean
  createdAt: string
  updatedAt: string
  branch?: {
    id: number
    branch_name: string
  }
}

// Frontend ShopInventoryStockLog interface
export interface ShopInventoryStockLog {
  id: string
  shop_inventory_stock_id: string
  user_id: string
  action: 'add' | 'remove'
  quantity: number
  stock_before: number
  stock_after: number
  notes: string | null
  created_at: string
  user?: {
    id: string
    first_name: string
    last_name: string
    user_name: string
    email_address: string
  }
}

// Frontend ShopInventory interface
export interface ShopInventory {
  id: string
  product_name: string
  img_url: string | null
  is_active: boolean
  createdAt: string
  updatedAt: string
  stock_entries?: ShopInventoryStock[]
}

// Pagination interfaces
export interface PaginationInfo {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface PaginatedStockLogsResponse {
  items: ShopInventoryStockLog[]
  pagination: PaginationInfo
}

// Helper function to map backend stock entry to frontend
const mapStockEntry = (backend: BackendShopInventoryStock): ShopInventoryStock => {
  return {
    id: String(backend.id),
    shop_inventory_id: String(backend.shop_inventory_id),
    branch_id: backend.branch_id,
    stock: backend.stock,
    is_active: backend.is_active,
    createdAt: backend.createdAt,
    updatedAt: backend.updatedAt,
    branch: backend.branch,
  }
}

// Helper function to map backend log to frontend
const mapStockLog = (backend: BackendShopInventoryStockLog): ShopInventoryStockLog => {
  return {
    id: String(backend.id),
    shop_inventory_stock_id: String(backend.shop_inventory_stock_id),
    user_id: String(backend.user_id),
    action: backend.action,
    quantity: backend.quantity,
    stock_before: backend.stock_before,
    stock_after: backend.stock_after,
    notes: backend.notes,
    created_at: backend.created_at,
    user: backend.user ? {
      id: String(backend.user.id),
      first_name: backend.user.first_name,
      last_name: backend.user.last_name,
      user_name: backend.user.user_name,
      email_address: backend.user.email_address,
    } : undefined,
  }
}

// Helper function to map backend to frontend
const mapBackendToFrontend = (backend: BackendShopInventory): ShopInventory => {
  return {
    id: String(backend.id),
    product_name: backend.product_name,
    img_url: backend.img_url,
    is_active: backend.is_active,
    createdAt: backend.createdAt,
    updatedAt: backend.updatedAt,
    stock_entries: backend.stock_entries?.map(mapStockEntry),
  }
}

export const shopInventoryApi = {
  getAll: async (): Promise<ShopInventory[]> => {
    const response = await axiosInstance.get('/shop-inventory')
    const backendItems: BackendShopInventory[] = response.data.data || response.data
    return Array.isArray(backendItems) 
      ? backendItems.map(mapBackendToFrontend)
      : []
  },

  getById: async (id: string): Promise<ShopInventory> => {
    const response = await axiosInstance.get(`/shop-inventory/${id}`)
    const backendItem: BackendShopInventory = response.data.data || response.data
    return mapBackendToFrontend(backendItem)
  },

  create: async (data: {
    product_name: string
    is_active: boolean
    image?: File
    stockEntries?: Array<{ branch_id: number; stock: number }>
  }): Promise<ShopInventory> => {
    const formData = new FormData()
    formData.append('product_name', data.product_name)
    formData.append('is_active', String(data.is_active))
    
    if (data.image) {
      formData.append('image', data.image)
    }

    // Handle stock_entries as JSON string (similar to products)
    if (data.stockEntries && Array.isArray(data.stockEntries) && data.stockEntries.length > 0) {
      const stockEntriesJson = JSON.stringify(
        data.stockEntries.map(entry => ({
          branch_id: entry.branch_id,
          stock: entry.stock,
        }))
      )
      formData.append('stock_entries', stockEntriesJson)
    }

    const response = await axiosInstance.post('/shop-inventory', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    const backendItem: BackendShopInventory = response.data.data || response.data
    return mapBackendToFrontend(backendItem)
  },

  update: async (id: string, data: {
    product_name: string
    is_active: boolean
  }): Promise<ShopInventory> => {
    const response = await axiosInstance.put(`/shop-inventory/${id}`, data)
    const backendItem: BackendShopInventory = response.data.data || response.data
    return mapBackendToFrontend(backendItem)
  },

  updateImage: async (id: string, image: File): Promise<ShopInventory> => {
    const formData = new FormData()
    formData.append('image', image)

    const response = await axiosInstance.put(`/shop-inventory/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    const backendItem: BackendShopInventory = response.data.data || response.data
    return mapBackendToFrontend(backendItem)
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/shop-inventory/${id}`)
  },

  addStock: async (id: string, branchId: number, quantity: number, notes?: string): Promise<ShopInventoryStock> => {
    const response = await axiosInstance.post(`/shop-inventory/${id}/add-stock`, { 
      branch_id: branchId,
      quantity,
      notes 
    })
    const backendStock: BackendShopInventoryStock = response.data.data || response.data
    return mapStockEntry(backendStock)
  },

  removeStock: async (id: string, branchId: number, quantity: number, notes?: string): Promise<ShopInventoryStock> => {
    const response = await axiosInstance.post(`/shop-inventory/${id}/remove-stock`, { 
      branch_id: branchId,
      quantity,
      notes 
    })
    const backendStock: BackendShopInventoryStock = response.data.data || response.data
    return mapStockEntry(backendStock)
  },

  getStockLogs: async (stockId: string, page: number = 1, pageSize: number = 5): Promise<PaginatedStockLogsResponse> => {
    const response = await axiosInstance.get(`/shop-inventory-stock/${stockId}/logs`, {
      params: { page, pageSize },
    })
    const responseData = response.data.data || response.data
    
    // Handle paginated response
    if (responseData.items && responseData.pagination) {
      return {
        items: Array.isArray(responseData.items)
          ? responseData.items.map(mapStockLog)
          : [],
        pagination: responseData.pagination,
      }
    }
    
    // Fallback for non-paginated response (backward compatibility)
    const backendLogs: BackendShopInventoryStockLog[] = Array.isArray(responseData) ? responseData : []
    return {
      items: backendLogs.map(mapStockLog),
      pagination: {
        page: 1,
        pageSize: backendLogs.length,
        totalItems: backendLogs.length,
        totalPages: 1,
      },
    }
  },
}

