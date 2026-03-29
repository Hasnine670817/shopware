import { useEffect, useMemo, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import {
  FiCalendar,
  FiChevronDown,
  FiClipboard,
  FiMoreVertical,
  FiSearch,
  FiSlash,
  FiTrash2,
} from 'react-icons/fi'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const AdminLoader = ({ text = 'Loading...' }) => (
  <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
    <span className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#f08a2f] border-t-transparent" />
    <p className="text-sm text-[#8d97a7]">{text}</p>
  </div>
)

const AVATAR_COLORS = [
  'bg-orange-400', 'bg-blue-400', 'bg-purple-400',
  'bg-pink-400', 'bg-teal-400', 'bg-indigo-400',
]

const getAvatarColor = (str = '') =>
  AVATAR_COLORS[(str.charCodeAt(0) || 0) % AVATAR_COLORS.length]

const SelectFilter = ({ value, onChange, options }) => (
  <div className="relative">
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

const AdminUsersTab = () => {
  const { users, deleteUser, toggleBlockUser, authLoading } = useAuth()
  const { currentAdmin } = useAdminAuth()
  const [orderCounts, setOrderCounts] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [openActionId, setOpenActionId] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const fetchOrderCounts = async () => {
      const { data } = await supabase.from('orders').select('user_email')
      if (data) {
        const counts = {}
        data.forEach(({ user_email }) => {
          if (user_email) counts[user_email.toLowerCase()] = (counts[user_email.toLowerCase()] || 0) + 1
        })
        setOrderCounts(counts)
      }
    }
    fetchOrderCounts()
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

  const getUserRole = (user) =>
    user.email === currentAdmin?.email || user.role === 'admin' ? 'admin' : 'user'

  const filtered = useMemo(() => {
    let result = [...users]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q),
      )
    }

    if (roleFilter !== 'all') {
      result = result.filter((u) => getUserRole(u) === roleFilter)
    }

    if (statusFilter === 'active') result = result.filter((u) => !u.blocked)
    if (statusFilter === 'blocked') result = result.filter((u) => u.blocked)

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      if (sortBy === 'name') return (a.fullName || '').localeCompare(b.fullName || '')
      return 0
    })

    return result
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, searchQuery, roleFilter, statusFilter, sortBy, currentAdmin])

  const handleDelete = async (user) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: `Delete ${user.fullName || user.email}?`,
      text: 'This action cannot be undone.',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#dc2626',
    })
    if (result.isConfirmed) {
      deleteUser(user.id)
      await Swal.fire({ icon: 'success', title: 'User deleted', confirmButtonColor: '#323232' })
    }
    setOpenActionId(null)
  }

  const handleBlock = async (user) => {
    const isBlocking = !user.blocked
    const result = await Swal.fire({
      icon: 'warning',
      title: `${isBlocking ? 'Block' : 'Unblock'} ${user.fullName || user.email}?`,
      showCancelButton: true,
      confirmButtonText: isBlocking ? 'Block' : 'Unblock',
      confirmButtonColor: isBlocking ? '#f08a2f' : '#16a34a',
    })
    if (result.isConfirmed) {
      toggleBlockUser(user.id)
      await Swal.fire({
        icon: 'success',
        title: isBlocking ? 'User blocked' : 'User unblocked',
        confirmButtonColor: '#323232',
      })
    }
    setOpenActionId(null)
  }

  if (authLoading) return <AdminLoader text="Loading users..." />

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#202734]">Users Management</h2>
        <p className="mt-0.5 text-xs text-[#8d97a7]">View and manage your customer base</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex h-10 flex-1 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3.5 text-sm text-[#6b7280] min-w-[200px]">
          <FiSearch className="shrink-0 text-[#9ca3af]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-transparent outline-none placeholder:text-[#b0b8c5]"
          />
        </label>
        <SelectFilter
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
            { value: 'all', label: 'All Roles' },
            { value: 'user', label: 'User' },
            { value: 'admin', label: 'Admin' },
          ]}
        />
        <SelectFilter
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'active', label: 'Active' },
            { value: 'blocked', label: 'Blocked' },
          ]}
        />
        <SelectFilter
          value={sortBy}
          onChange={setSortBy}
          options={[
            { value: 'newest', label: 'Newest First' },
            { value: 'oldest', label: 'Oldest First' },
            { value: 'name', label: 'Name A–Z' },
          ]}
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#e7e9ef] bg-white shadow-sm">
        {filtered.length === 0 ? (
          <p className="py-14 text-center text-sm text-[#8893a3]">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f0f2f5] text-left text-[11px] font-semibold uppercase tracking-wider text-[#8d97a7]">
                  <th className="px-5 py-3.5">User ID</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="hidden px-4 py-3.5 md:table-cell">Total Orders</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="hidden px-4 py-3.5 lg:table-cell">Joined Date</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const role = getUserRole(user)
                  const isAdmin = role === 'admin'
                  const isOpen = openActionId === user.id
                  const orderCount = orderCounts[user.email?.toLowerCase()] || 0
                  const initial = (user.fullName || user.email || 'U').charAt(0).toUpperCase()
                  const avatarCls = getAvatarColor(user.fullName || user.email)
                  const joinedDate = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
                    : 'N/A'

                  return (
                    <tr key={user.id} className="border-b border-[#f7f8fa] transition hover:bg-[#fafbfc]">
                      {/* User ID */}
                      <td className="px-5 py-4">
                        <span className="max-w-[130px] truncate font-mono text-xs text-[#6b7280]">
                          #{String(user.id).slice(0, 18)}...
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold text-white ${avatarCls}`}>
                            {initial}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-[#202734]">
                              {user.fullName || '—'}
                            </p>
                            <p className="truncate text-[11px] text-[#9ca3af]">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-4">
                        <span className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                          isAdmin
                            ? 'bg-purple-50 text-purple-600'
                            : 'bg-blue-50 text-blue-600'
                        }`}>
                          {role}
                        </span>
                      </td>

                      {/* Total Orders */}
                      <td className="hidden px-4 py-4 md:table-cell">
                        <div className="flex items-center gap-1.5 text-[#6b7280]">
                          <FiClipboard className="text-xs" />
                          <span className="text-sm">{orderCount}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className={`text-xs font-semibold uppercase tracking-wide ${
                          user.blocked ? 'text-red-500' : 'text-emerald-500'
                        }`}>
                          {user.blocked ? 'BLOCKED' : 'ACTIVE'}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="hidden px-4 py-4 lg:table-cell">
                        <div className="flex items-center gap-1.5 text-[#6b7280]">
                          <FiCalendar className="text-xs shrink-0" />
                          <span className="text-xs">{joinedDate}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="relative flex justify-end" ref={isOpen ? dropdownRef : null}>
                          <button
                            onClick={() => setOpenActionId(isOpen ? null : user.id)}
                            className="grid h-8 w-8 place-items-center rounded-lg text-[#9ca3af] transition hover:bg-[#f3f4f6] hover:text-[#374151]"
                          >
                            <FiMoreVertical />
                          </button>

                          {isOpen && (
                            <div className="absolute right-0 top-9 z-30 w-44 overflow-hidden rounded-xl border border-[#e7e9ef] bg-white py-1 shadow-lg">
                              <button
                                onClick={() => handleBlock(user)}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#f08a2f] transition hover:bg-[#fff7f0]"
                              >
                                <FiSlash className="shrink-0 text-base" />
                                {user.blocked ? 'Unblock User' : 'Block User'}
                              </button>
                              {!isAdmin && (
                                <button
                                  onClick={() => handleDelete(user)}
                                  className="flex w-full items-center gap-3 border-t border-[#f0f2f5] px-4 py-2.5 text-left text-sm text-red-500 transition hover:bg-red-50"
                                >
                                  <FiTrash2 className="shrink-0 text-base" />
                                  Delete User
                                </button>
                              )}
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

      <p className="text-xs text-[#aab0ba]">{filtered.length} user{filtered.length !== 1 ? 's' : ''} found</p>
    </div>
  )
}

export default AdminUsersTab
