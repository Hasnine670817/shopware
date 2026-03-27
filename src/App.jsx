import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import CollectionPage from './pages/CollectionPage'
import ContactPage from './pages/ContactPage'
import CheckoutPage from './pages/CheckoutPage'
import CheckoutInfoPage from './pages/CheckoutInfoPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import AdminPanelPage from './pages/AdminPanelPage'
import ShopPage from './pages/ShopPage'
import SignupPage from './pages/SignupPage'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'

const App = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout-info" element={<CheckoutInfoPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminPanelPage />
            </ProtectedAdminRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
