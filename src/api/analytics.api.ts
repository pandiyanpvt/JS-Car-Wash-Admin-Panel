import axiosInstance from './axiosInstance'

export interface BranchOverviewMetrics {
  total_orders: number
  total_completed_orders: number
  average_monthly_revenue: number
  todays_orders: number
}

export interface MonthlyRevenuePoint {
  month: string // e.g. "2025-07"
  revenue: number
}

export interface BranchOverviewResponse {
  branch_id: number
  metrics: BranchOverviewMetrics
  monthly_revenue_last_6_months: MonthlyRevenuePoint[]
}

export interface WeeklyAveragePoint {
  day_of_week: number
  day_name: string
  average_orders: number
}

export interface WeeklyAveragesResponse {
  branch_id: number
  period: string
  weekly_average_orders: WeeklyAveragePoint[]
}

export type AnalyticsPeriod = 'last_30_days' | 'last_3_months' | 'last_6_months' | 'all'

export interface RevenueTrendPoint {
  date: string
  orders: number
  revenue: number
}

export interface RevenueTrendResponse {
  branch_id: number
  period: AnalyticsPeriod | string
  trend: RevenueTrendPoint[]
}

export interface BranchPerformanceItem {
  branch_id: number
  branch_name: string
  orders: number
  revenue: number
}

export interface TopProductItem {
  product_id: number
  product_name: string
  total_quantity: number
  total_revenue: number
}

export interface TopProductsResponse {
  branch_id: number
  top_products: TopProductItem[]
}

export interface ServiceTypeStat {
  service_type_id: number
  service_type_name: string
  orders: number
}

export interface ServiceTypeStatsResponse {
  service_type_stats: ServiceTypeStat[]
}

export interface ExtraWorkStat {
  extra_work_id: number
  extra_work_name: string
  usage_count: number
}

export interface TopExtraWorksResponse {
  top_extra_works: ExtraWorkStat[]
}

export const analyticsApi = {
  getBranchOverview: async (branchId: string | number): Promise<BranchOverviewResponse> => {
    const response = await axiosInstance.get('/analytics/branch-overview', {
      params: { branch_id: branchId },
    })
    // Backend returns { success, message, data }
    return response.data.data || response.data
  },

  getWeeklyAverages: async (branchId: string | number): Promise<WeeklyAveragesResponse> => {
    const response = await axiosInstance.get('/analytics/weekly-averages', {
      params: { branch_id: branchId },
    })
    // Backend returns { success, message, data }
    return response.data.data || response.data
  },

  getRevenueTrend: async (
    branchId: string | number,
    period: AnalyticsPeriod
  ): Promise<RevenueTrendResponse> => {
    const response = await axiosInstance.get('/analytics/revenue-trend', {
      params: { branch_id: branchId, period },
    })
    return response.data.data || response.data
  },

  getBranchPerformance: async (): Promise<BranchPerformanceItem[]> => {
    const response = await axiosInstance.get('/analytics/branch-performance')
    const data: BranchPerformanceItem[] = response.data.data || response.data
    return Array.isArray(data) ? data : []
  },

  getTopProducts: async (branchId: string | number): Promise<TopProductsResponse> => {
    const response = await axiosInstance.get('/analytics/top-products', {
      params: { branch_id: branchId },
    })
    return response.data.data || response.data
  },

  getTopServiceTypes: async (): Promise<ServiceTypeStatsResponse> => {
    const response = await axiosInstance.get('/analytics/top-service-types')
    return response.data.data || response.data
  },

  getTopExtraWorks: async (): Promise<TopExtraWorksResponse> => {
    const response = await axiosInstance.get('/analytics/top-extra-works')
    return response.data.data || response.data
  },
}


