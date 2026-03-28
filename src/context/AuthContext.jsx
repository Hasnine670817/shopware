/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'

const USERS_KEY = 'shopware_users'
const CURRENT_USER_KEY = 'shopware_current_user'

const getStoredUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  } catch {
    return []
  }
}

const getStoredCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null')
  } catch {
    return null
  }
}

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(getStoredUsers)
  const [currentUser, setCurrentUser] = useState(getStoredCurrentUser)

  const signup = ({ fullName, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase()
    const exists = users.some((user) => user.email === normalizedEmail)
    if (exists) {
      return { ok: false, message: 'This email is already registered.' }
    }

    const newUser = {
      id: Date.now(),
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
    }

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers))

    const safeUser = {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
    }
    setCurrentUser(safeUser)
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser))

    return { ok: true, user: safeUser }
  }

  const login = ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase()
    const foundUser = users.find(
      (user) => user.email === normalizedEmail && user.password === password,
    )

    if (!foundUser) {
      return { ok: false, message: 'Invalid email or password.' }
    }

    const safeUser = {
      id: foundUser.id,
      fullName: foundUser.fullName,
      email: foundUser.email,
    }

    setCurrentUser(safeUser)
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser))
    return { ok: true, user: safeUser }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem(CURRENT_USER_KEY)
  }

  const setSessionUser = (user) => {
    const safeUser = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    }
    setCurrentUser(safeUser)
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser))
  }

  const value = {
    currentUser,
    signup,
    login,
    logout,
    setSessionUser,
    isAuthenticated: Boolean(currentUser),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.')
  }
  return context
}
