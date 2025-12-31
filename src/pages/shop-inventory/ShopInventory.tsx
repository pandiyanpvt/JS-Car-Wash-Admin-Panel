import { useState, useEffect } from 'react'
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Button, Modal, Input, Select, Badge, ConfirmDialog } from '../../components/ui'
import { Plus, Edit, Trash2, Image as ImageIcon, X, Upload, ChevronLeft, ChevronRight } from 'lucide-react'
import { shopInventoryApi } from '../../api/shop-inventory.api'
import type { ShopInventory, ShopInventoryStockLog, PaginationInfo } from '../../api/shop-inventory.api'
import { branchesApi, type Branch } from '../../api/branches.api'
import { useAuth } from '../../context/AuthContext'

export function ShopInventory() {
  const { getAdminBranchId, isDeveloper, isRestrictedAdmin } = useAuth()
  const adminBranchId = getAdminBranchId()
  const isRestricted = isRestrictedAdmin()
  const [items, setItems] = useState<ShopInventory[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ShopInventory | null>(null)
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)
  const [stockLogs, setStockLogs] = useState<Record<string, ShopInventoryStockLog[]>>({})
  const [stockLogsPagination, setStockLogsPagination] = useState<Record<string, PaginationInfo>>({})
  const [stockLogsPage, setStockLogsPage] = useState<Record<string, number>>({})
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    product_name: '',
    is_active: true,
    stockEntries: [] as Array<{ branch_id: number; stock: number }>,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [stockQuantities, setStockQuantities] = useState<Record<number, number>>({})
  const [stockAction, setStockAction] = useState<'add' | 'remove'>('add')
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    message: string
    onConfirm: (() => void) | null
  }>({
    isOpen: false,
    message: '',
    onConfirm: null,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [data, branchesData] = await Promise.all([
        shopInventoryApi.getAll(),
        branchesApi.getAll(),
      ])
      
      // Filter branches based on admin branch assignment
      let availableBranches = branchesData
      if (adminBranchId && !isDeveloper()) {
        availableBranches = branchesData.filter(b => b.id === adminBranchId)
      }
      setBranches(availableBranches)
      
      // Filter stock entries for items based on admin branch
      const filteredItems = data.map(item => {
        if (adminBranchId && !isDeveloper() && item.stock_entries) {
          return {
            ...item,
            stock_entries: item.stock_entries.filter(entry => 
              String(entry.branch_id) === adminBranchId
            ),
          }
        }
        return item
      })
      setItems(filteredItems)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch shop inventory')
      console.error('Error fetching shop inventory:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    // Initialize stock entries for available branches
    const initialStockEntries = branches.map(branch => ({
      branch_id: parseInt(branch.id),
      stock: 0,
    }))
    setFormData({
      product_name: '',
      is_active: true,
      stockEntries: initialStockEntries,
    })
    setImageFile(null)
    setImagePreview(null)
    setIsModalOpen(true)
  }

  const handleEdit = (item: ShopInventory) => {
    setEditingItem(item)
    // Map stock entries to form data format
    const stockEntries = item.stock_entries?.map(entry => ({
      branch_id: entry.branch_id,
      stock: entry.stock,
    })) || []
    setFormData({
      product_name: item.product_name,
      is_active: item.is_active,
      stockEntries,
    })
    setImageFile(null)
    setImagePreview(item.img_url || null)
    setIsModalOpen(true)
  }

  const handleEditImage = (item: ShopInventory) => {
    setEditingItem(item)
    setImageFile(null)
    setImagePreview(item.img_url || null)
    setIsImageModalOpen(true)
  }

  const handleStockAction = (item: ShopInventory, action: 'add' | 'remove') => {
    setEditingItem(item)
    setStockAction(action)
    // Initialize quantities to 0 for all available branches
    const initialQuantities: Record<number, number> = {}
    branches.forEach(branch => {
      initialQuantities[parseInt(branch.id)] = 0
    })
    setStockQuantities(initialQuantities)
    setIsStockModalOpen(true)
  }

  const handleRowClick = async (item: ShopInventory) => {
    // If clicking the same row, close it. Otherwise, open the clicked row and close previous one.
    if (expandedRowId === item.id) {
      setExpandedRowId(null)
      setStockLogs({})
      setStockLogsPagination({})
      setStockLogsPage({})
      return
    }

    setExpandedRowId(item.id)
    setIsLoadingLogs(true)
    setStockLogs({})
    setStockLogsPagination({})
    setStockLogsPage({})
    
    try {
      // Fetch logs for all stock entries of this item (first page, 5 items per page)
      if (item.stock_entries && item.stock_entries.length > 0) {
        const logsPromises = item.stock_entries.map(async (stockEntry) => {
          try {
            if (!stockEntry.id) {
              return { stockEntryId: '', logs: [], pagination: null }
            }
            const response = await shopInventoryApi.getStockLogs(stockEntry.id, 1, 5)
            return { 
              stockEntryId: stockEntry.id, 
              logs: response.items,
              pagination: response.pagination
            }
          } catch (err) {
            console.error(`Error fetching logs for stock entry ${stockEntry.id}:`, err)
            return { stockEntryId: stockEntry.id, logs: [], pagination: null }
          }
        })
        
        const logsResults = await Promise.all(logsPromises)
        const logsMap: Record<string, ShopInventoryStockLog[]> = {}
        const paginationMap: Record<string, PaginationInfo> = {}
        const pageMap: Record<string, number> = {}
        
        logsResults.forEach(({ stockEntryId, logs, pagination }) => {
          if (stockEntryId) {
            logsMap[stockEntryId] = logs
            if (pagination) {
              paginationMap[stockEntryId] = pagination
              pageMap[stockEntryId] = 1
            }
          }
        })
        setStockLogs(logsMap)
        setStockLogsPagination(paginationMap)
        setStockLogsPage(pageMap)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch stock logs')
      console.error('Error fetching stock logs:', err)
    } finally {
      setIsLoadingLogs(false)
    }
  }

  const handleStockLogsPageChange = async (stockEntryId: string, page: number) => {
    setIsLoadingLogs(true)
    try {
      const response = await shopInventoryApi.getStockLogs(stockEntryId, page, 5)
      setStockLogs(prev => ({
        ...prev,
        [stockEntryId]: response.items
      }))
      setStockLogsPagination(prev => ({
        ...prev,
        [stockEntryId]: response.pagination
      }))
      setStockLogsPage(prev => ({
        ...prev,
        [stockEntryId]: page
      }))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch stock logs')
      console.error('Error fetching stock logs:', err)
    } finally {
      setIsLoadingLogs(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleDelete = (id: string) => {
    setConfirmState({
      isOpen: true,
      message: 'Are you sure you want to delete this item?',
      onConfirm: async () => {
        try {
          await shopInventoryApi.delete(id)
          setItems(items.filter((item) => item.id !== id))
        } catch (err: any) {
          alert(err.response?.data?.message || 'Failed to delete item')
          console.error('Error deleting item:', err)
        }
      },
    })
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      if (editingItem) {
        const updatedItem = await shopInventoryApi.update(editingItem.id, formData)
        setItems(items.map((item) => (item.id === editingItem.id ? updatedItem : item)))
      } else {
        const newItem = await shopInventoryApi.create({
          product_name: formData.product_name,
          is_active: formData.is_active,
          image: imageFile || undefined,
          stockEntries: formData.stockEntries,
        })
        // Filter stock entries if admin has branch restriction
        let filteredItem = newItem
        if (adminBranchId && !isDeveloper() && newItem.stock_entries) {
          filteredItem = {
            ...newItem,
            stock_entries: newItem.stock_entries.filter(entry => 
              String(entry.branch_id) === adminBranchId
            ),
          }
        }
        setItems([...items, filteredItem])
      }
      setIsModalOpen(false)
      setImageFile(null)
      setImagePreview(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save item')
      console.error('Error saving item:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageSubmit = async () => {
    if (!editingItem || !imageFile) return

    try {
      setIsSubmitting(true)
      setError(null)
      const updatedItem = await shopInventoryApi.updateImage(editingItem.id, imageFile)
      setItems(items.map((item) => (item.id === editingItem.id ? updatedItem : item)))
      setIsImageModalOpen(false)
      setImageFile(null)
      setImagePreview(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update image')
      console.error('Error updating image:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStockSubmit = async () => {
    if (!editingItem) return

    try {
      setIsSubmitting(true)
      setError(null)

      // Process stock operations for each branch
      const operations = Object.entries(stockQuantities)
        .filter(([_, quantity]) => quantity > 0)
        .map(([branchIdStr, quantity]) => ({
          branchId: parseInt(branchIdStr),
          quantity: quantity as number,
        }))

      if (operations.length === 0) {
        setError('Please enter quantity for at least one branch')
        setIsSubmitting(false)
        return
      }

      // Validate remove operations - check if sufficient stock exists
      if (stockAction === 'remove') {
        for (const op of operations) {
          const stockEntry = editingItem.stock_entries?.find(
            entry => entry.branch_id === op.branchId
          )
          const currentStock = stockEntry?.stock || 0
          if (op.quantity > currentStock) {
            const branchName = branches.find(b => parseInt(b.id) === op.branchId)?.name || `Branch ${op.branchId}`
            setError(`Cannot remove ${op.quantity} items from ${branchName}. Current stock is only ${currentStock}`)
            setIsSubmitting(false)
            return
          }
        }
      }

      // Execute all operations
      let updatedItem = editingItem
      for (const op of operations) {
        try {
          if (stockAction === 'add') {
            await shopInventoryApi.addStock(editingItem.id, op.branchId, op.quantity)
          } else {
            await shopInventoryApi.removeStock(editingItem.id, op.branchId, op.quantity)
          }
        } catch (err: any) {
          setError(err.response?.data?.message || `Failed to ${stockAction} stock for branch ${op.branchId}`)
          setIsSubmitting(false)
          return
        }
      }

      // Refresh all items to get updated stock entries
      await fetchData()
      setIsStockModalOpen(false)
      setStockQuantities({})
      setError(null)
      // Refresh logs if the row is expanded (to show the new log entry)
      if (expandedRowId === editingItem.id && editingItem.stock_entries && editingItem.stock_entries.length > 0) {
        setIsLoadingLogs(true)
        try {
          const logsPromises = editingItem.stock_entries.map(async (stockEntry) => {
            try {
              if (!stockEntry.id) {
                return { stockEntryId: '', logs: [], pagination: null }
              }
              // Always fetch page 1 to show the latest entry (which will be the new one)
              const response = await shopInventoryApi.getStockLogs(stockEntry.id, 1, 5)
              return { 
                stockEntryId: stockEntry.id, 
                logs: response.items,
                pagination: response.pagination
              }
            } catch (err) {
              console.error(`Error fetching logs for stock entry ${stockEntry.id}:`, err)
              return { stockEntryId: stockEntry.id, logs: [], pagination: null }
            }
          })
          
          const logsResults = await Promise.all(logsPromises)
          const logsMap: Record<string, ShopInventoryStockLog[]> = {}
          const paginationMap: Record<string, PaginationInfo> = {}
          const pageMap: Record<string, number> = {}
          
          logsResults.forEach(({ stockEntryId, logs, pagination }) => {
            if (stockEntryId) {
              logsMap[stockEntryId] = logs
              if (pagination) {
                paginationMap[stockEntryId] = pagination
                pageMap[stockEntryId] = 1
              }
            }
          })
          setStockLogs(logsMap)
          setStockLogsPagination(paginationMap)
          setStockLogsPage(pageMap)
        } catch (err: any) {
          console.error('Error refreshing stock logs:', err)
        } finally {
          setIsLoadingLogs(false)
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${stockAction} stock`)
      console.error(`Error ${stockAction}ing stock:`, err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Shop Inventory</h1>
          <p className="text-gray-600">Manage shop inventory items and stock</p>
        </div>
        {!isRestricted && (
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2 inline" />
            Add Item
          </Button>
        )}
      </div>

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading shop inventory...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No items found</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableHeaderCell>Image</TableHeaderCell>
            <TableHeaderCell>Product Name</TableHeaderCell>
            <TableHeaderCell>Stock</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <>
                <TableRow 
                  key={item.id}
                  onClick={() => handleRowClick(item)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <TableCell>
                  {item.img_url ? (
                    <img src={item.img_url} alt={item.product_name} className="w-20 h-20 object-cover rounded-lg" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{item.product_name}</TableCell>
                <TableCell>
                  {item.stock_entries && item.stock_entries.length > 0 ? (
                    <div className="space-y-1">
                      {item.stock_entries.map((stockEntry) => (
                        <div key={stockEntry.id} className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{stockEntry.branch?.branch_name || `Branch ${stockEntry.branch_id}`}:</span>
                          <Badge variant={stockEntry.stock > 20 ? 'success' : stockEntry.stock > 10 ? 'warning' : 'danger'}>
                            {stockEntry.stock}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">No stock entries</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={item.is_active ? 'success' : 'danger'}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2 flex-wrap gap-2">
                    {!isRestricted && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(item)
                          }} 
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditImage(item)
                          }} 
                          title="Update Image"
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStockAction(item, 'add')
                      }}
                      className="px-3 py-1.5 text-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      Add Stock
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStockAction(item, 'remove')
                      }}
                      className="px-3 py-1.5 text-sm bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      Remove Stock
                    </button>
                    {!isRestricted && (
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item.id)
                        }} 
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
              {expandedRowId === item.id && (
                <tr key={`${item.id}-logs`} className="bg-gray-50">
                  <td colSpan={5} className="px-6 py-4" style={{ width: '100%', display: 'table-cell' }}>
                    <div className="w-full">
                      {isLoadingLogs ? (
                        <div className="text-center py-8">
                          <p className="text-gray-600">Loading logs...</p>
                        </div>
                      ) : item.stock_entries && item.stock_entries.length > 0 ? (
                        item.stock_entries.map((stockEntry) => {
                          const branchName = branches.find(b => parseInt(b.id) === stockEntry.branch_id)?.name || 
                                            stockEntry.branch?.branch_name || 
                                            `Branch ${stockEntry.branch_id}`
                          const logs = stockEntry.id ? stockLogs[stockEntry.id] || [] : []
                          const pagination = stockEntry.id ? stockLogsPagination[stockEntry.id] : null
                          const currentPage = stockEntry.id ? (stockLogsPage[stockEntry.id] || 1) : 1
                          
                          return (
                            <div key={stockEntry.id} className="mb-6 last:mb-0">
                              <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-300">
                                <h3 className="text-base font-semibold text-gray-800">{branchName}</h3>
                                <Badge variant={stockEntry.stock > 20 ? 'success' : stockEntry.stock > 10 ? 'warning' : 'danger'}>
                                  Current Stock: {stockEntry.stock}
                                </Badge>
                              </div>
                              
                              {logs.length === 0 ? (
                                <p className="text-gray-400 text-sm py-4">No logs found for this branch</p>
                              ) : (
                                <>
                                  <div className="overflow-x-auto">
                                    <table className="w-full min-w-full">
                                      <thead>
                                        <tr className="bg-gray-100 border-b border-gray-300">
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity</th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Previous Stock</th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">New Stock</th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date & Time</th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {logs.map((log) => (
                                          <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                              <Badge variant={log.action === 'add' ? 'success' : 'danger'}>
                                                {log.action === 'add' ? 'Added' : 'Removed'}
                                              </Badge>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-medium">
                                              {log.action === 'add' ? '+' : '-'}{log.quantity}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                              {log.stock_before}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-medium">
                                              {log.stock_after}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                              {log.user ? (
                                                <div>
                                                  <div className="font-medium text-gray-800">
                                                    {log.user.first_name} {log.user.last_name}
                                                  </div>
                                                  {log.user.email_address && (
                                                    <div className="text-xs text-gray-500">
                                                      {log.user.email_address}
                                                    </div>
                                                  )}
                                                </div>
                                              ) : (
                                                <span className="text-gray-400">-</span>
                                              )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                              {new Date(log.created_at).toLocaleString()}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  
                                  {/* Pagination Controls */}
                                  {pagination && pagination.totalPages > 1 && (
                                    <div className="mt-4 rounded-xl border border-white/20 bg-white/60 backdrop-blur-sm shadow-sm px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                      <div className="text-xs sm:text-sm text-gray-600">
                                        Showing{' '}
                                        <span className="font-semibold text-gray-800">
                                          {((pagination.page - 1) * pagination.pageSize) + 1}
                                        </span>{' '}
                                        to{' '}
                                        <span className="font-semibold text-gray-800">
                                          {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)}
                                        </span>{' '}
                                        of{' '}
                                        <span className="font-semibold text-gray-800">
                                          {pagination.totalItems}
                                        </span>{' '}
                                        logs
                                      </div>
                                      <div className="flex items-center justify-between sm:justify-end gap-3">
                                        <div className="flex items-center space-x-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-full border border-gray-200 bg-white/80 hover:bg-primary-50 shadow-sm"
                                            onClick={() => stockEntry.id && handleStockLogsPageChange(stockEntry.id, currentPage - 1)}
                                            disabled={pagination.page === 1 || isLoadingLogs}
                                          >
                                            <ChevronLeft className="w-4 h-4 mr-1" />
                                            Previous
                                          </Button>
                                          <div className="hidden sm:block text-sm text-gray-600">
                                            Page <span className="font-semibold">{pagination.page}</span> of{' '}
                                            <span className="font-semibold">{pagination.totalPages}</span>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-full border border-gray-200 bg-white/80 hover:bg-primary-50 shadow-sm"
                                            onClick={() => stockEntry.id && handleStockLogsPageChange(stockEntry.id, currentPage + 1)}
                                            disabled={pagination.page === pagination.totalPages || isLoadingLogs}
                                          >
                                            Next
                                            <ChevronRight className="w-4 h-4 ml-1" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-400">No stock entries found</p>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              </>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Item' : 'Add Item'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Product Name"
            value={formData.product_name}
            onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
          />
          <Select
            label="Status"
            value={formData.is_active ? 'true' : 'false'}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
          />
          
          {/* Image Upload Section - Only for new items */}
          {!editingItem && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Product Image</label>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              {/* File Upload */}
              <label className="block">
                <span className="sr-only">Choose image file</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </label>
              <p className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF, WebP</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="secondary" 
              onClick={() => {
                setIsModalOpen(false)
                setError(null)
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Update Image Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title="Update Image"
        size="md"
      >
        <div className="space-y-4">
          {/* Current Image Preview */}
          {editingItem && imagePreview && !imageFile && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Current Image</label>
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Current"
                  className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>
            </div>
          )}

          {/* New Image Preview */}
          {imageFile && imagePreview && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">New Image Preview</label>
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          {/* File Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Select New Image</label>
            <label className="block">
              <span className="sr-only">Choose image file</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </label>
            <p className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF, WebP</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="secondary" 
              onClick={() => {
                setIsImageModalOpen(false)
                setError(null)
                setImageFile(null)
                setImagePreview(null)
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleImageSubmit} disabled={isSubmitting || !imageFile}>
              {isSubmitting ? 'Uploading...' : 'Update Image'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Stock Action Modal */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={stockAction === 'add' ? 'Add Stock' : 'Remove Stock'}
        size="md"
      >
        <div className="space-y-4">
          {editingItem && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Product: <span className="font-medium">{editingItem.product_name}</span></p>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase">Current Stock:</p>
                {editingItem.stock_entries && editingItem.stock_entries.length > 0 ? (
                  editingItem.stock_entries.map((entry) => {
                    const branch = branches.find(b => parseInt(b.id) === entry.branch_id)
                    const branchName = branch?.name || entry.branch?.branch_name || `Branch ${entry.branch_id}`
                    return (
                      <p key={entry.id} className="text-sm text-gray-600">
                        {branchName}: <span className="font-medium">{entry.stock}</span>
                      </p>
                    )
                  })
                ) : (
                  <p className="text-sm text-gray-400">No stock entries</p>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-700">
              {stockAction === 'add' ? 'Quantity to Add' : 'Quantity to Remove'} by Branch:
            </p>
            {branches.map((branch) => {
              const branchId = parseInt(branch.id)
              const currentStock = editingItem?.stock_entries?.find(
                entry => entry.branch_id === branchId
              )?.stock || 0
              const quantity = stockQuantities[branchId] || 0
              
              return (
                <div key={branch.id} className="space-y-2">
                  <Input
                    label={branch.name}
                    type="number"
                    step="1"
                    min="0"
                    value={quantity === 0 ? '' : quantity}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '' || value === '-') {
                        setStockQuantities({ ...stockQuantities, [branchId]: 0 })
                      } else {
                        const numValue = parseInt(value, 10)
                        if (!isNaN(numValue) && numValue >= 0) {
                          setStockQuantities({ ...stockQuantities, [branchId]: numValue })
                        }
                      }
                    }}
                  />
                  {stockAction === 'remove' && quantity > currentStock && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded text-xs">
                      Warning: Cannot remove more than available ({currentStock})
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="secondary" 
              onClick={() => {
                setIsStockModalOpen(false)
                setError(null)
                setStockQuantities({})
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleStockSubmit} 
              disabled={
                isSubmitting || 
                Object.values(stockQuantities).every(qty => qty <= 0) ||
                (stockAction === 'remove' && editingItem && 
                  Object.entries(stockQuantities).some(([branchIdStr, qty]) => {
                    if (qty <= 0) return false
                    const branchId = parseInt(branchIdStr)
                    const stockEntry = editingItem.stock_entries?.find(entry => entry.branch_id === branchId)
                    return qty > (stockEntry?.stock || 0)
                  }))
              }
            >
              {isSubmitting ? 'Processing...' : stockAction === 'add' ? 'Add Stock' : 'Remove Stock'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        message={confirmState.message}
        title="Confirm Action"
        confirmLabel="OK"
        cancelLabel="Cancel"
        onCancel={() =>
          setConfirmState((prev) => ({
            ...prev,
            isOpen: false,
            onConfirm: null,
          }))
        }
        onConfirm={() => {
          if (confirmState.onConfirm) {
            confirmState.onConfirm()
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

