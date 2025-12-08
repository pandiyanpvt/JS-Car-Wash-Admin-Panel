import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { ProtectedRoute } from '../components/layout/ProtectedRoute'
import { LoginPage } from '../pages/auth/LoginPage'
import { Dashboard } from '../pages/Dashboard/Dashboard'
import { BranchList } from '../pages/Branches/BranchList'
import { Packages } from '../pages/Packages/Packages'
import { ExtraWorks } from '../pages/ExtraWorks/ExtraWorks'
import { Products } from '../pages/Products/Products'
import { Categories } from '../pages/ProductCategories/Categories'
import { ContactMessages } from '../pages/Contacts/ContactMessages'
import { Gallery } from '../pages/Gallery/Gallery'
import { Orders } from '../pages/Orders/Orders'
import { UserReviews } from '../pages/Reviews/UserReviews'
import { Analytics } from '../pages/Analytics/Analytics'
import { Users } from '../pages/Users/Users'
import { UserLogs } from '../pages/Logs/UserLogs'
import { UserRoles } from '../pages/Roles/UserRoles'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/branches" element={<BranchList />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/extra-works" element={<ExtraWorks />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product-categories" element={<Categories />} />
                <Route path="/contacts" element={<ContactMessages />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/reviews" element={<UserReviews />} />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute requiredRole="Developer">
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route path="/users" element={<Users />} />
                <Route path="/logs" element={<UserLogs />} />
                <Route path="/roles" element={<UserRoles />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

