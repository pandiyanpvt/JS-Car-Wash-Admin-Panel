import { useEffect, useMemo, useState } from 'react'
import { StatCard } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import { Badge } from '../../components/ui/Badge'
import { ShoppingCart, DollarSign, Users, TrendingUp, AlertTriangle, Package } from 'lucide-react'
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
import { productsApi, type Product } from '../../api/products.api'
import { useAuth } from '../../context/AuthContext'

interface RevenueChartPoint {
  month: string
  revenue: number
}

interface OrdersChartPoint {
  day: string
  orders: number
}

export function Dashboard() {
  const { getAdminBranchId, isDeveloper } = useAuth()
  const adminBranchId = getAdminBranchId()
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<string>('')
  const [overview, setOverview] = useState<BranchOverviewResponse | null>(null)
  const [weeklyAverages, setWeeklyAverages] = useState<WeeklyAveragePoint[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setError(null)
        const data = await branchesApi.getAll()
        
        // If user has admin_branch restriction, filter to only that branch
        if (adminBranchId && !isDeveloper()) {
          const restrictedBranch = data.find((b) => b.id === adminBranchId)
          if (restrictedBranch) {
            setBranches([restrictedBranch])
            setSelectedBranchId(adminBranchId)
          } else {
            setBranches([])
            setError('Your assigned branch is not available')
          }
        } else {
          setBranches(data)
          if (data.length > 0) {
            setSelectedBranchId(data[0].id)
          }
        }
      } catch (err: any) {
        console.error('Error fetching branches:', err)
        setError(err.response?.data?.message || 'Failed to fetch branches')
      }
    }

    fetchBranches()
  }, [adminBranchId, isDeveloper])

  // Fetch analytics and stock alerts when branch changes
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!selectedBranchId) return

      try {
        setIsLoading(true)
        setError(null)

        const branchIdNum = parseInt(selectedBranchId)
        const [overviewRes, weeklyRes, lowStockRes] = await Promise.all([
          analyticsApi.getBranchOverview(selectedBranchId),
          analyticsApi.getWeeklyAverages(selectedBranchId),
          productsApi.getLowStock(10, branchIdNum), // threshold = 10
        ])

        setOverview(overviewRes)
        setWeeklyAverages(weeklyRes.weekly_average_orders || [])

        // Separate low stock and out of stock products
        const lowStock: Product[] = []
        const outOfStock: Product[] = []

        lowStockRes.forEach((product) => {
          let stock = 0
          
          if (product.stockEntries && product.stockEntries.length > 0) {
            // Check stock entries for the selected branch
            const branchStock = product.stockEntries.find(
              (entry) => entry.branch_id === branchIdNum
            )
            if (branchStock) {
              stock = branchStock.stock
            }
          } else if (product.stock !== undefined) {
            // Fallback to old stock field
            stock = product.stock
          }

          // Categorize based on stock level
          if (stock === 0) {
            outOfStock.push(product)
          } else if (stock > 0 && stock <= 10) {
            lowStock.push(product)
          }
        })

        setLowStockProducts(lowStock)
        setOutOfStockProducts(outOfStock)
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
        {(!adminBranchId || isDeveloper()) && branches.length > 1 && (
          <div className="w-full sm:w-64">
            <Select
              label="Branch"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              options={branchOptions}
            />
          </div>
        )}
        {adminBranchId && !isDeveloper() && branches.length === 1 && (
          <div className="w-full sm:w-64">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Branch: </span>
              {branches[0]?.name}
            </div>
          </div>
        )}
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

      {/* Charts and Stock Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side - Charts (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <div className="glass-dark rounded-xl p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend (Last 6 Months)</h3>
            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280' }}
                    axisLine={{ stroke: '#6b7280' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280' }}
                    axisLine={{ stroke: '#6b7280' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
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
          </div>

          {/* Orders Chart */}
          <div className="glass-dark rounded-xl p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Average Orders by Weekday</h3>
            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ordersData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280' }}
                    axisLine={{ stroke: '#6b7280' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280' }}
                    axisLine={{ stroke: '#6b7280' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="rect"
                  />
                  <Bar dataKey="orders" fill="#0ea5e9" name="Avg Orders" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Side - Stock Alerts (1/3 width) */}
        <div className="glass-dark rounded-xl p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4 flex-shrink-0">
            <Package className="w-5 h-5 text-gray-800" />
            <h3 className="text-lg font-semibold text-gray-800">Stock Alerts</h3>
          </div>
          
          {/* Scrollable container for all alerts */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Out of Stock Alerts */}
            {outOfStockProducts.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <h4 className="text-sm font-semibold text-red-600">Out of Stock</h4>
                  <Badge variant="danger" className="ml-auto">
                    {outOfStockProducts.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {outOfStockProducts.map((product) => {
                    const branchStock = product.stockEntries?.find(
                      (entry) => entry.branch_id === parseInt(selectedBranchId)
                    )
                    const stock = branchStock?.stock ?? product.stock ?? 0
                    return (
                      <div
                        key={product.id}
                        className="bg-red-50 border border-red-200 rounded-lg p-3 hover:bg-red-100 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              Stock: <span className="font-semibold text-red-600">0</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Low Stock Alerts */}
            {lowStockProducts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <h4 className="text-sm font-semibold text-yellow-600">Low Stock</h4>
                  <Badge variant="warning" className="ml-auto">
                    {lowStockProducts.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {lowStockProducts.map((product) => {
                    const branchStock = product.stockEntries?.find(
                      (entry) => entry.branch_id === parseInt(selectedBranchId)
                    )
                    const stock = branchStock?.stock ?? product.stock ?? 0
                    return (
                      <div
                        key={product.id}
                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 hover:bg-yellow-100 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              Stock: <span className="font-semibold text-yellow-600">{stock}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* No Alerts Message */}
            {outOfStockProducts.length === 0 && lowStockProducts.length === 0 && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No stock alerts</p>
                <p className="text-xs text-gray-400 mt-1">All products are well stocked</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

