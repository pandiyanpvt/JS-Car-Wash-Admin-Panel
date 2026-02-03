import { useState, useEffect, useMemo } from 'react'
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Button, Modal, Badge, ConfirmDialog, Input, Select } from '../../components/ui'
import { Card } from '../../components/ui/Card'
import { Eye, User, Car, CheckCircle, Play, Upload, X, ClipboardCheck, Image as ImageIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ordersApi } from '../../api/orders.api'
import axiosInstance from '../../api/axiosInstance'
import type { Order } from '../../api/orders.api'
import { productsApi, type Product } from '../../api/products.api'
import { branchesApi, type Branch } from '../../api/branches.api'
import { packagesApi, type Package } from '../../api/packages.api'
import { extraWorksApi, type ExtraWork } from '../../api/extra-works.api'
import { VEHICLE_TYPES } from '../../utils/constants'
import { useAuth } from '../../context/AuthContext'

export function Orders() {
  const { getAdminBranchId, isDeveloper } = useAuth()
  const adminBranchId = getAdminBranchId()
  const [orders, setOrders] = useState<Order[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderTypeFilter, setOrderTypeFilter] = useState<'all' | 'service' | 'product'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all')
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
  const [completeWorkStep, setCompleteWorkStep] = useState<'inspection' | 'order-details'>('inspection')
  const [completeWorkOrderDetails, setCompleteWorkOrderDetails] = useState<{
    branch_id: string
    vehicle_type: string
    services: Array<{ package_id: number; vehicle_type: string; vehicle_number?: string; arrival_date?: string; arrival_time?: string }>
    products: Array<{ product_id: number; quantity: number }>
    extra_works: Array<{ extra_works_id: number }>
    total_amount: number
  }>({
    branch_id: '',
    vehicle_type: '',
    services: [],
    products: [],
    extra_works: [],
    total_amount: 0,
  })

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

  // State for offline order modal
  const [isOfflineOrderModalOpen, setIsOfflineOrderModalOpen] = useState(false)
  const [packages, setPackages] = useState<Package[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [allExtraWorks, setAllExtraWorks] = useState<ExtraWork[]>([])
  const [offlineOrderForm, setOfflineOrderForm] = useState({
    user_full_name: '',
    user_email_address: '',
    user_phone_number: '',
    branch_id: adminBranchId || '',
    vehicle_type: '',
    vehicle_number: '', // Single vehicle number for all selected packages
    selectedPackages: [] as Array<{ package_id: number; vehicle_type: string }>,
    selectedProducts: [] as Array<{ product_id: number; quantity: number }>,
    selectedExtraWorks: [] as Array<{ extra_works_id: number }>,
    total_amount: 0,
  })
  const [isSavingOfflineOrder, setIsSavingOfflineOrder] = useState(false)

  useEffect(() => {
    fetchOrders()
    fetchBranches()
  }, [])

  useEffect(() => {
    if (isOfflineOrderModalOpen || (isCompleteWorkModalOpen && completeWorkStep === 'order-details')) {
      fetchPackages()
      fetchProducts()
      fetchExtraWorks()
    }
  }, [isOfflineOrderModalOpen, isCompleteWorkModalOpen, completeWorkStep])

  const fetchPackages = async () => {
    try {
      const data = await packagesApi.getAll()
      setPackages(data.filter(pkg => pkg.status === 'active'))
    } catch (err: any) {
      console.error('Error fetching packages:', err)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getAll(1, 1000)
      const products = Array.isArray(response.items) ? response.items : []
      setAllProducts(products.filter(p => p.status === 'active'))
    } catch (err: any) {
      console.error('Error fetching products:', err)
      setAllProducts([])
    }
  }

  const fetchExtraWorks = async () => {
    try {
      const data = await extraWorksApi.getAll()
      setAllExtraWorks(data.filter(ew => ew.status === 'active'))
    } catch (err: any) {
      console.error('Error fetching extra works:', err)
    }
  }

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

  const fetchBranches = async () => {
    try {
      const data = await branchesApi.getAll()
      setBranches(data)
    } catch (err: any) {
      console.error('Error fetching branches:', err)
    }
  }

  // Get branch name by ID
  const getBranchName = (branchId?: string): string => {
    if (!branchId) return '-'
    const branch = branches.find(b => b.id === branchId)
    return branch?.name || '-'
  }

  // Filter orders by branch, order type, and status
  const filteredOrders = useMemo(() => {
    let filtered = orders

    // Filter by branch if user has admin_branch restriction
    if (adminBranchId && !isDeveloper()) {
      filtered = filtered.filter((order) => order.branchId === adminBranchId)
    }

    // Filter by order type
    if (orderTypeFilter !== 'all') {
      filtered = filtered.filter((order) => {
        const hasServices = order.services.length > 0 || order.extraWorks.length > 0
        const hasProducts = order.products.length > 0

        if (orderTypeFilter === 'service') {
          return hasServices
        } else if (orderTypeFilter === 'product') {
          return hasProducts && !hasServices
        }
        return true
      })
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    return filtered
  }, [orders, adminBranchId, isDeveloper, orderTypeFilter, statusFilter])

  const handleViewDetails = async (order: Order) => {
    try {
      // Backend now enriches order with branch-specific prices
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

      // Reduce stock for each product in this order (branch-wise)
      if (completedOrder.products && completedOrder.products.length > 0 && completedOrder.branchId) {
        const branchIdNum = parseInt(completedOrder.branchId)
        for (const item of completedOrder.products) {
          try {
            const product = await productsApi.getById(item.productId)
            // Find stock entry for this branch
            if (product.stockEntries && product.stockEntries.length > 0) {
              const branchStock = product.stockEntries.find(
                (entry) => entry.branch_id === branchIdNum
              )
              if (branchStock && branchStock.id) {
                const newStock = Math.max(0, branchStock.stock - item.quantity)
                await productsApi.updateProductStock(product.id, branchStock.id, newStock)
              }
            } else if (product.stock !== undefined) {
              // Fallback to old stock system
              const newStock = Math.max(0, (product.stock || 0) - item.quantity)
              await productsApi.update(product.id, { stock: newStock } as any)
            }
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
    setCompleteWorkStep('inspection')
    setCompleteWorkOrderDetails({
      branch_id: '',
      vehicle_type: '',
      services: [],
      products: [],
      extra_works: [],
      total_amount: order.totalAmount,
    })
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

  const handleCompleteWorkNext = async () => {
    // Validate inspections if they exist
    if (startWorkInspections.length > 0) {
      const confirmations: Array<{ start_inspection_id: number; verified: boolean; notes: string | null; image: string }> = []

      Object.entries(completeWorkConfirmations).forEach(([inspectionIdStr, confirmation]) => {
        const inspectionId = Number(inspectionIdStr)
        if (confirmation.image) {
          confirmations.push({
            start_inspection_id: inspectionId,
            verified: confirmation.verified,
            notes: confirmation.notes || null,
            image: '',
          })
        }
      })

      // Only require confirmation images if there are inspections
      if (confirmations.length === 0) {
        setError('Please upload at least one confirmation image')
        return
      }
    }

    setError(null)

    // Fetch full backend order to get package_ids and all details
    if (orderForCompleteWork) {
      try {
        const response = await axiosInstance.get(`/orders/${orderForCompleteWork.id}`)
        const backendOrder = response.data.data || response.data

        if (backendOrder.service_details && backendOrder.service_details.length > 0) {
          const firstService = backendOrder.service_details[0]
          const vehicleType = firstService.vehicle_type || 'Sedan'

          setCompleteWorkOrderDetails({
            branch_id: String(backendOrder.branch_id || orderForCompleteWork.branchId || ''),
            vehicle_type: vehicleType,
            services: backendOrder.service_details.map((sd: any) => ({
              package_id: sd.package_id,
              vehicle_type: sd.vehicle_type || vehicleType,
              vehicle_number: sd.vehicle_number || '',
              arrival_date: sd.arrival_date || '',
              arrival_time: sd.arrival_time || '',
            })),
            products: (backendOrder.product_details || []).map((pd: any) => ({
              product_id: pd.product_id,
              quantity: pd.quantity,
            })),
            extra_works: (backendOrder.extra_work_details || []).map((ew: any) => ({
              extra_works_id: ew.extra_works_id,
            })),
            total_amount: orderForCompleteWork.totalAmount,
          })
        } else {
          // Fallback to frontend order structure
          const vehicleType = orderForCompleteWork.vehicleType || 'Sedan'
          setCompleteWorkOrderDetails({
            branch_id: orderForCompleteWork.branchId || '',
            vehicle_type: vehicleType,
            services: [],
            products: orderForCompleteWork.products.map(p => ({
              product_id: Number(p.productId),
              quantity: p.quantity,
            })),
            extra_works: orderForCompleteWork.extraWorks.map(ew => ({
              extra_works_id: Number(ew.id),
            })),
            total_amount: orderForCompleteWork.totalAmount,
          })
        }
      } catch (err) {
        console.error('Error fetching order details:', err)
        // Fallback to frontend order structure
        const vehicleType = orderForCompleteWork.vehicleType || 'Sedan'
        setCompleteWorkOrderDetails({
          branch_id: orderForCompleteWork.branchId || '',
          vehicle_type: vehicleType,
          services: [],
          products: orderForCompleteWork.products.map(p => ({
            product_id: Number(p.productId),
            quantity: p.quantity,
          })),
          extra_works: orderForCompleteWork.extraWorks.map(ew => ({
            extra_works_id: Number(ew.id),
          })),
          total_amount: orderForCompleteWork.totalAmount,
        })
      }
    }

    setCompleteWorkStep('order-details')
  }

  const handleCompleteWorkSubmit = async () => {
    if (!orderForCompleteWork) return

    try {
      setIsCompletingWork(true)
      setError(null)

      // First, update the order with all details (services, products, extra_works, total_amount)
      try {
        const now = new Date()
        const arrivalDate = now.toISOString().split('T')[0] // YYYY-MM-DD format
        const arrivalTime = now.toTimeString().split(' ')[0] // HH:MM:SS format

        // Ensure we have branch_id - use from order if not set
        const branchIdToSend = completeWorkOrderDetails.branch_id || orderForCompleteWork.branchId
        if (!branchIdToSend) {
          throw new Error('Branch ID is required to update order')
        }

        await ordersApi.updateOrder(orderForCompleteWork.id, {
          branch_id: Number(branchIdToSend),
          services: completeWorkOrderDetails.services.map(s => ({
            package_id: s.package_id,
            vehicle_type: s.vehicle_type,
            vehicle_number: s.vehicle_number || null,
            arrival_date: s.arrival_date || arrivalDate,
            arrival_time: s.arrival_time || arrivalTime,
          })),
          products: completeWorkOrderDetails.products,
          extra_works: completeWorkOrderDetails.extra_works,
          total_amount: completeWorkOrderDetails.total_amount,
        })
      } catch (updateErr: any) {
        console.error('Error updating order:', updateErr)
        setError(updateErr.response?.data?.message || 'Failed to update order')
        setIsCompletingWork(false)
        return
      }

      // Build confirmations array (only if inspections exist)
      const confirmations: Array<{ start_inspection_id: number; verified: boolean; notes: string | null; image: string }> = []
      const images: File[] = []

      if (startWorkInspections.length > 0) {
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
      }
      // If no inspections exist, allow completing without confirmations

      await ordersApi.completeWork(orderForCompleteWork.id, confirmations, images)

      // Refresh orders list
      await fetchOrders()
      setIsCompleteWorkModalOpen(false)
      setOrderForCompleteWork(null)
      setCompleteWorkConfirmations({})
      setStartWorkInspections([])
      setCompleteWorkStep('inspection')
      setCompleteWorkOrderDetails({
        branch_id: '',
        vehicle_type: '',
        services: [],
        products: [],
        extra_works: [],
        total_amount: 0,
      })
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

      // Allow proceeding even if no items are selected
      // items array can be empty
      const response = await ordersApi.startWork(orderForStartWork.id, items, images)

      // Store inspection data if returned in response (may be empty array)
      // The response should contain inspection IDs that were created
      if (response.data?.inspections || response.data?.items || response.data?.work_start_inspections) {
        const inspections = response.data.inspections || response.data.items || response.data.work_start_inspections || []
        // Map the items we submitted to inspection format
        const inspectionData = inspections.map((insp: any, index: number) => ({
          id: insp.id || insp.start_inspection_id || index + 1,
          name: insp.name || items[index]?.name || `Item ${index + 1}`,
          notes: insp.notes || items[index]?.notes || null,
          image_url: insp.image_url || insp.photo_url || null,
        }))
        setStartWorkInspections(inspectionData)
      } else if (items.length > 0) {
        // If no inspection data in response, create from submitted items (only if items exist)
        const inspectionData = items.map((item, index) => ({
          id: index + 1, // Temporary ID, should come from backend
          name: item.name,
          notes: item.notes,
          image_url: undefined,
        }))
        setStartWorkInspections(inspectionData)
      } else {
        // No items selected, set empty array
        setStartWorkInspections([])
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

  // Filter packages to show only those available for selected branch and vehicle type
  const availablePackages = useMemo(() => {
    if (!offlineOrderForm.branch_id || !offlineOrderForm.vehicle_type) {
      return []
    }

    return packages.filter(pkg => {
      // Check if package has an active price for the selected branch and vehicle type
      return pkg.branchPrices.some(
        bp => bp.branchId === offlineOrderForm.branch_id &&
          bp.vehicleType === offlineOrderForm.vehicle_type &&
          bp.isActive
      )
    })
  }, [packages, offlineOrderForm.branch_id, offlineOrderForm.vehicle_type])

  // Group packages by service type
  const packagesByServiceType = useMemo(() => {
    const grouped: Record<string, typeof availablePackages> = {}
    availablePackages.forEach(pkg => {
      const serviceTypeName = pkg.serviceTypeName || 'Other'
      if (!grouped[serviceTypeName]) {
        grouped[serviceTypeName] = []
      }
      grouped[serviceTypeName].push(pkg)
    })
    return grouped
  }, [availablePackages])

  // Calculate total amount for complete work order details
  const calculateCompleteWorkOrderTotal = useMemo(() => {
    let total = 0

    // Calculate package prices
    if (completeWorkOrderDetails.branch_id && completeWorkOrderDetails.vehicle_type && packages.length > 0) {
      completeWorkOrderDetails.services.forEach(service => {
        const pkg = packages.find(p => Number(p.id) === service.package_id)
        if (pkg) {
          const price = pkg.branchPrices.find(
            bp => bp.branchId === completeWorkOrderDetails.branch_id &&
              bp.vehicleType === completeWorkOrderDetails.vehicle_type &&
              bp.isActive
          )
          if (price) {
            total += price.price
          }
        }
      })
    }

    // Calculate products
    completeWorkOrderDetails.products.forEach(selectedProd => {
      const product = allProducts.find(p => Number(p.id) === selectedProd.product_id)
      if (product) {
        total += product.price * selectedProd.quantity
      }
    })

    // Calculate extra works
    completeWorkOrderDetails.extra_works.forEach(selectedEW => {
      const extraWork = allExtraWorks.find(ew => Number(ew.id) === selectedEW.extra_works_id)
      if (extraWork) {
        total += (extraWork.price ?? 0)
      }
    })

    return total
  }, [completeWorkOrderDetails, packages, allProducts, allExtraWorks])

  // Update total amount when calculation changes
  useEffect(() => {
    if (completeWorkStep === 'order-details') {
      setCompleteWorkOrderDetails(prev => ({ ...prev, total_amount: calculateCompleteWorkOrderTotal }))
    }
  }, [calculateCompleteWorkOrderTotal, completeWorkStep])

  // Calculate total amount for offline order
  const calculateOfflineOrderTotal = useMemo(() => {
    let total = 0

    // Calculate package prices based on selected branch and vehicle type
    if (offlineOrderForm.branch_id && offlineOrderForm.vehicle_type && packages.length > 0) {
      offlineOrderForm.selectedPackages.forEach(selectedPkg => {
        const pkg = packages.find(p => Number(p.id) === selectedPkg.package_id)
        if (pkg) {
          const price = pkg.branchPrices.find(
            bp => bp.branchId === offlineOrderForm.branch_id && bp.vehicleType === offlineOrderForm.vehicle_type && bp.isActive
          )
          if (price) {
            total += price.price
          }
        }
      })
    }

    // Calculate products
    offlineOrderForm.selectedProducts.forEach(selectedProd => {
      const product = allProducts.find(p => Number(p.id) === selectedProd.product_id)
      if (product) {
        total += product.price * selectedProd.quantity
      }
    })

    // Calculate extra works
    offlineOrderForm.selectedExtraWorks.forEach(selectedEW => {
      const extraWork = allExtraWorks.find(ew => Number(ew.id) === selectedEW.extra_works_id)
      if (extraWork) {
        total += (extraWork.price ?? 0)
      }
    })

    return total
  }, [offlineOrderForm, packages, allProducts, allExtraWorks])

  // Update total amount when calculation changes
  useEffect(() => {
    setOfflineOrderForm(prev => ({ ...prev, total_amount: calculateOfflineOrderTotal }))
  }, [calculateOfflineOrderTotal])

  const handleOpenOfflineOrderModal = () => {
    // Set default branch and vehicle type so packages show immediately
    const defaultBranchId = adminBranchId || (branches.length > 0 ? branches[0].id : '')
    const defaultVehicleType = VEHICLE_TYPES[0] || 'Sedan'

    setOfflineOrderForm({
      user_full_name: '',
      user_email_address: '',
      user_phone_number: '',
      branch_id: defaultBranchId,
      vehicle_type: defaultVehicleType,
      vehicle_number: '',
      selectedPackages: [],
      selectedProducts: [],
      selectedExtraWorks: [],
      total_amount: 0,
    })
    setIsOfflineOrderModalOpen(true)
  }

  const handleCloseOfflineOrderModal = () => {
    setIsOfflineOrderModalOpen(false)
    setError(null)
  }

  const handleOfflineOrderSubmit = async () => {
    try {
      // Customer details (name, email, phone) are optional for offline orders
      if (!offlineOrderForm.branch_id) {
        setError('Please select a branch')
        return
      }
      if (!offlineOrderForm.vehicle_type) {
        setError('Please select a vehicle type')
        return
      }
      if (offlineOrderForm.selectedPackages.length === 0 && offlineOrderForm.selectedProducts.length === 0 && offlineOrderForm.selectedExtraWorks.length === 0) {
        setError('Please select at least one package, product, or extra work')
        return
      }

      // Validate that vehicle number (Rego Number) is provided when packages are selected
      if (offlineOrderForm.selectedPackages.length > 0) {
        if (!offlineOrderForm.vehicle_number || offlineOrderForm.vehicle_number.trim() === '') {
          setError('Please enter Rego Number')
          return
        }
      }

      setIsSavingOfflineOrder(true)
      setError(null)

      const createdOrder = await ordersApi.saveOfflineOrder({
        user_full_name: offlineOrderForm.user_full_name || '',
        user_email_address: offlineOrderForm.user_email_address || '',
        user_phone_number: offlineOrderForm.user_phone_number || '',
        branch_id: Number(offlineOrderForm.branch_id),
        services: offlineOrderForm.selectedPackages.map(pkg => {
          const now = new Date()
          const arrivalDate = now.toISOString().split('T')[0] // YYYY-MM-DD format
          const arrivalTime = now.toTimeString().split(' ')[0] // HH:MM:SS format

          return {
            package_id: pkg.package_id,
            vehicle_type: pkg.vehicle_type,
            vehicle_number: offlineOrderForm.vehicle_number || null,
            arrival_date: arrivalDate,
            arrival_time: arrivalTime,
          }
        }),
        products: offlineOrderForm.selectedProducts,
        extra_works: offlineOrderForm.selectedExtraWorks.map(ew => ({
          extra_works_id: ew.extra_works_id,
        })),
        total_amount: offlineOrderForm.total_amount,
      })

      await fetchOrders()
      handleCloseOfflineOrderModal()

      // Open start work inspection modal for the newly created offline order
      setOrderForStartWork(createdOrder)
      setSelectedItems({})
      setIsStartWorkModalOpen(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save offline order')
      console.error('Error saving offline order:', err)
    } finally {
      setIsSavingOfflineOrder(false)
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Orders</h1>
          <p className="text-gray-600">View and manage all customer orders</p>
        </div>
        <Button onClick={handleOpenOfflineOrderModal} variant="primary">
          Add Offline Order
        </Button>
      </div>

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="glass-dark rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Order Type"
            value={orderTypeFilter}
            onChange={(e) => setOrderTypeFilter(e.target.value as 'all' | 'service' | 'product')}
            options={[
              { value: 'all', label: 'All Orders' },
              { value: 'service', label: 'Service Orders' },
              { value: 'product', label: 'Product Orders' },
            ]}
          />
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'in-progress' | 'completed')}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
            ]}
          />
        </div>
      </div>

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
            <TableHeaderCell>Branch</TableHeaderCell>
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
                  <span className="text-sm font-medium text-gray-700">
                    {getBranchName(order.branchId)}
                  </span>
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
                    {order.status === 'pending' && (() => {
                      // Check if order has only products (no services and no extra works)
                      const hasOnlyProducts = order.products.length > 0 &&
                        order.services.length === 0 &&
                        order.extraWorks.length === 0

                      if (hasOnlyProducts) {
                        // For product-only orders, allow direct completion
                        return (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleCompleteOrderClick(order.id)}
                            title="Complete this order (products only - no inspection required)"
                            className="bg-green-600 hover:bg-green-700 min-w-[130px]"
                            disabled={isCompletingOrder && orderBeingCompleted === order.id}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {isCompletingOrder && orderBeingCompleted === order.id ? 'Completing...' : 'Complete Order'}
                          </Button>
                        )
                      } else {
                        // For orders with services, require start work flow
                        return (
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
                        )
                      }
                    })()}
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
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted
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
                          className={`h-1 flex-1 mx-2 ${index < currentIndex ? 'bg-primary-600' : 'bg-gray-200'
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
                    <TableHeaderCell>Arrival Date</TableHeaderCell>
                    <TableHeaderCell>Arrival Time</TableHeaderCell>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>{service.serviceName}</TableCell>
                        <TableCell className="font-semibold">${service.price}</TableCell>
                        <TableCell>
                          {service.arrivalDate
                            ? format(new Date(service.arrivalDate), 'MMM dd, yyyy')
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          {service.arrivalTime
                            ? service.arrivalTime.substring(0, 5)
                            : 'N/A'
                          }
                        </TableCell>
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
          setCompleteWorkStep('inspection')
          setCompleteWorkOrderDetails({
            branch_id: '',
            vehicle_type: '',
            services: [],
            products: [],
            extra_works: [],
            total_amount: 0,
          })
        }}
        title={`Complete Work - Order #${orderForCompleteWork?.id}`}
        size="xl"
      >
        <div className="space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className={`flex items-center ${completeWorkStep === 'inspection' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${completeWorkStep === 'inspection' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Inspection</span>
            </div>
            <div className="w-12 h-1 bg-gray-200"></div>
            <div className={`flex items-center ${completeWorkStep === 'order-details' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${completeWorkStep === 'order-details' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Order Details</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {completeWorkStep === 'inspection' && (
            <>
              {startWorkInspections.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No inspection items found. You can proceed to order details.</p>
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
            </>
          )}

          {completeWorkStep === 'order-details' && orderForCompleteWork && (
            <div className="space-y-6">
              {/* Customer Info (Read-only) */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                    <p className="font-medium">{orderForCompleteWork.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Customer Email</p>
                    <p className="font-medium">{orderForCompleteWork.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Customer Phone</p>
                    <p className="font-medium">{orderForCompleteWork.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order Date</p>
                    <p className="font-medium">{format(new Date(orderForCompleteWork.orderDate), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                </div>
              </Card>

              {/* Branch and Vehicle Type */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Select
                      label="Branch"
                      value={completeWorkOrderDetails.branch_id}
                      onChange={(e) => setCompleteWorkOrderDetails(prev => ({ ...prev, branch_id: e.target.value, services: [] }))}
                      options={branches.filter(b => !adminBranchId || b.id === adminBranchId).map(branch => ({
                        value: branch.id,
                        label: branch.name,
                      }))}
                      required
                      disabled={!!adminBranchId}
                      className={adminBranchId ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}
                    />
                  </div>
                  <Select
                    label="Vehicle Type"
                    value={completeWorkOrderDetails.vehicle_type}
                    onChange={(e) => setCompleteWorkOrderDetails(prev => ({ ...prev, vehicle_type: e.target.value, services: [] }))}
                    options={VEHICLE_TYPES.map(vt => ({ value: vt, label: vt }))}
                    required
                  />
                </div>
              </Card>

              {/* Packages Selection */}
              {completeWorkOrderDetails.branch_id && completeWorkOrderDetails.vehicle_type && (
                <Card>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Packages</h3>
                  <div className="space-y-4">
                    {(() => {
                      // Filter packages for selected branch and vehicle type
                      const availablePkgs = packages.filter(pkg =>
                        pkg.branchPrices.some(
                          bp => bp.branchId === completeWorkOrderDetails.branch_id &&
                            bp.vehicleType === completeWorkOrderDetails.vehicle_type &&
                            bp.isActive
                        )
                      )

                      // Group by service type
                      const grouped: Record<string, typeof availablePkgs> = {}
                      availablePkgs.forEach(pkg => {
                        const serviceTypeName = pkg.serviceTypeName || 'Other'
                        if (!grouped[serviceTypeName]) {
                          grouped[serviceTypeName] = []
                        }
                        grouped[serviceTypeName].push(pkg)
                      })

                      if (Object.keys(grouped).length === 0) {
                        return <p className="text-gray-500 text-center py-4">No packages available</p>
                      }

                      return Object.entries(grouped).map(([serviceTypeName, servicePackages]) => {
                        const selectedPkg = completeWorkOrderDetails.services.find(s => {
                          const pkg = packages.find(p => Number(p.id) === s.package_id)
                          return pkg?.serviceTypeName === serviceTypeName
                        })

                        return (
                          <div key={serviceTypeName} className="space-y-2">
                            <h4 className="text-md font-semibold text-gray-700 px-2">{serviceTypeName}</h4>
                            <div className="space-y-2 border-2 border-gray-200 rounded-xl p-4 bg-white">
                              {servicePackages.map((pkg) => {
                                const price = pkg.branchPrices.find(
                                  bp => bp.branchId === completeWorkOrderDetails.branch_id &&
                                    bp.vehicleType === completeWorkOrderDetails.vehicle_type &&
                                    bp.isActive
                                )
                                const isSelected = selectedPkg?.package_id === Number(pkg.id)

                                return (
                                  <div key={pkg.id} className="space-y-2">
                                    <div
                                      className={`flex items-center justify-between border-2 rounded-lg p-3 transition-all cursor-pointer ${isSelected
                                          ? 'border-blue-500 bg-blue-50 shadow-md'
                                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                      onClick={() => {
                                        if (isSelected) {
                                          setCompleteWorkOrderDetails(prev => ({
                                            ...prev,
                                            services: prev.services.filter(s => s.package_id !== Number(pkg.id)),
                                          }))
                                        } else {
                                          setCompleteWorkOrderDetails(prev => {
                                            const otherServices = prev.services.filter(s => {
                                              const otherPkg = packages.find(p => Number(p.id) === s.package_id)
                                              return otherPkg?.serviceTypeName !== serviceTypeName
                                            })
                                            // Preserve vehicle_number from existing services if any
                                            const existingVehicleNumber = prev.services.length > 0 ? prev.services[0].vehicle_number || '' : ''
                                            return {
                                              ...prev,
                                              services: [
                                                ...otherServices,
                                                {
                                                  package_id: Number(pkg.id),
                                                  vehicle_type: prev.vehicle_type,
                                                  vehicle_number: existingVehicleNumber
                                                }
                                              ],
                                            }
                                          })
                                        }
                                      }}
                                    >
                                      <div className="flex items-center space-x-3 flex-1">
                                        <input
                                          type="radio"
                                          checked={isSelected}
                                          onChange={() => { }}
                                          className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="font-semibold text-gray-800">{pkg.name}</span>
                                      </div>
                                      {price && (
                                        <span className="text-lg font-bold text-blue-600 ml-3">
                                          ${price.price.toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>

                  {/* Rego Number Input - Show once when at least one package is selected */}
                  {completeWorkOrderDetails.services.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <Input
                        label="Rego Number *"
                        value={completeWorkOrderDetails.services[0]?.vehicle_number || ''}
                        onChange={(e) => {
                          const vehicleNumber = e.target.value
                          setCompleteWorkOrderDetails(prev => ({
                            ...prev,
                            services: prev.services.map(s => ({
                              ...s,
                              vehicle_number: vehicleNumber
                            })),
                          }))
                        }}
                        placeholder="Enter vehicle registration number"
                        className="w-full"
                        required
                      />
                    </div>
                  )}
                </Card>
              )}

              {/* Products Selection */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Products</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {allProducts.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No products available</p>
                  ) : (
                    allProducts.map((product) => {
                      const selectedProduct = completeWorkOrderDetails.products.find(p => p.product_id === Number(product.id))
                      const quantity = selectedProduct?.quantity || 0

                      return (
                        <div key={product.id} className="flex items-center justify-between border rounded-lg p-3">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{product.name}</p>
                            <p className="text-sm text-gray-600">${(product.price ?? 0).toFixed(2)} each</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              type="button"
                              onClick={() => {
                                if (quantity === 0) {
                                  setCompleteWorkOrderDetails(prev => ({
                                    ...prev,
                                    products: [...prev.products, { product_id: Number(product.id), quantity: 1 }],
                                  }))
                                } else {
                                  setCompleteWorkOrderDetails(prev => ({
                                    ...prev,
                                    products: prev.products.map(p =>
                                      p.product_id === Number(product.id)
                                        ? { ...p, quantity: p.quantity - 1 }
                                        : p
                                    ).filter(p => p.quantity > 0),
                                  }))
                                }
                              }}
                              className="px-3 py-1.5 border-2 rounded-lg font-semibold disabled:opacity-50"
                              disabled={quantity === 0}
                            >
                              −
                            </button>
                            <span className="w-10 text-center font-bold">{quantity}</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (quantity === 0) {
                                  setCompleteWorkOrderDetails(prev => ({
                                    ...prev,
                                    products: [...prev.products, { product_id: Number(product.id), quantity: 1 }],
                                  }))
                                } else {
                                  setCompleteWorkOrderDetails(prev => ({
                                    ...prev,
                                    products: prev.products.map(p =>
                                      p.product_id === Number(product.id)
                                        ? { ...p, quantity: p.quantity + 1 }
                                        : p
                                    ),
                                  }))
                                }
                              }}
                              className="px-3 py-1.5 border-2 border-blue-500 text-blue-700 rounded-lg font-semibold hover:bg-blue-50"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </Card>

              {/* Extra Works Selection */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Extra Works</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allExtraWorks.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No extra works available</p>
                  ) : (
                    allExtraWorks.map((extraWork) => {
                      const isSelected = completeWorkOrderDetails.extra_works.some(ew => ew.extra_works_id === Number(extraWork.id))

                      return (
                        <div
                          key={extraWork.id}
                          className={`flex items-center justify-between border-2 rounded-lg p-3 cursor-pointer transition-all ${isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                            }`}
                          onClick={() => {
                            if (isSelected) {
                              setCompleteWorkOrderDetails(prev => ({
                                ...prev,
                                extra_works: prev.extra_works.filter(ew => ew.extra_works_id !== Number(extraWork.id)),
                              }))
                            } else {
                              setCompleteWorkOrderDetails(prev => ({
                                ...prev,
                                extra_works: [...prev.extra_works, { extra_works_id: Number(extraWork.id) }],
                              }))
                            }
                          }}
                        >
                          <div>
                            <p className="font-medium text-gray-800">{extraWork.name}</p>
                            {extraWork.description && (
                              <p className="text-sm text-gray-600">{extraWork.description}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-blue-600">${(extraWork.price ?? 0).toFixed(2)}</span>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => { }}
                              className="w-4 h-4 text-blue-600"
                            />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </Card>

              {/* Total Amount */}
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-lg font-bold text-gray-800 block mb-1">Total Amount</label>
                    <p className="text-sm text-gray-600">
                      Calculated automatically. You can adjust if needed.
                    </p>
                  </div>
                  <div className="w-48">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={completeWorkOrderDetails.total_amount.toString()}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        setCompleteWorkOrderDetails(prev => ({ ...prev, total_amount: value }))
                      }}
                      className="text-lg font-bold"
                      required
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => {
                if (completeWorkStep === 'order-details') {
                  setCompleteWorkStep('inspection')
                } else {
                  setIsCompleteWorkModalOpen(false)
                  setOrderForCompleteWork(null)
                  setCompleteWorkConfirmations({})
                  setStartWorkInspections([])
                  setCompleteWorkStep('inspection')
                  setCompleteWorkOrderDetails({
                    branch_id: '',
                    vehicle_type: '',
                    services: [],
                    products: [],
                    extra_works: [],
                    total_amount: 0,
                  })
                }
              }}
              disabled={isCompletingWork}
            >
              {completeWorkStep === 'order-details' ? 'Back' : 'Cancel'}
            </Button>
            {completeWorkStep === 'inspection' ? (
              <Button onClick={handleCompleteWorkNext} disabled={isCompletingWork}>
                Next
              </Button>
            ) : (
              <Button onClick={handleCompleteWorkSubmit} disabled={isCompletingWork}>
                {isCompletingWork ? 'Completing...' : 'Complete Work'}
              </Button>
            )}
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

      {/* Add Offline Order Modal */}
      <Modal
        isOpen={isOfflineOrderModalOpen}
        onClose={handleCloseOfflineOrderModal}
        title="Add Offline Order"
        size="2xl"
      >
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Customer Details Section */}
          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Full Name (Optional)"
                value={offlineOrderForm.user_full_name}
                onChange={(e) => setOfflineOrderForm(prev => ({ ...prev, user_full_name: e.target.value }))}
                placeholder="Enter customer name"
                className="w-full"
              />
              <Input
                label="Email Address (Optional)"
                type="email"
                value={offlineOrderForm.user_email_address}
                onChange={(e) => setOfflineOrderForm(prev => ({ ...prev, user_email_address: e.target.value }))}
                placeholder="Enter email address"
                className="w-full"
              />
              <Input
                label="Phone Number (Optional)"
                value={offlineOrderForm.user_phone_number}
                onChange={(e) => setOfflineOrderForm(prev => ({ ...prev, user_phone_number: e.target.value }))}
                placeholder="Enter phone number"
                className="w-full"
              />
            </div>
          </div>

          {/* Branch and Vehicle Type Section */}
          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Order Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  label="Branch"
                  value={offlineOrderForm.branch_id}
                  onChange={(e) => setOfflineOrderForm(prev => ({ ...prev, branch_id: e.target.value, selectedPackages: [] }))}
                  options={branches.filter(b => !adminBranchId || b.id === adminBranchId).map(branch => ({
                    value: branch.id,
                    label: branch.name,
                  }))}
                  required
                  disabled={!!adminBranchId}
                  className={adminBranchId ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}
                />
                {adminBranchId && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center">
                    <span className="mr-1">🔒</span>
                    Branch is locked to your assigned branch
                  </p>
                )}
              </div>
              <Select
                label="Vehicle Type"
                value={offlineOrderForm.vehicle_type}
                onChange={(e) => setOfflineOrderForm(prev => ({ ...prev, vehicle_type: e.target.value, selectedPackages: [] }))}
                options={VEHICLE_TYPES.map(vt => ({ value: vt, label: vt }))}
                required
              />
            </div>
          </div>

          {/* Packages Selection - Grouped by Service Type */}
          {offlineOrderForm.branch_id && offlineOrderForm.vehicle_type && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-2">
                  Packages
                </span>
                {offlineOrderForm.selectedPackages.length > 0 && (
                  <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {offlineOrderForm.selectedPackages.length}
                  </span>
                )}
              </h3>

              <div className="space-y-4">
                {Object.keys(packagesByServiceType).length === 0 ? (
                  <div className="border-2 border-gray-200 rounded-xl p-4 bg-white">
                    <p className="text-gray-500 text-center py-4">No packages available for selected branch and vehicle type</p>
                  </div>
                ) : (
                  Object.entries(packagesByServiceType).map(([serviceTypeName, servicePackages]) => {
                    // Get currently selected package for this service type
                    const selectedPackageForServiceType = offlineOrderForm.selectedPackages.find(sp => {
                      const pkg = packages.find(p => Number(p.id) === sp.package_id)
                      return pkg?.serviceTypeName === serviceTypeName
                    })

                    return (
                      <div key={serviceTypeName} className="space-y-2">
                        <h4 className="text-md font-semibold text-gray-700 px-2">{serviceTypeName}</h4>
                        <div className="space-y-2 border-2 border-gray-200 rounded-xl p-4 bg-white">
                          {servicePackages.map((pkg) => {
                            const price = pkg.branchPrices.find(
                              bp => bp.branchId === offlineOrderForm.branch_id &&
                                bp.vehicleType === offlineOrderForm.vehicle_type &&
                                bp.isActive
                            )
                            const isSelected = selectedPackageForServiceType?.package_id === Number(pkg.id)

                            return (
                              <div key={pkg.id} className="space-y-2">
                                <div
                                  className={`flex items-center justify-between border-2 rounded-lg p-3 transition-all cursor-pointer ${isSelected
                                      ? 'border-blue-500 bg-blue-50 shadow-md'
                                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                  onClick={() => {
                                    if (isSelected) {
                                      // Deselect: remove this package
                                      setOfflineOrderForm(prev => ({
                                        ...prev,
                                        selectedPackages: prev.selectedPackages.filter(sp => sp.package_id !== Number(pkg.id)),
                                      }))
                                    } else {
                                      // Select: remove any other package from this service type, then add this one
                                      setOfflineOrderForm(prev => {
                                        const otherServiceTypePackages = prev.selectedPackages.filter(sp => {
                                          const otherPkg = packages.find(p => Number(p.id) === sp.package_id)
                                          return otherPkg?.serviceTypeName !== serviceTypeName
                                        })
                                        return {
                                          ...prev,
                                          selectedPackages: [
                                            ...otherServiceTypePackages,
                                            { package_id: Number(pkg.id), vehicle_type: prev.vehicle_type }
                                          ],
                                        }
                                      })
                                    }
                                  }}
                                >
                                  <div className="flex items-center space-x-3 flex-1">
                                    <input
                                      type="radio"
                                      name={`package-${serviceTypeName}`}
                                      checked={isSelected}
                                      onChange={() => { }}
                                      className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <span className="font-semibold text-gray-800">{pkg.name}</span>
                                  </div>
                                  {price && (
                                    <span className="text-lg font-bold text-blue-600 ml-3">
                                      ${price.price.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Rego Number Input - Show once when any package is selected */}
              {offlineOrderForm.selectedPackages.length > 0 && (
                <div className="mt-4">
                  <Input
                    label="Rego Number *"
                    value={offlineOrderForm.vehicle_number}
                    onChange={(e) => {
                      setOfflineOrderForm(prev => ({
                        ...prev,
                        vehicle_number: e.target.value,
                      }))
                    }}
                    placeholder="Enter vehicle registration number"
                    className="w-full"
                    required
                  />
                </div>
              )}
            </div>
          )}

          {/* Extra Works Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mr-2">
                Extra Works
              </span>
              {offlineOrderForm.selectedExtraWorks.length > 0 && (
                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {offlineOrderForm.selectedExtraWorks.length}
                </span>
              )}
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto border-2 border-gray-200 rounded-xl p-4 bg-white">
              {allExtraWorks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No extra works available</p>
              ) : (
                allExtraWorks.map((extraWork) => {
                  const isSelected = offlineOrderForm.selectedExtraWorks.some(sew => sew.extra_works_id === Number(extraWork.id))

                  return (
                    <div
                      key={extraWork.id}
                      className={`flex items-center justify-between border-2 rounded-lg p-3 transition-all cursor-pointer ${isSelected
                          ? 'border-green-500 bg-green-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      onClick={() => {
                        if (isSelected) {
                          setOfflineOrderForm(prev => ({
                            ...prev,
                            selectedExtraWorks: prev.selectedExtraWorks.filter(sew => sew.extra_works_id !== Number(extraWork.id)),
                          }))
                        } else {
                          setOfflineOrderForm(prev => ({
                            ...prev,
                            selectedExtraWorks: [...prev.selectedExtraWorks, { extra_works_id: Number(extraWork.id) }],
                          }))
                        }
                      }}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => { }}
                          className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="font-semibold text-gray-800">{extraWork.name}</span>
                      </div>
                      <span className="text-lg font-bold text-green-600 ml-3">
                        ${(extraWork.price ?? 0).toFixed(2)}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Products Selection - Full Width */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium mr-2">
                Products
              </span>
              {offlineOrderForm.selectedProducts.length > 0 && (
                <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {offlineOrderForm.selectedProducts.reduce((sum, p) => sum + p.quantity, 0)} items
                </span>
              )}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl p-4 bg-white">
              {allProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-4 col-span-2">No products available</p>
              ) : (
                allProducts.map((product) => {
                  const selectedProduct = offlineOrderForm.selectedProducts.find(sp => sp.product_id === Number(product.id))
                  const quantity = selectedProduct?.quantity || 0

                  // Get stock for the selected branch
                  const branchStock = offlineOrderForm.branch_id && product.stockEntries
                    ? product.stockEntries.find(se => se.branch_id === Number(offlineOrderForm.branch_id))
                    : null
                  const stock = branchStock?.stock ?? 0

                  return (
                    <div
                      key={product.id}
                      className={`flex items-center justify-between border-2 rounded-lg p-3 transition-all ${quantity > 0
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-gray-800 truncate">{product.name}</span>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="text-gray-500">${(product.price ?? 0).toFixed(2)}</span>
                            {offlineOrderForm.branch_id && (
                              <span className={`font-medium ${stock === 0 ? 'text-red-600' : stock <= 5 ? 'text-orange-600' : 'text-gray-600'}`}>
                                Stock: {stock}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (quantity > 0) {
                              setOfflineOrderForm(prev => ({
                                ...prev,
                                selectedProducts: prev.selectedProducts.map(sp =>
                                  sp.product_id === Number(product.id)
                                    ? { ...sp, quantity: sp.quantity - 1 }
                                    : sp
                                ).filter(sp => sp.quantity > 0),
                              }))
                            }
                          }}
                          className={`px-3 py-1.5 border-2 rounded-lg font-semibold transition-all ${quantity > 0
                              ? 'border-purple-500 text-purple-700 hover:bg-purple-100 active:scale-95'
                              : 'border-gray-300 text-gray-400 cursor-not-allowed'
                            }`}
                          disabled={quantity === 0}
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-bold text-gray-800">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (quantity === 0) {
                              // Only allow adding if stock is available
                              if (stock > 0) {
                                setOfflineOrderForm(prev => ({
                                  ...prev,
                                  selectedProducts: [...prev.selectedProducts, { product_id: Number(product.id), quantity: 1 }],
                                }))
                              }
                            } else {
                              // Only allow increment if quantity is less than stock
                              if (quantity < stock) {
                                setOfflineOrderForm(prev => ({
                                  ...prev,
                                  selectedProducts: prev.selectedProducts.map(sp =>
                                    sp.product_id === Number(product.id)
                                      ? { ...sp, quantity: sp.quantity + 1 }
                                      : sp
                                  ),
                                }))
                              }
                            }
                          }}
                          disabled={!offlineOrderForm.branch_id || quantity >= stock || stock === 0}
                          className={`px-3 py-1.5 border-2 rounded-lg font-semibold transition-all ${!offlineOrderForm.branch_id || quantity >= stock || stock === 0
                              ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                              : 'border-purple-500 text-purple-700 hover:bg-purple-100 active:scale-95'
                            }`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Total Amount Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <label className="text-xl font-bold text-gray-800 block mb-1">Total Amount</label>
                <p className="text-sm text-gray-600">
                  Calculated automatically. You can adjust if needed.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-gray-700">$</span>
                <Input
                  type="number"
                  value={offlineOrderForm.total_amount.toFixed(2)}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0
                    setOfflineOrderForm(prev => ({ ...prev, total_amount: value }))
                  }}
                  className="w-40 text-right text-xl font-bold border-2 border-blue-300 focus:border-blue-500"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t-2 border-gray-200">
            <Button
              variant="secondary"
              onClick={handleCloseOfflineOrderModal}
              disabled={isSavingOfflineOrder}
              size="lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleOfflineOrderSubmit}
              disabled={isSavingOfflineOrder}
              size="lg"
            >
              {isSavingOfflineOrder ? 'Loading...' : 'Next'}
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

