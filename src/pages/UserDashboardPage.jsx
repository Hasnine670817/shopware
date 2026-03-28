import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { RiArrowRightSLine } from 'react-icons/ri'
import Swal from 'sweetalert2'
import { FaCartArrowDown } from 'react-icons/fa6'

const formatPrice = (price) => `$${Number(price).toFixed(2)}`
const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  })

const UserDashboardPage = () => {
  const navigate = useNavigate()
  const { currentUser, isAuthenticated, logout } = useAuth()
  const { orderHistory } = useCart()
  const recentOrders = orderHistory.slice(0, 5)

  const handleLogout = async () => {
    const result = await Swal.fire({
      icon: 'question',
      title: 'Logout now?',
      text: 'You will be returned to the home page.',
      showCancelButton: true,
      confirmButtonText: 'Logout',
      confirmButtonColor: '#323232',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      logout()
      await Swal.fire({
        icon: 'success',
        title: 'Logged out',
        timer: 1200,
        showConfirmButton: false,
      })
      navigate('/')
    }
  }

  if (!isAuthenticated) {
    return (
      <section className="bg-[#f5f5f5] py-12 md:py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-neutral">Login Required</h1>
            <p className="mt-2 text-sm text-neutral/60">
              Please login first to view your dashboard and order history.
            </p>
            <Link to="/login" className="btn btn-neutral mt-5">
              Go to Login
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-[#f1f1f1] py-8 md:py-12">
      <div className="container-custom">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold leading-tight text-[#1b2940]">
              Hi, {currentUser?.fullName}!
            </h1>
            <p className="mt-1 text-sm text-[#243b5b]">Welcome back to your dashboard.</p>
          </div>
          <button
            className="btn btn-sm rounded border border-[#c7ccd3] bg-white px-5 text-[#1b2940] hover:bg-[#f7f8fa]"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[auto_320px]">
          <article className="overflow-hidden rounded-xl border border-[#d9dde3] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e3e6eb] px-4 py-4 md:px-6">
              <h2 className="text-xl font-semibold text-[#1b2940]">Recent Orders</h2>
              <Link to="/dashboard/orders" className="text-sm font-semibold text-[#1363df] hover:underline">
                View all
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-6 text-center h-full flex flex-col items-center justify-center">
                <FaCartArrowDown className='text-4xl text-[#5f6f85] mb-2 mx-auto' />
                <p className="text-sm text-[#5f6f85] text-center">No orders yet.</p>
                <Link to="/shop" className="mt-3 inline-block text-sm font-medium text-[#1363df] hover:underline">
                  Start shopping
                </Link>
              </div>
            ) : (
              <div>
                {recentOrders.map((order) => (
                  <Link
                    key={order.orderId}
                    to={`/dashboard/orders/${order.orderId}`}
                    className="flex items-start justify-between gap-4 border-b border-[#eceff3] px-4 pe-9 py-5 transition hover:bg-[#f9fafc] md:px-6 md:pe-10 relative"
                  >
                    <span className='absolute right-3 top-1/2 -translate-y-1/2 opacity-50 text-xl'>
                      <RiArrowRightSLine />
                    </span>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-[#1b2940]">Order {order.orderId.replace('ORD-', '#')}</p>
                      <div className='flex flex-wrap items-center gap-2 mt-1'>
                        <p className="text-xs text-[#6e7f95]">{formatDate(order.createdAt)},</p>
                        <p className="line-clamp-1 text-xs text-[#1f3351]">
                          {order.items.map((item) => `${item.quantity}x ${item.brand}`).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-base font-semibold text-[#1b2940]">{formatPrice(order.total)}</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#0d9f42]">
                        {order.status || 'pending'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </article>

          <div className="space-y-4">
            <article className="rounded-xl border border-[#d9dde3] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3 border-b border-[#eceff3] pb-4">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[#d9dde3] text-sm font-semibold text-[#1b2940]">
                  {(currentUser?.fullName || 'U').slice(0, 1)}
                </span>
                <div>
                  <p className="text-base font-semibold text-[#1b2940]">{currentUser?.fullName}</p>
                  <p className="text-xs text-[#5f6f85]">{currentUser?.email}</p>
                </div>
              </div>
              <div className="pt-4">
                <h3 className="text-base font-semibold text-[#1b2940]">Account Details</h3>
                <p className="mt-2 text-[11px] uppercase tracking-[0.08em] text-[#7d8da1]">Account status</p>
                <p className="text-sm font-semibold text-[#08a642]">Active</p>
                <div className="mt-4 space-y-2">
                  <button className="text-sm font-semibold text-[#1363df] hover:underline">Edit profile</button>
                  <button className="block text-sm font-semibold text-[#1363df] hover:underline">My Wishlist</button>
                </div>
              </div>
            </article>

            <article className="rounded-xl bg-[#30343a] p-5 text-white shadow-sm">
              <h3 className="text-xl font-semibold">Need help?</h3>
              <p className="mt-2 text-sm text-white/80">
                Our support team is available 24/7 to assist you with your orders.
              </p>
              <Link to="/contact" className="btn mt-4 w-full border-0 bg-white text-[#1f2937] hover:bg-white/90">
                Contact Support
              </Link>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}

export default UserDashboardPage
