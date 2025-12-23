import { useEffect, useMemo, useState } from 'react'
import { StatCard } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import { ShoppingCart, DollarSign, Users, TrendingUp } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { branchesApi, type Branch } from '../../api/branches.api'
import {
  analyticsApi,
  type BranchOverviewResponse,
  type WeeklyAveragePoint,
} from '../../api/analytics.api'

interface RevenueChartPoint {
  month: string
  revenue: number
}

interface OrdersChartPoint {
  day: string
  orders: number
}

export function Dashboard() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<string>('')
  const [overview, setOverview] = useState<BranchOverviewResponse | null>(null)
  const [weeklyAverages, setWeeklyAverages] = useState<WeeklyAveragePoint[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setError(null)
        const data = await branchesApi.getAll()
        setBranches(data)
        if (data.length > 0) {
          setSelectedBranchId(data[0].id)
        }
      } catch (err: any) {
        console.error('Error fetching branches:', err)
        setError(err.response?.data?.message || 'Failed to fetch branches')
      }
    }

    fetchBranches()
  }, [])

  // Fetch analytics when branch changes
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!selectedBranchId) return

      try {
        setIsLoading(true)
        setError(null)

        const [overviewRes, weeklyRes] = await Promise.all([
          analyticsApi.getBranchOverview(selectedBranchId),
          analyticsApi.getWeeklyAverages(selectedBranchId),
        ])

        setOverview(overviewRes)
        setWeeklyAverages(weeklyRes.weekly_average_orders || [])
      } catch (err: any) {
        console.error('Error fetching analytics:', err)
        setError(err.response?.data?.message || 'Failed to fetch analytics data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [selectedBranchId])

  const revenueData: RevenueChartPoint[] = useMemo(() => {
    if (!overview?.monthly_revenue_last_6_months) return []

    return overview.monthly_revenue_last_6_months.map((item) => {
      // Backend month is "YYYY-MM" – convert to readable label
      const date = new Date(`${item.month}-01`)
      const label = isNaN(date.getTime())
        ? item.month
        : date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })

      return {
        month: label,
        revenue: item.revenue,
      }
    })
  }, [overview])

  const ordersData: OrdersChartPoint[] = useMemo(() => {
    if (!weeklyAverages) return []

    return weeklyAverages.map((item) => ({
      day: item.day_name.slice(0, 3),
      orders: item.average_orders,
    }))
  }, [weeklyAverages])

  const branchOptions = useMemo(
    () => branches.map((b) => ({ value: b.id, label: b.name })),
    [branches]
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">Branch-wise overview of orders and revenue.</p>
        </div>
        <div className="w-full sm:w-64">
          <Select
            label="Branch"
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            options={branchOptions}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="text-gray-600">Loading analytics...</div>
      )}

      {/* KPI Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Orders"
            value={overview.metrics.total_orders.toLocaleString()}
            icon={ShoppingCart}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Completed Orders"
            value={overview.metrics.total_completed_orders.toLocaleString()}
            icon={Users}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Avg Monthly Revenue"
            value={`$${overview.metrics.average_monthly_revenue.toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Today's Orders"
            value={overview.metrics.todays_orders.toLocaleString()}
            icon={TrendingUp}
            trend={{ value: 0, isPositive: true }}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="glass-dark rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ fill: '#0ea5e9', r: 4 }}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="glass-dark rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Average Orders by Weekday</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="orders" fill="#0ea5e9" name="Avg Orders" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

