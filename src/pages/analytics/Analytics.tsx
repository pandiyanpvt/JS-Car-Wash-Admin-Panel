import { useState, useMemo } from 'react'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { useAuth } from '../../context/AuthContext'
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
  month: string
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

interface DailyOrderFrequency {
  day: string
  orders: number
}

interface AnalyticsSummary {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  growthRate: number
}

type TimePeriod = '7d' | '30d' | '3m' | '6m' | '1y' | 'custom'

const COLORS = ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7']

// Helper function to get date range based on period
const getDateRange = (period: TimePeriod): { start: Date; end: Date } => {
  const end = new Date()
  const start = new Date()
  
  switch (period) {
    case '7d':
      start.setDate(end.getDate() - 7)
      break
    case '30d':
      start.setDate(end.getDate() - 30)
      break
    case '3m':
      start.setMonth(end.getMonth() - 3)
      break
    case '6m':
      start.setMonth(end.getMonth() - 6)
      break
    case '1y':
      start.setFullYear(end.getFullYear() - 1)
      break
    default:
      // Custom will be handled separately
      start.setMonth(end.getMonth() - 6)
  }
  
  return { start, end }
}

// Generate data based on date range
const generateRevenueTrendData = (
  startDate: Date,
  endDate: Date
): RevenueTrendData[] => {
  // Validate dates
  if (!startDate || !endDate || !(startDate instanceof Date) || !(endDate instanceof Date)) {
    console.error('Invalid dates provided to generateRevenueTrendData', { startDate, endDate })
    return []
  }

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.error('Invalid date values', { startDate, endDate })
    return []
  }

  const months: string[] = []
  const data: RevenueTrendData[] = []
  const diffTime = endDate.getTime() - startDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  // Handle invalid date ranges
  if (diffDays < 0 || !isFinite(diffDays)) {
    console.error('Invalid date range', { startDate, endDate, diffDays })
    return []
  }
  
  if (diffDays <= 30) {
    // Daily data for short periods
    const days = Math.min(diffDays, 30)
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      months.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    }
  } else if (diffDays <= 90) {
    // Weekly data
    const weeks = Math.ceil(diffDays / 7)
    for (let i = 0; i < weeks; i++) {
      months.push(`Week ${i + 1}`)
    }
  } else {
    // Monthly data
    const monthCount = Math.ceil(diffDays / 30)
    for (let i = 0; i < monthCount; i++) {
      const date = new Date(startDate)
      date.setMonth(date.getMonth() + i)
      months.push(date.toLocaleDateString('en-US', { month: 'short' }))
    }
  }
  
  months.forEach((month, index) => {
    const baseRevenue = 40000 + Math.random() * 30000
    const baseOrders = 250 + Math.random() * 200
    data.push({
      month,
      revenue: Math.round(baseRevenue * (1 + index * 0.05)),
      orders: Math.round(baseOrders * (1 + index * 0.03)),
    })
  })
  
  return data
}

const generateBranchPerformanceData = (
  _startDate: Date,
  _endDate: Date
): BranchPerformanceData[] => {
  // Note: Date parameters are kept for future API integration
  return [
    {
      branch: 'Downtown',
      revenue: 25000 + Math.random() * 10000,
      orders: 180 + Math.random() * 50,
    },
    {
      branch: 'Mall',
      revenue: 22000 + Math.random() * 8000,
      orders: 160 + Math.random() * 40,
    },
    {
      branch: 'Highway',
      revenue: 20000 + Math.random() * 6000,
      orders: 110 + Math.random() * 30,
    },
  ].map((item) => ({
    ...item,
    revenue: Math.round(item.revenue),
    orders: Math.round(item.orders),
  }))
}

const generateTopProductsData = (
  _startDate: Date,
  _endDate: Date
): TopProductData[] => {
  // Note: Date parameters are kept for future API integration
  return [
    { name: 'Car Shampoo', sales: 150, revenue: 3750 },
    { name: 'Wax Polish', sales: 120, revenue: 5400 },
    { name: 'Microfiber Towel', sales: 200, revenue: 3000 },
    { name: 'Tire Shine', sales: 90, revenue: 2700 },
    { name: 'Interior Cleaner', sales: 110, revenue: 3300 },
  ]
}

