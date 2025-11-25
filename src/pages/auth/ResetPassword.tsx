import { useState } from 'react'
import { Alert, Box, Button, TextField, Typography, Link as MuiLink } from '@mui/material'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../../api/auth'
import './AuthPage.css'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFeedback(null)

    if (!token) {
      setFeedback({ type: 'error', message: 'Reset token is missing or invalid.' })
      return
    }
    if (!form.password || !form.confirmPassword) {
      setFeedback({ type: 'error', message: 'Please fill in both password fields.' })
      return
    }
    if (form.password !== form.confirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match.' })
      return
    }

    setLoading(true)
    try {
      const message = await resetPassword({ token, password: form.password })
      setFeedback({ type: 'success', message })
      setTimeout(() => navigate('/login', { replace: true }), 1500)
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || err?.message || 'Unable to reset password.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page-container">
        {/* Left Welcome Panel */}
        <div className="auth-welcome-panel">
          <div className="auth-welcome-content">
            <div className="auth-logo-container">
              <img
                src="/LOGO.png"
                alt="JS Car Wash & Detailing Logo"
                className="auth-logo-img"
              />
            </div>
            <h2 className="auth-welcome-subtitle">Reset your password</h2>
            <h1 className="auth-welcome-title">
              NEW PASSWORD
              <span className="auth-welcome-underline"></span>
            </h1>
            <p className="auth-welcome-text">
              Enter your new password below. Make sure it's strong and secure to keep your account protected.
            </p>
          </div>
          <div className="auth-welcome-background">
            <div className="auth-bg-grid"></div>
            <div className="auth-bg-waves"></div>
            <div className="auth-bg-dots"></div>
            <div className="auth-bg-circles"></div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="auth-form-panel">
          <div className="auth-container">
            <div className="auth-content">
              <div className="auth-form-container">
                <h2 className="auth-form-title">Reset Password</h2>
                <p className="auth-form-subtitle">Enter your new password</p>
                
                {!token && (
                  <Alert severity="warning" className="auth-alert">
                    This link is invalid or expired. Please request a new password reset email.
                  </Alert>
                )}
                {feedback && (
                  <Alert severity={feedback.type} className="auth-alert">
                    {feedback.message}
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="auth-form-group">
                    <label htmlFor="password">New Password</label>
                    <TextField
                      id="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange('password')}
                      placeholder="Enter new password"
                      required
                      fullWidth
                      variant="outlined"
                    />
                  </div>

                  <div className="auth-form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <TextField
                      id="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={handleChange('confirmPassword')}
                      placeholder="Confirm new password"
                      required
                      fullWidth
                      variant="outlined"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="auth-submit-btn"
                    disabled={loading || !token}
                  >
                    {loading ? 'Updating...' : 'Reset Password'}
                  </button>
                </form>

                <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
                  Back to{' '}
                  <MuiLink
                    component={Link}
                    to="/login"
                    className="auth-link"
                  >
                    login
                  </MuiLink>
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
