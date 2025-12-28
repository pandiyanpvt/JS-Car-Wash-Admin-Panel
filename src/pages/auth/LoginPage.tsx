import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../api/auth.api'
import { Lock, Mail, X, ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react'

type ForgotPasswordStep = 'email' | 'reset' | null

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordStep, setForgotPasswordStep] = useState<ForgotPasswordStep>(null)
  const [forgotEmail, setForgotEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [forgotPasswordError, setForgotPasswordError] = useState('')
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('')
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        navigate('/dashboard')
      } else {
        setError('Invalid email or password')
      }
    } catch (err: any) {
      // Display backend error message if available
      const errorMessage = err?.response?.data?.message || err?.message || 'An error occurred. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotPasswordError('')
    setForgotPasswordSuccess('')
    setForgotPasswordLoading(true)

    try {
      if (forgotPasswordStep === 'email') {
        await authApi.forgotPassword({ email_address: forgotEmail })
        setForgotPasswordSuccess('OTP has been sent to your email address')
        setForgotPasswordStep('reset')
      } else if (forgotPasswordStep === 'reset') {
        if (newPassword !== confirmPassword) {
          setForgotPasswordError('Passwords do not match')
          setForgotPasswordLoading(false)
          return
        }
        if (newPassword.length < 6) {
          setForgotPasswordError('Password must be at least 6 characters long')
          setForgotPasswordLoading(false)
          return
        }
        await authApi.resetPassword({
          email_address: forgotEmail,
          otp,
          password: newPassword,
        })
        setForgotPasswordSuccess('Password reset successfully! You can now login with your new password.')
        setTimeout(() => {
          setShowForgotPassword(false)
          setForgotPasswordStep(null)
          setForgotEmail('')
          setOtp('')
          setNewPassword('')
          setConfirmPassword('')
          setShowNewPassword(false)
          setShowConfirmPassword(false)
          setForgotPasswordError('')
          setForgotPasswordSuccess('')
        }, 2000)
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'An error occurred. Please try again.'
      setForgotPasswordError(errorMessage)
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  const openForgotPassword = () => {
    setShowForgotPassword(true)
    setForgotPasswordStep('email')
    setForgotEmail('')
    setOtp('')
    setNewPassword('')
    setConfirmPassword('')
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setForgotPasswordError('')
    setForgotPasswordSuccess('')
  }

  const closeForgotPassword = () => {
    setShowForgotPassword(false)
    setForgotPasswordStep(null)
    setForgotEmail('')
    setOtp('')
    setNewPassword('')
    setConfirmPassword('')
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setForgotPasswordError('')
    setForgotPasswordSuccess('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="glass-dark rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <img
                src="/images/js-logo.png"
                alt="JS Car Wash & Detailing"
                className="w-28 h-28 object-contain drop-shadow-lg"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">JS Car Wash</h1>
            <p className="text-gray-600">Admin Panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="admin@jscarwash.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={openForgotPassword}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="glass-dark rounded-2xl p-8 shadow-2xl w-full max-w-md relative">
            <button
              onClick={closeForgotPassword}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl mb-4 shadow-lg">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
              <p className="text-gray-600 text-sm">
                {forgotPasswordStep === 'email'
                  ? 'Enter your email address to receive an OTP'
                  : 'Enter the OTP sent to your email and your new password'}
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-6">
              {forgotPasswordError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {forgotPasswordError}
                </div>
              )}

              {forgotPasswordSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {forgotPasswordSuccess}
                </div>
              )}

              {forgotPasswordStep === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </div>
              )}

              {forgotPasswordStep === 'reset' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OTP Code
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="input-field pl-10"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input-field pl-10 pr-10"
                        placeholder="Enter new password"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input-field pl-10 pr-10"
                        placeholder="Confirm new password"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordStep('email')
                      setOtp('')
                      setNewPassword('')
                      setConfirmPassword('')
                      setShowNewPassword(false)
                      setShowConfirmPassword(false)
                      setForgotPasswordError('')
                      setForgotPasswordSuccess('')
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to email
                  </button>
                </>
              )}

              <button
                type="submit"
                disabled={forgotPasswordLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {forgotPasswordLoading
                  ? 'Processing...'
                  : forgotPasswordStep === 'email'
                  ? 'Send OTP'
                  : 'Reset Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

