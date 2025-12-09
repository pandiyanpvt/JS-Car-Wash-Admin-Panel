import axiosInstance from './axiosInstance'

// Backend Gallery model structure
interface BackendGalleryItem {
  id: number
  img_url: string
  is_active: boolean
}

// Frontend GalleryImage interface
export interface GalleryImage {
  id: string
  url: string
  title?: string
  uploadedAt: string
}

// Helper function to map backend to frontend
const mapBackendToFrontend = (backend: BackendGalleryItem): GalleryImage => {
  return {
    id: String(backend.id),
    url: backend.img_url,
    uploadedAt: new Date().toISOString().split('T')[0], // Backend doesn't have timestamp
  }
}

export const galleryApi = {
  getAll: async (): Promise<GalleryImage[]> => {
    const response = await axiosInstance.get('/gallery')
    const backendItems: BackendGalleryItem[] = response.data.data || response.data
    return Array.isArray(backendItems) 
      ? backendItems.map(mapBackendToFrontend)
      : []
  },

  getById: async (id: string): Promise<GalleryImage> => {
    const response = await axiosInstance.get(`/gallery/${id}`)
    const backendItem: BackendGalleryItem = response.data.data || response.data
    return mapBackendToFrontend(backendItem)
  },

  create: async (imageFile: File): Promise<GalleryImage> => {
    const formData = new FormData()
    formData.append('image', imageFile)
    const response = await axiosInstance.post('/gallery', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    const backendItem: BackendGalleryItem = response.data.data || response.data
    return mapBackendToFrontend(backendItem)
  },

  createFromUrl: async (imageUrl: string): Promise<GalleryImage> => {
    // If backend supports URL, use it; otherwise fetch and convert to File
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const file = new File([blob], 'image.jpg', { type: blob.type })
    return galleryApi.create(file)
  },

  update: async (id: string, imageFile?: File): Promise<GalleryImage> => {
    const formData = new FormData()
    if (imageFile) {
      formData.append('image', imageFile)
    }
    const response = await axiosInstance.put(`/gallery/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    const backendItem: BackendGalleryItem = response.data.data || response.data
    return mapBackendToFrontend(backendItem)
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/gallery/${id}`)
  },
}

