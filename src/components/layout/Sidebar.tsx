import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Package,
  Wrench,
  ShoppingBag,
  FolderTree,
  MessageSquare,
  Image,
  ShoppingCart,
  Star,
  BarChart3,
  Users,
  FileText,
  Shield,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
  roles?: ('Admin' | 'Developer' | 'Manager' | 'Worker')[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Branches', path: '/branches', icon: Building2 },
  { label: 'Our Packages', path: '/packages', icon: Package },
  { label: 'Extra Works', path: '/extra-works', icon: Wrench },
  { label: 'Products', path: '/products', icon: ShoppingBag },
  { label: 'Categories', path: '/product-categories', icon: FolderTree },
  { label: 'Contact Messages', path: '/contact-messages', icon: MessageSquare },
  { label: 'Gallery', path: '/gallery', icon: Image },
  { label: 'Orders', path: '/orders', icon: ShoppingCart },
  { label: 'Reviews', path: '/reviews', icon: Star },
  { label: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['Developer'] },
  { label: 'Users', path: '/users', icon: Users },
  { label: 'User Logs', path: '/user-logs', icon: FileText },
  { label: 'User Roles', path: '/user-roles', icon: Shield },
]

export function Sidebar() {
  const { user, hasRole } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true
    return item.roles.some((role) => hasRole(role))
  })

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass rounded-lg shadow-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:fixed inset-y-0 left-0 z-40
          w-64 glass-dark
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img 
                  src="/images/js-logo.png" 
                  alt="JS Car Wash Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">JS Car Wash</h2>
                <p className="text-xs text-gray-600">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white/50 hover:text-primary-600'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-white/20">
            <div className="flex items-center space-x-3 px-4 py-3 glass rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                <p className="text-xs text-gray-600 truncate">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}

