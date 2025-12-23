import axiosInstance from './axiosInstance'

// Backend UserLog model structure
interface BackendUserLog {
  id: number
  user_id: number | null
  email: string | null
  login_type: string | null
  ip_address: string | null
  user_agent: string | null
  login_status: 'success' | 'failed'
  failure_reason: string | null
  logged_date_time: string
  description: string
  is_active: boolean
  user?: {
    id: number
    email_address: string
    phone_number: string
    first_name: string
    last_name: string
    user_name: string
    is_verified: boolean
    verified_at: string | null
    user_role_id: number
    is_active: boolean
    createdAt: string
    updatedAt: string
  } | null
}

// Frontend UserLog interface
export interface UserLog {
  id: string
  userId: string | null
  userName: string
  email: string
  action: string
  activityType: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'other'
  details?: string
  timestamp: string
  loginStatus: 'success' | 'failed'
  ipAddress?: string
  loginType?: string | null
  userAgent?: string | null
}

export interface PaginationInfo {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface PaginatedUserLogsResponse {
  items: UserLog[]
  pagination: PaginationInfo
}

// Helper function to map backend to frontend
const mapBackendToFrontend = (backend: BackendUserLog): UserLog => {
  const userName =
    backend.user && (backend.user.first_name || backend.user.last_name)
      ? `${backend.user.first_name ?? ''} ${backend.user.last_name ?? ''}`.trim()
      : backend.email || 'Unknown User'

  const desc = backend.description?.toLowerCase() || ''
  const activityType: UserLog['activityType'] =
    desc.includes('create') ? 'create' :
    desc.includes('update') ? 'update' :
    desc.includes('delete') ? 'delete' :
    desc.includes('login') || backend.login_status ? 'login' :
    desc.includes('logout') ? 'logout' :
    desc.includes('view') ? 'view' : 'other'

  const details = backend.failure_reason || backend.user_agent || undefined

  return {
    id: String(backend.id),
    userId: backend.user_id ? String(backend.user_id) : null,
    userName,
    email: backend.email || backend.user?.email_address || 'Unknown',
    action: backend.description,
    activityType,
    details,
    timestamp: backend.logged_date_time,
    loginStatus: backend.login_status,
    ipAddress: backend.ip_address || undefined,
    loginType: backend.login_type,
    userAgent: backend.user_agent || undefined,
  }
}

export const userLogsApi = {
  getAll: async (page: number = 1, pageSize: number = 10): Promise<PaginatedUserLogsResponse> => {
    const response = await axiosInstance.get('/user-logs', {
      params: { page, pageSize },
    })
    const responseData = response.data.data || response.data
    
    // Handle paginated response
    if (responseData.items && responseData.pagination) {
      return {
        items: Array.isArray(responseData.items)
          ? responseData.items.map(mapBackendToFrontend)
          : [],
        pagination: responseData.pagination,
      }
    }
    
    // Fallback for non-paginated response (backward compatibility)
    const backendLogs: BackendUserLog[] = Array.isArray(responseData) ? responseData : []
    return {
      items: backendLogs.map(mapBackendToFrontend),
      pagination: {
        page: 1,
        pageSize: backendLogs.length,
        totalItems: backendLogs.length,
        totalPages: 1,
      },
    }
  },

  getByUserId: async (userId: string): Promise<UserLog[]> => {
    const response = await axiosInstance.get(`/user-logs/user/${userId}`)
    const backendLogs: BackendUserLog[] = response.data.data || response.data
    return Array.isArray(backendLogs) 
      ? backendLogs.map(mapBackendToFrontend)
      : []
  },

  getById: async (id: string): Promise<UserLog> => {
    const response = await axiosInstance.get(`/user-logs/${id}`)
    const backendLog: BackendUserLog = response.data.data || response.data
    return mapBackendToFrontend(backendLog)
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/user-logs/${id}`)
  },
}