const generateDailyOrderFrequency = (
  _startDate: Date,
  _endDate: Date
): DailyOrderFrequency[] => {
  // Note: Date parameters are kept for future API integration
  return [
    { day: 'Mon', orders: 45 + Math.random() * 20 },
    { day: 'Tue', orders: 52 + Math.random() * 20 },
    { day: 'Wed', orders: 48 + Math.random() * 20 },
    { day: 'Thu', orders: 61 + Math.random() * 20 },
    { day: 'Fri', orders: 55 + Math.random() * 20 },
    { day: 'Sat', orders: 78 + Math.random() * 20 },
    { day: 'Sun', orders: 65 + Math.random() * 20 },
  ].map((item) => ({
    ...item,
    orders: Math.round(item.orders),
  }))
}

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

  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [selectedBranch, setSelectedBranch] = useState<string>('all')

  // Initialize dates based on selected period
  const { start: defaultStart, end: defaultEnd } = useMemo(
    () => getDateRange(timePeriod),
    [timePeriod]
  )

  const start = useMemo(() => {
    if (startDate) {
      const date = new Date(startDate)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
    return defaultStart
  }, [startDate, defaultStart])

  const end = useMemo(() => {
    if (endDate) {
      const date = new Date(endDate)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
    return defaultEnd
  }, [endDate, defaultEnd])

  // Generate data based on filters
  const revenueTrendData = useMemo(
    () => generateRevenueTrendData(start, end),
    [start, end]
  )

  const branchPerformanceData = useMemo(
    () => generateBranchPerformanceData(start, end),
    [start, end]
  )

  const topProductsData = useMemo(
    () => generateTopProductsData(start, end),
    [start, end]
  )

  const dailyOrderFrequency = useMemo(
    () => generateDailyOrderFrequency(start, end),
    [start, end]
  )

  // Calculate summary metrics
  const summary: AnalyticsSummary = useMemo(() => {
    const totalRevenue = revenueTrendData.reduce((sum, item) => sum + item.revenue, 0)
    const totalOrders = revenueTrendData.reduce((sum, item) => sum + item.orders, 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const growthRate = revenueTrendData.length > 1
      ? ((revenueTrendData[revenueTrendData.length - 1].revenue -
          revenueTrendData[0].revenue) /
          revenueTrendData[0].revenue) *
        100
      : 0

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      growthRate,
    }
  }, [revenueTrendData])

  const handlePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period)
    if (period !== 'custom') {
      setStartDate('')
      setEndDate('')
    }
  }

  const timePeriodOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '3m', label: 'Last 3 Months' },
    { value: '6m', label: 'Last 6 Months' },
    { value: '1y', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' },
  ]

  const branchOptions = [
    { value: 'all', label: 'All Branches' },
    { value: 'downtown', label: 'Downtown' },
    { value: 'mall', label: 'Mall' },
    { value: 'highway', label: 'Highway' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics</h1>
          <p className="text-gray-600">Advanced analytics and insights (Developer Only)</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Time Period"
            value={timePeriod}
            onChange={(e) => handlePeriodChange(e.target.value as TimePeriod)}
            options={timePeriodOptions}
          />
          {timePeriod === 'custom' && (
            <>
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </>
          )}
          <Select
            label="Branch"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            options={branchOptions}
          />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing data from{' '}
          <span className="font-semibold">
            {start.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>{' '}
          to{' '}
          <span className="font-semibold">
            {end.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-800">
              ${summary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p
              className={`text-xs mt-1 ${
                summary.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {summary.growthRate >= 0 ? '↑' : '↓'}{' '}
              {Math.abs(summary.growthRate).toFixed(1)}% vs previous period
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-gray-800">
              {summary.totalOrders.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Across all branches</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-1">Average Order Value</p>
            <p className="text-2xl font-bold text-gray-800">
              ${summary.averageOrderValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-gray-500 mt-1">Per transaction</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-1">Growth Rate</p>
            <p
              className={`text-2xl font-bold ${
                summary.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {summary.growthRate >= 0 ? '+' : ''}
              {summary.growthRate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Revenue growth</p>
          </div>
        </Card>
      </div>

      {/* Revenue Trends */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Revenue Trends</h3>
          <div className="text-sm text-gray-600">
            {revenueTrendData.length} {revenueTrendData.length === 1 ? 'period' : 'periods'}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={revenueTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
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
            {selectedBranch !== 'all' && (
              <span className="text-xs text-gray-500">Filtered: {selectedBranch}</span>
            )}
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

      {/* Daily Order Frequency */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Order Frequency</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyOrderFrequency}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#6b7280" />
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
            <Bar
              dataKey="orders"
              fill="#0ea5e9"
              name="Orders"
              radius={[8, 8, 0, 0]}
            >
              {dailyOrderFrequency.map((entry, index) => {
                const maxOrders = Math.max(...dailyOrderFrequency.map((d) => d.orders))
                const intensity = entry.orders / maxOrders
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      intensity > 0.8
                        ? '#0ea5e9'
                        : intensity > 0.6
                        ? '#3b82f6'
                        : intensity > 0.4
                        ? '#60a5fa'
                        : '#93c5fd'
                    }
                  />
                )
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

