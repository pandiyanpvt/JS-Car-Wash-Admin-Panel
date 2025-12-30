import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { ProtectedRoute } from '../components/layout/ProtectedRoute'
import { LoginPage } from '../pages/auth/LoginPage'
import { Dashboard } from '../pages/dashboard/Dashboard'
import { BranchList } from '../pages/branches/BranchList'
import { Packages } from '../pages/packages/Packages'
import { ExtraWorks } from '../pages/ExtraWorks/ExtraWorks'
import { Products } from '../pages/products/Products'
import { Categories } from '../pages/ProductCategories/Categories'
import { ContactMessages } from '../pages/Contacts/ContactMessages'
import { Gallery } from '../pages/gallery/Gallery'
import { Orders } from '../pages/orders/Orders'
import { UserReviews } from '../pages/reviews/UserReviews'
import { Analytics } from '../pages/analytics/Analytics'
import { Users } from '../pages/users/Users'
import { UserLogs } from '../pages/Logs/UserLogs'
import { UserRoles } from '../pages/Roles/UserRoles'
import { ShopInventory } from '../pages/shop-inventory/ShopInventory'

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
                <Route path="/shop-inventory" element={<ShopInventory />} />
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
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute requiredRole="Developer">
                      <Users />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/logs"
                  element={
                    <ProtectedRoute requiredRole="Developer">
                      <UserLogs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/roles"
                  element={
                    <ProtectedRoute requiredRole="Developer">
                      <UserRoles />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

