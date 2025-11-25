import apiClient, { clearAdminAuthToken, setAdminAuthToken } from './client'
import { mockAuthService } from './mockData'

type AuthResponse = {
  token?: string
  accessToken?: string
  user?: any
  message?: string
}

const persistSession = (data: AuthResponse) => {
  const token = data?.accessToken || data?.token
  if (token) {
    setAdminAuthToken(token, data?.user || null)
  }
  return {
    token: token || null,
    user: data?.user || null,
    message: data?.message,
  }
}

// Check if error is a connection error
const isConnectionError = (error: any): boolean => {
  return (
    error?.code === 'ECONNREFUSED' ||
    error?.code === 'ERR_NETWORK' ||
    error?.message?.includes('Network Error') ||
    error?.message?.includes('ERR_CONNECTION_REFUSED') ||
    (error?.response?.status === undefined && error?.request)
  )
}

export async function registerAdmin(payload: { name: string; email: string; password: string }) {
  try {
    const { data } = await apiClient.post('/auth/register', payload)
    return data?.message || 'Registration successful. Please sign in.'
  } catch (error: any) {
    if (isConnectionError(error)) {
      console.warn('⚠️ Backend unavailable. Using mock data for registration.')
      return await mockAuthService.register(payload.name, payload.email, payload.password)
    }
    throw error
  }
}

export async function loginAdmin(payload: { email: string; password: string }) {
  if (!payload.email || !payload.password) throw new Error('Email and password are required')
  
  try {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload)
    return persistSession(data || {})
  } catch (error: any) {
    if (isConnectionError(error)) {
      console.warn('⚠️ Backend unavailable. Using mock data for login.')
      const mockResponse = await mockAuthService.login(payload.email, payload.password)
      return persistSession(mockResponse)
    }
    throw error
  }
}

export async function forgotPassword(email: string) {
  if (!email) throw new Error('Email is required')
  
  try {
    const { data } = await apiClient.post('/auth/forgot-password', { email })
    return data?.message || 'Password reset link sent to your email.'
  } catch (error: any) {
    if (isConnectionError(error)) {
      console.warn('⚠️ Backend unavailable. Using mock data for forgot password.')
      return await mockAuthService.forgotPassword(email)
    }
    throw error
  }
}

export async function resetPassword(payload: { token: string; password: string }) {
  if (!payload.token) throw new Error('Reset token is required')
  
  try {
    const { data } = await apiClient.post('/auth/reset-password', payload)
    return data?.message || 'Password reset successfully.'
  } catch (error: any) {
    if (isConnectionError(error)) {
      console.warn('⚠️ Backend unavailable. Using mock data for reset password.')
      return await mockAuthService.resetPassword(payload.token, payload.password)
    }
    throw error
  }
}

export async function logoutAdmin() {
  try {
    await apiClient.post('/auth/logout')
  } catch (error: any) {
    if (isConnectionError(error)) {
      console.warn('⚠️ Backend unavailable. Using mock data for logout.')
      await mockAuthService.logout()
    }
  }
  clearAdminAuthToken()
}

