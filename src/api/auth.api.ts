import axiosInstance from './axiosInstance'

export interface LoginCredentials {
  identifier: string // Can be email, phone, or username
  password: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    user_name?: string
    email_address: string
    phone_number?: string
    role?: {
      role_name: string
    }
    is_active: boolean
    is_verified: boolean
  }
}

export interface BackendResponse<T> {
  success: boolean
  message: string
  data: T
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<BackendResponse<AuthResponse>>('/users/login', credentials)
    // Backend returns { success, message, data: { token, user } }
    return response.data.data
  },

  logout: async (): Promise<void> => {
    // Backend doesn't have a logout endpoint, just clear local storage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('admin_user')
  },

  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    // Backend doesn't have a /auth/me endpoint, user info comes from login
    // This can be implemented if needed using JWT token decoding or a new endpoint
    throw new Error('getCurrentUser not implemented - user info stored from login')
  },
}

