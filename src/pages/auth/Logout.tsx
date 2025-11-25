import { useEffect } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { logoutAdmin } from '../../api/auth'

export default function Logout() {
  const navigate = useNavigate()

  useEffect(() => {
    const performLogout = async () => {
      await logoutAdmin()
      navigate('/login', { replace: true })
    }
    performLogout()
  }, [navigate])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #6C9BCF 50%, #8BB4E8 75%, #f5f5f5 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite',
        position: 'relative',
        p: 3,
        '@keyframes gradient': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          p: 4,
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: '#667eea' }} />
        <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
          Signing you out...
        </Typography>
      </Box>
    </Box>
  )
}

