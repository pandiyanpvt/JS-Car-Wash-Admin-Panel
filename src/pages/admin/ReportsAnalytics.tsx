import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material'
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from '@mui/icons-material'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

const bookingsByService = [
  { service: 'Basic Wash', bookings: 45 },
  { service: 'Full Service', bookings: 32 },
  { service: 'Premium Detail', bookings: 18 },
]

const revenueByPeriod = [
  { month: 'Jan', revenue: 4200 },
  { month: 'Feb', revenue: 4800 },
  { month: 'Mar', revenue: 4500 },
  { month: 'Apr', revenue: 5800 },
]

const popularServices = [
  { name: 'Basic Wash', value: 45 },
  { name: 'Full Service', value: 32 },
  { name: 'Premium Detail', value: 18 },
]

const bookingsByEmployee = [
  { employee: 'Staff Member 1', bookings: 25, revenue: 2500 },
  { employee: 'Staff Member 2', bookings: 20, revenue: 2000 },
  { employee: 'Staff Member 3', bookings: 15, revenue: 1500 },
]

const productSalesData = [
  { product: 'Car Wax', quantity: 45, revenue: 675, stock: 5 },
  { product: 'Interior Cleaner', quantity: 32, revenue: 480, stock: 3 },
  { product: 'Tire Shine', quantity: 28, revenue: 420, stock: 8 },
]

const topSellingProducts = [
  { name: 'Car Wax', sales: 45, revenue: 675 },
  { name: 'Interior Cleaner', sales: 32, revenue: 480 },
  { name: 'Tire Shine', sales: 28, revenue: 420 },
]

const lowStockProducts = [
  { name: 'Car Wax', stock: 5, threshold: 10 },
  { name: 'Interior Cleaner', stock: 3, threshold: 10 },
]

const customerReports = [
  { id: 1, name: 'John Doe', email: 'john@example.com', bookings: 5, totalSpent: 750, lastVisit: '2024-01-15', status: 'Returning' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', bookings: 1, totalSpent: 150, lastVisit: '2024-01-16', status: 'New' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', bookings: 3, totalSpent: 450, lastVisit: '2024-01-14', status: 'Returning' },
]

const COLORS = ['#FF2B29', '#00BFFF', '#0080FF', '#C0C0C0'] // Red, Cyan Blue, Darker Blue, Silver-grey (from logo)

