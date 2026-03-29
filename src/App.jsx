import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import TopProgressBar from './components/TopProgressBar'
import CollectionPage from './pages/CollectionPage'
import ContactPage from './pages/ContactPage'
import CheckoutPage from './pages/CheckoutPage'
import CheckoutInfoPage from './pages/CheckoutInfoPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import AdminLoginPage from './pages/AdminLoginPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import AllOrdersPage from './pages/AllOrdersPage'
import OrderDetailsPage from './pages/OrderDetailsPage'
import AdminPanelPage from './pages/AdminPanelPage'
import ShopPage from './pages/ShopPage'
import SignupPage from './pages/SignupPage'
import UserDashboardPage from './pages/UserDashboardPage'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'

const App = () => {
  // Hide splash screen once React has mounted
  useEffect(() => {
    const splash = document.getElementById('app-splash')
    if (!splash) return
    splash.classList.add('splash-hide')
    const t = setTimeout(() => splash.remove(), 480)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
    <TopProgressBar />
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout-info" element={<CheckoutInfoPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="/dashboard" element={<UserDashboardPage />} />
        <Route path="/dashboard/orders" element={<AllOrdersPage />} />
        <Route path="/dashboard/orders/:orderId" element={<OrderDetailsPage />} />
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminPanelPage />
          </ProtectedAdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

export default App
