import { useState } from 'react'
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
} from 'react-icons/fi'
import { LuLayoutDashboard } from 'react-icons/lu'
import { IoHomeOutline } from 'react-icons/io5'
import { useAdminAuth } from '../context/AdminAuthContext'
import AdminDashboardTab from './admin/AdminDashboardTab'
import AdminProductsTab from './admin/AdminProductsTab'
import AdminOrdersTab from './admin/AdminOrdersTab'
import AdminUsersTab from './admin/AdminUsersTab'
import AdminSettingsTab from './admin/AdminSettingsTab'

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LuLayoutDashboard },
  { id: 'products', label: 'Products', icon: FiPackage },
  { id: 'orders', label: 'Orders', icon: FiShoppingCart },
  { id: 'users', label: 'Users', icon: FiUsers },
  { id: 'settings', label: 'Settings', icon: FiSettings },
]

const AdminPanelPage = () => {
  const navigate = useNavigate()
  const { adminLogout, currentAdmin } = useAdminAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleAdminLogout = async () => {
    await adminLogout()
    await Swal.fire({ icon: 'success', title: 'Logged out', confirmButtonColor: '#323232' })
    navigate('/')
  }

  const renderContent = () => {
    if (activeTab === 'products') return <AdminProductsTab />
    if (activeTab === 'orders') return <AdminOrdersTab />
    if (activeTab === 'users') return <AdminUsersTab />
    if (activeTab === 'settings') return <AdminSettingsTab />
    return <AdminDashboardTab />
  }

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
              <label className="hidden h-[38px] min-w-[220px] items-center gap-2 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-sm text-[#6b7280] sm:flex md:min-w-[340px]">
                <FiSearch className="text-base" />
                <input
                  type="text"
                  placeholder="Search orders, products, users..."
                  className="w-full bg-transparent outline-none placeholder:text-[#9ca3af]"
                />
              </label>
            </div>

            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#eceff4] text-[#1f2937]">
                <FiBox />
              </span>
              <span className="h-[30px] w-px border-r border-gray-200" />
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-[#202734]">{currentAdmin?.fullName}</p>
                <p className="text-xs text-[#8b95a4]">{currentAdmin?.email}</p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#1f2937] text-sm font-semibold text-white">
                A
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
