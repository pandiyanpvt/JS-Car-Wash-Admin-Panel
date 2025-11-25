import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Assignment as AssignIcon,
  Payment as PaymentIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'
import { Tabs, Tab } from '@mui/material'

// Sample booking data
const sampleBookings = [
  {
    id: 1,
    customerName: 'John Doe',
    customerId: 1,
    email: 'john@example.com',
    phone: '+1234567890',
    vehicleType: 'Sedan',
    service: 'Full Service',
    date: '2024-01-15',
    time: '10:00 AM',
    status: 'confirmed',
    paymentStatus: 'paid',
    amount: 150,
    notes: 'Customer prefers morning appointment',
    assignedStaff: 'Staff Member 1',
    branch: 'Branch 1',
  },
  {
    id: 2,
    customerName: 'Jane Smith',
    customerId: 2,
    email: 'jane@example.com',
    phone: '+1234567891',
    vehicleType: 'SUV',
    service: 'Basic Wash',
    date: '2024-01-16',
    time: '2:00 PM',
    status: 'pending',
    paymentStatus: 'pending',
    amount: 75,
    notes: '',
    assignedStaff: null,
    branch: 'Branch 1',
  },
  {
    id: 3,
    customerName: 'Bob Johnson',
    customerId: 3,
    email: 'bob@example.com',
    phone: '+1234567892',
    vehicleType: 'Truck',
    service: 'Premium Detail',
    date: '2024-01-14',
    time: '9:00 AM',
    status: 'completed',
    paymentStatus: 'paid',
    amount: 250,
    notes: 'Repeat customer',
    assignedStaff: 'Staff Member 2',
    branch: 'Branch 2',
  },
  {
    id: 4,
    customerName: 'John Doe',
    customerId: 1,
    email: 'john@example.com',
    phone: '+1234567890',
    vehicleType: 'Sedan',
    service: 'Basic Wash',
    date: '2024-01-10',
    time: '11:00 AM',
    status: 'completed',
    paymentStatus: 'paid',
    amount: 75,
    notes: '',
    assignedStaff: 'Staff Member 1',
    branch: 'Branch 1',
  },
]

const staffMembers = [
  { id: 1, name: 'Staff Member 1' },
  { id: 2, name: 'Staff Member 2' },
  { id: 3, name: 'Staff Member 3' },
]

const statusColors: Record<string, string> = {
  pending: '#00BFFF', // Cyan Blue (from logo)
  confirmed: '#FF2B29', // Red (from logo)
  completed: '#4caf50', // Green (keep for success state)
  cancelled: '#C0C0C0', // Silver-grey (from logo)
}

const paymentColors: Record<string, string> = {
  paid: '#4caf50', // Green (keep for success state)
  pending: '#00BFFF', // Cyan Blue (from logo)
  refunded: '#C0C0C0', // Silver-grey (from logo)
}

