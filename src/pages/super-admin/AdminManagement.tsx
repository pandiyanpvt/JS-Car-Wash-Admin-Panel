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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tabs,
  Tab,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Block as BlockIcon,
  CheckCircle as UnblockIcon,
  History as HistoryIcon,
} from '@mui/icons-material'
import GridLegacy from '@mui/material/GridLegacy'

const sampleAdmins = [
  {
    id: 1,
    username: 'admin1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Admin',
    lastLogin: '2024-01-15 10:30 AM',
    status: 'active',
    branch: 'Branch 1',
    createdAt: '2024-01-01',
  },
  {
    id: 2,
    username: 'admin2',
    name: 'Manager One',
    email: 'manager@example.com',
    role: 'Admin',
    lastLogin: '2024-01-14 2:15 PM',
    status: 'blocked',
    branch: 'Branch 2',
    createdAt: '2024-01-02',
  },
  {
    id: 3,
    username: 'staff1',
    name: 'Staff Member',
    email: 'staff@example.com',
    role: 'Booking Staff',
    lastLogin: '2024-01-13 9:00 AM',
    status: 'active',
    branch: 'Branch 1',
    createdAt: '2024-01-03',
  },
]

const activityLogs = [
  {
    id: 1,
    adminId: 1,
    action: 'Created new booking',
    details: 'Booking #1234',
    timestamp: '2024-01-15 10:30 AM',
  },
  {
    id: 2,
    adminId: 1,
    action: 'Updated service',
    details: 'Service: Basic Wash',
    timestamp: '2024-01-15 9:15 AM',
  },
  {
    id: 3,
    adminId: 2,
    action: 'Blocked admin',
    details: 'Admin: admin2',
    timestamp: '2024-01-14 2:00 PM',
  },
]

const roleColors: Record<string, string> = {
  Admin: '#FF2B29',
  Manager: '#00BFFF',
  Staff: '#4caf50',
}

function AdminManagement() {
  const [admins, setAdmins] = useState(sampleAdmins)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activityDialogOpen, setActivityDialogOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<any>(null)
  const [selectedAdminForActivity, setSelectedAdminForActivity] = useState<any>(null)
  const [currentTab, setCurrentTab] = useState(0)
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    role: 'Admin',
    password: '',
    branch: '',
  })

  const handleAdd = () => {
    setEditingAdmin(null)
    setFormData({
      username: '',
      name: '',
      email: '',
      role: 'Admin',
      password: '',
      branch: '',
    })
    setDialogOpen(true)
  }

  const handleEdit = (admin: any) => {
    setEditingAdmin(admin)
    setFormData({
      username: admin.username,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      password: '',
      branch: admin.branch || '',
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (editingAdmin) {
      setAdmins(
        admins.map((a) =>
          a.id === editingAdmin.id
            ? {
                ...a,
                ...formData,
                lastLogin: a.lastLogin,
                status: a.status,
              }
            : a
        )
      )
    } else {
      setAdmins([
        ...admins,
        {
          id: admins.length + 1,
          ...formData,
          lastLogin: 'Never',
          status: 'active',
        },
      ])
    }
    setDialogOpen(false)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      setAdmins(admins.filter((a) => a.id !== id))
    }
  }

  const handleBlockUnblock = (id: number) => {
    setAdmins(
      admins.map((a) =>
        a.id === id ? { ...a, status: a.status === 'active' ? 'blocked' : 'active' } : a
      )
    )
  }

  const handleViewActivity = (admin: any) => {
    setSelectedAdminForActivity(admin)
    setActivityDialogOpen(true)
  }

  const getAdminActivityLogs = (adminId: number) => {
    return activityLogs.filter(log => log.adminId === adminId)
  }

  return (
    <Box sx={{ p: 4 }}>
      <Card sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Admin Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{ backgroundColor: '#00BFFF' }}
          >
            Add New Admin
          </Button>
        </Box>

        <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)} sx={{ mb: 3 }}>
          <Tab label="Admins List" />
          <Tab label="Activity Logs" />
        </Tabs>

        {currentTab === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Admin</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ backgroundColor: roleColors[admin.role] || '#C0C0C0' }}>
                          <PersonIcon />
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {admin.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{admin.username}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={admin.role}
                        size="small"
                        sx={{
                          backgroundColor: roleColors[admin.role] || '#C0C0C0',
                          color: 'white',
                        }}
                      />
                    </TableCell>
                    <TableCell>{admin.branch}</TableCell>
                    <TableCell>{admin.lastLogin}</TableCell>
                    <TableCell>
                      <Chip
                        label={admin.status}
                        size="small"
                        color={admin.status === 'active' ? 'success' : admin.status === 'blocked' ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(admin)}
                          color="primary"
                          title="Edit Admin Details"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleBlockUnblock(admin.id)}
                          color={admin.status === 'active' ? 'error' : 'success'}
                          title={admin.status === 'active' ? 'Block Admin' : 'Unblock Admin'}
                        >
                          {admin.status === 'active' ? <BlockIcon fontSize="small" /> : <UnblockIcon fontSize="small" />}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleViewActivity(admin)}
                          color="primary"
                          title="View Activity Logs"
                        >
                          <HistoryIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {currentTab === 1 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Admin</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activityLogs.map((log) => {
                  const admin = admins.find(a => a.id === log.adminId)
                  return (
                    <TableRow key={log.id} hover>
                      <TableCell>{admin?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <Chip label={log.action} size="small" color="primary" />
                      </TableCell>
                      <TableCell>{log.details}</TableCell>
                      <TableCell>{log.timestamp}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAdmin ? 'Edit Admin' : 'Add New Admin'}</DialogTitle>
        <DialogContent>
          <GridLegacy container spacing={2} sx={{ mt: 1 }}>
            <GridLegacy item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </GridLegacy>
            <GridLegacy item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </GridLegacy>
            <GridLegacy item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </GridLegacy>
            <GridLegacy item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Booking Staff">Booking Staff</MenuItem>
                  <MenuItem value="Super Admin">Super Admin</MenuItem>
                </Select>
              </FormControl>
            </GridLegacy>
            <GridLegacy item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Branch"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                placeholder="e.g., Branch 1"
              />
            </GridLegacy>
            <GridLegacy item xs={12}>
              <TextField
                fullWidth
                label={editingAdmin ? 'New Password (leave blank to keep current)' : 'Password'}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </GridLegacy>
          </GridLegacy>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: '#00BFFF' }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Activity Logs Dialog */}
      <Dialog open={activityDialogOpen} onClose={() => setActivityDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Activity Logs - {selectedAdminForActivity?.name || 'Admin'}
        </DialogTitle>
        <DialogContent>
          {selectedAdminForActivity && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Action</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getAdminActivityLogs(selectedAdminForActivity.id).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Chip label={log.action} size="small" color="primary" />
                      </TableCell>
                      <TableCell>{log.details}</TableCell>
                      <TableCell>{log.timestamp}</TableCell>
                    </TableRow>
                  ))}
                  {getAdminActivityLogs(selectedAdminForActivity.id).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No activity logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivityDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminManagement

