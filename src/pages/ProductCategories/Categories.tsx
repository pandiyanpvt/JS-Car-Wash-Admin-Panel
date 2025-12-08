import { useState } from 'react'
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Button, Modal, Input, Badge } from '../../components/ui'
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react'

interface Category {
  id: string
  name: string
  description: string
  productCount: number
}

const dummyCategories: Category[] = [
  { id: '1', name: 'Cleaning Supplies', description: 'Car cleaning products', productCount: 15 },
  { id: '2', name: 'Accessories', description: 'Car care accessories', productCount: 8 },
  { id: '3', name: 'Polishing', description: 'Wax and polish products', productCount: 12 },
  { id: '4', name: 'Interior Care', description: 'Interior cleaning products', productCount: 10 },
]

export function Categories() {
  const [categories, setCategories] = useState<Category[]>(dummyCategories)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    description: '',
    productCount: 0,
  })

  const handleAdd = () => {
    setEditingCategory(null)
    setFormData({ name: '', description: '', productCount: 0 })
    setIsModalOpen(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData(category)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter((c) => c.id !== id))
    }
  }

  const handleSubmit = () => {
    if (editingCategory) {
      setCategories(categories.map((c) => (c.id === editingCategory.id ? { ...formData, id: c.id } as Category : c)))
    } else {
      const newCategory: Category = {
        ...formData,
        id: String(categories.length + 1),
      } as Category
      setCategories([...categories, newCategory])
    }
    setIsModalOpen(false)
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

      <Table>
        <TableHeader>
          <TableHeaderCell>Category Name</TableHeaderCell>
          <TableHeaderCell>Description</TableHeaderCell>
          <TableHeaderCell>Products</TableHeaderCell>
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
              <TableCell className="text-gray-600">{category.description}</TableCell>
              <TableCell>
                <Badge variant="info">{category.productCount} products</Badge>
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

