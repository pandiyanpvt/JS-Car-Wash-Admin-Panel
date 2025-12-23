import { useEffect, useMemo, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import { useAuth } from '../../context/AuthContext'
import { branchesApi, type Branch } from '../../api/branches.api'
import {
  analyticsApi,
  type AnalyticsPeriod,
  type BranchPerformanceItem,
  type RevenueTrendPoint,
  type ServiceTypeStat,
  type TopExtraWorksResponse,
  type TopProductsResponse,
} from '../../api/analytics.api'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// TypeScript interfaces
interface RevenueTrendData {
  date: string
  revenue: number
  orders: number
}

interface BranchPerformanceData {
  branch: string
  revenue: number
  orders: number
}

interface TopProductData {
  name: string
  sales: number
  revenue: number
}

interface ServiceTypeData {
  name: string
  orders: number
}

interface ExtraWorkData {
  name: string
  usage: number
}

type TimePeriod = AnalyticsPeriod

const COLORS = ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7']

export function Analytics() {
  const { isDeveloper } = useAuth()

  // Developer-only access check
  if (!isDeveloper()) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card>
          <div className="p-8 text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              This page is restricted to Developers only.
            </p>
            <p className="text-sm text-gray-500">
              You do not have permission to view analytics data.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  const [timePeriod, setTimePeriod] = useState<TimePeriod>('last_30_days')
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<string>('')

  const [revenueTrendData, setRevenueTrendData] = useState<RevenueTrendData[]>([])
  const [branchPerformanceData, setBranchPerformanceData] = useState<BranchPerformanceData[]>([])
  const [topProductsData, setTopProductsData] = useState<TopProductData[]>([])
  const [serviceTypeStats, setServiceTypeStats] = useState<ServiceTypeData[]>([])
  const [extraWorksStats, setExtraWorksStats] = useState<ExtraWorkData[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch branches and global analytics (branch performance, service types, extra works) on mount
  useEffect(() => {
    const init = async () => {
      try {
        setError(null)

        const [branchesData, branchPerf, serviceTypesRes, extraWorksRes] = await Promise.all([
          branchesApi.getAll(),
          analyticsApi.getBranchPerformance(),
          analyticsApi.getTopServiceTypes(),
          analyticsApi.getTopExtraWorks(),
        ])

        setBranches(branchesData)
        if (branchesData.length > 0) {
          setSelectedBranchId(branchesData[0].id)
        }

        const branchPerfData: BranchPerformanceData[] = (branchPerf as BranchPerformanceItem[]).map(
          (item) => ({
            branch: item.branch_name,
            revenue: item.revenue,
            orders: item.orders,
          })
        )
        setBranchPerformanceData(branchPerfData)

        const serviceData: ServiceTypeData[] = (serviceTypesRes as { service_type_stats: ServiceTypeStat[] })
          .service_type_stats.map((s) => ({
            name: s.service_type_name,
            orders: s.orders,
          }))
        setServiceTypeStats(serviceData)

        const extraWorksData: ExtraWorkData[] = (extraWorksRes as TopExtraWorksResponse).top_extra_works.map(
          (e) => ({
            name: e.extra_work_name,
            usage: e.usage_count,
          })
        )
        setExtraWorksStats(extraWorksData)
      } catch (err: any) {
        console.error('Error initializing analytics:', err)
        setError(err.response?.data?.message || 'Failed to load analytics data')
      }
    }

    void init()
  }, [])

  // Fetch revenue trend when branch or period changes
  useEffect(() => {
    const fetchRevenueTrend = async () => {
      if (!selectedBranchId) return

      try {
        setIsLoading(true)
        setError(null)

        const trendRes = await analyticsApi.getRevenueTrend(selectedBranchId, timePeriod)

        const trendData: RevenueTrendData[] = (trendRes as { trend: RevenueTrendPoint[] }).trend.map((t) => {
          const d = new Date(t.date)
          const label = isNaN(d.getTime())
            ? t.date
            : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

          return {
            date: label,
            revenue: t.revenue,
            orders: t.orders,
          }
        })
        setRevenueTrendData(trendData)
      } catch (err: any) {
        console.error('Error fetching revenue trend:', err)
        setError(err.response?.data?.message || 'Failed to load revenue trend')
      } finally {
        setIsLoading(false)
      }
    }

    void fetchRevenueTrend()
  }, [selectedBranchId, timePeriod])

  // Fetch top products when branch changes
  useEffect(() => {
    const fetchTopProducts = async () => {
      if (!selectedBranchId) return

      try {
        setError(null)

        const topProductsRes = await analyticsApi.getTopProducts(selectedBranchId)

        const topData: TopProductData[] = (topProductsRes as TopProductsResponse).top_products.map((p) => ({
          name: p.product_name,
          sales: p.total_quantity,
          revenue: p.total_revenue,
        }))
        setTopProductsData(topData)
      } catch (err: any) {
        console.error('Error fetching top products:', err)
        setError(err.response?.data?.message || 'Failed to load top products')
      }
    }

    void fetchTopProducts()
  }, [selectedBranchId])

  const handlePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period)
  }

  const timePeriodOptions = [
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_3_months', label: 'Last 3 Months' },
    { value: 'last_6_months', label: 'Last 6 Months' },
    { value: 'all', label: 'All Time' },
  ]

  const branchOptions = useMemo(
    () => branches.map((b) => ({ value: b.id, label: b.name })),
    [branches]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics</h1>
          <p className="text-gray-600">Advanced analytics and insights (Developer Only)</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Revenue Trends */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Revenue Trends</h3>
          <div className="flex items-center gap-4">
            <div className="w-48">
              <Select
                label="Time Period"
                value={timePeriod}
                onChange={(e) => handlePeriodChange(e.target.value as TimePeriod)}
                options={timePeriodOptions}
              />
            </div>
            <div className="w-48">
              <Select
                label="Branch"
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                options={branchOptions}
              />
            </div>
            <div className="text-sm text-gray-600 pt-6">
              {revenueTrendData.length} {revenueTrendData.length === 1 ? 'point' : 'points'}
            </div>
          </div>
        </div>
        {isLoading && (
          <div className="mb-4 text-sm text-gray-600">Loading revenue trend...</div>
        )}
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={revenueTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis
              yAxisId="left"
              stroke="#6b7280"
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#6b7280"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'Revenue ($)') {
                  return [`$${value.toLocaleString()}`, name]
                }
                return [value.toLocaleString(), name]
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ fill: '#0ea5e9', r: 4 }}
              name="Revenue ($)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              name="Orders"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch Performance */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Branch Performance</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={branchPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="branch" stroke="#6b7280" />
              <YAxis
                stroke="#6b7280"
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'Revenue ($)') {
                    return [`$${value.toLocaleString()}`, name]
                  }
                  return [value.toLocaleString(), name]
                }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#0ea5e9" name="Revenue ($)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="orders" fill="#10b981" name="Orders" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Selling Products */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topProductsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="sales"
              >
                {topProductsData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'sales') {
                    return [value.toLocaleString(), 'Sales']
                  }
                  return [value, name]
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {topProductsData.slice(0, 4).map((product, index) => (
              <div key={product.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-gray-600">{product.name}</span>
                <span className="ml-auto font-semibold text-gray-800">
                  ${product.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Service Types and Extra Works */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Service Types (by Orders)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serviceTypeStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number) => [value.toLocaleString(), 'Orders']}
              />
              <Bar dataKey="orders" fill="#0ea5e9" name="Orders" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Extra Works (by Usage)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={extraWorksStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number) => [value.toLocaleString(), 'Usage']}
              />
              <Bar dataKey="usage" fill="#10b981" name="Usage" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}

