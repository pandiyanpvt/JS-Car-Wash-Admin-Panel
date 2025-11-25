import React from 'react'
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material'
import { motion } from 'framer-motion'
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material'

interface AdminHeaderBarProps {
  pageTitle?: string
}

function AdminHeaderBar({ pageTitle }: AdminHeaderBarProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <Box
      sx={{
        height: 80,
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: 4,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Right Section */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        {/* Search Bar */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <TextField
            placeholder="Search..."
            size="small"
            sx={{
              width: 320,
              backgroundColor: '#f9f9f9', // Very Light Gray
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              borderRadius: 3,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { 
                  border: '1px solid #e0e0e0', // Medium Gray
                },
                '&:hover fieldset': { 
                  border: '1px solid #00BFFF', // Cyan Blue (from logo)
                },
                '&.Mui-focused fieldset': { 
                  border: '2px solid #00BFFF', // Cyan Blue (from logo)
                  boxShadow: '0 0 0 3px rgba(0, 191, 255, 0.1)',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#A8A8A8', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
        </motion.div>

        {/* Notifications */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <IconButton
            sx={{
              color: '#00BFFF', // Cyan Blue (from logo)
              backgroundColor: 'rgba(0, 191, 255, 0.1)', // Light Blue
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 191, 255, 0.2)', // Light Blue border
              '&:hover': { 
                backgroundColor: 'rgba(0, 191, 255, 0.2)', // Lighter Blue
                border: '1px solid #00BFFF', // Cyan Blue
              },
            }}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </motion.div>

        {/* Messages */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <IconButton
            sx={{
              color: '#00BFFF', // Cyan Blue (from logo)
              backgroundColor: 'rgba(0, 191, 255, 0.1)', // Light Blue
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 191, 255, 0.2)', // Light Blue border
              '&:hover': { 
                backgroundColor: 'rgba(0, 191, 255, 0.2)', // Lighter Blue
                border: '1px solid #00BFFF', // Cyan Blue
              },
            }}
          >
            <Badge badgeContent={2} color="error">
              <MessageIcon />
            </Badge>
          </IconButton>
        </motion.div>

        {/* User Profile */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <IconButton
            onClick={handleClick}
            sx={{
              p: 0.5,
              '&:hover': { backgroundColor: 'transparent' },
            }}
          >
            <Avatar
              sx={{
                width: 42,
                height: 42,
                background: 'linear-gradient(135deg, #FF2B29 0%, #00BFFF 100%)', // Red to Cyan Blue (from logo)
                cursor: 'pointer',
                border: '2px solid #ffffff', // White
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
              }}
            >
              <AccountCircleIcon />
            </Avatar>
          </IconButton>
        </motion.div>

        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 220,
              backgroundColor: '#ffffff', // White
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid #e0e0e0', // Medium Gray
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              borderRadius: 3,
              overflow: 'hidden',
            },
          }}
        >
          <MenuItem 
            onClick={handleClose}
            sx={{
              '&:hover': {
                backgroundColor: '#ffe0e0', // Lighter Pink
              },
            }}
          >
            <AccountCircleIcon sx={{ mr: 2, fontSize: 20, color: '#00BFFF' }} />
            <Typography sx={{ fontWeight: 500, color: '#000000' }}>Profile</Typography>
          </MenuItem>
          <MenuItem 
            onClick={handleClose}
            sx={{
              '&:hover': {
                backgroundColor: '#ffe0e0', // Lighter Pink
              },
            }}
          >
            <SettingsIcon sx={{ mr: 2, fontSize: 20, color: '#00BFFF' }} />
            <Typography sx={{ fontWeight: 500, color: '#000000' }}>Settings</Typography>
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem 
            onClick={handleClose} 
            sx={{ 
              color: '#FF2B29', // Red (from logo)
              '&:hover': {
                backgroundColor: 'rgba(255, 43, 41, 0.1)', // Light Red
              },
            }}
          >
            <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
            <Typography sx={{ fontWeight: 500 }}>Logout</Typography>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  )
}

export default AdminHeaderBar

