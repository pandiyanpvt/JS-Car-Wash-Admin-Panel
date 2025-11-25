import { useState } from 'react'
import { 
  Box, 
  Typography, 
  Card, 
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { motion } from 'framer-motion'
import {
  Store as StoreIcon,
  People as PeopleIcon,
  BookOnline as BookingsIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as ProductIcon,
} from '@mui/icons-material'
import GridLegacy from '@mui/material/GridLegacy'

const metrics = [
  { 
    label: 'Total Car Wash Centers', 
    value: '12', 
    icon: <StoreIcon sx={{ fontSize: 40 }} />, 
    color: '#FF2B29' 
  },
  { 
    label: 'Total Admins', 
    value: '45', 
    icon: <PeopleIcon sx={{ fontSize: 40 }} />, 
    color: '#00BFFF' 
  },
  { 
    label: 'Total Bookings (All Branches)', 
    value: '1,234', 
    icon: <BookingsIcon sx={{ fontSize: 40 }} />, 
    color: '#0080FF' 
  },
  { 
    label: 'Total Revenue (All Branches)', 
    value: '$125,450', 
    icon: <MoneyIcon sx={{ fontSize: 40 }} />, 
    color: '#4CAF50' 
  },
  { 
    label: 'Total Product Sales (All Branches)', 
    value: '$45,230', 
    icon: <ProductIcon sx={{ fontSize: 40 }} />, 
    color: '#FF9800' 
  },
]

const recentActivities = [
  { id: 1, type: 'login', user: 'Admin User', action: 'logged in', time: '10:30 AM', branch: 'Branch 1' },
  { id: 2, type: 'update', user: 'Admin User', action: 'updated booking #123', time: '10:15 AM', branch: 'Branch 2' },
  { id: 3, type: 'login', user: 'Staff Member', action: 'logged in', time: '9:45 AM', branch: 'Branch 1' },
  { id: 4, type: 'update', user: 'Admin User', action: 'created new service', time: '9:30 AM', branch: 'Branch 3' },
  { id: 5, type: 'update', user: 'Manager One', action: 'added new admin', time: '9:00 AM', branch: 'Main Branch' },
]

function SuperAdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('week')

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#000000' }}>
          Super Admin Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={selectedPeriod === 'week' ? 'contained' : 'outlined'}
            onClick={() => setSelectedPeriod('week')}
            sx={{ backgroundColor: selectedPeriod === 'week' ? '#00BFFF' : 'transparent' }}
          >
            Weekly
          </Button>
          <Button
            variant={selectedPeriod === 'month' ? 'contained' : 'outlined'}
            onClick={() => setSelectedPeriod('month')}
            sx={{ backgroundColor: selectedPeriod === 'month' ? '#00BFFF' : 'transparent' }}
          >
            Monthly
          </Button>
        </Box>
      </Box>

      {/* Metrics Cards */}
      <GridLegacy container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric, index) => (
          <GridLegacy item xs={12} sm={6} md={4} lg={2.4} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${metric.color}20 0%, ${metric.color}10 100%)`,
                  border: `1px solid ${metric.color}40`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${metric.color}30`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ color: metric.color }}>{metric.icon}</Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#000000', mb: 0.5 }}>
                  {metric.value}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>
                  {metric.label}
                </Typography>
              </Card>
            </motion.div>
          </GridLegacy>
        ))}
      </GridLegacy>

      {/* Recent Activities */}
      <Card sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Recent Activities
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentActivities.map((activity) => (
                <TableRow key={activity.id} hover>
                  <TableCell>{activity.time}</TableCell>
                  <TableCell>{activity.user}</TableCell>
                  <TableCell>{activity.action}</TableCell>
                  <TableCell>{activity.branch}</TableCell>
                  <TableCell>
                    <Chip
                      label={activity.type}
                      size="small"
                      color={activity.type === 'login' ? 'primary' : 'secondary'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  )
}

export default SuperAdminDashboard