function BookingsManagement() {
  const [bookings, setBookings] = useState(sampleBookings)
  const [filteredBookings, setFilteredBookings] = useState(sampleBookings)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('month')
  const [currentView, setCurrentView] = useState<'list' | 'calendar'>('list')
  const [filters, setFilters] = useState({
    status: 'all',
    date: null as Date | null,
    search: '',
    service: 'all',
    staff: 'all',
  })
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: '',
  })
  const [assignData, setAssignData] = useState({
    staffId: '',
  })
  const [refundData, setRefundData] = useState({
    amount: '',
    reason: '',
  })

  const handleFilter = () => {
    let filtered = [...bookings]

    if (filters.status !== 'all') {
      filtered = filtered.filter((b) => b.status === filters.status)
    }

    if (filters.service !== 'all') {
      filtered = filtered.filter((b) => b.service === filters.service)
    }

    if (filters.staff !== 'all' && filters.staff) {
      filtered = filtered.filter((b) => {
        const staffId = staffMembers.find(s => s.name === b.assignedStaff)?.id
        return staffId?.toString() === filters.staff
      })
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (b) =>
          b.customerName.toLowerCase().includes(searchLower) ||
          b.email.toLowerCase().includes(searchLower) ||
          b.service.toLowerCase().includes(searchLower)
      )
    }

    setFilteredBookings(filtered)
  }

  React.useEffect(() => {
    handleFilter()
  }, [filters, bookings])

  const handleView = (booking: any) => {
    setSelectedBooking(booking)
    setViewDialogOpen(true)
  }

  const handleEdit = (booking: any) => {
    setSelectedBooking(booking)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (selectedBooking) {
      setBookings(
        bookings.map((b) => (b.id === selectedBooking.id ? selectedBooking : b))
      )
      setEditDialogOpen(false)
      setSelectedBooking(null)
    }
  }

  const handleStatusChange = (id: number, newStatus: string) => {
    setBookings(
      bookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    )
  }

  const handleEmail = (booking: any) => {
    setEmailData({
      to: booking.email,
      subject: `Booking ${booking.id} - ${booking.service}`,
      message: `Dear ${booking.customerName},\n\nRegarding your booking...`,
    })
    setEmailDialogOpen(true)
  }

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    if (format === 'csv' || format === 'excel') {
      const csv = [
        ['ID', 'Customer', 'Email', 'Phone', 'Service', 'Vehicle', 'Date', 'Time', 'Status', 'Payment', 'Amount', 'Staff'].join(','),
        ...filteredBookings.map((b) =>
          [
            b.id,
            b.customerName,
            b.email,
            b.phone,
            b.service,
            b.vehicleType,
            b.date,
            b.time,
            b.status,
            b.paymentStatus,
            b.amount,
            b.assignedStaff || 'Unassigned',
          ].join(',')
        ),
      ].join('\n')

      const blob = new Blob([csv], { type: format === 'csv' ? 'text/csv' : 'application/vnd.ms-excel' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bookings-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xls'}`
      a.click()
    } else {
      // PDF export would require a library like jsPDF
      alert('PDF export functionality would require jsPDF library')
    }
  }

  const handleAssignStaff = (booking: any) => {
    setSelectedBooking(booking)
    setAssignData({ staffId: booking.assignedStaff || '' })
    setAssignDialogOpen(true)
  }

  const handleSaveAssign = () => {
    if (selectedBooking) {
      const staff = staffMembers.find(s => s.id === parseInt(assignData.staffId))
      setBookings(
        bookings.map((b) =>
          b.id === selectedBooking.id ? { ...b, assignedStaff: staff?.name || null } : b
        )
      )
      setAssignDialogOpen(false)
    }
  }

  const handleRefund = (booking: any) => {
    setSelectedBooking(booking)
    setRefundData({ amount: booking.amount.toString(), reason: '' })
    setRefundDialogOpen(true)
  }

  const handleProcessRefund = () => {
    if (selectedBooking) {
      setBookings(
        bookings.map((b) =>
          b.id === selectedBooking.id
            ? { ...b, paymentStatus: 'refunded', status: 'cancelled', notes: `Refunded: ${refundData.reason}` }
            : b
        )
      )
      setRefundDialogOpen(false)
      alert(`Refund of $${refundData.amount} processed successfully`)
    }
  }

  const handleViewHistory = (customerId: number) => {
    setSelectedCustomerId(customerId)
    setHistoryDialogOpen(true)
  }

  const getCustomerHistory = (customerId: number) => {
    return bookings.filter(b => b.customerId === customerId).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }

  const handleChangeTime = (booking: any, newDate: string, newTime: string) => {
    setBookings(
      bookings.map((b) =>
        b.id === booking.id ? { ...b, date: newDate, time: newTime } : b
      )
    )
  }

  return (
    <Box sx={{ p: 4 }}>
      <Card sx={{ p: 3, borderRadius: 2 }}>
        {/* Header and Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Bookings Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant={currentView === 'list' ? 'contained' : 'outlined'}
              startIcon={<ViewIcon />}
              onClick={() => setCurrentView('list')}
              sx={{ backgroundColor: currentView === 'list' ? '#00BFFF' : undefined }}
            >
              List View
            </Button>
            <Button
              variant={currentView === 'calendar' ? 'contained' : 'outlined'}
              startIcon={<CalendarIcon />}
              onClick={() => setCurrentView('calendar')}
              sx={{ backgroundColor: currentView === 'calendar' ? '#00BFFF' : undefined }}
            >
              Calendar View
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExcelIcon />}
              onClick={() => handleExport('excel')}
            >
              Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<PdfIcon />}
              onClick={() => handleExport('pdf')}
            >
              PDF
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('csv')}
              sx={{ backgroundColor: '#00BFFF' }}
            >
              CSV
            </Button>
          </Box>
        </Box>

        {/* Calendar View Selector */}
        {currentView === 'calendar' && (
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2">View:</Typography>
            <Tabs value={calendarView} onChange={(e, v) => setCalendarView(v)}>
              <Tab label="Daily" value="day" />
              <Tab label="Weekly" value="week" />
              <Tab label="Monthly" value="month" />
            </Tabs>
          </Box>
        )}

        {/* Calendar View Placeholder */}
        {currentView === 'calendar' && (
          <Card sx={{ p: 3, mb: 3, minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <CalendarIcon sx={{ fontSize: 60, color: '#C0C0C0', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Calendar View - {calendarView === 'day' ? 'Daily' : calendarView === 'week' ? 'Weekly' : 'Monthly'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Calendar view with booking slots would be implemented here
              </Typography>
            </Box>
          </Card>
        )}

        {/* Filters */}
        {currentView === 'list' && (
          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search bookings..."
              size="small"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              sx={{ minWidth: 250 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Service</InputLabel>
              <Select
                value={filters.service}
                label="Service"
                onChange={(e) => setFilters({ ...filters, service: e.target.value })}
              >
                <MenuItem value="all">All Services</MenuItem>
                <MenuItem value="Basic Wash">Basic Wash</MenuItem>
                <MenuItem value="Full Service">Full Service</MenuItem>
                <MenuItem value="Premium Detail">Premium Detail</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Staff</InputLabel>
              <Select
                value={filters.staff}
                label="Staff"
                onChange={(e) => setFilters({ ...filters, staff: e.target.value })}
              >
                <MenuItem value="all">All Staff</MenuItem>
                {staffMembers.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id.toString()}>{staff.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Bookings Table */}
        {currentView === 'list' && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Assigned Staff</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id} hover>
                  <TableCell>{booking.id}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {booking.customerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {booking.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{booking.service}</TableCell>
                  <TableCell>{booking.vehicleType}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{booking.date}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {booking.time}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={booking.status}
                      size="small"
                      sx={{
                        backgroundColor: statusColors[booking.status],
                        color: 'white',
                        textTransform: 'capitalize',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={booking.paymentStatus}
                      size="small"
                      sx={{
                        backgroundColor: paymentColors[booking.paymentStatus],
                        color: 'white',
                        textTransform: 'capitalize',
                      }}
                    />
                  </TableCell>
                  <TableCell>${booking.amount}</TableCell>
                  <TableCell>
                    {booking.assignedStaff || (
                      <Chip label="Unassigned" size="small" color="warning" />
                    )}
                    {booking.assignedStaff && (
                      <Typography variant="body2">{booking.assignedStaff}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleView(booking)}
                        color="primary"
                        title="View Details"
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(booking)}
                        color="primary"
                        title="Edit Booking"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleAssignStaff(booking)}
                        color="secondary"
                        title="Assign Staff"
                      >
                        <AssignIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleViewHistory(booking.customerId)}
                        color="info"
                        title="Customer History"
                      >
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                      {booking.paymentStatus === 'paid' && booking.status !== 'cancelled' && (
                        <IconButton
                          size="small"
                          onClick={() => handleRefund(booking)}
                          color="warning"
                          title="Process Refund"
                        >
                          <PaymentIcon fontSize="small" />
                        </IconButton>
                      )}
                      {booking.status === 'pending' && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            color="success"
                            title="Confirm"
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            color="error"
                            title="Cancel"
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <IconButton
                          size="small"
                          onClick={() => handleStatusChange(booking.id, 'completed')}
                          color="success"
                          title="Mark Completed"
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        )}
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Customer Name
                </Typography>
                <Typography variant="body1">{selectedBooking.customerName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{selectedBooking.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">{selectedBooking.phone}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Vehicle Type
                </Typography>
                <Typography variant="body1">{selectedBooking.vehicleType}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Service
                </Typography>
                <Typography variant="body1">{selectedBooking.service}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Date & Time
                </Typography>
                <Typography variant="body1">
                  {selectedBooking.date} at {selectedBooking.time}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={selectedBooking.status}
                  size="small"
                  sx={{
                    backgroundColor: statusColors[selectedBooking.status],
                    color: 'white',
                    textTransform: 'capitalize',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Payment Status
                </Typography>
                <Chip
                  label={selectedBooking.paymentStatus}
                  size="small"
                  sx={{
                    backgroundColor: paymentColors[selectedBooking.paymentStatus],
                    color: 'white',
                    textTransform: 'capitalize',
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="h6">${selectedBooking.amount}</Typography>
              </Grid>
              {selectedBooking.notes && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Special Notes
                  </Typography>
                  <Typography variant="body1">{selectedBooking.notes}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Booking</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={selectedBooking.date}
                  onChange={(e) =>
                    setSelectedBooking({ ...selectedBooking, date: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Time"
                  type="time"
                  value={selectedBooking.time}
                  onChange={(e) =>
                    setSelectedBooking({ ...selectedBooking, time: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Service</InputLabel>
                  <Select
                    value={selectedBooking.service}
                    label="Service"
                    onChange={(e) =>
                      setSelectedBooking({ ...selectedBooking, service: e.target.value })
                    }
                  >
                    <MenuItem value="Basic Wash">Basic Wash</MenuItem>
                    <MenuItem value="Full Service">Full Service</MenuItem>
                    <MenuItem value="Premium Detail">Premium Detail</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Vehicle Type</InputLabel>
                  <Select
                    value={selectedBooking.vehicleType}
                    label="Vehicle Type"
                    onChange={(e) =>
                      setSelectedBooking({ ...selectedBooking, vehicleType: e.target.value })
                    }
                  >
                    <MenuItem value="Sedan">Sedan</MenuItem>
                    <MenuItem value="SUV">SUV</MenuItem>
                    <MenuItem value="Truck">Truck</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Special Notes"
                  value={selectedBooking.notes || ''}
                  onChange={(e) =>
                    setSelectedBooking({ ...selectedBooking, notes: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" sx={{ backgroundColor: '#667eea' }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Email to Customer</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="To"
                value={emailData.to}
                onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Message"
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              // Handle email send
              setEmailDialogOpen(false)
            }}
            variant="contained"
            sx={{ backgroundColor: '#00BFFF' }}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Staff Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Staff to Booking #{selectedBooking?.id}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Staff</InputLabel>
                <Select
                  value={assignData.staffId}
                  label="Select Staff"
                  onChange={(e) => setAssignData({ ...assignData, staffId: e.target.value })}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {staffMembers.map((staff) => (
                    <MenuItem key={staff.id} value={staff.id.toString()}>
                      {staff.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Currently assigned: {selectedBooking?.assignedStaff || 'None'}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveAssign}
            variant="contained"
            sx={{ backgroundColor: '#00BFFF' }}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onClose={() => setRefundDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Process Refund for Booking #{selectedBooking?.id}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Customer: {selectedBooking?.customerName}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Original Amount: ${selectedBooking?.amount}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Refund Amount"
                type="number"
                value={refundData.amount}
                onChange={(e) => setRefundData({ ...refundData, amount: e.target.value })}
                inputProps={{ min: 0, max: selectedBooking?.amount }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Refund Reason"
                value={refundData.reason}
                onChange={(e) => setRefundData({ ...refundData, reason: e.target.value })}
                placeholder="Enter reason for refund..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleProcessRefund}
            variant="contained"
            color="warning"
            disabled={!refundData.amount || !refundData.reason}
          >
            Process Refund
          </Button>
        </DialogActions>
      </Dialog>

      {/* Customer History Dialog */}
      <Dialog open={historyDialogOpen} onClose={() => setHistoryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Customer Booking History
        </DialogTitle>
        <DialogContent>
          {selectedCustomerId && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Booking ID</TableCell>
                    <TableCell>Service</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getCustomerHistory(selectedCustomerId).map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>#{booking.id}</TableCell>
                      <TableCell>{booking.service}</TableCell>
                      <TableCell>{booking.date}</TableCell>
                      <TableCell>{booking.time}</TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status}
                          size="small"
                          sx={{
                            backgroundColor: statusColors[booking.status],
                            color: 'white',
                          }}
                        />
                      </TableCell>
                      <TableCell>${booking.amount}</TableCell>
                    </TableRow>
                  ))}
                  {getCustomerHistory(selectedCustomerId).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No booking history found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BookingsManagement

