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
    return response.data
  },

  getById: async (id: string): Promise<Product> => {
    const response = await axiosInstance.get(`/products/${id}`)
    return response.data
  },

  create: async (data: Omit<Product, 'id'>): Promise<Product> => {
    const response = await axiosInstance.post('/products', data)
    return response.data
  },

  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await axiosInstance.put(`/products/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/products/${id}`)
  },

  getCategories: async (): Promise<ProductCategory[]> => {
    const response = await axiosInstance.get('/products/categories')
    return response.data
  },

  createCategory: async (data: Omit<ProductCategory, 'id' | 'productCount'>): Promise<ProductCategory> => {
    const response = await axiosInstance.post('/products/categories', data)
    return response.data
  },

  updateCategory: async (id: string, data: Partial<ProductCategory>): Promise<ProductCategory> => {
    const response = await axiosInstance.put(`/products/categories/${id}`, data)
    return response.data
  },

  deleteCategory: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/products/categories/${id}`)
  },
}

