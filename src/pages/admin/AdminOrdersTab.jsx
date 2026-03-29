import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FiCheckCircle,
  FiPackage,
  FiPrinter,
  FiSearch,
  FiXCircle,
  FiMoreVertical,
  FiChevronDown,
} from 'react-icons/fi'
import { MdOutlineLocalShipping, MdCheckCircleOutline } from 'react-icons/md'
import { supabase } from '../../lib/supabase'

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   cls: 'bg-amber-50 text-amber-600 border border-amber-200' },
  approved:  { label: 'Approved',  cls: 'bg-blue-50 text-blue-600 border border-blue-200' },
  printing:  { label: 'Printing',  cls: 'bg-purple-50 text-purple-600 border border-purple-200' },
  shipped:   { label: 'Shipped',   cls: 'bg-sky-50 text-sky-600 border border-sky-200' },
  delivered: { label: 'Delivered', cls: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-50 text-red-500 border border-red-200' },
}

const ACTION_ITEMS = [
  { status: 'approved',  label: 'Mark as Approved',  icon: FiCheckCircle,         cls: 'text-[#374151]' },
  { status: 'shipped',   label: 'Mark as Shipped',   icon: MdOutlineLocalShipping, cls: 'text-[#374151]' },
  { status: 'delivered', label: 'Mark as Delivered', icon: MdCheckCircleOutline,  cls: 'text-emerald-600' },
  { status: 'cancelled', label: 'Cancel Order',      icon: FiXCircle,             cls: 'text-red-500' },
]

const AVATAR_COLORS = [
  'bg-orange-400', 'bg-blue-400', 'bg-purple-400',
  'bg-pink-400', 'bg-teal-400', 'bg-indigo-400',
]

const getAvatarColor = (str) => AVATAR_COLORS[(str?.charCodeAt(0) || 0) % AVATAR_COLORS.length]

const getCustomerName = (order) =>
  order.customerInfo?.fullName || order.userEmail?.split('@')[0] || 'Guest'

const getCustomerEmail = (order) => order.userEmail || order.customerInfo?.email || ''

const getProductSummary = (items) => {
  if (!items?.length) return '—'
  const first = `${items[0].quantity}x ${items[0].title}`
  return items.length > 1 ? `${first}, ${items.length - 1}x...` : first
}

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return {
    date: d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  }
}

