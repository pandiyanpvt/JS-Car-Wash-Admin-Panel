import { Box, IconButton, Typography, Tooltip } from '@mui/material'
import { motion } from 'framer-motion'
import {
  Dashboard as DashboardIcon,
  BookOnline as BookingsIcon,
  BusinessCenter as ServicesIcon,
  LocalOffer as PromotionsIcon,
  PhotoLibrary as GalleryIcon,
  RateReview as TestimonialsIcon,
  Feedback as FeedbackIcon,
  Analytics as ReportsIcon,
  ManageAccounts as StaffIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Person as PersonIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material'

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  filter?: boolean
}

interface SidebarProps {
  selectedMenu: string
  onMenuChange: (menuId: string) => void
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, filter: true },
  { id: 'bookings', label: 'Bookings Management', icon: <BookingsIcon /> },
  { id: 'services', label: 'Services Management', icon: <ServicesIcon /> },
  { id: 'promotions', label: 'Promotions / Offers Management', icon: <PromotionsIcon /> },
  { id: 'gallery', label: 'Gallery / Media Management', icon: <GalleryIcon /> },
  { id: 'testimonials', label: 'Testimonials / Reviews Management', icon: <TestimonialsIcon /> },
  { id: 'feedback', label: 'Feedback / Messages Management', icon: <FeedbackIcon /> },
  { id: 'reports', label: 'Reports / Analytics', icon: <ReportsIcon /> },
  { id: 'staff', label: 'Staff / Users Management', icon: <StaffIcon /> },
  { id: 'settings', label: 'Settings / Configuration', icon: <SettingsIcon /> },
]

function AdminSidebar({ selectedMenu, onMenuChange }: SidebarProps) {
  return (
    <Box
      sx={{
        width: 80,
        height: '100vh',
        backgroundColor: '#2c3e50',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 2,
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
      }}
    >
      {/* Logo/Brand Section */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: '#27ae60',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.5rem',
              }}
            >
              A
            </Typography>
          </Box>
        </motion.div>
        <Typography
          variant="caption"
          sx={{
            color: 'white',
            textAlign: 'center',
            fontSize: '0.7rem',
            lineHeight: 1.2,
            px: 0.5,
          }}
        >
          Admin Panel
        </Typography>
      </Box>

      {/* Menu Items */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          width: '100%',
          px: 1,
        }}
      >
        {menuItems.map((item, index) => (
          <Tooltip key={item.id} title={item.label} placement="right">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconButton
                onClick={() => onMenuChange(item.id)}
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 1.5,
                  backgroundColor:
                    selectedMenu === item.id ? '#34495e' : '#34495e',
                  color: selectedMenu === item.id ? '#27ae60' : 'white',
                  '&:hover': {
                    backgroundColor: '#3d566e',
                    color: selectedMenu === item.id ? '#27ae60' : '#27ae60',
                  },
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  boxShadow:
                    selectedMenu === item.id
                      ? '0 2px 4px rgba(0,0,0,0.2)'
                      : 'none',
                }}
              >
                {item.icon}
                {item.filter && (
                  <FilterIcon
                    sx={{
                      position: 'absolute',
                      bottom: 4,
                      right: 4,
                      fontSize: 14,
                      color: selectedMenu === item.id ? '#27ae60' : 'rgba(255,255,255,0.6)',
                    }}
                  />
                )}
              </IconButton>
            </motion.div>
          </Tooltip>
        ))}
      </Box>

      {/* Bottom Icons */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          width: '100%',
          px: 1,
        }}
      >
        <Tooltip title="Help" placement="right">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconButton
              sx={{
                width: 56,
                height: 56,
                borderRadius: 1.5,
                backgroundColor: '#34495e',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#3d566e',
                  color: '#27ae60',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <HelpIcon />
            </IconButton>
          </motion.div>
        </Tooltip>
        <Tooltip title="User Profile" placement="right">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconButton
              sx={{
                width: 56,
                height: 56,
                borderRadius: 1.5,
                backgroundColor: '#34495e',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#3d566e',
                  color: '#27ae60',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <PersonIcon />
            </IconButton>
          </motion.div>
        </Tooltip>
      </Box>
    </Box>
  )
}

export default AdminSidebar

