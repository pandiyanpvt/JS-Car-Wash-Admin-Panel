import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Image as ImageIcon,
} from '@mui/icons-material'
import GridLegacy from '@mui/material/GridLegacy'

const sampleMedia = [
  {
    id: 1,
    url: 'https://via.placeholder.com/300x200',
    caption: 'Before and After - Full Service',
    category: 'Full Service',
    type: 'image',
    order: 1,
  },
  {
    id: 2,
    url: 'https://via.placeholder.com/300x200',
    caption: 'Premium Detail Service',
    category: 'Premium Detail',
    type: 'image',
    order: 2,
  },
]

function MediaManagement() {
  const [media, setMedia] = useState(sampleMedia)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<any>(null)
  const [formData, setFormData] = useState({
    caption: '',
    category: '',
    order: '',
  })

  const handleUpload = () => {
    setFormData({ caption: '', category: '', order: '' })
    setUploadDialogOpen(true)
  }

  const handleEdit = (item: any) => {
    setSelectedMedia(item)
    setFormData({
      caption: item.caption,
      category: item.category,
      order: item.order.toString(),
    })
    setEditDialogOpen(true)
  }

  const handleSave = () => {
    if (selectedMedia) {
      setMedia(
        media.map((m) =>
          m.id === selectedMedia.id
            ? {
                ...m,
                ...formData,
                order: parseInt(formData.order),
              }
            : m
        )
      )
    } else {
      // Handle new upload
      setMedia([
        ...media,
        {
          id: media.length + 1,
          url: 'https://via.placeholder.com/300x200',
          ...formData,
          type: 'image',
          order: parseInt(formData.order) || media.length + 1,
        },
      ])
    }
    setUploadDialogOpen(false)
    setEditDialogOpen(false)
    setSelectedMedia(null)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this media item?')) {
      setMedia(media.filter((m) => m.id !== id))
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Card sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Media Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleUpload}
            sx={{ backgroundColor: '#00BFFF' }}
          >
            Upload Car Wash Images
          </Button>
        </Box>
      </Card>

      <GridLegacy container spacing={2}>
        {media.map((item) => (
          <GridLegacy item xs={12} sm={6} md={4} key={item.id}>
            <Card sx={{ position: 'relative' }}>
              <Box
                sx={{
                  width: '100%',
                  height: 200,
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ImageIcon sx={{ fontSize: 60, color: '#ccc' }} />
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                  {item.caption}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                  <Chip label={item.category} size="small" />
                  <Chip label={`Order: ${item.order}`} size="small" variant="outlined" />
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(item)}
                    color="primary"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(item.id)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          </GridLegacy>
        ))}
      </GridLegacy>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload New Media</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
              Choose File
              <input type="file" hidden accept="image/*" />
            </Button>
            <TextField
              fullWidth
              label="Caption"
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <MenuItem value="Basic Wash">Basic Wash</MenuItem>
                <MenuItem value="Full Service">Full Service</MenuItem>
                <MenuItem value="Premium Detail">Premium Detail</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Display Order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: '#00BFFF' }}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Media</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Caption"
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <MenuItem value="Basic Wash">Basic Wash</MenuItem>
                <MenuItem value="Full Service">Full Service</MenuItem>
                <MenuItem value="Premium Detail">Premium Detail</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Display Order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: '#00BFFF' }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default MediaManagement
