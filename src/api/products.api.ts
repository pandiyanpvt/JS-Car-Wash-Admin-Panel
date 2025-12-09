import axiosInstance from './axiosInstance'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  categoryId: string
  image?: string
  status: 'active' | 'inactive'
  stock?: number
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
    // Backend returns { success, message, data }
    return response.data.data || response.data
  },

  getById: async (id: string): Promise<Product> => {
    const response = await axiosInstance.get(`/products/${id}`)
    // Backend returns { success, message, data }
    return response.data.data || response.data
  },

  create: async (data: Omit<Product, 'id'>): Promise<Product> => {
    // Note: Backend expects FormData for file upload
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'image' && data.image) {
        // If image is a File object, append it
        formData.append('image', data.image as any)
      } else if (data[key as keyof typeof data] !== undefined) {
        formData.append(key, String(data[key as keyof typeof data]))
      }
    })
    const response = await axiosInstance.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    // Backend returns { success, message, data }
    return response.data.data || response.data
  },

  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    // Note: Backend expects FormData for file upload
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'image' && data.image) {
        formData.append('image', data.image as any)
      } else if (data[key as keyof typeof data] !== undefined) {
        formData.append(key, String(data[key as keyof typeof data]))
      }
    })
    const response = await axiosInstance.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    // Backend returns { success, message, data }
    return response.data.data || response.data
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

