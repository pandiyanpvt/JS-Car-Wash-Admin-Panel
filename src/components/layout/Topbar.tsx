import { Search, LogOut, User, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { usersApi, type User as ProfileUser } from '../../api/users.api'

export function Topbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [profile, setProfile] = useState<Partial<ProfileUser> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

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

  return (
    <>
      <header className="glass-dark border-b border-white/20 sticky top-0 z-30 w-full">
        <div className="px-6 py-4 w-full">
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="input-field pl-10 w-full"
                />
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

