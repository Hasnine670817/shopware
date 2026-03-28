/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'

const ADMIN_SESSION_KEY = 'shopware_admin_session'
const ADMIN_USER_KEY = 'shopware_admin_user'
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

const getStoredAdminUser = () => {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_USER_KEY) || 'null')
  } catch {
    return null
  }
}

export const AdminAuthProvider = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(getStoredAdminSession)
  const [currentAdmin, setCurrentAdmin] = useState(getStoredAdminUser)

  const adminLogin = ({ email, password }) => {
    const valid =
      email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD

    if (!valid) {
      return { ok: false, message: 'Invalid admin email or password.' }
    }

    const adminUser = {
      email: ADMIN_EMAIL,
      role: 'Super Admin',
    }

    setIsAdminAuthenticated(true)
    localStorage.setItem(ADMIN_SESSION_KEY, 'true')
    setCurrentAdmin(adminUser)
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(adminUser))
    return { ok: true, admin: adminUser }
  }

  const adminLogout = () => {
    setIsAdminAuthenticated(false)
    setCurrentAdmin(null)
    localStorage.removeItem(ADMIN_SESSION_KEY)
    localStorage.removeItem(ADMIN_USER_KEY)
  }

  const value = {
    isAdminAuthenticated,
    currentAdmin,
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
