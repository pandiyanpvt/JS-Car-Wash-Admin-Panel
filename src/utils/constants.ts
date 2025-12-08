export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  BRANCHES: '/branches',
  PACKAGES: '/packages',
  EXTRA_WORKS: '/extra-works',
  PRODUCTS: '/products',
  PRODUCT_CATEGORIES: '/product-categories',
  CONTACTS: '/contacts',
  GALLERY: '/gallery',
  ORDERS: '/orders',
  REVIEWS: '/reviews',
  ANALYTICS: '/analytics',
  USERS: '/users',
  LOGS: '/logs',
  ROLES: '/roles',
} as const

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
] as const

export const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

