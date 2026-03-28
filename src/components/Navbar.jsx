import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useAdminAuth } from '../context/AdminAuthContext'
import { MdLogout, MdOutlineDashboard } from 'react-icons/md'
import { RiAdminLine } from 'react-icons/ri'
import Swal from 'sweetalert2'

const iconClass = 'h-5 w-5 stroke-[1.8]'
const menuItems = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Contact', to: '/contact' },
]

const navClass = ({ isActive }) => `transition hover:text-neutral ${isActive ? 'text-neutral' : ''}`

const Navbar = () => {
  const { cartItems, cartCount, subtotal, increaseQuantity, decreaseQuantity, removeFromCart } = useCart()
  const { currentUser, isAuthenticated, logout } = useAuth()
  const { isAdminAuthenticated, currentAdmin, adminLogout } = useAdminAuth()
  const hasAccountSession = isAuthenticated || isAdminAuthenticated
  const profileName = isAdminAuthenticated ? 'Administrator' : currentUser?.fullName
  const profileEmail = isAdminAuthenticated ? currentAdmin?.email : currentUser?.email
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen || isCartOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen, isCartOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleUserLogout = async () => {
    const result = await Swal.fire({
      icon: 'question',
      title: 'Logout now?',
      text: 'You will need to login again to access your account.',
      showCancelButton: true,
      confirmButtonText: 'Logout',
      confirmButtonColor: '#323232',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      logout()
      setIsProfileDropdownOpen(false)
      await Swal.fire({
        icon: 'success',
        title: 'Logged out',
        timer: 1200,
        showConfirmButton: false,
      })
    }
  }

  const handleAdminLogout = async () => {
    const result = await Swal.fire({
      icon: 'question',
      title: 'Logout admin?',
      showCancelButton: true,
      confirmButtonText: 'Logout',
      confirmButtonColor: '#323232',
    })

    if (result.isConfirmed) {
      adminLogout()
      logout()
      setIsProfileDropdownOpen(false)
      await Swal.fire({
        icon: 'success',
        title: 'Admin logged out',
        timer: 1200,
        showConfirmButton: false,
      })
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-base-100/95 backdrop-blur">
        <div className="bg-neutral px-4 py-2 text-center text-xs font-medium uppercase tracking-[0.2em] text-white md:text-sm">
          Free shipping worldwide - 30 day easy returns
        </div>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <Link to="/" className="text-base md:text-xl font-bold tracking-[0.2em] text-neutral">
            SHOPWARE
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium uppercase tracking-[0.14em] text-neutral/70 lg:flex">
            {menuItems.map((item) => (
              <NavLink key={item.label} to={item.to} end={item.to === '/'} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            {/* <div className="hidden items-center gap-2 lg:flex">
              <NavLink to="/login" className="btn btn-ghost btn-sm">
                Login
              </NavLink>
              <NavLink to="/signup" className="btn btn-neutral btn-sm">
                Signup
              </NavLink>
            </div> */}
            <button className="btn btn-ghost btn-circle btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={iconClass}>
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.05 6.05a7.5 7.5 0 0 0 10.6 10.6Z" />
              </svg>
            </button>
            <button className="btn btn-ghost btn-circle btn-sm relative" onClick={() => setIsCartOpen(true)} aria-label="Open cart">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={iconClass}>
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.39c.51 0 .95.36 1.05.86L5.7 8.5m0 0h13.52c.5 0 .93.35 1.03.84l.84 3.9a1.06 1.06 0 0 1-1.03 1.28H8.15a1.06 1.06 0 0 1-1.03-.82L5.7 8.5Zm2.8 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm10.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
              </svg>
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              ) : null}
            </button>
            {hasAccountSession ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  className={`btn btn-circle btn-sm overflow-hidden border border-base-300 bg-base-200 font-semibold uppercase transition ${
                    isProfileDropdownOpen ? 'shadow-md ring-2 ring-neutral/20' : ''
                  }`}
                  onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                  aria-label="Open profile menu"
                  title={profileName || 'Profile'}
                >
                  {(profileName || 'U').slice(0, 1)}
                </button>

                <div
                  className={`absolute right-0 top-12 w-72 rounded-2xl border border-base-300 bg-white p-3 shadow-premium transition duration-200 ${
                    isProfileDropdownOpen
                      ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
                      : 'pointer-events-none -translate-y-1 scale-95 opacity-0'
                  }`}
                >
                  <div className="rounded-xl bg-base-200 p-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-neutral text-sm font-semibold text-white">
                        {(profileName || 'U').slice(0, 1)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-neutral">{profileName}</p>
                        <p className="text-xs text-neutral/60">{profileEmail}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3">
                    <Link
                      to="/dashboard"
                      className="btn px-3 text-sm font-medium btn-ghost btn-sm w-full justify-start rounded-sm"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <MdOutlineDashboard />
                      Dashboard
                    </Link>
                    {isAdminAuthenticated ? (
                      <Link
                        to="/admin"
                        className="btn px-3 text-sm font-medium btn-ghost btn-sm mt-2 w-full justify-start rounded-sm"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <RiAdminLine />
                        Admin Panel
                      </Link>
                    ) : null}
                    <button
                      className="btn px-3 text-sm btn-outline btn-sm mt-2 w-full justify-start rounded-sm border-red-200 text-red-500 hover:border-red-500 hover:bg-red-50"
                      onClick={isAdminAuthenticated ? handleAdminLogout : handleUserLogout}
                    >
                      <MdLogout />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn btn-ghost btn-circle btn-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={iconClass}>
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M17.98 18.73a9 9 0 0 0-11.96 0M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 1a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </Link>
            )}

            <button
              className="btn btn-ghost btn-circle btn-sm lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={iconClass}>
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75h15m-15 5.25h15m-15 5.25h15" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-50 transition ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!isMobileMenuOpen}
      >
        <button
          className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu overlay"
        />
        <aside
          className={`absolute right-0 top-0 h-full w-[82%] max-w-sm bg-base-100 p-6 shadow-premium transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="mb-6 flex items-center justify-between border-b border-base-300 pb-4">
            <p className="text-lg font-bold tracking-[0.14em]">MENU</p>
            <button className="btn btn-ghost btn-circle btn-sm" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={iconClass}>
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col gap-4 text-sm font-medium uppercase tracking-[0.14em] text-neutral/80">
            {menuItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === '/'}
                className="rounded-lg px-2 py-2 transition hover:bg-base-200 hover:text-neutral"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-base-300 pt-4">
              {isAdminAuthenticated ? (
                <>
                  <NavLink to="/dashboard" className="btn btn-sm btn-ghost" onClick={() => setIsMobileMenuOpen(false)}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/admin" className="btn btn-sm btn-ghost" onClick={() => setIsMobileMenuOpen(false)}>
                    Admin Panel
                  </NavLink>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={async () => {
                      setIsMobileMenuOpen(false)
                      await handleAdminLogout()
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : isAuthenticated ? (
                <>
                  <NavLink to="/dashboard" className="btn btn-sm btn-ghost" onClick={() => setIsMobileMenuOpen(false)}>
                    Dashboard
                  </NavLink>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={async () => {
                      setIsMobileMenuOpen(false)
                      await handleUserLogout()
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="btn btn-sm btn-ghost" onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </NavLink>
                  <NavLink to="/signup" className="btn btn-sm btn-neutral" onClick={() => setIsMobileMenuOpen(false)}>
                    Signup
                  </NavLink>
                </>
              )}
            </div>
          </nav>
        </aside>
      </div>

      <div
        className={`fixed inset-0 z-[60] transition ${isCartOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!isCartOpen}
      >
        <button
          className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${
            isCartOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsCartOpen(false)}
          aria-label="Close cart overlay"
        />

        <aside
          className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-base-100 shadow-premium transition-transform duration-300 ${
            isCartOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-base-300 px-5 py-4">
            <h3 className="text-base font-semibold uppercase tracking-[0.08em] text-neutral">Your Cart ({cartCount})</h3>
            <button className="btn btn-ghost btn-circle btn-sm" onClick={() => setIsCartOpen(false)} aria-label="Close cart">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={iconClass}>
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {cartItems.length === 0 ? (
              <p className="text-sm text-neutral/60 text-center pt-5">No products added yet.</p>
            ) : (
              cartItems.map((item) => (
                <article key={item.id} className="rounded-xl border border-base-300 p-3">
                  <div className="flex gap-3">
                    <img src={item.image} alt={item.brand} className="h-16 w-14 rounded object-cover" />
                    <div className="flex-1">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-neutral/50">{item.brand}</p>
                      <h4 className="line-clamp-2 text-sm text-neutral">{item.title}</h4>
                      <p className="mt-1 text-sm font-semibold text-neutral">${Number(item.price).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center rounded-full border border-base-300 bg-base-200 p-1">
                      <button
                        className="grid h-7 w-7 place-items-center rounded-full text-sm font-semibold text-neutral transition hover:bg-white"
                        onClick={() => decreaseQuantity(item.id)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        className="grid h-7 w-7 place-items-center rounded-full text-sm font-semibold text-neutral transition hover:bg-white"
                        onClick={() => increaseQuantity(item.id)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-neutral">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button className="text-xs font-medium text-red-500 hover:underline" onClick={() => removeFromCart(item.id)}>
                      Remove
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="border-t border-base-300 px-5 py-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-neutral/60">Subtotal</p>
              <p className="text-lg font-semibold text-neutral">${subtotal.toFixed(2)}</p>
            </div>
            <Link
              to="/checkout"
              className={`btn w-full ${cartItems.length > 0 ? 'bg-[#323232] text-white shadow-none font-semibold hover:bg-[#323232]/90 transition-all duration-300' : 'btn-disabled'}`}
              onClick={() => setIsCartOpen(false)}
            >
              Purchase Now
            </Link>
          </div>
        </aside>
      </div>
    </>
  )
}

export default Navbar