function ReportsAnalytics() {
  const [reportCategory, setReportCategory] = useState('bookings')
  const [reportType, setReportType] = useState('by-date')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [selectedService, setSelectedService] = useState('all')
  const [selectedEmployee, setSelectedEmployee] = useState('all')

  const handleExport = (format: 'csv' | 'excel' | 'pdf', category: string) => {
    if (format === 'csv' || format === 'excel') {
      let csv = ''
      if (category === 'bookings') {
        csv = [
          ['ID', 'Customer', 'Service', 'Date', 'Status', 'Amount'].join(','),
          ['1', 'John Doe', 'Basic Wash', '2024-01-15', 'Completed', '75'].join(','),
        ].join('\n')
      } else if (category === 'products') {
        csv = [
          ['Product', 'Quantity Sold', 'Revenue', 'Stock'].join(','),
          ...productSalesData.map(p => [p.product, p.quantity, p.revenue, p.stock].join(',')),
        ].join('\n')
      } else if (category === 'customers') {
        csv = [
          ['ID', 'Name', 'Email', 'Bookings', 'Total Spent', 'Last Visit', 'Status'].join(','),
          ...customerReports.map(c => [c.id, c.name, c.email, c.bookings, c.totalSpent, c.lastVisit, c.status].join(',')),
        ].join('\n')
      }

      const blob = new Blob([csv], { type: format === 'csv' ? 'text/csv' : 'application/vnd.ms-excel' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${category}-report-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xls'}`
      a.click()
    } else {
      alert('PDF export functionality would require jsPDF library')
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Card sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Reports / Analytics
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<ExcelIcon />}
              onClick={() => handleExport('excel', reportCategory)}
              size="small"
            >
              Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<PdfIcon />}
              onClick={() => handleExport('pdf', reportCategory)}
              size="small"
            >
              PDF
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('csv', reportCategory)}
              sx={{ backgroundColor: '#00BFFF' }}
              size="small"
            >
              CSV
            </Button>
          </Box>
        </Box>

        <Tabs value={reportCategory} onChange={(e, v) => setReportCategory(v)} sx={{ mb: 3 }}>
          <Tab label="Booking Reports" value="bookings" />
          <Tab label="Revenue Reports" value="revenue" />
          <Tab label="Product Sales" value="products" />
          <Tab label="Customer Reports" value="customers" />
        </Tabs>

        {/* Filters */}
        {reportCategory === 'bookings' && (
          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter By</InputLabel>
              <Select
                value={reportType}
                label="Filter By"
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="by-date">By Date Range</MenuItem>
                <MenuItem value="by-service">By Service</MenuItem>
                <MenuItem value="by-employee">By Employee</MenuItem>
              </Select>
            </FormControl>
            {reportType === 'by-date' && (
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
            )}
            {reportType === 'by-service' && (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Service</InputLabel>
                <Select
                  value={selectedService}
                  label="Service"
                  onChange={(e) => setSelectedService(e.target.value)}
                >
                  <MenuItem value="all">All Services</MenuItem>
                  <MenuItem value="Basic Wash">Basic Wash</MenuItem>
                  <MenuItem value="Full Service">Full Service</MenuItem>
                  <MenuItem value="Premium Detail">Premium Detail</MenuItem>
                </Select>
              </FormControl>
            )}
            {reportType === 'by-employee' && (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Employee</InputLabel>
                <Select
                  value={selectedEmployee}
                  label="Employee"
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <MenuItem value="all">All Employees</MenuItem>
                  <MenuItem value="1">Staff Member 1</MenuItem>
                  <MenuItem value="2">Staff Member 2</MenuItem>
                  <MenuItem value="3">Staff Member 3</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        )}
      </Card>

      {/* Booking Reports */}
      {reportCategory === 'bookings' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Bookings by Service Type
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bookingsByService}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="service" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#FF2B29" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Bookings by Employee
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bookingsByEmployee}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="employee" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#00BFFF" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Most Popular Services
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={popularServices}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {popularServices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Revenue Reports */}
      {reportCategory === 'revenue' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Revenue by Period
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueByPeriod}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#00BFFF" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Revenue by Employee
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bookingsByEmployee}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="employee" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#FF2B29" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Product Sales Reports */}
      {reportCategory === 'products' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Top Selling Products
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topSellingProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#FF9800" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Product Sales Revenue
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Revenue</TableCell>
                      <TableCell>Stock</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productSalesData.map((product, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{product.product}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>${product.revenue}</TableCell>
                        <TableCell>
                          <Chip
                            label={product.stock}
                            size="small"
                            color={product.stock < 10 ? 'error' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Low Stock Products
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Current Stock</TableCell>
                      <TableCell>Threshold</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lowStockProducts.map((product, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>
                          <Chip label={product.stock} size="small" color="error" />
                        </TableCell>
                        <TableCell>{product.threshold}</TableCell>
                        <TableCell>
                          <Chip label="Low Stock" size="small" color="warning" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Customer Reports */}
      {reportCategory === 'customers' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Customer Analytics
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Total Bookings</TableCell>
                      <TableCell>Total Spent</TableCell>
                      <TableCell>Last Visit</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customerReports.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.bookings}</TableCell>
                        <TableCell>${customer.totalSpent}</TableCell>
                        <TableCell>{customer.lastVisit}</TableCell>
                        <TableCell>
                          <Chip
                            label={customer.status}
                            size="small"
                            color={customer.status === 'Returning' ? 'success' : 'info'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                New vs Returning Customers
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'New Customers', value: 10 },
                      { name: 'Returning Customers', value: 25 },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#00BFFF" />
                    <Cell fill="#FF2B29" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default ReportsAnalytics

