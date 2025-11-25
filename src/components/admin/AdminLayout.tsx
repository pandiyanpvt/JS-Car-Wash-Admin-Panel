import { Box } from '@mui/material'
import { useEffect, useState } from 'react'
import { AdminSidebar } from './index'
import { 
  AdminDashboard, 
  AdminProfile, 
  BookingsManagement,
  ServicesManagement,
  MediaManagement,
  ReviewsManagement,
  FeedbackManagement,
  ReportsAnalytics,
  SettingsManagement
} from '../../pages/admin'
import { SuperAdminDashboard, AdminManagement } from '../../pages/super-admin'
import { useNavigate, useLocation } from 'react-router-dom'

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedMenu, setSelectedMenu] = useState('dashboard')

  // Get current user role (mock - should come from auth context)
  const getCurrentUserRole = (): 'developer' | 'admin' | 'booking' => {
    try {
      const stored = localStorage.getItem('adminAuth')
      if (!stored) return 'admin'
      const { user } = JSON.parse(stored)
      return (user?.role as 'developer' | 'admin' | 'booking') || 'admin'
    } catch {
      return 'admin'
    }
  }

  const currentUserRole = getCurrentUserRole()
  const isSuperAdmin = currentUserRole === 'developer'

  const renderContent = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return isSuperAdmin ? <SuperAdminDashboard /> : <AdminDashboard />
      case 'adminManagement':
        return isSuperAdmin ? <AdminManagement /> : null
      case 'bookings':
        return <BookingsManagement />
      case 'services':
        return <ServicesManagement />
      case 'media':
        return <MediaManagement />
      case 'reviews':
        return <ReviewsManagement />
      case 'feedback':
        return <FeedbackManagement />
      case 'reports':
        return <ReportsAnalytics />
      case 'settings':
        return <SettingsManagement />
      case 'profile':
        return <AdminProfile />
      case 'logout':
        navigate('/logout', { replace: true })
        return null
      default:
        return isSuperAdmin ? <SuperAdminDashboard /> : <AdminDashboard />
    }
  }

  // Read initial route from URL on mount
  useEffect(() => {
    const path = location.pathname
    // Map URL paths to menu IDs
    const pathToMenu: Record<string, string> = {
      '/dashboard': 'dashboard',
      '/admin-management': 'adminManagement',
      '/bookings': 'bookings',
      '/services': 'services',
      '/media': 'media',
      '/reviews': 'reviews',
      '/feedback': 'feedback',
      '/reports': 'reports',
      '/settings': 'settings',
      '/profile': 'profile',
    }
    
    const menuId = pathToMenu[path] || 'dashboard'
    setSelectedMenu(menuId)
  }, [location.pathname])

  // Listen for custom navigation events
  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<string>
      setSelectedMenu(customEvent.detail)
    }
    window.addEventListener('admin:navigate', handler as EventListener)
    return () => {
      window.removeEventListener('admin:navigate', handler as EventListener)
    }
  }, [])

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh', 
        backgroundColor: '#f5f5f5',
      }}
    >
      <AdminSidebar selectedMenu={selectedMenu} onMenuChange={setSelectedMenu} />
      <Box
        sx={{
          flex: 1,
          marginLeft: '260px',
          width: 'calc(100% - 260px)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            backgroundColor: '#ffffff', // White background for content
          }}
        >
          {renderContent()}
        </Box>
      </Box>
    </Box>
  )
}

export default AdminLayout

