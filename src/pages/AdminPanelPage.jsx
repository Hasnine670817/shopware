import { useEffect, useMemo, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiArrowRight,
  FiLogOut,
  FiMenu,
  FiPackage,
  FiSearch,
  FiSettings,
  FiShoppingCart,
  FiUsers,
  FiX,
} from 'react-icons/fi'
import { LuLayoutDashboard } from 'react-icons/lu'
import { IoHomeOutline } from 'react-icons/io5'
import { IoMdNotificationsOutline } from 'react-icons/io'
import { useAdminAuth } from '../context/AdminAuthContext'
import { useAuth } from '../context/AuthContext'
import { useProducts } from '../context/ProductContext'
import { supabase } from '../lib/supabase'
import AdminDashboardTab from './admin/AdminDashboardTab'
import AdminProductsTab from './admin/AdminProductsTab'
import AdminOrdersTab from './admin/AdminOrdersTab'
import AdminUsersTab from './admin/AdminUsersTab'
import AdminSettingsTab from './admin/AdminSettingsTab'

// ── Notification helpers ──────────────────────────────────────────────────────
const STORAGE_KEY = 'admin_read_notif_ids'

const getReadIds = () => {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')) }
  catch { return new Set() }
}
const saveReadIds = (set) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
}

const STATUS_STYLES = {
  pending:    'bg-amber-50  text-amber-600',
  processing: 'bg-blue-50   text-blue-600',
  shipped:    'bg-indigo-50 text-indigo-600',
  delivered:  'bg-emerald-50 text-emerald-600',
  cancelled:  'bg-red-50    text-red-600',
}

const timeAgo = (iso) => {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
// ─────────────────────────────────────────────────────────────────────────────

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LuLayoutDashboard },
  { id: 'products', label: 'Products', icon: FiPackage },
  { id: 'orders', label: 'Orders', icon: FiShoppingCart },
  { id: 'users', label: 'Users', icon: FiUsers },
  { id: 'settings', label: 'Settings', icon: FiSettings },
]

const RESULT_ICONS = {
  product: <FiPackage className="text-[#f08a2f]" />,
  order:   <FiShoppingCart className="text-[#5b8def]" />,
  user:    <FiUsers className="text-[#22a35a]" />,
}

const RESULT_BADGE = {
  product: 'bg-orange-50 text-[#f08a2f]',
  order:   'bg-blue-50 text-[#5b8def]',
  user:    'bg-emerald-50 text-[#22a35a]',
}

