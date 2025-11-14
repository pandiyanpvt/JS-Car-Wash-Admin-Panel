import { Box } from '@mui/material'
import { useState } from 'react'
import { AdminSidebar } from './index'
import { AdminDashboard } from '../../pages/admin'

function AdminLayout() {
  const [selectedMenu, setSelectedMenu] = useState('dashboard')

  const renderContent = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return <AdminDashboard />
      case 'bookings':
        return <div>Bookings Management - Coming Soon</div>
      case 'services':
        return <div>Services Management - Coming Soon</div>
      case 'promotions':
        return <div>Promotions / Offers Management - Coming Soon</div>
      case 'gallery':
        return <div>Gallery / Media Management - Coming Soon</div>
      case 'testimonials':
        return <div>Testimonials / Reviews Management - Coming Soon</div>
      case 'feedback':
        return <div>Feedback / Messages Management - Coming Soon</div>
      case 'reports':
        return <div>Reports / Analytics - Coming Soon</div>
      case 'staff':
        return <div>Staff / Users Management - Coming Soon</div>
      case 'settings':
        return <div>Settings / Configuration - Coming Soon</div>
      default:
        return <AdminDashboard />
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AdminSidebar selectedMenu={selectedMenu} onMenuChange={setSelectedMenu} />
      <Box
        sx={{
          flex: 1,
          marginLeft: '80px',
          p: 3,
          width: 'calc(100% - 80px)',
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  )
}

export default AdminLayout

