import { useState, useEffect } from 'react'
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Button, Modal, Badge, ConfirmDialog } from '../../components/ui'
import { Card } from '../../components/ui/Card'
import { Eye, User, Car, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ordersApi } from '../../api/orders.api'
import type { Order } from '../../api/orders.api'
import { productsApi } from '../../api/products.api'

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    message: string
    onConfirm: (() => void) | null
  }>({
    isOpen: false,
    message: '',
    onConfirm: null,
  })
  const [isCompletingOrder, setIsCompletingOrder] = useState(false)
  const [orderBeingCompleted, setOrderBeingCompleted] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await ordersApi.getAll()
      setOrders(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch orders')
      console.error('Error fetching orders:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = async (order: Order) => {
    try {
      const fullOrder = await ordersApi.getById(order.id)
      setSelectedOrder(fullOrder)
      setIsDetailModalOpen(true)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to fetch order details')
      console.error('Error fetching order details:', err)
    }
  }

  const handleCompleteOrderClick = (orderId: string) => {
    setConfirmState({
      isOpen: true,
      message: 'Mark this order as completed?',
      onConfirm: () => {
        handleCompleteOrder(orderId)
      },
    })
  }

  const handleCompleteOrder = async (orderId: string) => {
    try {
      setIsCompletingOrder(true)
      setOrderBeingCompleted(orderId)
      setError(null)
      const completedOrder = await ordersApi.updateStatus(orderId, 'completed')

      // Reduce stock for each product in this order
      if (completedOrder.products && completedOrder.products.length > 0) {
        for (const item of completedOrder.products) {
          try {
            const product = await productsApi.getById(item.productId)
            const newStock = Math.max(0, (product.stock || 0) - item.quantity)
            await productsApi.update(product.id, { stock: newStock } as any)
          } catch (err) {
            console.error('Failed to update product stock for order completion:', err)
          }
        }
      }
      // Refresh orders list
      await fetchOrders()
      // If the completed order is currently selected, update it
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = await ordersApi.getById(orderId)
        setSelectedOrder(updatedOrder)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete order')
      console.error('Error completing order:', err)
    } finally {
      setIsCompletingOrder(false)
      setOrderBeingCompleted(null)
    }
  }

  const statusSteps = ['pending', 'completed']

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      pending: 'warning',
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

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No orders found</p>
        </div>
      ) : (
        <Table>
        <TableHeader>
          <TableHeaderCell className="w-5">Order ID</TableHeaderCell>
          <TableHeaderCell>Customer</TableHeaderCell>
          <TableHeaderCell>Vehicle</TableHeaderCell>
          <TableHeaderCell>Date</TableHeaderCell>
          <TableHeaderCell>Amount</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell className="w-48">Actions</TableHeaderCell>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium w-20">{order.id}</TableCell>
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
              <TableCell className="w-48">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleViewDetails(order)}
                    className="min-w-[80px]"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  {order.status === 'pending' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleCompleteOrderClick(order.id)}
                      title="Mark as completed"
                      className="bg-green-600 hover:bg-green-700 min-w-[120px]"
                      disabled={isCompletingOrder && orderBeingCompleted === order.id}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {isCompletingOrder && orderBeingCompleted === order.id ? 'Completing...' : 'Complete'}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      )}

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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium">{selectedOrder.vehicleType}</p>
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

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        message={confirmState.message}
        title="Confirm Action"
        confirmLabel={isCompletingOrder ? 'Completing...' : 'OK'}
        cancelLabel="Cancel"
        isProcessing={isCompletingOrder}
        onCancel={() =>
          setConfirmState((prev) => ({
            ...prev,
            isOpen: false,
            onConfirm: null,
          }))
        }
        onConfirm={async () => {
          if (confirmState.onConfirm) {
            await confirmState.onConfirm()
          }
          setConfirmState((prev) => ({
            ...prev,
            isOpen: false,
            onConfirm: null,
          }))
        }}
      />
    </div>
  )
}

