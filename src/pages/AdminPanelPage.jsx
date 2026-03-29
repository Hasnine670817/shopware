import { useEffect, useMemo, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiBox,
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
import { useAdminAuth } from '../context/AdminAuthContext'
import { useAuth } from '../context/AuthContext'
import { useProducts } from '../context/ProductContext'
import { supabase } from '../lib/supabase'
import AdminDashboardTab from './admin/AdminDashboardTab'
import AdminProductsTab from './admin/AdminProductsTab'
import AdminOrdersTab from './admin/AdminOrdersTab'
import AdminUsersTab from './admin/AdminUsersTab'
import AdminSettingsTab from './admin/AdminSettingsTab'
import { IoMdNotificationsOutline } from 'react-icons/io'

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

      {/* Overlay */}
      <button
        className={`fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
        aria-label="Close admin sidebar overlay"
      />

      {/* Main content */}
      <div className="min-w-0 lg:ml-[260px]">
        {/* Topbar */}
        <div className="sticky top-0 z-20 border-b border-[#e6e9ee] bg-white px-4 py-3.5 md:px-6">
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

            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#eceff4] text-[#1f2937] cursor-pointer">
                <IoMdNotificationsOutline className='text-xl' />
              </span>
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
