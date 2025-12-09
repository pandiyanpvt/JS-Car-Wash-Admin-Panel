import { useEffect, useState } from 'react'
import { Input, Button, Badge } from '../../components/ui'
import { Card } from '../../components/ui/Card'
import { usersApi } from '../../api/users.api'
import { useAuth } from '../../context/AuthContext'

type ProfileForm = {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  userName: string
  roleName: string
  password: string
}

export function Profile() {
  const { user } = useAuth()
  const [form, setForm] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    userName: '',
    roleName: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    try {
      setIsLoading(true)
      setError(null)
      const data = await usersApi.getById(user.id)
      setForm({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        userName: data.userName,
        roleName: data.roleName,
        password: '',
      })
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!user) return
    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)
      const payload: any = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        userName: form.userName,
      }
      if (form.password) {
        payload.password = form.password
      }
      const updated = await usersApi.update(user.id, payload)
      setSuccess('Profile updated successfully')
      setForm((prev) => ({
        ...prev,
        password: '',
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        phoneNumber: updated.phoneNumber,
        userName: updated.userName,
        roleName: updated.roleName,
      }))
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">You are not logged in</h2>
            <p className="text-gray-600">Please log in to view your profile.</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>
        <Badge variant="info">{form.roleName || user.role}</Badge>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <Card>
        <div className="p-6 space-y-4">
          {isLoading ? (
            <p className="text-gray-600">Loading profile...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
                <Input
                  label="Last Name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <Input
                  label="Phone Number"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                />
                <Input
                  label="Username"
                  value={form.userName}
                  onChange={(e) => setForm({ ...form, userName: e.target.value })}
                />
                <Input label="Role" value={form.roleName} disabled />
              </div>
              <Input
                label="Password (leave blank to keep current)"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}


