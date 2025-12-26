import { useEffect, useState } from 'react'
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table'
import { Button, Modal, Input, Select, Badge } from '../../components/ui'
import { Plus, Edit } from 'lucide-react'
import type { UserRole } from '../../context/AuthContext'
import { useAuth } from '../../context/AuthContext'
import { usersApi, type User as ApiUser } from '../../api/users.api'
import { userRolesApi, type UserRole as ApiUserRole } from '../../api/user-roles.api'
import { branchesApi, type Branch } from '../../api/branches.api'
import { format } from 'date-fns'

type UserForm = {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  userName: string
  password: string
  roleId: string
  branchId?: string
  isActive: boolean
  verifyEmailImmediately: boolean
}

export function Users() {
  const { isDeveloper } = useAuth()
  const [users, setUsers] = useState<ApiUser[]>([])
  const [roles, setRoles] = useState<ApiUserRole[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
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
    branchId: undefined,
    isActive: true,
    verifyEmailImmediately: true,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [fetchedUsers, fetchedRoles, fetchedBranches] = await Promise.all([
          usersApi.getAll(),
          userRolesApi.getAll(),
          branchesApi.getAll(),
        ])
        setUsers(fetchedUsers)
        setRoles(fetchedRoles.filter((r) => r.status === 'active'))
        setBranches(fetchedBranches.filter((b) => b.status === 'active'))
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
      branchId: undefined,
      isActive: true,
      verifyEmailImmediately: true,
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
      branchId: user.adminBranchId, // Include current branch assignment
      isActive: user.isActive,
      verifyEmailImmediately: true, // Not used in edit mode, but required by type
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
      setSubmitting(true)
      
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || 
          !formData.phoneNumber || !formData.userName || !formData.roleId) {
        setError('Please fill in all required fields')
        setSubmitting(false)
        return
      }
      
      // Check if role is admin (role_id=2) and branch_id is required
      const selectedRole = roles.find((r) => r.id === formData.roleId)
      const isAdminRole = selectedRole?.name?.toLowerCase() === 'admin' || formData.roleId === '2'
      
      if (!editingUser && isAdminRole && !formData.branchId) {
        setError('Branch is required for admin users')
        setSubmitting(false)
        return
      }
      
      if (editingUser) {
        const payload: any = { ...formData }
        if (!payload.password) {
          delete payload.password
        }
        // For developers editing admin users, allow branch assignment update
        const selectedRole = roles.find((r) => r.id === formData.roleId)
        const isAdminRole = selectedRole?.name?.toLowerCase() === 'admin' || formData.roleId === '2'
        if (isDeveloper() && isAdminRole) {
          // Include branchId for developers editing admin users
          // If branchId is empty string or undefined, set to null to remove assignment
          if (formData.branchId === '' || !formData.branchId) {
            payload.branchId = null
          } else {
            payload.branchId = formData.branchId
          }
        } else {
          // For non-developers or non-admin users, don't send branchId
          delete payload.branchId
        }
        const updated = await usersApi.update(editingUser.id, payload)
        // Refetch the user to ensure we have the latest branch assignment data
        const refreshedUser = await usersApi.getById(editingUser.id)
        setUsers(users.map((u) => (u.id === editingUser.id ? refreshedUser : u)))
      } else {
        if (!formData.password) {
          setError('Password is required for new users')
          setSubmitting(false)
          return
        }
        const created = await usersApi.create(formData)
        
        // If "Verify email immediately" is checked, verify the user's email
        if (formData.verifyEmailImmediately) {
          try {
            const verified = await usersApi.verifyEmail(created.id)
            setUsers([...users, verified])
          } catch (verifyErr: any) {
            // If verification fails, still add the user but show a warning
            console.warn('Failed to verify email immediately:', verifyErr)
            setUsers([...users, created])
            // Don't show error as user was created successfully
          }
        } else {
          setUsers([...users, created])
        }
      }
      setIsModalOpen(false)
      resetForm()
      setEditingUser(null)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save user')
    } finally {
      setSubmitting(false)
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

      {error && !isModalOpen && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}
      {loading && <div className="text-gray-600 text-sm">Loading users...</div>}

      <Table>
        <TableHeader>
          <TableHeaderCell>User</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
          <TableHeaderCell>Branch Assignment</TableHeaderCell>
          <TableHeaderCell>Active Status</TableHeaderCell>
          <TableHeaderCell>Verification</TableHeaderCell>
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
                {user.roleName === 'Admin' && user.adminBranchId ? (
                  <div className="flex flex-col gap-1">
                    <Badge variant="info" className="w-fit">
                      {user.adminBranchName || `Branch ${user.adminBranchId}`}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Assigned to specific branch
                    </span>
                  </div>
                ) : user.roleName === 'Admin' ? (
                  <div className="flex flex-col gap-1">
                    <Badge variant="default" className="w-fit">
                      All Branches
                    </Badge>
                    <span className="text-xs text-gray-500">
                      No branch restriction
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant={user.isActive ? 'success' : 'danger'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-xs font-semibold text-gray-700">
                      ({user.isActive ? 'Enabled' : 'Disabled'})
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Status Value:</span>{' '}
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                      {String(user.isActive)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {user.isActive ? '✓ Account is enabled and operational' : '✗ Account is disabled'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge variant={user.isVerified ? 'success' : 'warning'}>
                    {user.isVerified ? 'Verified' : 'Not Verified'}
                  </Badge>
                  {user.isVerified && user.verifiedAt && (
                    <span className="text-xs text-gray-500">
                      Verified {formatDate(user.verifiedAt)}
                    </span>
                  )}
                  {!user.isVerified && (
                    <span className="text-xs text-gray-500">Email not verified</span>
                  )}
                </div>
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
            required
          />
          <Input
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
          <Select
            label="Role"
            value={formData.roleId}
            onChange={(e) => {
              const newRoleId = e.target.value
              const selectedRole = roles.find((r) => r.id === newRoleId)
              const isAdminRole = selectedRole?.name?.toLowerCase() === 'admin' || newRoleId === '2'
              setFormData({ 
                ...formData, 
                roleId: newRoleId,
                // Clear branchId if role is changed from admin to non-admin
                branchId: isAdminRole ? formData.branchId : undefined
              })
            }}
            options={roles.map((role) => ({ value: role.id, label: role.name }))}
          />
          {(() => {
            const selectedRole = roles.find((r) => r.id === formData.roleId)
            const isAdminRole = selectedRole?.name?.toLowerCase() === 'admin' || formData.roleId === '2'
            // Show branch selection for:
            // 1. Creating new admin users
            // 2. Developers editing admin users
            const showBranchSelect = isAdminRole && (!editingUser || (editingUser && isDeveloper()))
            return showBranchSelect ? (
              <div>
                <Select
                  label="Branch Assignment"
                  value={formData.branchId || ''}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value || undefined })}
                  options={[
                    { value: '', label: 'No Branch (All Branches)' },
                    ...branches.map((branch) => ({ value: branch.id, label: branch.name }))
                  ]}
                  required={!editingUser}
                />
                {editingUser && (
                  <p className="mt-1 text-xs text-gray-500">
                    Select "No Branch (All Branches)" to remove branch assignment, or choose a specific branch to assign.
                  </p>
                )}
              </div>
            ) : null
          })()}
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
            required
          />
          <Input
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            required
          />
          <Input
            label="Username"
            value={formData.userName}
            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
            required
          />
          <Input
            label={editingUser ? 'Password (leave blank to keep current)' : 'Password'}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={editingUser ? '********' : ''}
            required={!editingUser}
          />
          
          {!editingUser && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="verifyEmailImmediately"
                  checked={formData.verifyEmailImmediately}
                  onChange={(e) => setFormData({ ...formData, verifyEmailImmediately: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="verifyEmailImmediately" className="text-sm text-gray-700 cursor-pointer">
                  Verify email immediately (skip OTP verification)
                </label>
              </div>
              <p className="text-xs text-gray-500 ml-6">
                {formData.verifyEmailImmediately
                  ? 'User will be verified immediately. An OTP email will still be sent for reference.'
                  : 'User will need to verify their email using the OTP sent to their email address.'}
              </p>
            </div>
          )}
          
          {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

