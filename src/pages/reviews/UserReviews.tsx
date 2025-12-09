import { useState, useEffect } from 'react'
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Star } from 'lucide-react'
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

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await reviewsApi.getAll()
      setReviews(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch reviews')
      console.error('Error fetching reviews:', err)
    } finally {
      setIsLoading(false)
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
      )}
    </div>
  )
}

