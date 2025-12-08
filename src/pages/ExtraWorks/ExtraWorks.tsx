import { useState } from 'react'
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Button, Modal, Input, Select, Badge } from '../../components/ui'
import { Plus, Edit, Trash2 } from 'lucide-react'

interface ExtraWork {
  id: string
  name: string
  description: string
  price: number
  duration: number
  status: 'active' | 'inactive'
}

const dummyExtraWorks: ExtraWork[] = [
  {
    id: '1',
    name: 'Headlight Restoration',
    description: 'Restore cloudy headlights to like-new condition',
    price: 80,
    duration: 30,
    status: 'active',
  },
  {
    id: '2',
    name: 'Leather Conditioning',
    description: 'Deep conditioning for leather seats',
    price: 60,
    duration: 20,
    status: 'active',
  },
  {
    id: '3',
    name: 'Engine Bay Cleaning',
    description: 'Complete engine bay degreasing and detailing',
    price: 100,
    duration: 45,
    status: 'active',
  },
]

export function ExtraWorks() {
  const [extraWorks, setExtraWorks] = useState<ExtraWork[]>(dummyExtraWorks)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWork, setEditingWork] = useState<ExtraWork | null>(null)
  const [formData, setFormData] = useState<Partial<ExtraWork>>({
    name: '',
    description: '',
    price: 0,
    duration: 0,
    status: 'active',
  })

  const handleAdd = () => {
    setEditingWork(null)
    setFormData({ name: '', description: '', price: 0, duration: 0, status: 'active' })
    setIsModalOpen(true)
  }

  const handleEdit = (work: ExtraWork) => {
    setEditingWork(work)
    setFormData(work)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this extra work?')) {
      setExtraWorks(extraWorks.filter((w) => w.id !== id))
    }
  }

  const handleSubmit = () => {
    if (editingWork) {
      setExtraWorks(extraWorks.map((w) => (w.id === editingWork.id ? { ...formData, id: w.id } as ExtraWork : w)))
    } else {
      const newWork: ExtraWork = {
        ...formData,
        id: String(extraWorks.length + 1),
      } as ExtraWork
      setExtraWorks([...extraWorks, newWork])
    }
    setIsModalOpen(false)
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

      <Table>
        <TableHeader>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Description</TableHeaderCell>
          <TableHeaderCell>Price</TableHeaderCell>
          <TableHeaderCell>Duration (min)</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableHeader>
        <TableBody>
          {extraWorks.map((work) => (
            <TableRow key={work.id}>
              <TableCell className="font-medium">{work.name}</TableCell>
              <TableCell className="text-gray-600">{work.description}</TableCell>
              <TableCell className="font-semibold">${work.price}</TableCell>
              <TableCell>{work.duration}</TableCell>
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
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
          />
          <Input
            label="Duration (minutes)"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
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

