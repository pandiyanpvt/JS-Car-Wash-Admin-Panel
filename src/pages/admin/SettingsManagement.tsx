import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material'
import Grid from '@mui/material/GridLegacy'
import {
  Save as SaveIcon,
  PhotoCamera as PhotoIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Store as BranchIcon,
  Payment as PaymentIcon,
  AttachMoney as TaxIcon,
  CalendarToday as HolidayIcon,
  People as PeopleIcon,
  Notifications as NotificationIcon,
  AccountCircle as ProfileIcon,
  Sms as SmsIcon,
  Email as EmailIcon,
} from '@mui/icons-material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

const holidays = [
  { id: 1, name: 'New Year', date: '2024-01-01', recurring: true },
  { id: 2, name: 'Christmas', date: '2024-12-25', recurring: true },
]

const branches = [
  { id: 1, name: 'Branch 1', address: '123 Main St', phone: '+1234567890', enabled: true },
  { id: 2, name: 'Branch 2', address: '456 Oak Ave', phone: '+1234567891', enabled: true },
]

const employeeRoles = [
  { id: 'admin', name: 'Admin', permissions: ['all'] },
  { id: 'booking', name: 'Booking Staff', permissions: ['bookings', 'customers'] },
  { id: 'service', name: 'Service Staff', permissions: ['services'] },
]

