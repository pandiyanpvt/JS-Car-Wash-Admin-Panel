import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button, Badge } from '../../components/ui'
import { Shield, Check, X } from 'lucide-react'
import type { UserRole as RoleType } from '../../context/AuthContext'

interface Permission {
  id: string
  name: string
  description: string
  feature: string
}

interface RolePermissions {
  role: RoleType
  permissions: Record<string, boolean>
}

const permissions: Permission[] = [
  { id: '1', name: 'View Dashboard', description: 'Access dashboard page', feature: 'dashboard' },
  { id: '2', name: 'Manage Branches', description: 'View and edit branches', feature: 'branches' },
  { id: '3', name: 'Create Branches', description: 'Add new branches', feature: 'branches_create' },
  { id: '4', name: 'Delete Branches', description: 'Remove branches', feature: 'branches_delete' },
  { id: '5', name: 'Manage Packages', description: 'View and edit packages', feature: 'packages' },
  { id: '6', name: 'Manage Products', description: 'View and edit products', feature: 'products' },
  { id: '7', name: 'View Orders', description: 'Access orders page', feature: 'orders' },
  { id: '8', name: 'Manage Orders', description: 'Update order status', feature: 'orders_manage' },
  { id: '9', name: 'View Analytics', description: 'Access analytics page', feature: 'analytics' },
  { id: '10', name: 'Manage Users', description: 'View and edit users', feature: 'users' },
  { id: '11', name: 'Manage Roles', description: 'Configure role permissions', feature: 'roles' },
  { id: '12', name: 'View Gallery', description: 'Access gallery page', feature: 'gallery' },
]

const initialRolePermissions: RolePermissions[] = [
  {
    role: 'Developer',
    permissions: {
      dashboard: true,
      branches: true,
      branches_create: true,
      branches_delete: true,
      packages: true,
      products: true,
      orders: true,
      orders_manage: true,
      analytics: true,
      users: true,
      roles: true,
      gallery: true,
    },
  },
  {
    role: 'Admin',
    permissions: {
      dashboard: true,
      branches: true,
      branches_create: false,
      branches_delete: false,
      packages: true,
      products: true,
      orders: true,
      orders_manage: true,
      analytics: false,
      users: true,
      roles: false,
      gallery: true,
    },
  },
  {
    role: 'Manager',
    permissions: {
      dashboard: true,
      branches: true,
      branches_create: false,
      branches_delete: false,
      packages: true,
      products: true,
      orders: true,
      orders_manage: true,
      analytics: false,
      users: false,
      roles: false,
      gallery: true,
    },
  },
  {
    role: 'Worker',
    permissions: {
      dashboard: true,
      branches: false,
      branches_create: false,
      branches_delete: false,
      packages: false,
      products: false,
      orders: true,
      orders_manage: false,
      analytics: false,
      users: false,
      roles: false,
      gallery: false,
    },
  },
]

export function UserRoles() {
  const [rolePermissions, setRolePermissions] = useState<RolePermissions[]>(initialRolePermissions)

  const togglePermission = (role: RoleType, feature: string) => {
    setRolePermissions(
      rolePermissions.map((rp) =>
        rp.role === role
          ? {
              ...rp,
              permissions: {
                ...rp.permissions,
                [feature]: !rp.permissions[feature],
              },
            }
          : rp
      )
    )
  }

  const groupedPermissions = permissions.reduce((acc, perm) => {
    const featureGroup = perm.feature.split('_')[0]
    if (!acc[featureGroup]) {
      acc[featureGroup] = []
    }
    acc[featureGroup].push(perm)
    return acc
  }, {} as Record<string, Permission[]>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">User Roles & Permissions</h1>
        <p className="text-gray-600">Configure role-based access control</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {rolePermissions.map((rolePerm) => (
          <Card key={rolePerm.role} className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 text-white mb-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <h3 className="text-lg font-bold">{rolePerm.role}</h3>
              </div>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {Object.entries(groupedPermissions).map(([group, groupPerms]) => (
                <div key={group}>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    {group}
                  </h4>
                  <div className="space-y-2">
                    {groupPerms.map((perm) => {
                      const hasPermission = rolePerm.permissions[perm.feature] || false
                      return (
                        <div
                          key={perm.id}
                          className="flex items-start justify-between p-2 rounded-lg hover:bg-white/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">{perm.name}</p>
                            <p className="text-xs text-gray-500">{perm.description}</p>
                          </div>
                          <button
                            onClick={() => togglePermission(rolePerm.role, perm.feature)}
                            className={`ml-2 p-1.5 rounded-lg transition-colors ${
                              hasPermission
                                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            {hasPermission ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">
                  {Object.values(rolePerm.permissions).filter(Boolean).length}
                </span>{' '}
                permissions enabled
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

