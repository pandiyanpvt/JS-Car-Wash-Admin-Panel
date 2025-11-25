import { useState } from 'react'
import { Alert, Box, Button, TextField, Typography, Link as MuiLink } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { registerAdmin } from '../../api/auth'
import './AuthPage.css'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      setError('All fields are required.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Please enter a valid email.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const message = await registerAdmin({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      setSuccess(message)
      setTimeout(() => navigate('/login', { replace: true }), 1200)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Registration failed.')
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
            <h2 className="auth-welcome-subtitle">Join us today</h2>
            <h1 className="auth-welcome-title">
              CREATE ACCOUNT
              <span className="auth-welcome-underline"></span>
            </h1>
            <p className="auth-welcome-text">
              Start managing your car wash business with our comprehensive admin dashboard. Sign up to get started.
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
                <h2 className="auth-form-title">Create Account</h2>
                <p className="auth-form-subtitle">Sign up to get started</p>
                
                {error && (
                  <Alert severity="error" className="auth-alert">
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" className="auth-alert">
                    {success}
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="auth-form-group">
                    <label htmlFor="name">Full Name</label>
                    <TextField
                      id="name"
                      value={form.name}
                      onChange={handleChange('name')}
                      placeholder="Enter your full name"
                      required
                      fullWidth
                      variant="outlined"
                    />
                  </div>

                  <div className="auth-form-group">
                    <label htmlFor="email">Email Address</label>
                    <TextField
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange('email')}
                      placeholder="Enter your email"
                      required
                      fullWidth
                      variant="outlined"
                    />
                  </div>

                  <div className="auth-form-group">
                    <label htmlFor="password">Password</label>
                    <TextField
                      id="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange('password')}
                      placeholder="Create a password"
                      required
                      fullWidth
                      variant="outlined"
                    />
                  </div>

                  <div className="auth-form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <TextField
                      id="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={handleChange('confirmPassword')}
                      placeholder="Confirm your password"
                      required
                      fullWidth
                      variant="outlined"
                    />
                  </div>

                  <div className="auth-form-options">
                    <label className="auth-checkbox">
                      <input type="checkbox" required />
                      <span>I agree to the Terms & Conditions</span>
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    className="auth-submit-btn"
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>

                <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
                  Already have an account?{' '}
                  <MuiLink
                    component={Link}
                    to="/login"
                    className="auth-link"
                  >
                    Login
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
