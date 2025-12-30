import { useState, useEffect } from 'react'
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Button, Modal, Input, Select, Badge, ConfirmDialog } from '../../components/ui'
import { Plus, Edit, Trash2, Image as ImageIcon, X, Upload } from 'lucide-react'
import { shopInventoryApi } from '../../api/shop-inventory.api'
import type { ShopInventory } from '../../api/shop-inventory.api'

export function ShopInventory() {
  const [items, setItems] = useState<ShopInventory[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ShopInventory | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    product_name: '',
    stock: 0,
    is_active: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [stockQuantity, setStockQuantity] = useState(0)
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
      const data = await shopInventoryApi.getAll()
      setItems(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch shop inventory')
      console.error('Error fetching shop inventory:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      product_name: '',
      stock: 0,
      is_active: true,
    })
    setImageFile(null)
    setImagePreview(null)
    setIsModalOpen(true)
  }

  const handleEdit = (item: ShopInventory) => {
    setEditingItem(item)
    setFormData({
      product_name: item.product_name,
      stock: item.stock,
      is_active: item.is_active,
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
    setStockQuantity(0)
    setIsStockModalOpen(true)
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
          ...formData,
          image: imageFile || undefined,
        })
        setItems([...items, newItem])
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
    if (!editingItem || stockQuantity <= 0) return

    try {
      setIsSubmitting(true)
      setError(null)
      const updatedItem = stockAction === 'add'
        ? await shopInventoryApi.addStock(editingItem.id, stockQuantity)
        : await shopInventoryApi.removeStock(editingItem.id, stockQuantity)
      setItems(items.map((item) => (item.id === editingItem.id ? updatedItem : item)))
      setIsStockModalOpen(false)
      setStockQuantity(0)
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
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2 inline" />
          Add Item
        </Button>
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
              <TableRow key={item.id}>
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
                  <Badge variant={item.stock > 20 ? 'success' : item.stock > 10 ? 'warning' : 'danger'}>
                    {item.stock}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={item.is_active ? 'success' : 'danger'}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2 flex-wrap gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} title="Edit">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditImage(item)} title="Update Image">
                      <Upload className="w-4 h-4" />
                    </Button>
                    <button
                      onClick={() => handleStockAction(item, 'add')}
                      className="px-3 py-1.5 text-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      Add Stock
                    </button>
                    <button
                      onClick={() => handleStockAction(item, 'remove')}
                      className="px-3 py-1.5 text-sm bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      Remove Stock
                    </button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)} title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
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
          <Input
            label="Stock"
            type="number"
            step="1"
            min="0"
            value={formData.stock === 0 ? '' : formData.stock}
            onChange={(e) => {
              const value = e.target.value
              if (value === '' || value === '-') {
                setFormData({ ...formData, stock: 0 })
              } else {
                const numValue = parseInt(value, 10)
                if (!isNaN(numValue) && numValue >= 0) {
                  setFormData({ ...formData, stock: numValue })
                }
              }
            }}
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
              <p className="text-sm text-gray-600">Product: <span className="font-medium">{editingItem.product_name}</span></p>
              <p className="text-sm text-gray-600">Current Stock: <span className="font-medium">{editingItem.stock}</span></p>
            </div>
          )}
          
          <Input
            label={stockAction === 'add' ? 'Quantity to Add' : 'Quantity to Remove'}
            type="number"
            step="1"
            min="1"
            value={stockQuantity === 0 ? '' : stockQuantity}
            onChange={(e) => {
              const value = e.target.value
              if (value === '' || value === '-') {
                setStockQuantity(0)
              } else {
                const numValue = parseInt(value, 10)
                if (!isNaN(numValue) && numValue > 0) {
                  setStockQuantity(numValue)
                }
              }
            }}
          />

          {stockAction === 'remove' && editingItem && stockQuantity > editingItem.stock && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
              Warning: You cannot remove more stock than available ({editingItem.stock})
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
                setIsStockModalOpen(false)
                setError(null)
                setStockQuantity(0)
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleStockSubmit} 
              disabled={isSubmitting || stockQuantity <= 0 || (stockAction === 'remove' && editingItem && stockQuantity > editingItem.stock)}
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

