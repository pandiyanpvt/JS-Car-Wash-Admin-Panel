import { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button, Badge, Input, Select } from '../../components/ui'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { userRolesApi, type UserRole as ApiUserRole } from '../../api/user-roles.api'

export function UserRoles() {
  const [roles, setRoles] = useState<ApiUserRole[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<ApiUserRole | null>(null)
  const [formData, setFormData] = useState<{ name: string; status: 'active' | 'inactive' }>({
    name: '',
    status: 'active',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await userRolesApi.getAll()
        setRoles(data)
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load roles')
      } finally {
        setLoading(false)
      }
    }
    fetchRoles()
  }, [])

  const openAdd = () => {
    setEditingRole(null)
    setFormData({ name: '', status: 'active' })
    setIsModalOpen(true)
  }

  const openEdit = (role: ApiUserRole) => {
    setEditingRole(role)
    setFormData({ name: role.name, status: role.status })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return
    try {
      await userRolesApi.delete(id)
      setRoles(roles.filter((r) => r.id !== id))
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete role')
    }
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      setError(null)
      if (!formData.name.trim()) {
        setError('Role name is required')
        return
      }

      if (editingRole) {
        const updated = await userRolesApi.update(editingRole.id, formData)
        setRoles(roles.map((r) => (r.id === editingRole.id ? updated : r)))
      } else {
        const created = await userRolesApi.create(formData)
        setRoles([...roles, created])
      }

      setIsModalOpen(false)
      setEditingRole(null)
      setFormData({ name: '', status: 'active' })
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save role')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">User Roles</h1>
          <p className="text-gray-600">Manage role definitions synced with the backend</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2 inline" />
          Add Role
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {loading && <div className="text-gray-600 text-sm">Loading roles...</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-800">{role.name}</div>
              <Badge variant={role.status === 'active' ? 'success' : 'danger'}>{role.status}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => openEdit(role)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(role.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
        {roles.length === 0 && !loading && (
          <div className="text-gray-600 text-sm">No roles found.</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingRole ? 'Edit Role' : 'Add Role'}
            </h2>
            <Input
              label="Role Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

