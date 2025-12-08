import { useState } from 'react'
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Button, Modal, Input, Select, Badge } from '../../components/ui'
import { Plus, Edit, User as UserIcon, Shield } from 'lucide-react'
import type { UserRole } from '../../context/AuthContext'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: string
}

const dummyUsers: User[] = [
  {
    id: '1',
    name: 'Developer User',
    email: 'developer@jscarwash.com',
    role: 'Developer',
    isActive: true,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Admin User',
    email: 'admin@jscarwash.com',
    role: 'Admin',
    isActive: true,
    createdAt: '2024-01-02',
  },
  {
    id: '3',
    name: 'Manager User',
    email: 'manager@jscarwash.com',
    role: 'Manager',
    isActive: true,
    createdAt: '2024-01-03',
  },
  {
    id: '4',
    name: 'Worker User',
    email: 'worker@jscarwash.com',
    role: 'Worker',
    isActive: false,
    createdAt: '2024-01-04',
  },
]

export function Users() {
  const [users, setUsers] = useState<User[]>(dummyUsers)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'Worker',
    isActive: true,
  })

  const handleAdd = () => {
    setEditingUser(null)
    setFormData({ name: '', email: '', role: 'Worker', isActive: true })
    setIsModalOpen(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData(user)
    setIsModalOpen(true)
  }

  const handleToggleActive = (id: string) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)))
  }

  const handleSubmit = () => {
    if (editingUser) {
      setUsers(users.map((u) => (u.id === editingUser.id ? { ...formData, id: u.id, createdAt: u.createdAt } as User : u)))
    } else {
      const newUser: User = {
        ...formData,
        id: String(users.length + 1),
        createdAt: new Date().toISOString().split('T')[0],
      } as User
      setUsers([...users, newUser])
    }
    setIsModalOpen(false)
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
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{user.name}</span>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{getRoleBadge(user.role)}</TableCell>
              <TableCell>
                <Badge variant={user.isActive ? 'success' : 'danger'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-500">{user.createdAt}</TableCell>
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
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Select
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            options={[
              { value: 'Developer', label: 'Developer' },
              { value: 'Admin', label: 'Admin' },
              { value: 'Manager', label: 'Manager' },
              { value: 'Worker', label: 'Worker' },
            ]}
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

