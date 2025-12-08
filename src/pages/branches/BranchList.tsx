import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Plus, Edit, Trash2, MapPin, Phone, User } from 'lucide-react'

interface Branch {
  id: string
  name: string
  address: string
  phone: string
  manager: string
  managerEmail: string
  status: 'active' | 'inactive'
}

const dummyBranches: Branch[] = [
  {
    id: '1',
    name: 'Downtown Branch',
    address: '123 Main St, City Center',
    phone: '+1 234-567-8900',
    manager: 'John Manager',
    managerEmail: 'john@jscarwash.com',
    status: 'active',
  },
  {
    id: '2',
    name: 'Mall Branch',
    address: '456 Shopping Ave, Mall Area',
    phone: '+1 234-567-8901',
    manager: 'Jane Manager',
    managerEmail: 'jane@jscarwash.com',
    status: 'active',
  },
  {
    id: '3',
    name: 'Highway Branch',
    address: '789 Highway Rd, Outskirts',
    phone: '+1 234-567-8902',
    manager: 'Mike Manager',
    managerEmail: 'mike@jscarwash.com',
    status: 'inactive',
  },
]

export function BranchList() {
  const { isDeveloper } = useAuth()
  const [branches, setBranches] = useState<Branch[]>(dummyBranches)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [formData, setFormData] = useState<Partial<Branch>>({
    name: '',
    address: '',
    phone: '',
    manager: '',
    managerEmail: '',
    status: 'active',
  })

  const handleAdd = () => {
    setEditingBranch(null)
    setFormData({
      name: '',
      address: '',
      phone: '',
      manager: '',
      managerEmail: '',
      status: 'active',
    })
    setIsModalOpen(true)
  }

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch)
    setFormData(branch)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      setBranches(branches.filter((b) => b.id !== id))
    }
  }

  const handleSubmit = () => {
    if (editingBranch) {
      setBranches(branches.map((b) => (b.id === editingBranch.id ? { ...formData, id: b.id } as Branch : b)))
    } else {
      const newBranch: Branch = {
        ...formData,
        id: String(branches.length + 1),
      } as Branch
      setBranches([...branches, newBranch])
    }
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Branch List</h1>
          <p className="text-gray-600">Manage all branches and their information</p>
        </div>
        {isDeveloper() && (
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2 inline" />
            Add New Branch
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableHeaderCell>Branch Name</TableHeaderCell>
          <TableHeaderCell>Address</TableHeaderCell>
          <TableHeaderCell>Phone</TableHeaderCell>
          <TableHeaderCell>Manager</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableHeader>
        <TableBody>
          {branches.map((branch) => (
            <TableRow key={branch.id}>
              <TableCell className="font-medium">{branch.name}</TableCell>
              <TableCell>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  {branch.address}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-1" />
                  {branch.phone}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-1" />
                  <div>
                    <div className="font-medium">{branch.manager}</div>
                    <div className="text-xs text-gray-500">{branch.managerEmail}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={branch.status === 'active' ? 'success' : 'danger'}>
                  {branch.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(branch)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  {isDeveloper() && (
                    <Button variant="danger" size="sm" onClick={() => handleDelete(branch.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBranch ? 'Edit Branch' : 'Add New Branch'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Branch Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Manager Name"
            value={formData.manager}
            onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
          />
          <Input
            label="Manager Email"
            type="email"
            value={formData.managerEmail}
            onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
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
