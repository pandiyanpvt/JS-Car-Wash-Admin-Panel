import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import Grid from '@mui/material/GridLegacy'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoIcon,
  Image as ImageIcon,
  SwitchRight as SwitchIcon,
  Inventory2 as PackageIcon,
} from '@mui/icons-material'
import { Switch, FormControlLabel, Tabs, Tab, Button as MuiButton } from '@mui/material'

const sampleServices = [
  {
    id: 1,
    name: 'Basic Wash',
    description: 'Exterior wash and dry',
    basePrice: 25,
    duration: 30, // in minutes
    estimatedTime: '30 minutes',
    vehicleTypes: ['Sedan', 'SUV', 'Truck'],
    photos: [],
    enabled: true,
    isPackage: false,
    addOns: [
      { name: 'Wax', price: 15, time: '15 min' },
      { name: 'Interior Vacuum', price: 10, time: '10 min' },
    ],
  },
  {
    id: 2,
    name: 'Full Service',
    description: 'Complete interior and exterior cleaning',
    basePrice: 75,
    duration: 90, // in minutes
    estimatedTime: '1.5 hours',
    vehicleTypes: ['Sedan', 'SUV'],
    photos: [],
    enabled: true,
    isPackage: false,
    addOns: [
      { name: 'Leather Treatment', price: 25, time: '20 min' },
    ],
  },
  {
    id: 3,
    name: 'Premium Package',
    description: 'Full service + detailing + polish',
    basePrice: 150,
    duration: 180, // in minutes
    estimatedTime: '3 hours',
    vehicleTypes: ['Sedan', 'SUV', 'Truck'],
    photos: [],
    enabled: true,
    isPackage: true,
    packageServices: ['Basic Wash', 'Full Service', 'Detailing', 'Polish'],
    addOns: [],
  },
]

