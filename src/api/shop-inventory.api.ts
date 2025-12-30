import axiosInstance from './axiosInstance'

// Backend ShopInventory model structure
interface BackendShopInventory {
  id: number
  product_name: string
  stock: number
  img_url: string | null
  is_active: boolean
  createdAt: string
  updatedAt: string
}

// Frontend ShopInventory interface
export interface ShopInventory {
  id: string
  product_name: string
  stock: number
  img_url: string | null
  is_active: boolean
  createdAt: string
  updatedAt: string
}

// Helper function to map backend to frontend
const mapBackendToFrontend = (backend: BackendShopInventory): ShopInventory => {
  return {
    id: String(backend.id),
    product_name: backend.product_name,
    stock: backend.stock,
    img_url: backend.img_url,
    is_active: backend.is_active,
    createdAt: backend.createdAt,
    updatedAt: backend.updatedAt,
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
    stock: number
    is_active: boolean
    image?: File
  }): Promise<ShopInventory> => {
    const formData = new FormData()
    formData.append('product_name', data.product_name)
    formData.append('stock', String(data.stock))
    formData.append('is_active', String(data.is_active))
    
    if (data.image) {
      formData.append('image', data.image)
    }

    const response = await axiosInstance.post('/shop-inventory', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    const backendItem: BackendShopInventory = response.data.data || response.data
    return mapBackendToFrontend(backendItem)
  },

  update: async (id: string, data: {
    product_name: string
    stock: number
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

  addStock: async (id: string, quantity: number): Promise<ShopInventory> => {
    const response = await axiosInstance.post(`/shop-inventory/${id}/add-stock`, { quantity })
    const backendItem: BackendShopInventory = response.data.data || response.data
    return mapBackendToFrontend(backendItem)
  },

  removeStock: async (id: string, quantity: number): Promise<ShopInventory> => {
    const response = await axiosInstance.post(`/shop-inventory/${id}/remove-stock`, { quantity })
    const backendItem: BackendShopInventory = response.data.data || response.data
    return mapBackendToFrontend(backendItem)
  },
}

