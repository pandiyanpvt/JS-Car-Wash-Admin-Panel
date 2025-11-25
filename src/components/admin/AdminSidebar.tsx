import { Box, Typography, Chip, Divider } from '@mui/material'
import { motion } from 'framer-motion'
import {
  Dashboard as DashboardIcon,
  BookOnline as BookingsIcon,
  BusinessCenter as ServicesIcon,
  PhotoLibrary as MediaIcon,
  RateReview as ReviewsIcon,
  Feedback as FeedbackIcon,
  Analytics as ReportsIcon,
  ManageAccounts as AdminManagementIcon,
  Settings as SettingsIcon,
  Person as ProfileIcon,
  ExitToApp as LogoutIcon,
  VerifiedUser as VerifiedIcon,
  AdminPanelSettings as DeveloperIcon,
} from '@mui/icons-material'

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  shortLabel?: string
  superAdminOnly?: boolean
}

interface SidebarProps {
  selectedMenu: string
  onMenuChange: (menuId: string) => void
}

// Get current user role
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

const getMenuItems = (): MenuItem[] => {
  const currentUserRole = getCurrentUserRole()
  const isSuperAdmin = currentUserRole === 'developer'

  const allMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, shortLabel: 'Home' },
    { 
      id: 'adminManagement', 
      label: 'Admin Management', 
      icon: <AdminManagementIcon />, 
      shortLabel: 'Admins',
      superAdminOnly: true 
    },
    { id: 'bookings', label: 'Bookings', icon: <BookingsIcon />, shortLabel: 'Book' },
    { id: 'services', label: 'Services', icon: <ServicesIcon />, shortLabel: 'Service' },
    { id: 'media', label: 'Media', icon: <MediaIcon />, shortLabel: 'Media' },
    { id: 'reviews', label: 'Reviews', icon: <ReviewsIcon />, shortLabel: 'Review' },
    { id: 'feedback', label: 'Feedback', icon: <FeedbackIcon />, shortLabel: 'Message' },
    { id: 'reports', label: 'Reports', icon: <ReportsIcon />, shortLabel: 'Analytic' },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon />, shortLabel: 'Config' },
    { id: 'profile', label: 'Profile', icon: <ProfileIcon />, shortLabel: 'Profile' },
    { id: 'logout', label: 'Logout', icon: <LogoutIcon />, shortLabel: 'Logout' },
  ]

  return allMenuItems.filter(item => !item.superAdminOnly || isSuperAdmin)
}

// Get current user info
const getCurrentUserInfo = () => {
  try {
    const stored = localStorage.getItem('adminAuth')
    if (!stored) return null
    const { user } = JSON.parse(stored)
    return user || null
  } catch {
    return null
  }
}

function AdminSidebar({ selectedMenu, onMenuChange }: SidebarProps) {
  const menuItems = getMenuItems()
  const currentUserRole = getCurrentUserRole()
  const isDeveloper = currentUserRole === 'developer'
  const userInfo = getCurrentUserInfo()
  
  return (
    <Box
      sx={{
        width: 260,
        height: '100vh',
        backgroundColor: '#000000', // Black (from logo background)
        display: 'flex',
        flexDirection: 'column',
        pt: 4,
        pb: 4,
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
        borderTopRightRadius: 24,
        borderBottomRightRadius: 32,
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Box
          component="img"
          src="/LOGO.png"
          alt="JS Car Wash & Detailing"
          sx={{
            maxWidth: '80px',
            maxHeight: '80px',
            objectFit: 'contain',
          }}
        />
      </Box>

      {/* Menu Items */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          width: '100%',
          px: 2,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#000000', // Black
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255,255,255,0.3)',
            borderRadius: '2px',
          },
        }}
      >
        {menuItems.map((item, index) => {
          const isActive = selectedMenu === item.id
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              style={{ width: '100%' }}
            >
              <Box
                onClick={() => onMenuChange(item.id)}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 2,
                  py: 1.5,
                  px: 2.5,
                  borderRadius: 2,
                  backgroundColor: isActive ? 'rgba(0, 191, 255, 0.15)' : 'transparent', // Cyan Blue tint for active
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 2px 8px rgba(0, 191, 255, 0.2)' : 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: isActive ? 'rgba(0, 191, 255, 0.15)' : 'rgba(0, 191, 255, 0.1)', // Cyan Blue tint for hover
                  },
                }}
              >
                <Box
                  sx={{
                    color: isActive ? '#00BFFF' : '#C0C0C0', // Cyan Blue when active, Silver-grey otherwise
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 24,
                  }}
                >
                  {item.icon}
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: isActive ? '#00BFFF' : '#C0C0C0', // Cyan Blue when active, Silver-grey otherwise
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.875rem',
                    textTransform: 'capitalize',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            </motion.div>
          )
        })}
      </Box>

      {/* Developer Account Indicator / User Info */}
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 2,
        }}
      >
        <Divider sx={{ mb: 2, backgroundColor: 'rgba(192, 192, 192, 0.2)' }} />
        {isDeveloper && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: 'rgba(0, 191, 255, 0.1)',
                border: '1px solid rgba(0, 191, 255, 0.3)',
              }}
            >
              <DeveloperIcon sx={{ color: '#00BFFF', fontSize: 20 }} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#00BFFF',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Developer Account
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#C0C0C0',
                    fontSize: '0.7rem',
                    display: 'block',
                    mt: 0.5,
                  }}
                >
                  Full System Access
                </Typography>
              </Box>
              <VerifiedIcon sx={{ color: '#00BFFF', fontSize: 18 }} />
            </Box>
          </motion.div>
        )}
        
        {/* User Info */}
        {userInfo && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: isDeveloper ? '#00BFFF' : '#C0C0C0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              {userInfo.name?.charAt(0)?.toUpperCase() || userInfo.email?.charAt(0)?.toUpperCase() || 'A'}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {userInfo.name || userInfo.email || 'Admin User'}
              </Typography>
              <Chip
                label={currentUserRole === 'developer' ? 'Developer' : currentUserRole === 'admin' ? 'Admin' : 'Booking'}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  backgroundColor: isDeveloper ? '#00BFFF' : '#C0C0C0',
                  color: '#000000',
                  fontWeight: 600,
                  mt: 0.5,
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default AdminSidebar

