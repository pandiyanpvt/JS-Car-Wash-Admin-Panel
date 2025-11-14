import { Box, Typography, Container } from '@mui/material'
import { motion } from 'framer-motion'

function AdminDashboard() {
  return (
    <Container maxWidth="xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome to the admin dashboard
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
          }}
        >
          {/* Dashboard content will be added here */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Total Bookings
              </Typography>
              <Typography variant="h3" color="primary">
                0
              </Typography>
            </Box>
          </motion.div>
        </Box>
      </motion.div>
    </Container>
  )
}

export default AdminDashboard

