import { useState, useEffect, useMemo } from 'react'
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Button, Modal, Badge, ConfirmDialog, Input } from '../../components/ui'
import { Card } from '../../components/ui/Card'
import { Eye, User, Car, CheckCircle, Play, Upload, X, ClipboardCheck, Image as ImageIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ordersApi } from '../../api/orders.api'
import type { Order } from '../../api/orders.api'
import { productsApi } from '../../api/products.api'
import { useAuth } from '../../context/AuthContext'

export function Orders() {
  const { getAdminBranchId, isDeveloper } = useAuth()
  const adminBranchId = getAdminBranchId()
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
  const [isStartWorkModalOpen, setIsStartWorkModalOpen] = useState(false)
  const [orderForStartWork, setOrderForStartWork] = useState<Order | null>(null)
  const [isStartingWork, setIsStartingWork] = useState(false)
  const [isCompleteWorkModalOpen, setIsCompleteWorkModalOpen] = useState(false)
  const [orderForCompleteWork, setOrderForCompleteWork] = useState<Order | null>(null)
  const [isCompletingWork, setIsCompletingWork] = useState(false)
  const [startWorkInspections, setStartWorkInspections] = useState<Array<{ id: number; name: string; notes: string | null; image_url?: string }>>([])
  const [completeWorkConfirmations, setCompleteWorkConfirmations] = useState<Record<number, { verified: boolean; notes: string; image: File | null; imagePreview: string | null }>>({})
  
  // Common damages and personal items
  const interiorDamages = [
    'Seat tear',
    'Dashboard scratch',
    'Door panel damage',
    'Carpet stain',
    'Headliner damage',
    'Center console scratch',
    'Armrest damage',
    'Seat belt issue',
    'Window tint damage',
    'Others'
  ]
  
  const exteriorDamages = [
    'Bumper scratch',
    'Door dent',
    'Hood scratch',
    'Windshield crack',
    'Side mirror damage',
    'Headlight crack',
    'Taillight damage',
    'Wheel rim scratch',
    'Paint chip',
    'Others'
  ]
  
  const personalItems = [
    'Wallet',
    'Phone',
    'Keys',
    'Documents',
    'Sunglasses',
    'Charging cable',
    'Water bottle',
    'Umbrella',
    'Shopping bags',
    'Others'
  ]
  
  // State for start work form
  const [selectedItems, setSelectedItems] = useState<Record<string, { checked: boolean; notes: string; image: File | null; imagePreview: string | null; customName?: string }>>({})

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

  // Filter orders by branch if user has admin_branch restriction
  const filteredOrders = useMemo(() => {
    if (adminBranchId && !isDeveloper()) {
      return orders.filter((order) => order.branchId === adminBranchId)
    }
    return orders
  }, [orders, adminBranchId, isDeveloper])

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

  const statusSteps = ['pending', 'in-progress', 'completed']

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      pending: 'warning',
      'in-progress': 'info',
      completed: 'success',
      cancelled: 'danger',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getStatusIndex = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, '-')
    return statusSteps.indexOf(normalizedStatus as any)
  }

  const handleStartWorkClick = (order: Order) => {
    setOrderForStartWork(order)
    setSelectedItems({})
    setIsStartWorkModalOpen(true)
  }

  const handleItemToggle = (itemName: string, category: string) => {
    const key = `${category}_${itemName}`
    setSelectedItems((prev) => {
      const current = prev[key] || { checked: false, notes: '', image: null, imagePreview: null, customName: '' }
      return {
        ...prev,
        [key]: {
          ...current,
          checked: !current.checked,
          notes: !current.checked ? current.notes : '',
          image: !current.checked ? current.image : null,
          imagePreview: !current.checked ? current.imagePreview : null,
          customName: !current.checked ? (current.customName || '') : '',
        },
      }
    })
  }

  const handleNotesChange = (itemName: string, category: string, notes: string) => {
    const key = `${category}_${itemName}`
    setSelectedItems((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { checked: true, notes: '', image: null, imagePreview: null, customName: '' }),
        notes,
      },
    }))
  }

  const handleCustomNameChange = (itemName: string, category: string, customName: string) => {
    const key = `${category}_${itemName}`
    setSelectedItems((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { checked: true, notes: '', image: null, imagePreview: null, customName: '' }),
        customName,
      },
    }))
  }

  const handleImageChange = (itemName: string, category: string, file: File | null) => {
    const key = `${category}_${itemName}`
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedItems((prev) => ({
          ...prev,
          [key]: {
            ...(prev[key] || { checked: true, notes: '', image: null, imagePreview: null }),
            image: file,
            imagePreview: reader.result as string,
          },
        }))
      }
      reader.readAsDataURL(file)
    } else {
      setSelectedItems((prev) => ({
        ...prev,
        [key]: {
          ...(prev[key] || { checked: true, notes: '', image: null, imagePreview: null }),
          image: null,
          imagePreview: null,
        },
      }))
    }
  }

  const handleCompleteWorkClick = async (order: Order) => {
    setOrderForCompleteWork(order)
    setCompleteWorkConfirmations({})
    setIsCompleteWorkModalOpen(true)
    
    // Try to fetch start work inspections from API
    try {
      const inspections = await ordersApi.getStartWorkInspections(order.id)
      if (inspections && Array.isArray(inspections) && inspections.length > 0) {
        setStartWorkInspections(inspections)
        // Initialize confirmations with verified unchecked by default
        const initialConfirmations: Record<number, { verified: boolean; notes: string; image: File | null; imagePreview: string | null }> = {}
        inspections.forEach((inspection: any) => {
          initialConfirmations[inspection.id] = {
            verified: false,
            notes: '',
            image: null,
            imagePreview: null,
          }
        })
        setCompleteWorkConfirmations(initialConfirmations)
      } else {
        // If no inspections from API, use stored inspections from start work
        if (startWorkInspections.length > 0) {
          const initialConfirmations: Record<number, { verified: boolean; notes: string; image: File | null; imagePreview: string | null }> = {}
          startWorkInspections.forEach((inspection) => {
            initialConfirmations[inspection.id] = {
              verified: false,
              notes: '',
              image: null,
              imagePreview: null,
            }
          })
          setCompleteWorkConfirmations(initialConfirmations)
        } else {
          setStartWorkInspections([])
        }
      }
    } catch (err: any) {
      console.error('Error fetching inspections:', err)
      // If API fails, try using stored inspections
      if (startWorkInspections.length > 0) {
        const initialConfirmations: Record<number, { verified: boolean; notes: string; image: File | null; imagePreview: string | null }> = {}
        startWorkInspections.forEach((inspection) => {
          initialConfirmations[inspection.id] = {
            verified: false,
            notes: '',
            image: null,
            imagePreview: null,
          }
        })
        setCompleteWorkConfirmations(initialConfirmations)
      } else {
        setStartWorkInspections([])
      }
    }
  }

  const handleVerificationToggle = (inspectionId: number) => {
    setCompleteWorkConfirmations((prev) => ({
      ...prev,
      [inspectionId]: {
        ...(prev[inspectionId] || { verified: false, notes: '', image: null, imagePreview: null }),
        verified: !prev[inspectionId]?.verified,
      },
    }))
  }

  const handleVerificationNotesChange = (inspectionId: number, notes: string) => {
    setCompleteWorkConfirmations((prev) => ({
      ...prev,
      [inspectionId]: {
        ...(prev[inspectionId] || { verified: false, notes: '', image: null, imagePreview: null }),
        notes,
      },
    }))
  }

  const handleVerificationImageChange = (inspectionId: number, file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCompleteWorkConfirmations((prev) => ({
          ...prev,
          [inspectionId]: {
            ...(prev[inspectionId] || { verified: false, notes: '', image: null, imagePreview: null }),
            image: file,
            imagePreview: reader.result as string,
            verified: true, // Automatically check verified when image is uploaded
          },
        }))
      }
      reader.readAsDataURL(file)
    } else {
      setCompleteWorkConfirmations((prev) => ({
        ...prev,
        [inspectionId]: {
          ...(prev[inspectionId] || { verified: false, notes: '', image: null, imagePreview: null }),
          image: null,
          imagePreview: null,
          verified: false, // Uncheck verified when image is removed
        },
      }))
    }
  }

  const handleCompleteWorkSubmit = async () => {
    if (!orderForCompleteWork) return

    try {
      setIsCompletingWork(true)
      setError(null)

      // Build confirmations array
      const confirmations: Array<{ start_inspection_id: number; verified: boolean; notes: string | null; image: string }> = []
      const images: File[] = []
      
      Object.entries(completeWorkConfirmations).forEach(([inspectionIdStr, confirmation]) => {
        const inspectionId = Number(inspectionIdStr)
        if (confirmation.image) {
          confirmations.push({
            start_inspection_id: inspectionId,
            verified: confirmation.verified,
            notes: confirmation.notes || null,
            image: '', // Will be set by API function based on index
          })
          images.push(confirmation.image)
        }
      })

      if (confirmations.length === 0) {
        setError('Please upload at least one confirmation image')
        setIsCompletingWork(false)
        return
      }

      await ordersApi.completeWork(orderForCompleteWork.id, confirmations, images)
      
      // Refresh orders list
      await fetchOrders()
      setIsCompleteWorkModalOpen(false)
      setOrderForCompleteWork(null)
      setCompleteWorkConfirmations({})
      setStartWorkInspections([])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete work')
      console.error('Error completing work:', err)
    } finally {
      setIsCompletingWork(false)
    }
  }

  const handleStartWorkSubmit = async () => {
    if (!orderForStartWork) return

    try {
      setIsStartingWork(true)
      setError(null)

      // Validate that customName is provided for "Others" items
      for (const [key, item] of Object.entries(selectedItems)) {
        if (item.checked && item.image) {
          const itemName = key.split('_').slice(1).join('_') // Remove category prefix
          if (itemName === 'Others' && !item.customName?.trim()) {
            setError('Please enter a name for "Others"')
            setIsStartingWork(false)
            return
          }
        }
      }

      // Build items array from selected items
      const items: Array<{ name: string; notes: string | null; image: string }> = []
      const images: File[] = []
      
      Object.entries(selectedItems).forEach(([key, item]) => {
        if (item.checked && item.image) {
          const itemName = key.split('_').slice(1).join('_') // Remove category prefix
          // Use customName if "Others" is selected, otherwise use the item name
          const finalName = itemName === 'Others' && item.customName ? item.customName.trim() : itemName
          
          items.push({
            name: finalName,
            notes: item.notes || null,
            image: '', // Will be set by API function based on index
          })
          images.push(item.image)
        }
      })

      if (items.length === 0) {
        setError('Please select at least one item with an image')
        setIsStartingWork(false)
        return
      }

      const response = await ordersApi.startWork(orderForStartWork.id, items, images)
      
      // Store inspection data if returned in response
      // The response should contain inspection IDs that were created
      if (response.data?.inspections || response.data?.items) {
        const inspections = response.data.inspections || response.data.items || []
        // Map the items we submitted to inspection format
        const inspectionData = inspections.map((insp: any, index: number) => ({
          id: insp.id || insp.start_inspection_id || index + 1,
          name: insp.name || items[index]?.name || `Item ${index + 1}`,
          notes: insp.notes || items[index]?.notes || null,
          image_url: insp.image_url || null,
        }))
        setStartWorkInspections(inspectionData)
      } else {
        // If no inspection data in response, create from submitted items
        const inspectionData = items.map((item, index) => ({
          id: index + 1, // Temporary ID, should come from backend
          name: item.name,
          notes: item.notes,
          image_url: null,
        }))
        setStartWorkInspections(inspectionData)
      }
      
      // Update order status to in-progress in local state immediately
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderForStartWork.id
            ? { ...order, status: 'in-progress' as const }
            : order
        )
      )
      
      // Refresh orders list to get latest data from backend
      await fetchOrders()
      setIsStartWorkModalOpen(false)
      setOrderForStartWork(null)
      setSelectedItems({})
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start work')
      console.error('Error starting work:', err)
    } finally {
      setIsStartingWork(false)
    }
  }

  const renderDamageSection = (title: string, items: string[], category: string) => (
    <div className="mb-6">
      <h4 className="text-md font-semibold text-gray-700 mb-3">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => {
          const key = `${category}_${item}`
          const itemData = selectedItems[key] || { checked: false, notes: '', image: null, imagePreview: null, customName: '' }
          return (
            <div key={key} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={key}
                  checked={itemData.checked}
                  onChange={() => handleItemToggle(item, category)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 flex-shrink-0"
                />
                <label htmlFor={key} className="flex-1 text-sm font-medium text-gray-700 cursor-pointer">
                  {item}
                </label>
              </div>
              {itemData.checked && (
                <div className="space-y-2">
                  {item === 'Others' && (
                    <Input
                      label="Name (required)"
                      value={itemData.customName || ''}
                      onChange={(e) => handleCustomNameChange(item, category, e.target.value)}
                      placeholder="Enter name..."
                      className="text-sm"
                      required
                    />
                  )}
                  <Input
                    label="Notes (optional)"
                    value={itemData.notes}
                    onChange={(e) => handleNotesChange(item, category, e.target.value)}
                    placeholder="Add notes..."
                    className="text-sm"
                  />
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Image (required)
                    </label>
                    <div className="flex flex-col space-y-2">
                      <label className="flex items-center space-x-2 px-3 py-1.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-xs">
                        <Upload className="w-3 h-3 text-gray-600" />
                        <span className="text-xs text-gray-700 truncate">
                          {itemData.image ? itemData.image.name : 'Upload Image'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageChange(item, category, e.target.files?.[0] || null)}
                        />
                      </label>
                      {itemData.imagePreview && (
                        <div className="relative w-full">
                          <img
                            src={itemData.imagePreview}
                            alt={item}
                            className="w-full h-24 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => handleImageChange(item, category, null)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

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
      ) : filteredOrders.length === 0 ? (
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
          <TableHeaderCell className="w-64">Actions</TableHeaderCell>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((order) => (
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
              <TableCell className="w-64">
                <div className="flex items-center space-x-2 flex-wrap gap-2">
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
                      onClick={() => handleStartWorkClick(order)}
                      title="Start work on this order"
                      className="bg-blue-600 hover:bg-blue-700 min-w-[110px]"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Start Work
                    </Button>
                  )}
                  {order.status === 'in-progress' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleCompleteWorkClick(order)}
                      title="Complete work on this order"
                      className="bg-green-600 hover:bg-green-700 min-w-[130px]"
                      disabled={isCompletingWork}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {isCompletingWork ? 'Completing...' : 'Complete Work'}
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
                  
                  // Get date for each status
                  let statusDate: string | null = null
                  if (step === 'pending') {
                    statusDate = selectedOrder.orderDate
                  } else if (step === 'in-progress') {
                    statusDate = selectedOrder.startedAt || null
                  } else if (step === 'completed') {
                    statusDate = selectedOrder.completedAt || null
                  }
                  
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
                        <p className="text-xs mt-2 text-gray-600 capitalize font-medium">{step}</p>
                        {statusDate && (
                          <p className="text-xs mt-1 text-gray-500">
                            {format(new Date(statusDate), 'MMM dd, yyyy')}
                          </p>
                        )}
                        {statusDate && (
                          <p className="text-xs text-gray-500">
                            {format(new Date(statusDate), 'HH:mm')}
                          </p>
                        )}
                        {!statusDate && isCompleted && (
                          <p className="text-xs mt-1 text-gray-400 italic">Date not available</p>
                        )}
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

            {/* Inspection Details */}
            {selectedOrder.inspections && selectedOrder.inspections.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <ClipboardCheck className="w-5 h-5 mr-2" />
                  Inspection Details
                </h3>
                <div className="space-y-4">
                  {selectedOrder.inspections.map((inspection) => (
                    <div key={inspection.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">{inspection.name}</h4>
                          {inspection.notes && (
                            <p className="text-sm text-gray-600">Notes: {inspection.notes}</p>
                          )}
                        </div>
                        <Badge variant="info">Start Work</Badge>
                      </div>
                      
                      {inspection.photoUrl && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2 flex items-center">
                            <ImageIcon className="w-3 h-3 mr-1" />
                            Start Work Image
                          </p>
                          <img
                            src={inspection.photoUrl}
                            alt={inspection.name}
                            className="w-full max-w-md h-48 object-cover rounded border"
                          />
                        </div>
                      )}

                      {inspection.completions && inspection.completions.length > 0 && (
                        <div className="border-t pt-3 space-y-3">
                          <p className="text-sm font-medium text-gray-700">Completion Details:</p>
                          {inspection.completions.map((completion) => (
                            <div key={completion.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Badge variant={completion.verified ? 'success' : 'warning'}>
                                    {completion.verified ? 'Verified' : 'Not Verified'}
                                  </Badge>
                                </div>
                              </div>
                              {completion.notes && (
                                <p className="text-sm text-gray-600">Notes: {completion.notes}</p>
                              )}
                              {completion.photoUrl && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-2 flex items-center">
                                    <ImageIcon className="w-3 h-3 mr-1" />
                                    Completion Image
                                  </p>
                                  <img
                                    src={completion.photoUrl}
                                    alt={`Completion for ${inspection.name}`}
                                    className="w-full max-w-md h-48 object-cover rounded border"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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

      {/* Complete Work Modal */}
      <Modal
        isOpen={isCompleteWorkModalOpen}
        onClose={() => {
          setIsCompleteWorkModalOpen(false)
          setOrderForCompleteWork(null)
          setCompleteWorkConfirmations({})
          setStartWorkInspections([])
        }}
        title={`Complete Work - Order #${orderForCompleteWork?.id}`}
        size="xl"
      >
        <div className="space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {startWorkInspections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No inspection items found. Please start work first.</p>
            </div>
          ) : (
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Verification & Confirmation</h3>
              <p className="text-sm text-gray-600 mb-4">
                Verify each item from the start work inspection and upload confirmation images.
              </p>
              <div className="space-y-4">
                {startWorkInspections.map((inspection) => {
                  const confirmation = completeWorkConfirmations[inspection.id] || {
                    verified: false,
                    notes: '',
                    image: null,
                    imagePreview: null,
                  }
                  return (
                    <div key={inspection.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{inspection.name}</h4>
                          {inspection.notes && (
                            <p className="text-sm text-gray-600 mt-1">Original notes: {inspection.notes}</p>
                          )}
                          {inspection.image_url && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 mb-1">Original image:</p>
                              <img
                                src={inspection.image_url}
                                alt={inspection.name}
                                className="w-24 h-24 object-cover rounded border"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={confirmation.verified}
                            onChange={() => handleVerificationToggle(inspection.id)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <label className="text-sm font-medium text-gray-700">
                            Verified
                          </label>
                        </div>
                      </div>
                      <Input
                        label="Verification Notes (optional)"
                        value={confirmation.notes}
                        onChange={(e) => handleVerificationNotesChange(inspection.id, e.target.value)}
                        placeholder="Add verification notes..."
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirmation Image (required)
                        </label>
                        <div className="flex items-center space-x-2">
                          <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <Upload className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">
                              {confirmation.image ? confirmation.image.name : 'Upload Confirmation Image'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleVerificationImageChange(inspection.id, e.target.files?.[0] || null)}
                            />
                          </label>
                          {confirmation.imagePreview && (
                            <div className="relative">
                              <img
                                src={confirmation.imagePreview}
                                alt={`Confirmation for ${inspection.name}`}
                                className="w-20 h-20 object-cover rounded border"
                              />
                              <button
                                type="button"
                                onClick={() => handleVerificationImageChange(inspection.id, null)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => {
                setIsCompleteWorkModalOpen(false)
                setOrderForCompleteWork(null)
                setCompleteWorkConfirmations({})
                setStartWorkInspections([])
              }}
              disabled={isCompletingWork}
            >
              Cancel
            </Button>
            <Button onClick={handleCompleteWorkSubmit} disabled={isCompletingWork || startWorkInspections.length === 0}>
              {isCompletingWork ? 'Completing...' : 'Complete Work'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Start Work Modal */}
      <Modal
        isOpen={isStartWorkModalOpen}
        onClose={() => {
          setIsStartWorkModalOpen(false)
          setOrderForStartWork(null)
          setSelectedItems({})
        }}
        title={`Start Work - Order #${orderForStartWork?.id}`}
        size="2xl"
      >
        <div className="space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Physical Damages</h3>
            {renderDamageSection('Interior Damages', interiorDamages, 'interior')}
            {renderDamageSection('Exterior Damages', exteriorDamages, 'exterior')}
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {personalItems.map((item) => {
                const key = `personal_${item}`
                const itemData = selectedItems[key] || { checked: false, notes: '', image: null, imagePreview: null, customName: '' }
                return (
                  <div key={key} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={key}
                        checked={itemData.checked}
                        onChange={() => handleItemToggle(item, 'personal')}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 flex-shrink-0"
                      />
                      <label htmlFor={key} className="flex-1 text-sm font-medium text-gray-700 cursor-pointer">
                        {item}
                      </label>
                    </div>
                    {itemData.checked && (
                      <div className="space-y-2">
                        {item === 'Others' && (
                          <Input
                            label="Name (required)"
                            value={itemData.customName || ''}
                            onChange={(e) => handleCustomNameChange(item, 'personal', e.target.value)}
                            placeholder="Enter name..."
                            className="text-sm"
                            required
                          />
                        )}
                        <Input
                          label="Notes (optional)"
                          value={itemData.notes}
                          onChange={(e) => handleNotesChange(item, 'personal', e.target.value)}
                          placeholder="Add notes..."
                          className="text-sm"
                        />
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Image (required)
                          </label>
                          <div className="flex flex-col space-y-2">
                            <label className="flex items-center space-x-2 px-3 py-1.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-xs">
                              <Upload className="w-3 h-3 text-gray-600" />
                              <span className="text-xs text-gray-700 truncate">
                                {itemData.image ? itemData.image.name : 'Upload Image'}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageChange(item, 'personal', e.target.files?.[0] || null)}
                              />
                            </label>
                            {itemData.imagePreview && (
                              <div className="relative w-full">
                                <img
                                  src={itemData.imagePreview}
                                  alt={item}
                                  className="w-full h-24 object-cover rounded border"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleImageChange(item, 'personal', null)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => {
                setIsStartWorkModalOpen(false)
                setOrderForStartWork(null)
                setSelectedItems({})
              }}
              disabled={isStartingWork}
            >
              Cancel
            </Button>
            <Button onClick={handleStartWorkSubmit} disabled={isStartingWork}>
              {isStartingWork ? 'Starting Work...' : 'Start Work'}
            </Button>
          </div>
        </div>
      </Modal>

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

