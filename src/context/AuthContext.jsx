/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

const mapUser = (row) => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  role: row.role,
  blocked: row.blocked,
  createdAt: row.created_at,
})

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  const loadUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, full_name, email, role, blocked, created_at')
      .order('created_at', { ascending: false })
    if (data) setUsers(data.map(mapUser))
  }

  const fetchUserById = async (id) => {
    const { data } = await supabase.from('users').select('*').eq('id', id).single()
    return data ? mapUser(data) : null
  }

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const user = await fetchUserById(session.user.id)
        if (user) setCurrentUser(user)
      }
      setAuthLoading(false)
    })

    // Listen for auth state changes (login / logout / tab switch)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null)
      } else if (event === 'SIGNED_IN' && session?.user) {
        const user = await fetchUserById(session.user.id)
        if (user) setCurrentUser(user)
      }
    })

    loadUsers()
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signup = async ({ fullName, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase()

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: { full_name: fullName.trim() } },
    })

    if (error) {
      console.error('Signup error:', error)
      if (error.message.toLowerCase().includes('already registered')) {
        return { ok: false, message: 'This email is already registered.' }
      }
      return { ok: false, message: error.message }
    }

    if (!data.user) return { ok: false, message: 'Signup failed. Please try again.' }

    // Wait briefly for the database trigger to create the public.users row
    await new Promise((r) => setTimeout(r, 800))

    let user = await fetchUserById(data.user.id)

    // Fallback: trigger may have been slow, insert manually
    if (!user) {
      await supabase.from('users').insert({
        id: data.user.id,
        full_name: fullName.trim(),
        email: normalizedEmail,
        role: 'user',
        blocked: false,
      })
      user = await fetchUserById(data.user.id)
    }

    if (!user) return { ok: false, message: 'Signup failed. Please try again.' }

    setCurrentUser(user)
    await loadUsers()
    return { ok: true, user }
  }

  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      console.error('Login error:', error)
      return { ok: false, message: 'Invalid email or password.' }
    }

    const user = await fetchUserById(data.user.id)
    if (!user) return { ok: false, message: 'User account not found.' }

    if (user.blocked) {
      await supabase.auth.signOut()
      return { ok: false, message: 'This account has been blocked. Please contact support.' }
    }

    setCurrentUser(user)
    return { ok: true, user }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setCurrentUser(null)
  }

  // Kept for backward compatibility (Footer admin login modal uses it)
  const setSessionUser = (user) => {
    setCurrentUser(user)
  }

  const deleteUser = async (userId) => {
    const { error } = await supabase.from('users').delete().eq('id', userId)
    if (error) { console.error('Delete user error:', error); return }
    await loadUsers()
  }

  const toggleBlockUser = async (userId) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return
    const { error } = await supabase.from('users').update({ blocked: !user.blocked }).eq('id', userId)
    if (error) { console.error('Block user error:', error); return }
    await loadUsers()
  }

  const value = {
    users,
    currentUser,
    authLoading,
    signup,
    login,
    logout,
    setSessionUser,
    deleteUser,
    toggleBlockUser,
    isAuthenticated: Boolean(currentUser),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider.')
  return context
}
