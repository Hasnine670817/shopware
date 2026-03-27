import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const iconClass = 'h-5 w-5 stroke-[1.8]'
const menuItems = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  // { label: 'Collection', to: '/collection' },
  { label: 'Contact', to: '/contact' },
]
const authItems = [
  { label: 'Login', to: '/login' },
  { label: 'Signup', to: '/signup' },
]

const navClass = ({ isActive }) => `transition hover:text-neutral ${isActive ? 'text-neutral' : ''}`
const formatPrice = (price) => `$${Number(price).toFixed(2)}`

const Navbar = () => {
  const { cartItems, cartCount, subtotal, increaseQuantity, decreaseQuantity, removeFromCart, orderHistory } = useCart()
  const { currentUser, isAuthenticated, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen || isCartOpen || isAccountOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen, isCartOpen, isAccountOpen])

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
            {isAuthenticated ? (
              <button
                className="btn btn-ghost btn-circle btn-sm overflow-hidden bg-base-200 font-semibold uppercase"
                onClick={() => setIsAccountOpen(true)}
                aria-label="Open account panel"
                title={currentUser?.fullName || 'Account'}
              >
                {(currentUser?.fullName || 'U').slice(0, 1)}
              </button>
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
            <div className="mt-3 flex items-center gap-2 border-t border-base-300 pt-4">
              {authItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={`btn btn-sm ${item.label === 'Signup' ? 'btn-neutral' : 'btn-ghost'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
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

      <div
        className={`fixed inset-0 z-[65] transition ${isAccountOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!isAccountOpen}
      >
        <button
          className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${
            isAccountOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsAccountOpen(false)}
          aria-label="Close account overlay"
        />

        <aside
          className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-base-100 shadow-premium transition-transform duration-300 ${
            isAccountOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-base-300 px-5 py-4">
            <h3 className="text-base font-semibold uppercase tracking-[0.08em] text-neutral">My Account</h3>
            <button className="btn btn-ghost btn-circle btn-sm" onClick={() => setIsAccountOpen(false)} aria-label="Close account panel">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={iconClass}>
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {isAuthenticated ? (
            <>
              <div className="border-b border-base-300 px-5 py-4">
                <p className="text-sm font-semibold text-neutral">{currentUser?.fullName}</p>
                <p className="text-xs text-neutral/60">{currentUser?.email}</p>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <h4 className="text-sm font-semibold uppercase tracking-[0.08em] text-neutral/70">
                  Order History
                </h4>
                {orderHistory.length === 0 ? (
                  <p className="mt-3 text-sm text-neutral/60">No orders yet.</p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {orderHistory.map((order) => (
                      <article key={order.orderId} className="rounded-xl border border-base-300 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-neutral">{order.orderId}</p>
                          <p className="text-xs text-neutral/60">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="mt-2 text-xs text-neutral/60">
                          {order.items.length} item(s) • {formatPrice(order.total)}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
              <div className="border-t border-base-300 px-5 py-4">
                <button
                  className="btn btn-outline w-full"
                  onClick={() => {
                    logout()
                    setIsAccountOpen(false)
                  }}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="p-5">
              <p className="text-sm text-neutral/70">Please login to view your orders.</p>
              <Link to="/login" className="btn btn-neutral mt-4 w-full" onClick={() => setIsAccountOpen(false)}>
                Go to Login
              </Link>
            </div>
          )}
        </aside>
      </div>
    </>
  )
}

export default Navbar
