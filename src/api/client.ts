import axios from 'axios'

const baseURL =
  (import.meta as any)?.env?.VITE_API_BASE_URL?.trim?.() ||
  (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) ||
  'http://localhost:3000'

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})

apiClient.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('adminAuth')
    if (stored) {
      const { token } = JSON.parse(stored)
      if (token) {
        config.headers = config.headers || {}
        ;(config.headers as any).Authorization = `Bearer ${token}`
      }
    }
  } catch {}
  return config
})

// Add response interceptor to handle connection errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
      console.error('API Connection Error: Backend server is not running or unreachable.')
      console.error('Please ensure your backend server is running on:', baseURL)
    }
    return Promise.reject(error)
  }
)

export const setAdminAuthToken = (token: string, user: any) => {
  try {
    localStorage.setItem('adminAuth', JSON.stringify({ token, user }))
  } catch {}
}

export const clearAdminAuthToken = () => {
  try {
    localStorage.removeItem('adminAuth')
  } catch {}
}

export default apiClient

