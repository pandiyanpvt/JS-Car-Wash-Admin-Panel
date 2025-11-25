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
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from '@mui/material'
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import GridLegacy from '@mui/material/GridLegacy'

const sampleReviews = [
  {
    id: 1,
    customerName: 'John Doe',
    rating: 5,
    text: 'Excellent service! Very satisfied with the results.',
    date: '2024-01-10',
    status: 'approved',
  },
  {
    id: 2,
    customerName: 'Jane Smith',
    rating: 4,
    text: 'Good service, but could be faster.',
    date: '2024-01-12',
    status: 'pending',
  },
]

function ReviewsManagement() {
  const [reviews, setReviews] = useState(sampleReviews)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<any>(null)

  const handleApprove = (id: number) => {
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
    )
  }

  const handleReject = (id: number) => {
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
    )
  }

  const handleEdit = (review: any) => {
    setEditingReview({ ...review })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (editingReview) {
      setReviews(
        reviews.map((r) =>
          r.id === editingReview.id ? editingReview : r
        )
      )
      setEditDialogOpen(false)
      setEditingReview(null)
    }
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      setReviews(reviews.filter((r) => r.id !== id))
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Card sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Reviews Management
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Review</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id} hover>
                  <TableCell>{review.customerName}</TableCell>
                  <TableCell>
                    <Rating value={review.rating} readOnly size="small" />
                  </TableCell>
                  <TableCell>{review.text}</TableCell>
                  <TableCell>{review.date}</TableCell>
                  <TableCell>
                    <Chip
                      label={review.status}
                      size="small"
                      color={
                        review.status === 'approved'
                          ? 'success'
                          : review.status === 'rejected'
                          ? 'error'
                          : 'warning'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {review.status === 'pending' && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleApprove(review.id)}
                            color="success"
                          >
                            <ApproveIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleReject(review.id)}
                            color="error"
                          >
                            <RejectIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(review)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(review.id)}
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
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Review</DialogTitle>
        <DialogContent>
          {editingReview && (
            <GridLegacy container spacing={2} sx={{ mt: 1 }}>
              <GridLegacy item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Review Text"
                  value={editingReview.text}
                  onChange={(e) =>
                    setEditingReview({ ...editingReview, text: e.target.value })
                  }
                />
              </GridLegacy>
            </GridLegacy>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" sx={{ backgroundColor: '#00BFFF' }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ReviewsManagement
