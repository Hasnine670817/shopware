/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'

const ADMIN_SESSION_KEY = 'shopware_admin_session'
const ADMIN_EMAIL = 'admin@shopware.com'
const ADMIN_PASSWORD = 'Admin@12345'

const AdminAuthContext = createContext(null)

const getStoredAdminSession = () => {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY) || 'false')
  } catch {
    return false
  }
}

export const AdminAuthProvider = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(getStoredAdminSession)

  const adminLogin = ({ email, password }) => {
    const valid =
      email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD

    if (!valid) {
      return { ok: false, message: 'Invalid admin email or password.' }
    }

    setIsAdminAuthenticated(true)
    localStorage.setItem(ADMIN_SESSION_KEY, 'true')
    return { ok: true }
  }

  const adminLogout = () => {
    setIsAdminAuthenticated(false)
    localStorage.removeItem(ADMIN_SESSION_KEY)
  }

  const value = {
    isAdminAuthenticated,
    adminLogin,
    adminLogout,
    adminCredentialsHint: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    },
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider.')
  }
  return context
}
