import { useState } from 'react'
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Button, Modal, Badge } from '../../components/ui'
import { Card } from '../../components/ui/Card'
import { Eye, User, Car, Calendar, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

interface OrderServiceDetail {
  id: string
  serviceName: string
  price: number
}

interface OrderProductDetail {
  id: string
  productName: string
  quantity: number
  price: number
}

interface OrderExtraWork {
  id: string
  workName: string
  price: number
}

interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  vehicleType: string
  vehicleModel: string
  vehiclePlate: string
  orderDate: string
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
  totalAmount: number
  services: OrderServiceDetail[]
  products: OrderProductDetail[]
  extraWorks: OrderExtraWork[]
  paymentStatus: 'pending' | 'paid' | 'refunded'
}

const dummyOrders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+1 234-567-8900',
    vehicleType: 'Sedan',
    vehicleModel: 'Toyota Camry',
    vehiclePlate: 'ABC-1234',
    orderDate: '2024-01-15T10:30:00',
    status: 'completed',
    totalAmount: 350,
    services: [
      { id: '1', serviceName: 'Premium Wash', price: 150 },
      { id: '2', serviceName: 'Interior Vacuum', price: 50 },
    ],
    products: [
      { id: '1', productName: 'Car Shampoo', quantity: 1, price: 25 },
    ],
    extraWorks: [
      { id: '1', workName: 'Headlight Restoration', price: 80 },
    ],
    paymentStatus: 'paid',
  },
  {
    id: 'ORD-002',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    customerPhone: '+1 234-567-8901',
    vehicleType: 'SUV',
    vehicleModel: 'Honda CR-V',
    vehiclePlate: 'XYZ-5678',
    orderDate: '2024-01-14T14:20:00',
    status: 'in-progress',
    totalAmount: 200,
    services: [
      { id: '3', serviceName: 'Express Wash', price: 80 },
      { id: '4', serviceName: 'Tire Shine', price: 30 },
    ],
    products: [],
    extraWorks: [],
    paymentStatus: 'paid',
  },
]

const statusSteps = ['pending', 'confirmed', 'in-progress', 'completed']

export function Orders() {
  const [orders, setOrders] = useState<Order[]>(dummyOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailModalOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      pending: 'warning',
      confirmed: 'info',
      'in-progress': 'info',
      completed: 'success',
      cancelled: 'danger',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getStatusIndex = (status: string) => {
    return statusSteps.indexOf(status)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Orders</h1>
        <p className="text-gray-600">View and manage all customer orders</p>
      </div>

      <Table>
        <TableHeader>
          <TableHeaderCell>Order ID</TableHeaderCell>
          <TableHeaderCell>Customer</TableHeaderCell>
          <TableHeaderCell>Vehicle</TableHeaderCell>
          <TableHeaderCell>Date</TableHeaderCell>
          <TableHeaderCell>Amount</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Payment</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{order.customerName}</div>
                  <div className="text-sm text-gray-500">{order.customerEmail}</div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{order.vehicleModel}</div>
                  <div className="text-sm text-gray-500">{order.vehiclePlate}</div>
                </div>
              </TableCell>
              <TableCell className="text-gray-500">
                {format(new Date(order.orderDate), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell className="font-semibold">${order.totalAmount}</TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>
                <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
                  {order.paymentStatus}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => handleViewDetails(order)}>
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Order Details - ${selectedOrder.id}`}
          size="xl"
        >
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Customer Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium">
                    {format(new Date(selectedOrder.orderDate), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
            </Card>

            {/* Vehicle Info */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Car className="w-5 h-5 mr-2" />
                Vehicle Information
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium">{selectedOrder.vehicleType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Model</p>
                  <p className="font-medium">{selectedOrder.vehicleModel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plate Number</p>
                  <p className="font-medium">{selectedOrder.vehiclePlate}</p>
                </div>
              </div>
            </Card>

            {/* Order Status Timeline */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Status</h3>
              <div className="flex items-center space-x-4">
                {statusSteps.map((step, index) => {
                  const currentIndex = getStatusIndex(selectedOrder.status)
                  const isCompleted = index <= currentIndex
                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isCompleted
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <p className="text-xs mt-2 text-gray-600 capitalize">{step}</p>
                      </div>
                      {index < statusSteps.length - 1 && (
                        <div
                          className={`h-1 flex-1 mx-2 ${
                            index < currentIndex ? 'bg-primary-600' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Services */}
            {selectedOrder.services.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Services</h3>
                <Table>
                  <TableHeader>
                    <TableHeaderCell>Service Name</TableHeaderCell>
                    <TableHeaderCell>Price</TableHeaderCell>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>{service.serviceName}</TableCell>
                        <TableCell className="font-semibold">${service.price}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}

            {/* Products */}
            {selectedOrder.products.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Products</h3>
                <Table>
                  <TableHeader>
                    <TableHeaderCell>Product Name</TableHeaderCell>
                    <TableHeaderCell>Quantity</TableHeaderCell>
                    <TableHeaderCell>Price</TableHeaderCell>
                    <TableHeaderCell>Total</TableHeaderCell>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.productName}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>${product.price}</TableCell>
                        <TableCell className="font-semibold">
                          ${product.price * product.quantity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}

            {/* Extra Works */}
            {selectedOrder.extraWorks.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Extra Works</h3>
                <Table>
                  <TableHeader>
                    <TableHeaderCell>Work Name</TableHeaderCell>
                    <TableHeaderCell>Price</TableHeaderCell>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.extraWorks.map((work) => (
                      <TableRow key={work.id}>
                        <TableCell>{work.workName}</TableCell>
                        <TableCell className="font-semibold">${work.price}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}

            {/* Total */}
            <Card>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-800">Total Amount</span>
                <span className="text-2xl font-bold text-primary-600">
                  ${selectedOrder.totalAmount}
                </span>
              </div>
              <div className="mt-2">
                <Badge variant={selectedOrder.paymentStatus === 'paid' ? 'success' : 'warning'}>
                  Payment: {selectedOrder.paymentStatus}
                </Badge>
              </div>
            </Card>
          </div>
        </Modal>
      )}
    </div>
  )
}

