import { useState, useEffect } from 'react'
import { Box, Button, TextField, Typography, Alert, Link as MuiLink } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { loginAdmin } from '../../api/auth'
import './AuthPage.css'

const isAuthenticated = () => {
  try {
    const stored = localStorage.getItem('adminAuth')
    if (!stored) return false
    const { token } = JSON.parse(stored)
    return Boolean(token)
  } catch {
    return false
  }
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Note: Removed auto-redirect to allow login page to always be accessible
  // Users can manually navigate to protected routes after login

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.')
      return
    }
    setLoading(true)
    try {
      const { message } = await loginAdmin({ email: email.trim(), password })
      setSuccess(message || 'Login successful. Redirecting to dashboard...')
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
        // Trigger dashboard view in AdminLayout
        window.dispatchEvent(new CustomEvent('admin:navigate', { detail: 'dashboard' }))
      }, 800)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Invalid credentials')
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
            <h2 className="auth-welcome-subtitle">Nice to see you again</h2>
            <h1 className="auth-welcome-title">
              WELCOME BACK
              <span className="auth-welcome-underline"></span>
            </h1>
            <p className="auth-welcome-text">
              Experience premium car wash and detailing services. Manage your admin dashboard and keep your business running smoothly.
            </p>
          </div>
          <div className="auth-welcome-background">
            <div className="auth-bg-grid"></div>
            <div className="auth-bg-waves"></div>
            <div className="auth-bg-dots"></div>
            <div className="auth-bg-circles"></div>
          </div>
        </div>

        {/* Right Login Form Panel */}
        <div className="auth-form-panel">
          <div className="auth-container">
            <div className="auth-content">
              <div className="auth-form-container">
                <h2 className="auth-form-title">Welcome Back</h2>
                <p className="auth-form-subtitle">Sign in to your account</p>
                
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
                    <label htmlFor="email">Email Address</label>
                    <TextField
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      fullWidth
                      variant="outlined"
                    />
                  </div>

                  <div className="auth-form-options">
                    <label className="auth-checkbox">
                      <input type="checkbox" />
                      <span>Remember me</span>
                    </label>
                    <MuiLink
                      component={Link}
                      to="/forgot-password"
                      className="auth-link"
                    >
                      Forgot Password?
                    </MuiLink>
                  </div>

                  <button 
                    type="submit" 
                    className="auth-submit-btn"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