const AdminPanelPage = () => {
  const navigate = useNavigate()
  const { adminLogout, currentAdmin } = useAdminAuth()
  const { users, currentUser } = useAuth()
  // Prefer currentUser for display (stays in sync after profile edits)
  const adminDisplayName   = currentUser?.fullName  || currentAdmin?.fullName  || 'Administrator'
  const adminDisplayEmail  = currentUser?.email     || currentAdmin?.email     || ''
  const adminDisplayAvatar = currentUser?.avatarUrl || null
  const { products } = useProducts()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // ── Notification state ──────────────────────────────────────────────────────
  const [isNotifOpen, setIsNotifOpen]   = useState(false)
  const [notifications, setNotifications] = useState([])  // recent orders
  const [readIds, setReadIds]           = useState(getReadIds)
  const notifRef = useRef(null)

  const unreadCount = useMemo(
    () => notifications.filter((n) => !readIds.has(n.order_id)).length,
    [notifications, readIds],
  )

  const loadNotifications = async () => {
    const { data } = await supabase
      .from('orders')
      .select('order_id, user_email, status, total, created_at, customer_info')
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setNotifications(data)
  }

  // Initial fetch
  useEffect(() => {
    let cancelled = false
    supabase
      .from('orders')
      .select('order_id, user_email, status, total, created_at, customer_info')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { if (!cancelled && data) setNotifications(data) })
    return () => { cancelled = true }
  }, [])

  // Realtime: listen for new / updated orders
  useEffect(() => {
    const channel = supabase
      .channel('admin-notif-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => { loadNotifications() },
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  // Close notif panel on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const openNotifications = () => {
    setIsNotifOpen((prev) => !prev)
  }

  const markAllRead = () => {
    const newSet = new Set([...readIds, ...notifications.map((n) => n.order_id)])
    setReadIds(newSet)
    saveReadIds(newSet)
  }

  const markOneRead = (orderId) => {
    if (readIds.has(orderId)) return
    const newSet = new Set([...readIds, orderId])
    setReadIds(newSet)
    saveReadIds(newSet)
  }
  // ─────────────────────────────────────────────────────────────────────────────

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [allOrders, setAllOrders] = useState([])
  const searchRef = useRef(null)
  const inputRef = useRef(null)

  // Load all orders once for search
  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('order_id, user_email, status, total, customer_info')
        .order('created_at', { ascending: false })
      if (data) setAllOrders(data)
    }
    fetchOrders()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
        setSearchQuery('')
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const results = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q || q.length < 1) return []

    const productResults = products
      .filter((p) =>
        p.title?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q),
      )
      .slice(0, 4)
      .map((p) => ({
        type: 'product',
        key: p.id,
        label: p.title,
        sublabel: `${p.brand} · $${Number(p.price).toFixed(2)}`,
        tab: 'products',
      }))

    const orderResults = allOrders
      .filter((o) =>
        o.order_id?.toLowerCase().includes(q) ||
        o.user_email?.toLowerCase().includes(q) ||
        o.customer_info?.fullName?.toLowerCase().includes(q),
      )
      .slice(0, 4)
      .map((o) => ({
        type: 'order',
        key: o.order_id,
        label: `Order #${o.order_id?.replace('ORD-', '')}`,
        sublabel: `${o.user_email} · $${Number(o.total).toFixed(2)}`,
        tab: 'orders',
      }))

    const userResults = users
      .filter((u) =>
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q),
      )
      .slice(0, 4)
      .map((u) => ({
        type: 'user',
        key: u.id,
        label: u.fullName,
        sublabel: u.email,
        tab: 'users',
      }))

    return [...productResults, ...orderResults, ...userResults]
  }, [searchQuery, products, allOrders, users])

  const handleResultClick = (result) => {
    setActiveTab(result.tab)
    setSearchQuery('')
    setIsSearchOpen(false)
  }

  const handleAdminLogout = async () => {
    await adminLogout()
    await Swal.fire({ icon: 'success', title: 'Logged out', confirmButtonColor: '#323232' })
    navigate('/')
  }

  // Keep all tabs mounted to prevent re-fetching on every tab switch
  const renderContent = () => (
    <>
      <div className={activeTab === 'dashboard' ? 'block' : 'hidden'}><AdminDashboardTab /></div>
      <div className={activeTab === 'products'  ? 'block' : 'hidden'}><AdminProductsTab /></div>
      <div className={activeTab === 'orders'    ? 'block' : 'hidden'}><AdminOrdersTab /></div>
      <div className={activeTab === 'users'     ? 'block' : 'hidden'}><AdminUsersTab /></div>
      <div className={activeTab === 'settings'  ? 'block' : 'hidden'}><AdminSettingsTab /></div>
    </>
  )

  return (
    <section className="min-h-screen bg-[#f5f7fb]">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] overflow-y-auto bg-[#181b22] text-white transition-transform duration-300 ease-in-out lg:z-30 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-white/10 px-5 py-5">
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            <span className="rounded bg-[#ff7a1a] px-2 py-1 text-xs font-bold">S</span>
            Admin Panel
          </h1>
        </div>

        <nav className="flex h-[calc(100vh-70px)] flex-col space-y-1 p-3">
          <Link
            to="/"
            className="mb-4 flex items-center gap-2 rounded-lg px-3 py-3 text-[15px] text-[#2F82FF] transition hover:bg-white/10 hover:text-white"
          >
            <IoHomeOutline className="text-[17px]" />
            Back to Home
          </Link>

          <div className="flex grow flex-col gap-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false) }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[15px] transition ${
                    activeTab === item.id
                      ? 'bg-[#ff7a1a] text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="text-[17px]" />
                  {item.label}
                </button>
              )
            })}
          </div>

          <button
            onClick={handleAdminLogout}
            className="mt-5 flex w-full items-center gap-2 rounded-lg bg-red-500/10 px-3 py-3 text-left text-[15px] text-red-300 transition hover:bg-red-500/15 hover:text-red-200"
          >
            <FiLogOut className="text-[17px]" />
            Logout
          </button>
        </nav>
      </aside>

      {/* Sidebar Overlay */}
      <button
        className={`fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
        aria-label="Close admin sidebar overlay"
      />

      {/* Notification backdrop (mobile only) — z-[44] stays below topbar z-[48] */}
      <button
        className={`fixed inset-0 z-[44] bg-black/30 sm:hidden transition-opacity duration-200 ${
          isNotifOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsNotifOpen(false)}
        aria-label="Close notifications"
        tabIndex={-1}
      />

      {/* Main content */}
      <div className="min-w-0 lg:ml-[260px]">
        {/* Topbar */}
        <div className="sticky top-0 z-[48] border-b border-[#e6e9ee] bg-white px-4 py-3.5 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button className="btn btn-ghost btn-sm lg:hidden" onClick={() => setIsSidebarOpen(true)}>
                <FiMenu className="text-2xl" />
              </button>

              {/* Search with suggestions */}
              <div ref={searchRef} className="relative hidden sm:block">
                <label className={`flex h-[38px] min-w-[220px] items-center gap-2 rounded-lg border bg-[#f9fafb] px-3 py-2 text-sm transition md:min-w-[340px] ${
                  isSearchOpen ? 'border-[#f08a2f] ring-2 ring-[#f08a2f]/15' : 'border-[#e5e7eb]'
                }`}>
                  <FiSearch className="shrink-0 text-base text-[#9ca3af]" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setIsSearchOpen(true) }}
                    onFocus={() => setIsSearchOpen(true)}
                    placeholder="Search orders, products, users..."
                    className="w-full bg-transparent outline-none placeholder:text-[#9ca3af]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(''); inputRef.current?.focus() }}
                      className="shrink-0 text-[#9ca3af] hover:text-[#6b7280]"
                    >
                      <FiX className="text-sm" />
                    </button>
                  )}
                </label>

                {/* Suggestions dropdown */}
                {isSearchOpen && searchQuery.trim().length > 0 && (
                  <div className="absolute left-0 top-[calc(100%+6px)] w-full min-w-[340px] rounded-xl border border-[#e5e7eb] bg-white shadow-lg">
                    {results.length === 0 ? (
                      <div className="flex items-center gap-2 px-4 py-4 text-sm text-[#9ca3af]">
                        <FiSearch className="text-base" />
                        No results for &quot;{searchQuery}&quot;
                      </div>
                    ) : (
                      <ul className="max-h-[360px] overflow-y-auto py-1.5">
                        {/* Group by type */}
                        {['product', 'order', 'user'].map((type) => {
                          const group = results.filter((r) => r.type === type)
                          if (!group.length) return null
                          const typeLabel = type === 'product' ? 'Products' : type === 'order' ? 'Orders' : 'Users'
                          return (
                            <li key={type}>
                              <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-[#b0bac7]">
                                {typeLabel}
                              </p>
                              {group.map((result) => (
                                <button
                                  key={result.key}
                                  onClick={() => handleResultClick(result)}
                                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-[#f8fafc]"
                                >
                                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#f3f4f6] text-base">
                                    {RESULT_ICONS[result.type]}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-[#202734]">{result.label}</p>
                                    <p className="truncate text-xs text-[#9ca3af]">{result.sublabel}</p>
                                  </div>
                                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${RESULT_BADGE[result.type]}`}>
                                    {type}
                                  </span>
                                </button>
                              ))}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                    <div className="border-t border-[#f0f2f5] px-3 py-2 text-[10px] text-[#b0bac7]">
                      Press <kbd className="rounded border border-[#e5e7eb] bg-[#f9fafb] px-1 py-0.5 font-mono text-[10px]">Esc</kbd> to close
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3" ref={notifRef}>
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={openNotifications}
                  className={`relative grid h-9 w-9 place-items-center rounded-full transition ${
                    isNotifOpen ? 'bg-[#f08a2f]/15 text-[#f08a2f]' : 'bg-[#eceff4] text-[#1f2937] hover:bg-[#e2e6ed]'
                  }`}
                  aria-label="Notifications"
                >
                  <IoMdNotificationsOutline className="text-xl" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification offcanvas / dropdown */}
                <div
                  className={`absolute right-0 top-[calc(100%+10px)] z-50 w-[340px] max-sm:fixed max-sm:inset-x-0 max-sm:top-auto max-sm:bottom-0 max-sm:w-full max-sm:rounded-b-none max-sm:rounded-t-2xl max-sm:z-[46] rounded-2xl border border-[#e5e7eb] bg-white shadow-2xl transition-all duration-200 ${
                    isNotifOpen
                      ? 'pointer-events-auto translate-y-0 opacity-100 scale-100'
                      : 'pointer-events-none -translate-y-2 opacity-0 scale-95 max-sm:translate-y-4'
                  }`}
                  style={{ maxHeight: '480px' }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[#f0f2f5] px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#202734]">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[11px] font-medium text-[#f08a2f] transition hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setIsNotifOpen(false)}
                        className="grid h-7 w-7 place-items-center rounded-lg text-[#9ca3af] transition hover:bg-[#f3f4f6] hover:text-[#202734]"
                      >
                        <FiX className="text-sm" />
                      </button>
                    </div>
                  </div>

                  {/* List */}
                  <ul className="overflow-y-auto" style={{ maxHeight: '370px' }}>
                    {notifications.length === 0 ? (
                      <li className="flex flex-col items-center gap-2 py-10 text-center">
                        <IoMdNotificationsOutline className="text-3xl text-[#d1d5db]" />
                        <p className="text-sm text-[#9ca3af]">No notifications yet</p>
                      </li>
                    ) : (
                      notifications.map((notif) => {
                        const isUnread = !readIds.has(notif.order_id)
                        const customerName =
                          notif.customer_info?.fullName ||
                          notif.customer_info?.name ||
                          notif.user_email ||
                          'Customer'
                        return (
                          <li key={notif.order_id}>
                            <button
                              onClick={() => {
                                markOneRead(notif.order_id)
                                setActiveTab('orders')
                                setIsNotifOpen(false)
                              }}
                              className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-[#f9fafb] ${
                                isUnread ? 'bg-[#fff8f2]' : ''
                              }`}
                            >
                              {/* Icon */}
                              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f08a2f]/10 text-[#f08a2f]">
                                <FiShoppingCart className="text-base" />
                              </span>

                              {/* Content */}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-semibold text-[#202734]">
                                  New order from{' '}
                                  <span className="text-[#f08a2f]">{customerName}</span>
                                </p>
                                <p className="mt-0.5 truncate text-xs text-[#8b95a4]">
                                  #{notif.order_id?.replace('ORD-', '')} ·{' '}
                                  <span className="font-medium text-[#202734]">
                                    ${Number(notif.total || 0).toFixed(2)}
                                  </span>
                                </p>
                                <div className="mt-1.5 flex items-center gap-2">
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                                      STATUS_STYLES[notif.status] || 'bg-gray-100 text-gray-500'
                                    }`}
                                  >
                                    {notif.status}
                                  </span>
                                  <span className="text-[10px] text-[#b0bac7]">
                                    {timeAgo(notif.created_at)}
                                  </span>
                                </div>
                              </div>

                              {/* Unread dot + arrow */}
                              <div className="flex shrink-0 flex-col items-end gap-1.5">
                                {isUnread && (
                                  <span className="mt-1 h-2 w-2 rounded-full bg-[#f08a2f]" />
                                )}
                                <FiArrowRight className="text-xs text-[#d1d5db]" />
                              </div>
                            </button>
                            <span className="block h-px bg-[#f3f4f6] last:hidden" />
                          </li>
                        )
                      })
                    )}
                  </ul>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="border-t border-[#f0f2f5] px-4 py-2.5">
                      <button
                        onClick={() => { setActiveTab('orders'); setIsNotifOpen(false) }}
                        className="flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-[#f08a2f] transition hover:underline"
                      >
                        View all orders <FiArrowRight className="text-xs" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <span className="h-[30px] w-px border-r border-gray-200" />
              <div className="hidden text-right md:block">
                <p className="text-sm font-semibold text-[#202734]">{adminDisplayName}</p>
                <p className="text-xs text-[#8b95a4]">{adminDisplayEmail}</p>
              </div>
              <span title={adminDisplayEmail} className="grid h-10 w-10 place-items-center rounded-full bg-[#1f2937] text-sm font-semibold text-white overflow-hidden">
                {adminDisplayAvatar ? (
                  <img src={adminDisplayAvatar} alt={adminDisplayName} className="h-full w-full object-cover" />
                ) : (
                  (adminDisplayName || 'A').slice(0, 1).toUpperCase()
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">{renderContent()}</div>
      </div>
    </section>
  )
}

export default AdminPanelPage
