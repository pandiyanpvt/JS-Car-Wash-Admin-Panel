import { Card } from '../../components/ui/Card'
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

const revenueTrendData = [
  { month: 'Jan', revenue: 45000, orders: 320 },
  { month: 'Feb', revenue: 52000, orders: 380 },
  { month: 'Mar', revenue: 48000, orders: 350 },
  { month: 'Apr', revenue: 61000, orders: 420 },
  { month: 'May', revenue: 55000, orders: 390 },
  { month: 'Jun', revenue: 67000, orders: 450 },
]

const branchPerformanceData = [
  { branch: 'Downtown', revenue: 25000, orders: 180 },
  { branch: 'Mall', revenue: 22000, orders: 160 },
  { branch: 'Highway', revenue: 20000, orders: 110 },
]

const topProductsData = [
  { name: 'Car Shampoo', sales: 150, revenue: 3750 },
  { name: 'Wax Polish', sales: 120, revenue: 5400 },
  { name: 'Microfiber Towel', sales: 200, revenue: 3000 },
  { name: 'Tire Shine', sales: 90, revenue: 2700 },
]

const dailyOrderFrequency = [
  { day: 'Mon', orders: 45 },
  { day: 'Tue', orders: 52 },
  { day: 'Wed', orders: 48 },
  { day: 'Thu', orders: 61 },
  { day: 'Fri', orders: 55 },
  { day: 'Sat', orders: 78 },
  { day: 'Sun', orders: 65 },
]

const COLORS = ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7']

export function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics</h1>
        <p className="text-gray-600">Advanced analytics and insights (Developer Only)</p>
      </div>

      {/* Revenue Trends */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={revenueTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis yAxisId="left" stroke="#6b7280" />
            <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Branch Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={branchPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="branch" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
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
                {topProductsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Daily Order Frequency Heatmap */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Order Frequency</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyOrderFrequency}>
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
            <Bar
              dataKey="orders"
              fill="#0ea5e9"
              name="Orders"
              radius={[8, 8, 0, 0]}
            >
              {dailyOrderFrequency.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.orders > 70
                      ? '#0ea5e9'
                      : entry.orders > 50
                      ? '#3b82f6'
                      : '#60a5fa'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

