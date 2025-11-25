// Mock data for development when backend is not available

import type { UserRole } from '../constants/roles'

export interface MockUser {
  id: string
  name: string
  email: string
  role: UserRole
  lastLogin?: string
}

export interface MockAuthResponse {
  token?: string
  accessToken?: string
  user?: MockUser
  message?: string
}

// Mock users database
const mockUsers: MockUser[] = [
  {
    id: '1',
    name: 'Product Developer',
    email: 'developer@jsfd.com',
    role: 'developer',
    lastLogin: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Operations Admin',
    email: 'admin@jsfd.com',
    role: 'admin',
    lastLogin: new Date().toISOString(),
  },
]

// Simulate network delay
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockAuthService = {
  async login(email: string, password: string): Promise<MockAuthResponse> {
    await delay(800)
    
    // For demo purposes, accept any email/password combination
    // In production, this would validate against real credentials
    const user = mockUsers.find((u) => u.email === email) || {
      id: Date.now().toString(),
      name: email.split('@')[0],
      email,
      role: 'admin' as UserRole,
    }

    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    return {
      accessToken: `mock_token_${Date.now()}`,
      token: `mock_token_${Date.now()}`,
      user: {
        ...user,
        lastLogin: new Date().toISOString(),
      },
      message: 'Login successful',
    }
  },

  async register(name: string, email: string, password: string): Promise<string> {
    await delay(1000)

    if (!name || !email || !password) {
      throw new Error('All fields are required')
    }

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Add new user to mock database
    const newUser: MockUser = {
      id: Date.now().toString(),
      name,
      email,
      role: 'booking',
    }
    mockUsers.push(newUser)

    return 'Registration successful. Please sign in.'
  },

  async forgotPassword(email: string): Promise<string> {
    await delay(800)

    if (!email) {
      throw new Error('Email is required')
    }

    // Simulate sending password reset email
    return `Password reset link has been sent to ${email}. Check your email inbox.`
  },

  async resetPassword(token: string, password: string): Promise<string> {
    await delay(800)

    if (!token || !password) {
      throw new Error('Token and password are required')
    }

    return 'Password reset successfully. You can now login with your new password.'
  },

  async logout(): Promise<void> {
    await delay(200)
    // Mock logout - just returns success
    return Promise.resolve()
  },
}

// Check if backend is available
export const isBackendAvailable = async (): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout

    const baseURL = (import.meta as any)?.env?.VITE_API_BASE_URL?.trim?.() || 'http://localhost:3000'
    await fetch(`${baseURL}/health`, {
      method: 'GET',
      signal: controller.signal,
      mode: 'no-cors', // This will still fail if server is down, but won't cause CORS errors
    })
    
    clearTimeout(timeoutId)
    return true
  } catch (error) {
    // If connection fails, backend is not available
    return false
  }
}