const SelectFilter = ({ value, onChange, options, className = '' }) => (
  <div className={`relative ${className}`}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 appearance-none rounded-lg border border-[#e5e7eb] bg-white pl-3 pr-8 text-sm text-[#374151] outline-none focus:border-[#f08a2f] focus:ring-2 focus:ring-[#f08a2f]/15"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <FiChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#9ca3af]" />
  </div>
)

const AdminOrdersTab = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [openActionId, setOpenActionId] = useState(null)
  const dropdownRef = useRef(null)

  const loadOrders = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) {
        setOrders(data.map((row) => ({
          orderId: row.order_id,
          createdAt: row.created_at,
          status: row.status,
          items: row.items,
          subtotal: Number(row.subtotal),
          total: Number(row.total),
          userEmail: row.user_email,
          customerInfo: row.customer_info,
          paymentInfo: row.payment_info,
        })))
      }
    } catch (err) {
      console.error('Orders fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenActionId(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const updateStatus = async (orderId, newStatus) => {
    await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('order_id', orderId)
    await loadOrders()
    setOpenActionId(null)
  }

  const filtered = useMemo(() => {
    let result = [...orders]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (o) =>
          o.orderId?.toLowerCase().includes(q) ||
          getCustomerName(o).toLowerCase().includes(q) ||
          getCustomerEmail(o).toLowerCase().includes(q),
      )
    }

    if (statusFilter !== 'all') result = result.filter((o) => o.status === statusFilter)

    if (timeFilter !== 'all') {
      const now = new Date()
      result = result.filter((o) => {
        const d = new Date(o.createdAt)
        if (timeFilter === 'today') return d.toDateString() === now.toDateString()
        if (timeFilter === 'week') return d >= new Date(now - 7 * 24 * 60 * 60 * 1000)
        if (timeFilter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        return true
      })
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === 'highest') return Number(b.total) - Number(a.total)
      if (sortBy === 'lowest') return Number(a.total) - Number(b.total)
      return 0
    })

    return result
  }, [orders, searchQuery, statusFilter, timeFilter, sortBy])

  if (loading) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
      <span className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#f08a2f] border-t-transparent" />
      <p className="text-sm text-[#8d97a7]">Loading orders...</p>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#202734]">Orders Management</h2>
        <p className="mt-0.5 text-xs text-[#8d97a7]">Track and manage customer orders and fulfillment</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex h-10 flex-1 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3.5 text-sm text-[#6b7280] min-w-[200px]">
          <FiSearch className="shrink-0 text-[#9ca3af]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Customer Name or Email..."
            className="w-full bg-transparent outline-none placeholder:text-[#b0b8c5]"
          />
        </label>
        <SelectFilter
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'printing', label: 'Printing' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
        />
        <SelectFilter
          value={timeFilter}
          onChange={setTimeFilter}
          options={[
            { value: 'all', label: 'All Time' },
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
          ]}
        />
        <SelectFilter
          value={sortBy}
          onChange={setSortBy}
          options={[
            { value: 'newest', label: 'Newest First' },
            { value: 'oldest', label: 'Oldest First' },
            { value: 'highest', label: 'Highest Amount' },
            { value: 'lowest', label: 'Lowest Amount' },
          ]}
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#e7e9ef] bg-white shadow-sm">
        {filtered.length === 0 ? (
          <p className="py-14 text-center text-sm text-[#8893a3]">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f0f2f5] text-left text-[11px] font-semibold uppercase tracking-wider text-[#8d97a7]">
                  <th className="px-5 py-3.5">Order ID</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="hidden px-4 py-3.5 md:table-cell">Products</th>
                  <th className="px-4 py-3.5">Total</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="hidden px-4 py-3.5 lg:table-cell">Date</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const name = getCustomerName(order)
                  const email = getCustomerEmail(order)
                  const initial = name.charAt(0).toUpperCase()
                  const avatarCls = getAvatarColor(name)
                  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                  const dt = formatDate(order.createdAt)
                  const isOpen = openActionId === order.orderId

                  return (
                    <tr key={order.orderId} className="border-b border-[#f7f8fa] transition hover:bg-[#fafbfc]">
                      {/* Order ID */}
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold text-[#202734]">#{order.orderId}</span>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${avatarCls}`}>
                            {initial}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-[#202734]">{name}</p>
                            <p className="truncate text-[11px] text-[#9ca3af]">{email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Products */}
                      <td className="hidden max-w-[200px] px-4 py-4 md:table-cell">
                        <p className="truncate text-xs text-[#6b7280]">{getProductSummary(order.items)}</p>
                      </td>

                      {/* Total */}
                      <td className="px-4 py-4">
                        <span className="font-semibold text-[#202734]">${Number(order.total).toFixed(2)}</span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="hidden px-4 py-4 lg:table-cell">
                        <p className="text-xs font-medium text-[#374151]">{dt.date}</p>
                        <p className="text-[11px] text-[#9ca3af]">{dt.time}</p>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="relative flex justify-end" ref={isOpen ? dropdownRef : null}>
                          <button
                            onClick={() => setOpenActionId(isOpen ? null : order.orderId)}
                            className="grid h-8 w-8 place-items-center rounded-lg text-[#9ca3af] transition hover:bg-[#f3f4f6] hover:text-[#374151]"
                          >
                            <FiMoreVertical />
                          </button>

                          {isOpen && (
                            <div className="absolute right-0 top-9 z-30 w-52 overflow-hidden rounded-xl border border-[#e7e9ef] bg-white shadow-lg">
                              {ACTION_ITEMS.map((action) => {
                                const Icon = action.icon
                                const isCurrent = order.status === action.status
                                return (
                                  <button
                                    key={action.status}
                                    onClick={() => updateStatus(order.orderId, action.status)}
                                    disabled={isCurrent}
                                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
                                      isCurrent
                                        ? 'cursor-default bg-[#f9fafb] text-[#d1d5db]'
                                        : `${action.cls} hover:bg-[#f9fafb]`
                                    } ${action.status === 'cancelled' ? 'border-t border-[#f0f2f5]' : ''}`}
                                  >
                                    <Icon className="shrink-0 text-base" />
                                    {action.label}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-[#aab0ba]">{filtered.length} order{filtered.length !== 1 ? 's' : ''} found</p>
    </div>
  )
}

export default AdminOrdersTab
