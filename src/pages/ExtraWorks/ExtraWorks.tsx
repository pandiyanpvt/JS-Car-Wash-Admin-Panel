import { useState, useEffect } from 'react'
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Button, Modal, Input, Select, Badge } from '../../components/ui'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { extraWorksApi } from '../../api/extra-works.api'
import type { ExtraWork } from '../../api/extra-works.api'

export function ExtraWorks() {
  const [extraWorks, setExtraWorks] = useState<ExtraWork[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWork, setEditingWork] = useState<ExtraWork | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<ExtraWork>>({
    name: '',
    description: '',
    price: 0,
    status: 'active',
  })

  useEffect(() => {
    fetchExtraWorks()
  }, [])

  const fetchExtraWorks = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await extraWorksApi.getAll()
      setExtraWorks(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch extra works')
      console.error('Error fetching extra works:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingWork(null)
    setFormData({ name: '', description: '', price: 0, status: 'active' })
    setIsModalOpen(true)
  }

  const handleEdit = (work: ExtraWork) => {
    setEditingWork(work)
    setFormData(work)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this extra work?')) {
      try {
        await extraWorksApi.delete(id)
        setExtraWorks(extraWorks.filter((w) => w.id !== id))
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete extra work')
        console.error('Error deleting extra work:', err)
      }
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      if (editingWork) {
        const updatedWork = await extraWorksApi.update(editingWork.id, formData)
        setExtraWorks(extraWorks.map((w) => (w.id === editingWork.id ? updatedWork : w)))
      } else {
        const newWork = await extraWorksApi.create(formData as Omit<ExtraWork, 'id'>)
        setExtraWorks([...extraWorks, newWork])
      }
      setIsModalOpen(false)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save extra work')
      console.error('Error saving extra work:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Extra Works</h1>
          <p className="text-gray-600">Manage additional services and extra works</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2 inline" />
          Add Extra Work
        </Button>
      </div>

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading extra works...</p>
        </div>
      ) : extraWorks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No extra works found</p>
        </div>
      ) : (
        <Table>
        <TableHeader>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Description</TableHeaderCell>
          <TableHeaderCell>Price</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableHeader>
        <TableBody>
          {extraWorks.map((work) => (
            <TableRow key={work.id}>
              <TableCell className="font-medium">{work.name}</TableCell>
              <TableCell className="text-gray-600">{work.description}</TableCell>
              <TableCell className="font-semibold">${work.price}</TableCell>
              <TableCell>
                <Badge variant={work.status === 'active' ? 'success' : 'danger'}>{work.status}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(work)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(work.id)}>
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
        title={editingWork ? 'Edit Extra Work' : 'Add Extra Work'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
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
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
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
    </div>
  )
}

