import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { Star } from 'lucide-react'
import { format } from 'date-fns'

interface Review {
  id: string
  customerName: string
  customerEmail: string
  rating: number
  comment: string
  orderId: string
  createdAt: string
  status: 'approved' | 'pending' | 'rejected'
}

const dummyReviews: Review[] = [
  {
    id: '1',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    rating: 5,
    comment: 'Excellent service! My car looks brand new. Highly recommended!',
    orderId: 'ORD-001',
    createdAt: '2024-01-15T10:30:00',
    status: 'approved',
  },
  {
    id: '2',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    rating: 4,
    comment: 'Great service, very professional staff. Will come back again.',
    orderId: 'ORD-002',
    createdAt: '2024-01-14T14:20:00',
    status: 'approved',
  },
  {
    id: '3',
    customerName: 'Mike Johnson',
    customerEmail: 'mike@example.com',
    rating: 5,
    comment: 'Outstanding quality and attention to detail. Worth every penny!',
    orderId: 'ORD-003',
    createdAt: '2024-01-13T09:15:00',
    status: 'pending',
  },
]

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
          {dummyReviews.map((review) => (
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
    </div>
  )
}

