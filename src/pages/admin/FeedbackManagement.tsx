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
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  Email as EmailIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MarkEmailRead as ReadIcon,
  MarkEmailUnread as UnreadIcon,
  CheckCircle as ResolvedIcon,
  Assignment as AssignIcon,
  Download as ExportIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Person as PersonIcon,
} from '@mui/icons-material'
import { Tabs, Tab } from '@mui/material'

const sampleMessages = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    message: 'I would like to inquire about your services.',
    date: '2024-01-15',
    status: 'unread',
    resolved: false,
    assignedTo: null,
    type: 'contact',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1234567891',
    message: 'Great service! Thank you.',
    date: '2024-01-14',
    status: 'read',
    resolved: true,
    assignedTo: 'Staff Member 1',
    type: 'feedback',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '+1234567892',
    message: 'Need to reschedule my appointment.',
    date: '2024-01-13',
    status: 'read',
    resolved: false,
    assignedTo: 'Staff Member 2',
    type: 'contact',
  },
]

const staffMembers = [
  { id: 1, name: 'Staff Member 1' },
  { id: 2, name: 'Staff Member 2' },
  { id: 3, name: 'Staff Member 3' },
]

function FeedbackManagement() {
  const [messages, setMessages] = useState(sampleMessages)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [replyText, setReplyText] = useState('')
  const [assignStaff, setAssignStaff] = useState('')
  const [currentTab, setCurrentTab] = useState(0)
  const [filterStatus, setFilterStatus] = useState<'all' | 'resolved' | 'unresolved'>('all')

  const handleView = (message: any) => {
    setSelectedMessage(message)
    setViewDialogOpen(true)
    if (message.status === 'unread') {
      setMessages(
        messages.map((m) => (m.id === message.id ? { ...m, status: 'read' } : m))
      )
    }
  }

  const handleReply = (message: any) => {
    setSelectedMessage(message)
    setReplyText('')
    setReplyDialogOpen(true)
  }

  const handleSendReply = () => {
    // Handle email reply
    alert('Reply sent!')
    setReplyDialogOpen(false)
  }

  const toggleReadStatus = (id: number) => {
    setMessages(
      messages.map((m) =>
        m.id === id ? { ...m, status: m.status === 'read' ? 'unread' : 'read' } : m
      )
    )
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      setMessages(messages.filter((m) => m.id !== id))
    }
  }

  const handleMarkResolved = (id: number) => {
    setMessages(
      messages.map((m) =>
        m.id === id ? { ...m, resolved: true } : m
      )
    )
  }

  const handleAssign = (message: any) => {
    setSelectedMessage(message)
    setAssignStaff(message.assignedTo || '')
    setAssignDialogOpen(true)
  }

  const handleSaveAssign = () => {
    if (selectedMessage) {
      setMessages(
        messages.map((m) =>
          m.id === selectedMessage.id ? { ...m, assignedTo: assignStaff || null } : m
        )
      )
      setAssignDialogOpen(false)
    }
  }

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const filtered = messages.filter((m) => {
      if (filterStatus === 'resolved') return m.resolved
      if (filterStatus === 'unresolved') return !m.resolved
      return true
    })

    if (format === 'csv' || format === 'excel') {
      const csv = [
        ['ID', 'Name', 'Email', 'Phone', 'Message', 'Date', 'Status', 'Resolved', 'Assigned To'].join(','),
        ...filtered.map((m) =>
          [
            m.id,
            m.name,
            m.email,
            m.phone,
            m.message.replace(/,/g, ';'),
            m.date,
            m.status,
            m.resolved ? 'Yes' : 'No',
            m.assignedTo || 'Unassigned',
          ].join(',')
        ),
      ].join('\n')

      const blob = new Blob([csv], { type: format === 'csv' ? 'text/csv' : 'application/vnd.ms-excel' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `feedback-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xls'}`
      a.click()
    } else {
      alert('PDF export functionality would require jsPDF library')
    }
  }

  const filteredMessages = messages.filter((m) => {
    if (currentTab === 1) return m.type === 'feedback'
    if (currentTab === 2) return m.type === 'contact'
    if (filterStatus === 'resolved') return m.resolved
    if (filterStatus === 'unresolved') return !m.resolved
    return true
  })

  return (
    <Box sx={{ p: 4 }}>
      <Card sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Feedback / Messages Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<ExcelIcon />}
              onClick={() => handleExport('excel')}
              size="small"
            >
              Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<PdfIcon />}
              onClick={() => handleExport('pdf')}
              size="small"
            >
              PDF
            </Button>
            <Button
              variant="contained"
              startIcon={<ExportIcon />}
              onClick={() => handleExport('csv')}
              sx={{ backgroundColor: '#00BFFF' }}
              size="small"
            >
              CSV
            </Button>
          </Box>
        </Box>

        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} sx={{ mb: 2 }}>
          <Tab label="All Messages" />
          <Tab label="Feedback" />
          <Tab label="Contact Form" />
        </Tabs>

        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter Status</InputLabel>
            <Select
              value={filterStatus}
              label="Filter Status"
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="unresolved">Unresolved</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Resolved</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMessages.map((message) => (
                <TableRow key={message.id} hover>
                  <TableCell>{message.name}</TableCell>
                  <TableCell>{message.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={message.type}
                      size="small"
                      color={message.type === 'feedback' ? 'primary' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>
                    {message.message.length > 50
                      ? `${message.message.substring(0, 50)}...`
                      : message.message}
                  </TableCell>
                  <TableCell>
                    {message.assignedTo ? (
                      <Chip
                        label={message.assignedTo}
                        size="small"
                        icon={<PersonIcon />}
                        color="info"
                      />
                    ) : (
                      <Chip label="Unassigned" size="small" color="default" />
                    )}
                  </TableCell>
                  <TableCell>{message.date}</TableCell>
                  <TableCell>
                    <Chip
                      label={message.status}
                      size="small"
                      color={message.status === 'read' ? 'default' : 'primary'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={message.resolved ? 'Resolved' : 'Unresolved'}
                      size="small"
                      color={message.resolved ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleView(message)}
                        color="primary"
                        title="View Details"
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleReply(message)}
                        color="primary"
                        title="Reply"
                      >
                        <EmailIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleAssign(message)}
                        color="secondary"
                        title="Assign to Staff"
                      >
                        <AssignIcon fontSize="small" />
                      </IconButton>
                      {!message.resolved && (
                        <IconButton
                          size="small"
                          onClick={() => handleMarkResolved(message.id)}
                          color="success"
                          title="Mark as Resolved"
                        >
                          <ResolvedIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(message.id)}
                        color="error"
                        title="Delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Message Details</DialogTitle>
        <DialogContent>
          {selectedMessage && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{selectedMessage.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{selectedMessage.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">{selectedMessage.phone}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">{selectedMessage.date}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Message
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {selectedMessage.message}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button
            onClick={() => {
              setViewDialogOpen(false)
              handleReply(selectedMessage)
            }}
            variant="contained"
            sx={{ backgroundColor: '#00BFFF' }}
          >
            Reply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onClose={() => setReplyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reply to Message</DialogTitle>
        <DialogContent>
          {selectedMessage && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField fullWidth label="To" value={selectedMessage.email} disabled />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  defaultValue={`Re: Your message from ${selectedMessage.date}`}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Message"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSendReply}
            variant="contained"
            sx={{ backgroundColor: '#00BFFF' }}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Staff Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Feedback to Staff</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Staff</InputLabel>
                <Select
                  value={assignStaff}
                  label="Select Staff"
                  onChange={(e) => setAssignStaff(e.target.value)}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {staffMembers.map((staff) => (
                    <MenuItem key={staff.id} value={staff.name}>
                      {staff.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {selectedMessage && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Currently assigned: {selectedMessage.assignedTo || 'None'}
                </Typography>
              </Grid>
            )}
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
    </Box>
  )
}

export default FeedbackManagement