function ServicesManagement() {
  const [services, setServices] = useState(sampleServices)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)
  const [currentTab, setCurrentTab] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    duration: '', // in minutes
    estimatedTime: '',
    vehicleTypes: [] as string[],
    photos: [] as string[],
    enabled: true,
    isPackage: false,
    packageServices: [] as string[],
  })

  const serviceCategories = [
    { id: 'carwash', name: 'Car Wash', services: ['Basic Wash', 'Deluxe Wash'] },
    { id: 'detailing', name: 'Detailing', services: ['Interior Detailing', 'Exterior Detailing'] },
    { id: 'polishing', name: 'Polishing', services: ['Wax Polish', 'Ceramic Coating'] },
    { id: 'interior', name: 'Interior Cleaning', services: ['Vacuum', 'Shampoo'] },
    { id: 'packages', name: 'Packages', services: ['Premium Package', 'Economy Package'] },
  ]

  const handleAdd = () => {
    setEditingService(null)
    setFormData({
      name: '',
      description: '',
      basePrice: '',
      duration: '',
      estimatedTime: '',
      vehicleTypes: [],
      photos: [],
      enabled: true,
      isPackage: false,
      packageServices: [],
    })
    setDialogOpen(true)
  }

  const handleEdit = (service: any) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description,
      basePrice: service.basePrice.toString(),
      duration: service.duration?.toString() || '',
      estimatedTime: service.estimatedTime,
      vehicleTypes: service.vehicleTypes,
      photos: service.photos || [],
      enabled: service.enabled !== false,
      isPackage: service.isPackage || false,
      packageServices: service.packageServices || [],
    })
    setDialogOpen(true)
  }

  const handleToggleEnabled = (id: number) => {
    setServices(
      services.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    )
  }

  const handleUploadPhoto = (serviceId: number) => {
    // Photo upload would be implemented here
    alert('Photo upload functionality would be implemented here')
  }

  const handleDeletePhoto = (serviceId: number, photoIndex: number) => {
    setServices(
      services.map((s) =>
        s.id === serviceId
          ? { ...s, photos: s.photos.filter((_, idx) => idx !== photoIndex) }
          : s
      )
    )
  }

  const handleSave = () => {
    const durationMinutes = parseInt(formData.duration) || 0
    const estimatedTimeStr = durationMinutes >= 60 
      ? `${Math.floor(durationMinutes / 60)} hour${Math.floor(durationMinutes / 60) > 1 ? 's' : ''} ${durationMinutes % 60 > 0 ? `${durationMinutes % 60} minutes` : ''}`.trim()
      : `${durationMinutes} minutes`

    if (editingService) {
      setServices(
        services.map((s) =>
          s.id === editingService.id
            ? {
                ...s,
                ...formData,
                basePrice: parseFloat(formData.basePrice),
                duration: durationMinutes,
                estimatedTime: estimatedTimeStr,
              }
            : s
        )
      )
    } else {
      setServices([
        ...services,
        {
          id: services.length + 1,
          ...formData,
          basePrice: parseFloat(formData.basePrice),
          duration: durationMinutes,
          estimatedTime: estimatedTimeStr,
          addOns: [],
        },
      ])
    }
    setDialogOpen(false)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setServices(services.filter((s) => s.id !== id))
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Card sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Services Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<PackageIcon />}
              onClick={() => {
                setFormData({
                  name: '',
                  description: '',
                  basePrice: '',
                  duration: '',
                  estimatedTime: '',
                  vehicleTypes: [],
                  photos: [],
                  enabled: true,
                  isPackage: true,
                  packageServices: [],
                })
                setEditingService(null)
                setDialogOpen(true)
              }}
              sx={{ backgroundColor: '#FF9800' }}
            >
              Add Package
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              sx={{ backgroundColor: '#00BFFF' }}
            >
              Add Service
            </Button>
          </Box>
        </Box>

        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} sx={{ mb: 3 }}>
          <Tab label="All Services" />
          <Tab label="Car Wash" />
          <Tab label="Detailing" />
          <Tab label="Polishing" />
          <Tab label="Interior Cleaning" />
          <Tab label="Packages" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Service Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Base Price</TableCell>
                <TableCell>Duration (min)</TableCell>
                <TableCell>Vehicle Types</TableCell>
                <TableCell>Photos</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services
                .filter((service) => {
                  if (currentTab === 5) return service.isPackage
                  if (currentTab === 0) return true
                  // Filter by category would be implemented here
                  return true
                })
                .map((service) => (
                <TableRow key={service.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {service.isPackage && <PackageIcon fontSize="small" color="warning" />}
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {service.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{service.description}</TableCell>
                  <TableCell>${service.basePrice}</TableCell>
                  <TableCell>{service.duration || '-'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {service.vehicleTypes.map((type) => (
                        <Chip key={type} label={type} size="small" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {service.photos?.length > 0 && (
                        <Chip 
                          label={`${service.photos.length} photos`} 
                          size="small" 
                          icon={<ImageIcon />}
                        />
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleUploadPhoto(service.id)}
                        color="primary"
                        title="Upload Photo"
                      >
                        <PhotoIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={service.enabled}
                          onChange={() => handleToggleEnabled(service.id)}
                          size="small"
                        />
                      }
                      label={service.enabled ? 'Enabled' : 'Disabled'}
                      sx={{ m: 0 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(service)}
                        color="primary"
                        title="Edit Service"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(service.id)}
                        color="error"
                        title="Delete Service"
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Service Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Base Price"
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 30"
                helperText="Service duration in minutes"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPackage}
                    onChange={(e) => setFormData({ ...formData, isPackage: e.target.checked })}
                  />
                }
                label="Is Package"
              />
            </Grid>
            {formData.isPackage && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Package Services</InputLabel>
                  <Select
                    multiple
                    value={formData.packageServices}
                    label="Package Services"
                    onChange={(e) =>
                      setFormData({ ...formData, packageServices: e.target.value as string[] })
                    }
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {services.filter(s => !s.isPackage).map((service) => (
                      <MenuItem key={service.id} value={service.name}>
                        {service.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  />
                }
                label="Enable Service"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={<PhotoIcon />}
                onClick={() => setPhotoDialogOpen(true)}
                fullWidth
              >
                Upload Service Photos
              </Button>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Vehicle Types</InputLabel>
                <Select
                  multiple
                  value={formData.vehicleTypes}
                  label="Vehicle Types"
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleTypes: e.target.value as string[] })
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="Sedan">Sedan</MenuItem>
                  <MenuItem value="SUV">SUV</MenuItem>
                  <MenuItem value="Truck">Truck</MenuItem>
                  <MenuItem value="Motorcycle">Motorcycle</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: '#667eea' }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ServicesManagement

