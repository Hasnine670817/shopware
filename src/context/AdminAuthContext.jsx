/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AdminAuthContext = createContext(null)

export const AdminAuthProvider = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState(null)

  // Restore admin session from Supabase Auth on mount
  useEffect(() => {
    const restoreSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle()

      if (userData) {
        setCurrentAdmin({
          id: userData.id,
          fullName: userData.full_name,
          email: userData.email,
          role: 'admin',
        })
      }
    }
    restoreSession()

    // Listen for sign-out to clear admin state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setCurrentAdmin(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const adminLogin = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      console.error('Admin login error:', error)
      return { ok: false, message: 'Invalid email or password.' }
    }

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (!userData) {
      await supabase.auth.signOut()
      return { ok: false, message: 'This account does not have admin privileges.' }
    }

    const admin = {
      id: userData.id,
      fullName: userData.full_name,
      email: userData.email,
      role: 'admin',
    }
    setCurrentAdmin(admin)
    return { ok: true, admin }
  }

  const adminLogout = async () => {
    await supabase.auth.signOut()
    setCurrentAdmin(null)
  }

  const value = {
    isAdminAuthenticated: Boolean(currentAdmin),
    currentAdmin,
    setCurrentAdmin,
    adminLogin,
    adminLogout,
    adminCredentialsHint: {
      email: 'admin@shopware.com',
      password: 'Admin@12345',
    },
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider.')
  return context
}
