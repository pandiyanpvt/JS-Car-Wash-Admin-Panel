import { useEffect, useState } from 'react'
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Button, Modal, Input, Select, Badge } from '../../components/ui'
import { Plus, Edit } from 'lucide-react'
import type { UserRole } from '../../context/AuthContext'
import { usersApi, type User as ApiUser } from '../../api/users.api'
import { userRolesApi, type UserRole as ApiUserRole } from '../../api/user-roles.api'
import { format } from 'date-fns'

type UserForm = {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  userName: string
  password: string
  roleId: string
  isActive: boolean
}

export function Users() {
  const [users, setUsers] = useState<ApiUser[]>([])
  const [roles, setRoles] = useState<ApiUserRole[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null)
  const [formData, setFormData] = useState<UserForm>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    userName: '',
    password: '',
    roleId: '',
    isActive: true,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [fetchedUsers, fetchedRoles] = await Promise.all([usersApi.getAll(), userRolesApi.getAll()])
        setUsers(fetchedUsers)
        setRoles(fetchedRoles.filter((r) => r.status === 'active'))
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!formData.roleId && roles.length > 0) {
      setFormData((prev) => ({ ...prev, roleId: roles[0].id }))
    }
  }, [roles])

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      userName: '',
      password: '',
      roleId: roles[0]?.id || '',
      isActive: true,
    })
  }

  const handleAdd = () => {
    setEditingUser(null)
    resetForm()
    setIsModalOpen(true)
  }

  const handleEdit = (user: ApiUser) => {
    setEditingUser(user)
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      userName: user.userName,
      password: '',
      roleId: user.roleId,
      isActive: user.isActive,
    })
    setIsModalOpen(true)
  }

  const handleToggleActive = (id: string) => {
    const user = users.find((u) => u.id === id)
    if (!user) return
    const updated = { isActive: !user.isActive }
    usersApi
      .update(id, updated)
      .then((res) => {
        setUsers(users.map((u) => (u.id === id ? res : u)))
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to update user status')
      })
  }

  const handleSubmit = async () => {
    try {
      setError(null)
      if (editingUser) {
        const payload = { ...formData }
        if (!payload.password) {
          delete (payload as any).password
        }
        const updated = await usersApi.update(editingUser.id, payload)
        setUsers(users.map((u) => (u.id === editingUser.id ? updated : u)))
      } else {
        if (!formData.password) {
          setError('Password is required for new users')
          return
        }
        const created = await usersApi.create(formData)
        setUsers([...users, created])
      }
      setIsModalOpen(false)
      resetForm()
      setEditingUser(null)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save user')
    }
  }

  const getRoleBadge = (role: UserRole) => {
    const variants: Record<UserRole, 'success' | 'warning' | 'info' | 'default'> = {
      Developer: 'info',
      Admin: 'success',
      Manager: 'warning',
      Worker: 'default',
    }
    return <Badge variant={variants[role]}>{role}</Badge>
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    try {
      return format(new Date(dateString), 'yyyy-MM-dd')
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Users</h1>
          <p className="text-gray-600">Manage users and their roles</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2 inline" />
          Add User
        </Button>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}
      {loading && <div className="text-gray-600 text-sm">Loading users...</div>}

      <Table>
        <TableHeader>
          <TableHeaderCell>User</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Created</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.fullName}</span>
                    <span className="text-xs text-gray-500">@{user.userName}</span>
                    <span className="text-xs text-gray-500">{user.phoneNumber}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{getRoleBadge(user.roleName)}</TableCell>
              <TableCell>
                <Badge variant={user.isActive ? 'success' : 'danger'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-500">{formatDate(user.createdAt)}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={user.isActive ? 'danger' : 'primary'}
                    size="sm"
                    onClick={() => handleToggleActive(user.id)}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
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
        title={editingUser ? 'Edit User' : 'Add User'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
          <Input
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
          <Select
            label="Role"
            value={formData.roleId}
            onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
            options={roles.map((role) => ({ value: role.id, label: role.name }))}
          />
          <Select
            label="Status"
            value={formData.isActive ? 'active' : 'inactive'}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          />
          <Input
            label="Username"
            value={formData.userName}
            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
          />
          <Input
            label={editingUser ? 'Password (leave blank to keep current)' : 'Password'}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={editingUser ? '********' : ''}
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

