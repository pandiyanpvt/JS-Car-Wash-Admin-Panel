import { useState, useEffect } from 'react'
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Button, Modal, Input, Badge, ConfirmDialog } from '../../components/ui'
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react'
import { productsApi } from '../../api/products.api'
import type { ProductCategory } from '../../api/products.api'

export function Categories() {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<ProductCategory>>({
    name: '',
  })
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
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await productsApi.getCategories()
      setCategories(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch categories')
      console.error('Error fetching categories:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingCategory(null)
    setFormData({ name: '' })
    setIsModalOpen(true)
  }

  const handleEdit = (category: ProductCategory) => {
    setEditingCategory(category)
    setFormData(category)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setConfirmState({
      isOpen: true,
      message: 'Are you sure you want to delete this category?',
      onConfirm: async () => {
        try {
          await productsApi.deleteCategory(id)
          setCategories(categories.filter((c) => c.id !== id))
        } catch (err: any) {
          alert(err.response?.data?.message || 'Failed to delete category')
          console.error('Error deleting category:', err)
        }
      },
    })
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      if (editingCategory) {
        await productsApi.updateCategory(editingCategory.id, formData)
      } else {
        await productsApi.createCategory(formData as Omit<ProductCategory, 'id' | 'productCount'>)
      }
      
      // Refresh categories to get updated product counts
      await fetchCategories()
      setIsModalOpen(false)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category')
      console.error('Error saving category:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Product Categories</h1>
          <p className="text-gray-600">Manage product categories and classifications</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2 inline" />
          Add Category
        </Button>
      </div>

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No categories found</p>
        </div>
      ) : (
        <Table>
        <TableHeader>
          <TableHeaderCell>Category Name</TableHeaderCell>
          <TableHeaderCell>Products</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                    <FolderTree className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">{category.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="info">{category.productCount} products</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={(category.status || 'active') === 'active' ? 'success' : 'danger'}>
                  {category.status || 'active'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(category.id)}>
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
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter category name"
          />
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

