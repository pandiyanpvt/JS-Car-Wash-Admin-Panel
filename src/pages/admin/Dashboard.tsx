import { useState } from 'react'
import { 
  Box, 
  Typography, 
  Card, 
  Chip,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { motion } from 'framer-motion'
import {
  BusinessCenter as ServiceIcon,
  Spa as SpaIcon,
  Restaurant as RestaurantIcon,
  DirectionsCar as CarIcon,
  Add as AddIcon,
  Store as StoreIcon,
  People as PeopleIcon,
  BookOnline as BookingsIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as ProductIcon,
  Inventory as InventoryIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

// Sample data
const bookingsOverTimeData = [
  { month: 'Jan', bookings: 45, revenue: 4200 },
  { month: 'Feb', bookings: 52, revenue: 4800 },
  { month: 'Mar', bookings: 48, revenue: 4500 },
  { month: 'Apr', bookings: 61, revenue: 5800 },
  { month: 'May', bookings: 55, revenue: 5200 },
  { month: 'Jun', bookings: 58, revenue: 5400 },
  { month: 'Jul', bookings: 65, revenue: 6200 },
]

const weeklyRevenueData = [
  { week: 'Week 1', revenue: 4200 },
  { week: 'Week 2', revenue: 4800 },
  { week: 'Week 3', revenue: 4500 },
  { week: 'Week 4', revenue: 5800 },
]

const monthlyBookingsData = [
  { month: 'Jan', bookings: 180 },
  { month: 'Feb', bookings: 208 },
  { month: 'Mar', bookings: 192 },
  { month: 'Apr', bookings: 244 },
]

const popularServicesData = [
  { name: 'Basic Wash', value: 45, color: '#FF2B29' },
  { name: 'Full Service', value: 32, color: '#00BFFF' },
  { name: 'Premium Detail', value: 18, color: '#0080FF' },
  { name: 'Interior Cleaning', value: 12, color: '#C0C0C0' },
]

const todayAppointments = [
  { id: 1, customer: 'John Doe', service: 'Basic Wash', time: '10:00 AM', status: 'confirmed' },
  { id: 2, customer: 'Jane Smith', service: 'Full Service', time: '11:30 AM', status: 'confirmed' },
  { id: 3, customer: 'Bob Johnson', service: 'Premium Detail', time: '2:00 PM', status: 'pending' },
]

const lowStockProducts = [
  { id: 1, name: 'Car Wax', stock: 5, threshold: 10 },
  { id: 2, name: 'Interior Cleaner', stock: 3, threshold: 10 },
  { id: 3, name: 'Tire Shine', stock: 8, threshold: 10 },
]

const recentActivities = [
  { id: 1, type: 'login', user: 'Admin User', action: 'logged in', time: '10:30 AM' },
  { id: 2, type: 'update', user: 'Admin User', action: 'updated booking #123', time: '10:15 AM' },
  { id: 3, type: 'login', user: 'Staff Member', action: 'logged in', time: '9:45 AM' },
  { id: 4, type: 'update', user: 'Admin User', action: 'created new service', time: '9:30 AM' },
]

const services = [
  { id: 1, name: 'Basic Wash', category: 'Car Wash', icon: <CarIcon />, enabled: true, bookings: 45 },
  { id: 2, name: 'Full Service', category: 'Detailing', icon: <ServiceIcon />, enabled: true, bookings: 32 },
  { id: 3, name: 'Premium Detail', category: 'Detailing', icon: <SpaIcon />, enabled: true, bookings: 18 },
  { id: 4, name: 'Interior Cleaning', category: 'Interior', icon: <RestaurantIcon />, enabled: true, bookings: 12 },
]

function AdminDashboard() {
  const [serviceStates, setServiceStates] = useState<Record<number, boolean>>(
    services.reduce((acc, service) => ({ ...acc, [service.id]: service.enabled }), {} as Record<number, boolean>)
  )
  const [filterPeriod, setFilterPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [analyticsFilter, setAnalyticsFilter] = useState<'date' | 'service' | 'branch'>('date')
  const [selectedBranch, setSelectedBranch] = useState<string>('all')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  // Get current user role from localStorage
  const getCurrentUserRole = (): 'developer' | 'admin' | 'booking' => {
    try {
      const stored = localStorage.getItem('adminAuth')
      if (!stored) return 'admin'
      const { user } = JSON.parse(stored)
      return (user?.role as 'developer' | 'admin' | 'booking') || 'admin'
    } catch {
      return 'admin'
    }
  }

  const currentUserRole = getCurrentUserRole()
  const isSuperAdmin = currentUserRole === 'developer'
  
  // Access control: Check if user is authenticated and has admin/developer access
  const isAuthenticated = () => {
    try {
      const stored = localStorage.getItem('adminAuth')
      if (!stored) return false
      const { token } = JSON.parse(stored)
      return Boolean(token)
    } catch {
      return false
    }
  }

  const hasAdminAccess = () => {
    const role = getCurrentUserRole()
    // Only allow developer and admin roles to access dashboard
    return role === 'developer' || role === 'admin'
  }

  // Redirect if not authenticated or doesn't have admin access
  if (!isAuthenticated()) {
    window.location.href = '/login'
    return null
  }

  if (!hasAdminAccess()) {
    // Redirect booking users to appropriate page
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Alert severity="error">
          You don't have permission to access this page. Please contact an administrator.
        </Alert>
      </Box>
    )
  }

  const toggleService = (id: number) => {
    setServiceStates(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Super Admin metrics (all branches)
  const superAdminMetrics = [
    { title: 'Total Car Wash Centers', value: '5', color: '#FF2B29', icon: <StoreIcon /> },
    { title: 'Total Admins', value: '12', color: '#00BFFF', icon: <PeopleIcon /> },
    { title: 'Total Bookings (All Branches)', value: '1,245', color: '#0080FF', icon: <BookingsIcon /> },
    { title: 'Total Revenue (All Branches)', value: '$125,400', color: '#4CAF50', icon: <MoneyIcon /> },
    { title: 'Total Product Sales (All Branches)', value: '$12,340', color: '#FF9800', icon: <ProductIcon /> },
  ]

  // Regular Admin metrics (current branch)
  const adminMetrics = [
    { title: 'Bookings Today', value: '12', color: '#FF2B29', icon: <BookingsIcon /> },
    { title: "Today's Revenue", value: '$1,200', color: '#00BFFF', icon: <MoneyIcon /> },
    { title: 'Product Sales Today', value: '$340', color: '#0080FF', icon: <ProductIcon /> },
    { title: 'Low Stock Alerts', value: `${lowStockProducts.length}`, color: '#FF9800', icon: <InventoryIcon /> },
  ]

  const metrics = isSuperAdmin ? superAdminMetrics : adminMetrics

  return (
    <Box sx={{ p: 4, minHeight: '100vh' }}>
      {/* Main Content Card */}
      <Card
        sx={{
          borderRadius: 4,
          backgroundColor: '#ffffff',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid #C0C0C0',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          p: 3,
        }}
      >
        {/* Header with Filters */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {isSuperAdmin ? 'Super Admin Dashboard' : 'Admin Dashboard'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Period</InputLabel>
              <Select
                value={filterPeriod}
                label="Period"
                onChange={(e) => setFilterPeriod(e.target.value as 'week' | 'month' | 'year')}
              >
                <MenuItem value="week">Weekly</MenuItem>
                <MenuItem value="month">Monthly</MenuItem>
                <MenuItem value="year">Yearly</MenuItem>
              </Select>
            </FormControl>
            {currentUserRole === 'developer' && (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Branch</InputLabel>
                <Select
                  value={selectedBranch}
                  label="Branch"
                  onChange={(e) => setSelectedBranch(e.target.value)}
                >
                  <MenuItem value="all">All Branches</MenuItem>
                  <MenuItem value="branch1">Branch 1</MenuItem>
                  <MenuItem value="branch2">Branch 2</MenuItem>
                  <MenuItem value="branch3">Branch 3</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </Box>

        {/* Metrics Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: currentUserRole === 'developer' ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${metric.color}20 0%, ${metric.color}10 100%)`,
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: `1px solid rgba(255, 255, 255, 0.3)`,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ color: metric.color }}>{metric.icon}</Box>
                  {metric.title === 'Low Stock Alerts' && parseInt(metric.value) > 0 && (
                    <Alert severity="warning" sx={{ py: 0, px: 1, fontSize: '0.7rem' }}>!</Alert>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                  {metric.title}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: metric.color }}>
                  {metric.value}
                </Typography>
              </Card>
            </motion.div>
          ))}
        </Box>

        {/* Filter Tabs for Analytics */}
        <Box sx={{ mb: 3 }}>
          <Tabs value={analyticsFilter} onChange={(_e, v) => setAnalyticsFilter(v)} sx={{ mb: 2 }}>
            <Tab label="By Date" value="date" />
            <Tab label="By Service" value="service" />
            <Tab label="By Branch" value="branch" />
          </Tabs>
          {analyticsFilter === 'date' && (
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{ textField: { size: 'small' } }}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </LocalizationProvider>
            </Box>
          )}
        </Box>

        {/* Charts Row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
          {/* Bookings Summary Chart */}
          <Card sx={{ 
            p: 2, 
            borderRadius: 3, 
            backgroundColor: '#ffffff',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            border: '1px solid #C0C0C0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {filterPeriod === 'week' ? 'Weekly' : filterPeriod === 'month' ? 'Monthly' : 'Yearly'} Bookings Summary
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={filterPeriod === 'month' ? monthlyBookingsData : bookingsOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#C0C0C0" />
                <XAxis dataKey={filterPeriod === 'month' ? 'month' : 'month'} stroke="#000000" />
                <YAxis stroke="#000000" />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="#00BFFF" 
                  strokeWidth={3}
                  dot={{ fill: '#00BFFF', r: 4 }}
                  name="Bookings"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Revenue Summary Chart */}
          <Card sx={{ 
            p: 2, 
            borderRadius: 3, 
            backgroundColor: '#ffffff',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            border: '1px solid #C0C0C0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Revenue Summary
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#C0C0C0" />
                <XAxis dataKey="week" stroke="#000000" />
                <YAxis stroke="#000000" />
                <Tooltip />
                <Bar dataKey="revenue" fill="#FF2B29" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Product Sales Summary */}
          <Card sx={{ 
            p: 2, 
            borderRadius: 3, 
            backgroundColor: '#ffffff',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            border: '1px solid #C0C0C0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Product Sales Summary
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#C0C0C0" />
                <XAxis dataKey="week" stroke="#000000" />
                <YAxis stroke="#000000" />
                <Tooltip />
                <Bar dataKey="revenue" fill="#FF9800" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Popular Services */}
          <Card sx={{ 
            p: 2, 
            borderRadius: 3, 
            backgroundColor: '#ffffff',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            border: '1px solid #C0C0C0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Popular Services
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={popularServicesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {popularServicesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Box>

        {/* Today's Appointments and Low Stock Alerts */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
          {/* Today's Appointments */}
          <Card sx={{ 
            p: 2, 
            borderRadius: 3, 
            backgroundColor: '#ffffff',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            border: '1px solid #C0C0C0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimeIcon /> Today's Appointments
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Service</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todayAppointments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell>{apt.customer}</TableCell>
                      <TableCell>{apt.service}</TableCell>
                      <TableCell>{apt.time}</TableCell>
                      <TableCell>
                        <Chip 
                          label={apt.status} 
                          size="small" 
                          color={apt.status === 'confirmed' ? 'success' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {/* Low Stock Alerts */}
          <Card sx={{ 
            p: 2, 
            borderRadius: 3, 
            backgroundColor: '#ffffff',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            border: '1px solid #C0C0C0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <InventoryIcon color="warning" /> Low Stock Alerts
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Threshold</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowStockProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={product.stock} 
                          size="small" 
                          color="error"
                        />
                      </TableCell>
                      <TableCell>{product.threshold}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>

        {/* Recent Activities (Super Admin only) */}
        {currentUserRole === 'developer' && (
          <Card sx={{ 
            p: 2, 
            borderRadius: 3, 
            backgroundColor: '#ffffff',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            border: '1px solid #C0C0C0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            mb: 3,
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Recent Activities (Logins, Updates)
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>{activity.user}</TableCell>
                      <TableCell>
                        <Chip 
                          label={activity.action} 
                          size="small" 
                          color={activity.type === 'login' ? 'primary' : 'secondary'}
                        />
                      </TableCell>
                      <TableCell>{activity.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {/* Quick Actions */}
        <Card sx={{ 
          p: 2, 
          borderRadius: 3, 
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)', 
          mb: 3,
        }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {['Approve Bookings', 'Reschedule Bookings', 'View Services', 'Add Promotion'].map((action) => (
              <motion.div
                key={action}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Chip
                  label={action}
                  sx={{
                    backgroundColor: '#00BFFF', // Cyan Blue (from logo)
                    color: 'white',
                    fontWeight: 500,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#0080FF', // Darker Blue (from logo)
                    },
                  }}
                />
              </motion.div>
            ))}
          </Box>
        </Card>

        {/* Services Section */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Services
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: serviceStates[service.id] 
                      ? '1px solid #00BFFF' 
                      : '1px solid #C0C0C0',
                    backgroundColor: serviceStates[service.id] 
                      ? 'rgba(0, 191, 255, 0.1)' 
                      : '#ffffff',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        backgroundColor: serviceStates[service.id] ? '#FF2B29' : '#C0C0C0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: serviceStates[service.id] ? 'white' : '#ffffff',
                      }}
                    >
                      {service.icon}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {service.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {service.category}
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={serviceStates[service.id]}
                    onChange={() => toggleService(service.id)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#00BFFF',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#00BFFF',
                      },
                    }}
                  />
                </Card>
              </motion.div>
            ))}
            {/* Add More Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: '2px dashed #C0C0C0',
                  backgroundColor: '#fafafa',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  minHeight: 100,
                }}
              >
                <AddIcon sx={{ color: '#A8A8A8', mb: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Add More
                </Typography>
              </Card>
            </motion.div>
          </Box>
        </Box>
      </Card>
    </Box>
  )
}

export default AdminDashboard
