import { useState, useEffect } from 'react'
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Button, Modal, Input, Select, Badge, ConfirmDialog } from '../../components/ui'
import { Plus, Edit, Trash2, Image as ImageIcon, X } from 'lucide-react'
import { productsApi } from '../../api/products.api'
import type { Product, ProductCategory, StockEntry } from '../../api/products.api'
import { branchesApi } from '../../api/branches.api'
import type { Branch } from '../../api/branches.api'
import { useAuth } from '../../context/AuthContext'

export function Products() {
  const { getAdminBranchId, isDeveloper } = useAuth()
  const adminBranchId = getAdminBranchId()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [productsData, categoriesData, branchesData] = await Promise.all([
        productsApi.getAll(),
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
      const filteredProducts = productsData.map(product => {
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
          setProducts(products.filter((p) => p.id !== id))
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
        // Filter stock entries if admin has branch restriction
        let filteredProduct = updatedProduct
        if (adminBranchId && !isDeveloper() && updatedProduct.stockEntries) {
          filteredProduct = {
            ...updatedProduct,
            stockEntries: updatedProduct.stockEntries.filter(entry => 
              String(entry.branch_id) === adminBranchId
            ),
          }
        }
        setProducts(products.map((p) => (p.id === editingProduct.id ? filteredProduct : p)))
      } else {
        const newProduct = await productsApi.create(productData as Omit<Product, 'id'>)
        // Filter stock entries if admin has branch restriction
        let filteredProduct = newProduct
        if (adminBranchId && !isDeveloper() && newProduct.stockEntries) {
          filteredProduct = {
            ...newProduct,
            stockEntries: newProduct.stockEntries.filter(entry => 
              String(entry.branch_id) === adminBranchId
            ),
          }
        }
        setProducts([...products, filteredProduct])
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Products</h1>
          <p className="text-gray-600">Manage product inventory and details</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2 inline" />
          Add Product
        </Button>
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
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Category</TableHeaderCell>
          <TableHeaderCell>Price</TableHeaderCell>
          <TableHeaderCell>Stock</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">{product.description}</div>
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
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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

