import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ProductProvider } from './context/ProductContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <AuthProvider>
          <CartProvider>
            <ProductProvider>
              <App />
            </ProductProvider>
          </CartProvider>
        </AuthProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