function SettingsManagement() {
  const [currentTab, setCurrentTab] = useState(0)
  const [logo, setLogo] = useState<string | null>(null)
  const [holidaysList, setHolidaysList] = useState(holidays)
  const [branchesList, setBranchesList] = useState(branches)
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false)
  const [branchDialogOpen, setBranchDialogOpen] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState<any>(null)
  const [editingBranch, setEditingBranch] = useState<any>(null)
  const [settings, setSettings] = useState({
    companyName: 'Car Wash Service',
    companyLogo: null as string | null,
    companyAddress: '123 Main Street, City, State 12345',
    companyPhone: '+1234567890',
    companyEmail: 'info@carwash.com',
    businessName: 'Car Wash Service',
    workingHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true },
    },
    bookingDuration: '30',
    vehicleTypes: ['Sedan', 'SUV', 'Truck', 'Motorcycle'],
    paymentMethods: {
      cash: true,
      card: true,
      online: true,
    },
    taxSettings: {
      enabled: true,
      rate: '10',
      type: 'percentage', // percentage or fixed
    },
    emailConfig: {
      smtpHost: 'smtp.example.com',
      smtpPort: '587',
      smtpUser: 'noreply@example.com',
      smtpPassword: '',
      bookingConfirmation: true,
      bookingReminder: true,
      cancellationEmail: true,
    },
    notificationSettings: {
      email: {
        enabled: true,
        bookingConfirmation: true,
        bookingReminder: true,
        bookingCancellation: true,
        paymentReceipt: true,
      },
      sms: {
        enabled: true,
        bookingConfirmation: true,
        bookingReminder: true,
        bookingCancellation: true,
      },
    },
  })

  const handleSave = () => {
    alert('Settings saved successfully!')
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogo(reader.result as string)
        setSettings({ ...settings, companyLogo: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddHoliday = () => {
    setEditingHoliday(null)
    setHolidayDialogOpen(true)
  }

  const handleEditHoliday = (holiday: any) => {
    setEditingHoliday(holiday)
    setHolidayDialogOpen(true)
  }

  const handleSaveHoliday = (holidayData: any) => {
    if (editingHoliday) {
      setHolidaysList(
        holidaysList.map((h) =>
          h.id === editingHoliday.id ? { ...h, ...holidayData } : h
        )
      )
    } else {
      setHolidaysList([
        ...holidaysList,
        { id: holidaysList.length + 1, ...holidayData },
      ])
    }
    setHolidayDialogOpen(false)
  }

  const handleDeleteHoliday = (id: number) => {
    setHolidaysList(holidaysList.filter((h) => h.id !== id))
  }

  const handleAddBranch = () => {
    setEditingBranch(null)
    setBranchDialogOpen(true)
  }

  const handleEditBranch = (branch: any) => {
    setEditingBranch(branch)
    setBranchDialogOpen(true)
  }

  const handleSaveBranch = (branchData: any) => {
    if (editingBranch) {
      setBranchesList(
        branchesList.map((b) =>
          b.id === editingBranch.id ? { ...b, ...branchData } : b
        )
      )
    } else {
      setBranchesList([
        ...branchesList,
        { id: branchesList.length + 1, ...branchData, enabled: true },
      ])
    }
    setBranchDialogOpen(false)
  }

  const handleDeleteBranch = (id: number) => {
    setBranchesList(branchesList.filter((b) => b.id !== id))
  }

  const handleToggleBranch = (id: number) => {
    setBranchesList(
      branchesList.map((b) =>
        b.id === id ? { ...b, enabled: !b.enabled } : b
      )
    )
  }

  return (
    <Box sx={{ p: 4 }}>
      <Card sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Settings / Configuration
          </Typography>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ backgroundColor: '#00BFFF' }}
          >
            Save Settings
          </Button>
        </Box>

        <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)} sx={{ mb: 3 }}>
          <Tab label="Company Profile" icon={<ProfileIcon />} iconPosition="start" />
          <Tab label="Working Hours" />
          <Tab label="Holidays" icon={<HolidayIcon />} iconPosition="start" />
          <Tab label="Payment Methods" icon={<PaymentIcon />} iconPosition="start" />
          <Tab label="Tax Settings" icon={<TaxIcon />} iconPosition="start" />
          <Tab label="Branch Settings" icon={<BranchIcon />} iconPosition="start" />
          <Tab label="Employee Roles" icon={<PeopleIcon />} iconPosition="start" />
          <Tab label="Notifications" icon={<NotificationIcon />} iconPosition="start" />
        </Tabs>

        {/* Company Profile Tab */}
        {currentTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Company Profile
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    {logo || settings.companyLogo ? (
                      <Box
                        component="img"
                        src={logo || settings.companyLogo || ''}
                        alt="Company Logo"
                        sx={{
                          width: 150,
                          height: 150,
                          objectFit: 'contain',
                          border: '1px solid #C0C0C0',
                          borderRadius: 2,
                          p: 1,
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 150,
                          height: 150,
                          border: '2px dashed #C0C0C0',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PhotoIcon sx={{ fontSize: 48, color: '#C0C0C0' }} />
                      </Box>
                    )}
                    <Box>
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<PhotoIcon />}
                        sx={{ backgroundColor: '#00BFFF', mb: 1 }}
                      >
                        Upload Logo
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleLogoUpload}
                        />
                      </Button>
                      {logo && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => {
                            setLogo(null)
                            setSettings({ ...settings, companyLogo: null })
                          }}
                          size="small"
                        >
                          Remove
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={settings.companyName}
                    onChange={(e) =>
                      setSettings({ ...settings, companyName: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Business Name"
                    value={settings.businessName}
                    onChange={(e) =>
                      setSettings({ ...settings, businessName: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Address"
                    multiline
                    rows={2}
                    value={settings.companyAddress}
                    onChange={(e) =>
                      setSettings({ ...settings, companyAddress: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company Phone"
                    value={settings.companyPhone}
                    onChange={(e) =>
                      setSettings({ ...settings, companyPhone: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company Email"
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) =>
                      setSettings({ ...settings, companyEmail: e.target.value })
                    }
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Working Hours Tab */}
        {currentTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Working Hours
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(settings.workingHours).map(([day, hours]) => (
                  <Grid item xs={12} sm={6} md={4} key={day}>
                    <Card sx={{ p: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!hours.closed}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                workingHours: {
                                  ...settings.workingHours,
                                  [day]: { ...hours, closed: !e.target.checked },
                                },
                              })
                            }
                          />
                        }
                        label={day.charAt(0).toUpperCase() + day.slice(1)}
                      />
                      {!hours.closed && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <TextField
                            label="Open"
                            type="time"
                            size="small"
                            value={hours.open}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                workingHours: {
                                  ...settings.workingHours,
                                  [day]: { ...hours, open: e.target.value },
                                },
                              })
                            }
                            InputLabelProps={{ shrink: true }}
                          />
                          <TextField
                            label="Close"
                            type="time"
                            size="small"
                            value={hours.close}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                workingHours: {
                                  ...settings.workingHours,
                                  [day]: { ...hours, close: e.target.value },
                                },
                              })
                            }
                            InputLabelProps={{ shrink: true }}
                          />
                        </Box>
                      )}
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Holidays Tab */}
        {currentTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Holidays
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddHoliday}
                  sx={{ backgroundColor: '#00BFFF' }}
                >
                  Add Holiday
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Recurring</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {holidaysList.map((holiday) => (
                      <TableRow key={holiday.id}>
                        <TableCell>{holiday.name}</TableCell>
                        <TableCell>{holiday.date}</TableCell>
                        <TableCell>
                          <Chip
                            label={holiday.recurring ? 'Yes' : 'No'}
                            size="small"
                            color={holiday.recurring ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleEditHoliday(holiday)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteHoliday(holiday.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        )}

        {/* Payment Methods Tab */}
        {currentTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Payment Methods
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.paymentMethods.cash}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            paymentMethods: {
                              ...settings.paymentMethods,
                              cash: e.target.checked,
                            },
                          })
                        }
                      />
                    }
                    label="Cash"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.paymentMethods.card}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            paymentMethods: {
                              ...settings.paymentMethods,
                              card: e.target.checked,
                            },
                          })
                        }
                      />
                    }
                    label="Card Payment"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.paymentMethods.online}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            paymentMethods: {
                              ...settings.paymentMethods,
                              online: e.target.checked,
                            },
                          })
                        }
                      />
                    }
                    label="Online Payment"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Tax Settings Tab */}
        {currentTab === 4 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Tax Settings
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.taxSettings.enabled}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            taxSettings: {
                              ...settings.taxSettings,
                              enabled: e.target.checked,
                            },
                          })
                        }
                      />
                    }
                    label="Enable Tax"
                  />
                </Grid>
                {settings.taxSettings.enabled && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Tax Rate (%)"
                        type="number"
                        value={settings.taxSettings.rate}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            taxSettings: {
                              ...settings.taxSettings,
                              rate: e.target.value,
                            },
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Tax Type</InputLabel>
                        <Select
                          value={settings.taxSettings.type}
                          label="Tax Type"
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              taxSettings: {
                                ...settings.taxSettings,
                                type: e.target.value,
                              },
                            })
                          }
                        >
                          <MenuItem value="percentage">Percentage</MenuItem>
                          <MenuItem value="fixed">Fixed Amount</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Branch Settings Tab */}
        {currentTab === 5 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Branch Settings
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddBranch}
                  sx={{ backgroundColor: '#00BFFF' }}
                >
                  Add Branch
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {branchesList.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell>{branch.name}</TableCell>
                        <TableCell>{branch.address}</TableCell>
                        <TableCell>{branch.phone}</TableCell>
                        <TableCell>
                          <Chip
                            label={branch.enabled ? 'Enabled' : 'Disabled'}
                            size="small"
                            color={branch.enabled ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleBranch(branch.id)}
                              color={branch.enabled ? 'default' : 'success'}
                            >
                              <Switch checked={branch.enabled} size="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleEditBranch(branch)}
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteBranch(branch.id)}
                              color="error"
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
            </Grid>
          </Grid>
        )}

        {/* Employee Roles & Permissions Tab */}
        {currentTab === 6 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Employee Roles & Permissions
              </Typography>
              <Grid container spacing={2}>
                {employeeRoles.map((role) => (
                  <Grid item xs={12} md={6} key={role.id}>
                    <Card sx={{ p: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        {role.name}
                      </Typography>
                      <List>
                        {[
                          { id: 'all', name: 'All Permissions' },
                          { id: 'bookings', name: 'Manage Bookings' },
                          { id: 'customers', name: 'Manage Customers' },
                          { id: 'services', name: 'Manage Services' },
                          { id: 'reports', name: 'View Reports' },
                          { id: 'settings', name: 'Manage Settings' },
                        ].map((permission) => (
                          <ListItem key={permission.id}>
                            <ListItemIcon>
                              <Checkbox
                                checked={role.permissions.includes('all') || role.permissions.includes(permission.id)}
                                disabled={role.permissions.includes('all')}
                              />
                            </ListItemIcon>
                            <ListItemText primary={permission.name} />
                          </ListItem>
                        ))}
                      </List>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Notification Settings Tab */}
        {currentTab === 7 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Notification Settings
              </Typography>
              <Grid container spacing={3}>
                {/* Email Notifications */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <EmailIcon />
                      <Typography variant="h6">Email Notifications</Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notificationSettings.email.enabled}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              notificationSettings: {
                                ...settings.notificationSettings,
                                email: {
                                  ...settings.notificationSettings.email,
                                  enabled: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                      }
                      label="Enable Email Notifications"
                    />
                    {settings.notificationSettings.email.enabled && (
                      <Box sx={{ mt: 2 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.notificationSettings.email.bookingConfirmation}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  notificationSettings: {
                                    ...settings.notificationSettings,
                                    email: {
                                      ...settings.notificationSettings.email,
                                      bookingConfirmation: e.target.checked,
                                    },
                                  },
                                })
                              }
                            />
                          }
                          label="Booking Confirmation"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.notificationSettings.email.bookingReminder}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  notificationSettings: {
                                    ...settings.notificationSettings,
                                    email: {
                                      ...settings.notificationSettings.email,
                                      bookingReminder: e.target.checked,
                                    },
                                  },
                                })
                              }
                            />
                          }
                          label="Booking Reminder"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.notificationSettings.email.bookingCancellation}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  notificationSettings: {
                                    ...settings.notificationSettings,
                                    email: {
                                      ...settings.notificationSettings.email,
                                      bookingCancellation: e.target.checked,
                                    },
                                  },
                                })
                              }
                            />
                          }
                          label="Booking Cancellation"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.notificationSettings.email.paymentReceipt}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  notificationSettings: {
                                    ...settings.notificationSettings,
                                    email: {
                                      ...settings.notificationSettings.email,
                                      paymentReceipt: e.target.checked,
                                    },
                                  },
                                })
                              }
                            />
                          }
                          label="Payment Receipt"
                        />
                      </Box>
                    )}
                  </Card>
                </Grid>

                {/* SMS Notifications */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <SmsIcon />
                      <Typography variant="h6">SMS Notifications</Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notificationSettings.sms.enabled}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              notificationSettings: {
                                ...settings.notificationSettings,
                                sms: {
                                  ...settings.notificationSettings.sms,
                                  enabled: e.target.checked,
                                },
                              },
                            })
                          }
                        />
                      }
                      label="Enable SMS Notifications"
                    />
                    {settings.notificationSettings.sms.enabled && (
                      <Box sx={{ mt: 2 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.notificationSettings.sms.bookingConfirmation}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  notificationSettings: {
                                    ...settings.notificationSettings,
                                    sms: {
                                      ...settings.notificationSettings.sms,
                                      bookingConfirmation: e.target.checked,
                                    },
                                  },
                                })
                              }
                            />
                          }
                          label="Booking Confirmation"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.notificationSettings.sms.bookingReminder}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  notificationSettings: {
                                    ...settings.notificationSettings,
                                    sms: {
                                      ...settings.notificationSettings.sms,
                                      bookingReminder: e.target.checked,
                                    },
                                  },
                                })
                              }
                            />
                          }
                          label="Booking Reminder"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.notificationSettings.sms.bookingCancellation}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  notificationSettings: {
                                    ...settings.notificationSettings,
                                    sms: {
                                      ...settings.notificationSettings.sms,
                                      bookingCancellation: e.target.checked,
                                    },
                                  },
                                })
                              }
                            />
                          }
                          label="Booking Cancellation"
                        />
                      </Box>
                    )}
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Card>

      {/* Holiday Dialog */}
      <Dialog open={holidayDialogOpen} onClose={() => setHolidayDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingHoliday ? 'Edit Holiday' : 'Add Holiday'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Holiday Name"
                value={editingHoliday?.name || ''}
                onChange={(e) => setEditingHoliday({ ...editingHoliday, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Holiday Date"
                  value={editingHoliday?.date ? new Date(editingHoliday.date) : null}
                  onChange={(newValue) => setEditingHoliday({ ...editingHoliday, date: newValue?.toISOString().split('T')[0] || '' })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editingHoliday?.recurring || false}
                    onChange={(e) => setEditingHoliday({ ...editingHoliday, recurring: e.target.checked })}
                  />
                }
                label="Recurring Holiday"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHolidayDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => handleSaveHoliday(editingHoliday)}
            variant="contained"
            sx={{ backgroundColor: '#00BFFF' }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Branch Dialog */}
      <Dialog open={branchDialogOpen} onClose={() => setBranchDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingBranch ? 'Edit Branch' : 'Add Branch'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Branch Name"
                value={editingBranch?.name || ''}
                onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={editingBranch?.address || ''}
                onChange={(e) => setEditingBranch({ ...editingBranch, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={editingBranch?.phone || ''}
                onChange={(e) => setEditingBranch({ ...editingBranch, phone: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBranchDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => handleSaveBranch(editingBranch)}
            variant="contained"
            sx={{ backgroundColor: '#00BFFF' }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SettingsManagement

