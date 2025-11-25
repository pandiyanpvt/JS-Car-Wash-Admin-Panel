import { useState } from 'react'
import { Alert, Box, Button, TextField, Typography, Link as MuiLink } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPassword } from '../../api/auth'
import './AuthPage.css'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFeedback(null)
    if (!email.trim()) {
      setFeedback({ type: 'error', message: 'Please enter your email address.' })
      return
    }
    setLoading(true)
    try {
      const message = await forgotPassword(email.trim())
      setFeedback({ type: 'success', message })
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || err?.message || 'Unable to process request.' })
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
            <h2 className="auth-welcome-subtitle">Forgot your password?</h2>
            <h1 className="auth-welcome-title">
              RESET PASSWORD
              <span className="auth-welcome-underline"></span>
            </h1>
            <p className="auth-welcome-text">
              No worries! Enter your email address and we'll send you a link to reset your password.
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
                <h2 className="auth-form-title">Forgot Password</h2>
                <p className="auth-form-subtitle">Enter your email address and we'll send you a link to reset your password</p>
                
                {feedback && (
                  <Alert severity={feedback.type} className="auth-alert">
                    {feedback.message}
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

                  <button 
                    type="submit" 
                    className="auth-submit-btn"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>

                  <button 
                    type="button" 
                    className="auth-back-btn"
                    onClick={() => navigate('/login')}
                  >
                    Back to Sign In
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
