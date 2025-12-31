import React, { useState, useEffect } from 'react'
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Button, Modal, Input, Select, Badge, ConfirmDialog } from '../../components/ui'
import { Plus, Edit, Trash2, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { productsApi } from '../../api/products.api'
import type { Product, ProductCategory, StockEntry, ProductStockLog, PaginationInfo, PaginatedProductsResponse } from '../../api/products.api'
import { branchesApi } from '../../api/branches.api'
import type { Branch } from '../../api/branches.api'
import { useAuth } from '../../context/AuthContext'

export function Products() {
  const { getAdminBranchId, isDeveloper, isRestrictedAdmin } = useAuth()
  const adminBranchId = getAdminBranchId()
  const isRestricted = isRestrictedAdmin()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)
  const [stockLogs, setStockLogs] = useState<Record<string, ProductStockLog[]>>({})
  const [stockLogsPagination, setStockLogsPagination] = useState<Record<string, PaginationInfo>>({})
  const [stockLogsPage, setStockLogsPage] = useState<Record<string, number>>({})
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stockQuantities, setStockQuantities] = useState<Record<number, number>>({})
  const [stockAction, setStockAction] = useState<'add' | 'remove'>('add')
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    image: '',
    status: 'active',
    stockEntries: [],
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
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
  }, [currentPage, pageSize])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [productsResponse, categoriesData, branchesData] = await Promise.all([
        productsApi.getAll(currentPage, pageSize),
        productsApi.getCategories(),
        branchesApi.getAll(),
      ])
      
      // Filter branches based on admin branch assignment
      let availableBranches = branchesData
      if (adminBranchId && !isDeveloper()) {
        availableBranches = branchesData.filter(b => b.id === adminBranchId)
      }
      setBranches(availableBranches)
      
      // Filter stock entries for products based on admin branch
      const filteredProducts = productsResponse.items.map(product => {
        if (adminBranchId && !isDeveloper() && product.stockEntries) {
          return {
            ...product,
            stockEntries: product.stockEntries.filter(entry => 
              String(entry.branch_id) === adminBranchId
            ),
          }
        }
        return product
      })
      
      setProducts(filteredProducts)
      setPagination(productsResponse.pagination)
      setCategories(categoriesData)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data')
      console.error('Error fetching data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingProduct(null)
    // Initialize stock entries for available branches
    const initialStockEntries: StockEntry[] = branches.map(branch => ({
      branch_id: parseInt(branch.id),
      stock: 0,
    }))
    setFormData({
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      image: '',
      status: 'active',
      stockEntries: initialStockEntries,
    })
    setImageFile(null)
    setImagePreview(null)
    setIsModalOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    // Ensure stock entries are initialized for all available branches
    const existingStockEntries = product.stockEntries || []
    const stockEntriesMap = new Map(
      existingStockEntries.map(entry => [entry.branch_id, entry])
    )
    
    // Create stock entries for all available branches
    const stockEntries: StockEntry[] = branches.map(branch => {
      const existing = stockEntriesMap.get(parseInt(branch.id))
      return existing || {
        branch_id: parseInt(branch.id),
        stock: 0,
      }
    })
    
    setFormData({
      ...product,
      stockEntries,
    })
    setImageFile(null)
    setImagePreview(product.image || null)
    setIsModalOpen(true)
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
      message: 'Are you sure you want to delete this product?',
      onConfirm: async () => {
        try {
          await productsApi.delete(id)
          // Refresh the list to get updated data with pagination
          await fetchData()
        } catch (err: any) {
          alert(err.response?.data?.message || 'Failed to delete product')
          console.error('Error deleting product:', err)
        }
      },
    })
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      const productData: any = {
        ...formData,
        categoryId: formData.categoryId || undefined,
        stockEntries: formData.stockEntries || [],
      }

      // Add image file if selected
      if (imageFile) {
        productData.image = imageFile
      }

      if (editingProduct) {
        const updatedProduct = await productsApi.update(editingProduct.id, productData)
        // Refresh the list to get updated data with pagination
        await fetchData()
      } else {
        const newProduct = await productsApi.create(productData as Omit<Product, 'id'>)
        // Refresh the list to get updated data with pagination
        await fetchData()
      }
      setIsModalOpen(false)
      setImageFile(null)
      setImagePreview(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product')
      console.error('Error saving product:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateStockEntry = (branchId: number, stock: number) => {
    const updatedStockEntries = (formData.stockEntries || []).map(entry => 
      entry.branch_id === branchId ? { ...entry, stock } : entry
    )
    setFormData({ ...formData, stockEntries: updatedStockEntries })
  }

  const getTotalStock = (product: Product): number => {
    if (!product.stockEntries || product.stockEntries.length === 0) {
      return product.stock || 0
    }
    return product.stockEntries.reduce((sum, entry) => sum + entry.stock, 0)
  }

  const getStockForBranch = (product: Product, branchId: number): number => {
    if (!product.stockEntries) return 0
    const entry = product.stockEntries.find(e => e.branch_id === branchId)
    return entry?.stock || 0
  }

  const handleStockAction = (product: Product, action: 'add' | 'remove') => {
    setEditingProduct(product)
    setStockAction(action)
    // Initialize quantities to 0 for all available branches
    const initialQuantities: Record<number, number> = {}
    branches.forEach(branch => {
      initialQuantities[parseInt(branch.id)] = 0
    })
    setStockQuantities(initialQuantities)
    setIsStockModalOpen(true)
  }

  const handleRowClick = async (product: Product) => {
    // If clicking the same row, close it. Otherwise, open the clicked row and close previous one.
    if (expandedRowId === product.id) {
      setExpandedRowId(null)
      setStockLogs({})
      setStockLogsPagination({})
      setStockLogsPage({})
      return
    }

    setExpandedRowId(product.id)
    setIsLoadingLogs(true)
    setStockLogs({})
    setStockLogsPagination({})
    setStockLogsPage({})
    
    try {
      // Fetch logs for all stock entries of this product (first page, 5 items per page)
      if (product.stockEntries && product.stockEntries.length > 0) {
        console.log('Fetching logs for product:', product.id)
        console.log('Stock entries:', product.stockEntries)
        
        const logsPromises = product.stockEntries.map(async (stockEntry) => {
          try {
            if (!stockEntry.id) {
              console.warn('Stock entry missing ID:', stockEntry)
              return { stockEntryId: '', logs: [], pagination: null }
            }
            console.log(`Fetching logs for stock entry ID: ${stockEntry.id}`)
            const response = await productsApi.getStockLogs(stockEntry.id, 1, 5)
            console.log(`Logs response for ${stockEntry.id}:`, response)
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
        const logsMap: Record<string, ProductStockLog[]> = {}
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
      const response = await productsApi.getStockLogs(stockEntryId, page, 5)
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

  const handleStockSubmit = async () => {
    if (!editingProduct) return

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
          const stockEntry = editingProduct.stockEntries?.find(
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
      for (const op of operations) {
        try {
          if (stockAction === 'add') {
            await productsApi.addStock(editingProduct.id, op.branchId, op.quantity)
          } else {
            await productsApi.removeStock(editingProduct.id, op.branchId, op.quantity)
          }
        } catch (err: any) {
          setError(err.response?.data?.message || `Failed to ${stockAction} stock for branch ${op.branchId}`)
          setIsSubmitting(false)
          return
        }
      }

      // Refresh all products to get updated stock entries
      await fetchData()
      
      // Get the updated product from the refreshed data
      const updatedProductsResponse = await productsApi.getAll(currentPage, pageSize)
      const updatedProducts = updatedProductsResponse.items
      // Filter based on admin branch if needed
      let filteredProducts = updatedProducts
      if (adminBranchId && !isDeveloper()) {
        filteredProducts = updatedProducts.map(item => {
          if (item.stockEntries) {
            return {
              ...item,
              stockEntries: item.stockEntries.filter(entry => 
                String(entry.branch_id) === adminBranchId
              ),
            }
          }
          return item
        })
      }
      setProducts(filteredProducts)
      
      // Find the updated product
      const updatedProduct = filteredProducts.find(p => p.id === editingProduct.id)
      
      setIsStockModalOpen(false)
      setStockQuantities({})
      setError(null)
      
      // Refresh logs if the row is expanded, using the updated product data
      if (expandedRowId === editingProduct.id && updatedProduct && updatedProduct.stockEntries && updatedProduct.stockEntries.length > 0) {
        setIsLoadingLogs(true)
        try {
          console.log('Refreshing logs for product:', updatedProduct.id)
          console.log('Stock entries:', updatedProduct.stockEntries)
          
          const logsPromises = updatedProduct.stockEntries.map(async (stockEntry) => {
            try {
              if (!stockEntry.id) {
                console.warn('Stock entry missing ID:', stockEntry)
                return { stockEntryId: '', logs: [], pagination: null }
              }
              console.log(`Fetching logs for stock entry ID: ${stockEntry.id}`)
              // Always fetch page 1 to show the latest entry (which will be the new one)
              const response = await productsApi.getStockLogs(stockEntry.id, 1, 5)
              console.log(`Logs response for ${stockEntry.id}:`, response)
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
          const logsMap: Record<string, ProductStockLog[]> = {}
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Products</h1>
          <p className="text-gray-600">Manage product inventory and details</p>
        </div>
        {!isRestricted && (
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2 inline" />
            Add Product
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
          <p className="text-gray-600">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No products found</p>
        </div>
      ) : (
        <Table>
        <TableHeader>
          <TableHeaderCell>Image</TableHeaderCell>
          <TableHeaderCell className="max-w-[180px]">Name</TableHeaderCell>
          <TableHeaderCell>Category</TableHeaderCell>
          <TableHeaderCell>Price</TableHeaderCell>
          <TableHeaderCell>Stock</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <React.Fragment key={product.id}>
              <TableRow 
                key={product.id}
                onClick={() => handleRowClick(product)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <TableCell>
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="max-w-[180px]">
                  <div className="truncate">
                    <div className="font-medium truncate">{product.name}</div>
                    <div className="text-sm text-gray-500 truncate">{product.description}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {categories.find(c => c.id === product.categoryId)?.name || 'Uncategorized'}
                </TableCell>
                <TableCell className="font-semibold">${product.price}</TableCell>
                <TableCell>
                  {product.stockEntries && product.stockEntries.length > 0 ? (
                    <div className="space-y-1">
                      {product.stockEntries.map((entry) => {
                        const branch = branches.find(b => b.id === String(entry.branch_id))
                        const stock = entry.stock
                        return (
                          <div key={entry.id || entry.branch_id} className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">{branch?.name || `Branch ${entry.branch_id}`}:</span>
                            <Badge variant={stock > 20 ? 'success' : stock > 10 ? 'warning' : 'danger'}>
                              {stock}
                            </Badge>
                          </div>
                        )
                      })}
                      <div className="pt-1 border-t border-gray-200">
                        <span className="text-xs text-gray-500">Total: </span>
                        <Badge variant={getTotalStock(product) > 20 ? 'success' : getTotalStock(product) > 10 ? 'warning' : 'danger'}>
                          {getTotalStock(product)}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <Badge variant={product.stock && product.stock > 20 ? 'success' : product.stock && product.stock > 10 ? 'warning' : 'danger'}>
                      {product.stock || 0}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={product.status === 'active' ? 'success' : 'danger'}>{product.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1.5 flex-nowrap">
                    {!isRestricted && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(product)
                        }}
                        title="Edit"
                        className="shrink-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStockAction(product, 'add')
                      }}
                      className="px-2 py-1 text-xs bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 shrink-0 whitespace-nowrap"
                    >
                      Add Stock
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStockAction(product, 'remove')
                      }}
                      className="px-2 py-1 text-xs bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 shrink-0 whitespace-nowrap"
                    >
                      Remove
                    </button>
                    {!isRestricted && (
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(product.id)
                        }}
                        title="Delete"
                        className="shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
              {expandedRowId === product.id && (() => {
                // Get the current product from state to ensure we have the latest data
                const currentProduct = products.find(p => p.id === product.id) || product
                return (
                <tr key={`${product.id}-logs`} className="bg-gray-50">
                  <td colSpan={7} className="px-6 py-4" style={{ width: '100%', display: 'table-cell' }}>
                    <div className="w-full">
                      {isLoadingLogs ? (
                        <div className="text-center py-8">
                          <p className="text-gray-600">Loading logs...</p>
                        </div>
                      ) : currentProduct.stockEntries && currentProduct.stockEntries.length > 0 ? (
                        currentProduct.stockEntries.map((stockEntry) => {
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
                )
              })()}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
      )}

      {/* Pagination Controls */}
      {!isLoading && pagination.totalPages > 0 && (
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
            products
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="w-36">
              <Select
                value={String(pageSize)}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1) // Reset to first page when changing page size
                }}
                options={[
                  { value: '10', label: '10 per page' },
                  { value: '20', label: '20 per page' },
                  { value: '50', label: '50 per page' },
                  { value: '100', label: '100 per page' },
                ]}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full border border-gray-200 bg-white/80 hover:bg-primary-50 shadow-sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={pagination.page === 1 || isLoading}
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
                onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                disabled={pagination.page === pagination.totalPages || isLoading}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price === 0 ? '' : formData.price}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || value === '-') {
                  setFormData({ ...formData, price: 0 })
                } else {
                  const numValue = parseFloat(value)
                  if (!isNaN(numValue) && numValue >= 0) {
                    setFormData({ ...formData, price: numValue })
                  }
                }
              }}
            />
          </div>
          {/* Stock Entries by Branch */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Stock by Branch</label>
            <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
              {branches.map((branch) => {
                const stockEntry = formData.stockEntries?.find(
                  entry => entry.branch_id === parseInt(branch.id)
                )
                const stock = stockEntry?.stock || 0
                return (
                  <div key={branch.id} className="flex items-center gap-3">
                    <label className="text-sm text-gray-700 w-32">{branch.name}:</label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={stock}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === '' || value === '-') {
                          updateStockEntry(parseInt(branch.id), 0)
                        } else {
                          const numValue = parseInt(value, 10)
                          if (!isNaN(numValue) && numValue >= 0) {
                            updateStockEntry(parseInt(branch.id), numValue)
                          }
                        }
                      }}
                      className="flex-1"
                    />
                  </div>
                )
              })}
              {branches.length === 0 && (
                <p className="text-sm text-gray-500">No branches available</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
            />
            <Select
              label="Status"
              value={formData.status || 'active'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </div>
          
          {/* Image Upload Section */}
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

      {/* Stock Action Modal */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={stockAction === 'add' ? 'Add Stock' : 'Remove Stock'}
        size="md"
      >
        <div className="space-y-4">
          {editingProduct && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Product: <span className="font-medium">{editingProduct.name}</span></p>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase">Current Stock:</p>
                {editingProduct.stockEntries && editingProduct.stockEntries.length > 0 ? (
                  editingProduct.stockEntries.map((entry) => {
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
              const currentStock = editingProduct?.stockEntries?.find(
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
                (stockAction === 'remove' && editingProduct && 
                  Object.entries(stockQuantities).some(([branchIdStr, qty]) => {
                    if (qty <= 0) return false
                    const branchId = parseInt(branchIdStr)
                    const stockEntry = editingProduct.stockEntries?.find(entry => entry.branch_id === branchId)
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

