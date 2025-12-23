import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input, Select, ConfirmDialog } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Plus, Edit, Trash2, MapPin, Phone, Mail } from 'lucide-react'
import { branchesApi } from '../../api/branches.api'
import type { Branch } from '../../api/branches.api'

export function BranchList() {
  const { isDeveloper } = useAuth()
  const [branches, setBranches] = useState<Branch[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<Branch>>({
    name: '',
    address: '',
    phone: '',
    email: '',
    status: 'active',
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

  // Fetch branches on component mount
  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await branchesApi.getAll()
      setBranches(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch branches')
      console.error('Error fetching branches:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingBranch(null)
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
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
    setConfirmState({
      isOpen: true,
      message: 'Are you sure you want to delete this branch?',
      onConfirm: async () => {
        try {
          await branchesApi.delete(id)
          setBranches(branches.filter((b) => b.id !== id))
        } catch (err: any) {
          alert(err.response?.data?.message || 'Failed to delete branch')
          console.error('Error deleting branch:', err)
        }
      },
    })
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      if (editingBranch) {
        // When editing, exclude name and status from the update
        const { name, status, ...updateData } = formData
        const updatedBranch = await branchesApi.update(editingBranch.id, updateData)
        setBranches(branches.map((b) => (b.id === editingBranch.id ? updatedBranch : b)))
      } else {
        const newBranch = await branchesApi.create(formData as Omit<Branch, 'id'>)
        setBranches([...branches, newBranch])
      }
      setIsModalOpen(false)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save branch')
      console.error('Error saving branch:', err)
    } finally {
      setIsSubmitting(false)
    }
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

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading branches...</p>
        </div>
      ) : branches.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No branches found</p>
        </div>
      ) : (
        <Table>
        <TableHeader>
          <TableHeaderCell>Branch Name</TableHeaderCell>
          <TableHeaderCell>Address</TableHeaderCell>
          <TableHeaderCell>Phone</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
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
                  <Mail className="w-4 h-4 mr-1" />
                  <div className="text-xs text-gray-500">{branch.email || 'N/A'}</div>
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
      )}

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
            disabled={!!editingBranch}
            className={editingBranch ? 'bg-gray-100 cursor-not-allowed' : ''}
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
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {!editingBranch && (
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
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
