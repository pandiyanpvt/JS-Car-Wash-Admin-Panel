import { useState, useEffect } from 'react'
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui'
import { Star, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { reviewsApi } from '../../api/reviews.api'
import type { Review } from '../../api/reviews.api'

const renderStars = (rating: number) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-gray-700">{rating}/5</span>
    </div>
  )
}

export function UserReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [disapprovingId, setDisapprovingId] = useState<string | null>(null)
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    reviewId: string | null
    action: 'approve' | 'disapprove' | null
  }>({
    isOpen: false,
    reviewId: null,
    action: null,
  })

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await reviewsApi.getAll()
      // Sort reviews by createdAt date, latest first
      const sortedReviews = [...data].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA // Descending order (newest first)
      })
      setReviews(sortedReviews)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch reviews')
      console.error('Error fetching reviews:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveClick = (reviewId: string) => {
    setConfirmState({
      isOpen: true,
      reviewId,
      action: 'approve',
    })
  }

  const handleDisapproveClick = (reviewId: string) => {
    setConfirmState({
      isOpen: true,
      reviewId,
      action: 'disapprove',
    })
  }

  const handleApprove = async () => {
    if (!confirmState.reviewId || confirmState.action !== 'approve') return
    
    try {
      setApprovingId(confirmState.reviewId)
      setError(null)
      const updatedReview = await reviewsApi.approve(confirmState.reviewId)
      // Update the review in the list
      setReviews(reviews.map(review => 
        review.id === confirmState.reviewId ? updatedReview : review
      ))
      setConfirmState({ isOpen: false, reviewId: null, action: null })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve review')
      console.error('Error approving review:', err)
      setConfirmState({ isOpen: false, reviewId: null, action: null })
    } finally {
      setApprovingId(null)
    }
  }

  const handleDisapprove = async () => {
    if (!confirmState.reviewId || confirmState.action !== 'disapprove') return
    
    try {
      setDisapprovingId(confirmState.reviewId)
      setError(null)
      const updatedReview = await reviewsApi.disapprove(confirmState.reviewId)
      // Update the review in the list
      setReviews(reviews.map(review => 
        review.id === confirmState.reviewId ? updatedReview : review
      ))
      setConfirmState({ isOpen: false, reviewId: null, action: null })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to disapprove review')
      console.error('Error disapproving review:', err)
      setConfirmState({ isOpen: false, reviewId: null, action: null })
    } finally {
      setDisapprovingId(null)
    }
  }

  const handleConfirmAction = () => {
    if (confirmState.action === 'approve') {
      handleApprove()
    } else if (confirmState.action === 'disapprove') {
      handleDisapprove()
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger'> = {
      approved: 'success',
      pending: 'warning',
      rejected: 'danger',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">User Reviews</h1>
        <p className="text-gray-600">View and manage customer reviews</p>
      </div>

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No reviews found</p>
        </div>
      ) : (
        <Table>
        <TableHeader>
          <TableHeaderCell>Customer</TableHeaderCell>
          <TableHeaderCell>Rating</TableHeaderCell>
          <TableHeaderCell>Comment</TableHeaderCell>
          <TableHeaderCell>Order ID</TableHeaderCell>
          <TableHeaderCell>Date</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{review.customerName}</div>
                  <div className="text-sm text-gray-500">{review.customerEmail}</div>
                </div>
              </TableCell>
              <TableCell>{renderStars(review.rating)}</TableCell>
              <TableCell className="max-w-md">
                <p className="text-gray-700 line-clamp-2">{review.comment}</p>
              </TableCell>
              <TableCell className="font-medium">{review.orderId}</TableCell>
              <TableCell className="text-gray-500">
                {format(new Date(review.createdAt), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>{getStatusBadge(review.status)}</TableCell>
              <TableCell>
                {!review.isShowOthers ? (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleApproveClick(review.id)}
                    disabled={approvingId === review.id || confirmState.isOpen}
                    className="min-w-[110px] shadow-sm hover:shadow-md"
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    {approvingId === review.id ? 'Approving...' : 'Approve'}
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDisapproveClick(review.id)}
                    disabled={disapprovingId === review.id || confirmState.isOpen}
                    className="min-w-[110px] shadow-sm hover:shadow-md"
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    {disapprovingId === review.id ? 'Disapproving...' : 'Disapprove'}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      )}

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        message={
          confirmState.action === 'approve'
            ? "Are you sure you want to approve this review? This will make it visible to other customers."
            : "Are you sure you want to disapprove this review? This will hide it from other customers."
        }
        title={confirmState.action === 'approve' ? 'Approve Review' : 'Disapprove Review'}
        confirmLabel={confirmState.action === 'approve' ? 'Approve' : 'Disapprove'}
        cancelLabel="Cancel"
        onCancel={() => setConfirmState({ isOpen: false, reviewId: null, action: null })}
        onConfirm={handleConfirmAction}
        isProcessing={approvingId !== null || disapprovingId !== null}
      />
    </div>
  )
}

