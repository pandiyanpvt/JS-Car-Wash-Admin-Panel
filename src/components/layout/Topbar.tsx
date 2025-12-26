import { Search, LogOut, User, ShieldCheck, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { usersApi, type User as ProfileUser } from '../../api/users.api'

interface SearchKeyword {
  keyword: string
  path: string
  category: string
}

const searchKeywords: SearchKeyword[] = [
  // Products
  { keyword: 'add product', path: '/products', category: 'Products' },
  { keyword: 'products', path: '/products', category: 'Products' },
  { keyword: 'product list', path: '/products', category: 'Products' },
  { keyword: 'add stock', path: '/products', category: 'Products' },
  { keyword: 'update stock', path: '/products', category: 'Products' },
  { keyword: 'low stock', path: '/products', category: 'Products' },
  { keyword: 'out of stock', path: '/products', category: 'Products' },
  { keyword: 'edit product', path: '/products', category: 'Products' },
  { keyword: 'delete product', path: '/products', category: 'Products' },
  
  // Categories
  { keyword: 'categories', path: '/product-categories', category: 'Categories' },
  { keyword: 'add category', path: '/product-categories', category: 'Categories' },
  { keyword: 'product categories', path: '/product-categories', category: 'Categories' },
  
  // Orders
  { keyword: 'orders', path: '/orders', category: 'Orders' },
  { keyword: 'view orders', path: '/orders', category: 'Orders' },
  { keyword: 'order list', path: '/orders', category: 'Orders' },
  { keyword: 'complete order', path: '/orders', category: 'Orders' },
  { keyword: 'pending orders', path: '/orders', category: 'Orders' },
  
  // Packages
  { keyword: 'packages', path: '/packages', category: 'Packages' },
  { keyword: 'add package', path: '/packages', category: 'Packages' },
  { keyword: 'our packages', path: '/packages', category: 'Packages' },
  { keyword: 'edit package', path: '/packages', category: 'Packages' },
  
  // Extra Works
  { keyword: 'extra works', path: '/extra-works', category: 'Extra Works' },
  { keyword: 'add extra work', path: '/extra-works', category: 'Extra Works' },
  { keyword: 'edit extra work', path: '/extra-works', category: 'Extra Works' },
  
  // Branches
  { keyword: 'branches', path: '/branches', category: 'Branches' },
  { keyword: 'add branch', path: '/branches', category: 'Branches' },
  { keyword: 'branch list', path: '/branches', category: 'Branches' },
  { keyword: 'edit branch', path: '/branches', category: 'Branches' },
  
  // Dashboard
  { keyword: 'dashboard', path: '/dashboard', category: 'Dashboard' },
  { keyword: 'home', path: '/dashboard', category: 'Dashboard' },
  { keyword: 'overview', path: '/dashboard', category: 'Dashboard' },
  
  // Contact Messages
  { keyword: 'contacts', path: '/contacts', category: 'Contacts' },
  { keyword: 'contact messages', path: '/contacts', category: 'Contacts' },
  { keyword: 'messages', path: '/contacts', category: 'Contacts' },
  
  // Gallery
  { keyword: 'gallery', path: '/gallery', category: 'Gallery' },
  { keyword: 'images', path: '/gallery', category: 'Gallery' },
  { keyword: 'upload image', path: '/gallery', category: 'Gallery' },
  
  // Reviews
  { keyword: 'reviews', path: '/reviews', category: 'Reviews' },
  { keyword: 'user reviews', path: '/reviews', category: 'Reviews' },
  
  // Users (Developer only)
  { keyword: 'users', path: '/users', category: 'Users' },
  { keyword: 'add user', path: '/users', category: 'Users' },
  { keyword: 'user list', path: '/users', category: 'Users' },
  { keyword: 'edit user', path: '/users', category: 'Users' },
  
  // Analytics (Developer only)
  { keyword: 'analytics', path: '/analytics', category: 'Analytics' },
  { keyword: 'reports', path: '/analytics', category: 'Analytics' },
  { keyword: 'statistics', path: '/analytics', category: 'Analytics' },
]

export function Topbar() {
  const { user, logout, isDeveloper } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [profile, setProfile] = useState<Partial<ProfileUser> | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const openProfileModal = async () => {
    if (!user?.id) return

    setShowDropdown(false)
    setIsProfileOpen(true)
    setProfileError(null)
    setProfileSuccess(null)
    setProfile(null)

    try {
      setProfileLoading(true)
      const data = await usersApi.getById(user.id)
      setProfile(data)
    } catch (err: any) {
      console.error('Failed to load profile', err)
      setProfileError(err?.response?.data?.message || 'Failed to load profile details')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleProfileChange = (field: keyof ProfileUser, value: unknown) => {
    setProfile((prev) => ({
      ...(prev || {}),
      [field]: value,
    }))
  }

  const handleSaveProfile = async () => {
    if (!user?.id || !profile) return
    setIsSaving(true)
    setProfileError(null)
    setProfileSuccess(null)

    try {
      const updated = await usersApi.update(user.id, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        isActive: profile.isActive,
      })
      setProfile(updated)
      setProfileSuccess('Profile updated successfully.')
    } catch (err: any) {
      console.error('Failed to update profile', err)
      setProfileError(err?.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  // Filter search keywords based on query and user role
  const filteredKeywords = searchKeywords.filter((item) => {
    const matchesQuery = item.keyword.toLowerCase().includes(searchQuery.toLowerCase())
    // Filter out developer-only pages for non-developers
    if (!isDeveloper() && (item.path === '/users' || item.path === '/analytics')) {
      return false
    }
    return matchesQuery
  })

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setShowSearchResults(e.target.value.length > 0)
  }

  const handleKeywordClick = (path: string) => {
    setSearchQuery('')
    setShowSearchResults(false)
    navigate(path)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setShowSearchResults(false)
  }

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <>
      <header className="glass-dark border-b border-white/20 sticky top-0 z-30 w-full">
        <div className="px-6 py-4 w-full">
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder="Search here..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery.length > 0 && setShowSearchResults(true)}
                  className="input-field pl-10 pr-10 w-full"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                
                {/* Search Results Dropdown */}
                {showSearchResults && filteredKeywords.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      {filteredKeywords.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleKeywordClick(item.path)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                              {item.keyword}
                            </p>
                            <p className="text-xs text-gray-500">{item.category}</p>
                          </div>
                          <Search className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {showSearchResults && filteredKeywords.length === 0 && searchQuery.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-4 text-center text-sm text-gray-500">
                      No results found for "{searchQuery}"
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - User Menu */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-3 glass rounded-lg px-3 py-2 hover:bg-white/50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-600">{user?.role}</p>
                  </div>
                </button>

                {showDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 glass-dark rounded-lg shadow-xl z-20 border border-white/20">
                      <div className="p-2">
                        <button
                          onClick={openProfileModal}
                          className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/50 transition-colors text-left"
                        >
                          <User className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">Profile</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-600">Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <Modal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title="Profile"
        size="lg"
      >
        {profileLoading && !profile && (
          <div className="text-center text-gray-600 py-6">Loading profile...</div>
        )}

        {!profileLoading && profile && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                  {profile.fullName?.charAt(0).toUpperCase() || user?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">{profile.fullName}</p>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 font-medium">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      {profile.roleName}
                    </span>
                    {profile.isVerified && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 md:text-right">
                <div>User ID: <span className="font-mono">{profile.id}</span></div>
                {profile.createdAt && (
                  <div>
                    Joined:{' '}
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                )}
              </div>
            </div>

            {profileError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded text-sm">
                {profileSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={profile.firstName || ''}
                onChange={(e) => handleProfileChange('firstName', e.target.value)}
              />
              <Input
                label="Last Name"
                value={profile.lastName || ''}
                onChange={(e) => handleProfileChange('lastName', e.target.value)}
              />
              <Input
                label="Email"
                value={profile.email || ''}
                disabled
              />
              <Input
                label="Phone Number"
                value={profile.phoneNumber || ''}
                disabled
              />
              <Input
                label="Username"
                value={profile.userName || ''}
                disabled
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <button
                  type="button"
                  onClick={() => handleProfileChange('isActive', !profile.isActive)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    profile.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-gray-50 text-gray-500 border-gray-200'
                  }`}
                >
                  {profile.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setIsProfileOpen(false)}
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={handleSaveProfile}
                isLoading={isSaving}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

