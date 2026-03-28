import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { RiArrowRightSLine } from 'react-icons/ri'

const formatPrice = (price) => `$${Number(price).toFixed(2)}`
const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  })

const AllOrdersPage = () => {
  const { isAuthenticated } = useAuth()
  const { orderHistory } = useCart()

  if (!isAuthenticated) {
    return (
      <section className="bg-[#f1f1f1] py-10 md:py-12">
        <div className="container-custom">
          <div className="rounded-xl border border-[#d9dde3] bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-[#5f6f85]">Please login to view orders.</p>
            <Link to="/login" className="btn btn-neutral mt-4">Go to Login</Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-[#f1f1f1] py-8 md:py-12">
      <div className="container-custom">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1363df] hover:underline">
          <span>←</span> Back to Dashboard
        </Link>

        <h1 className="mt-4 text-3xl font-semibold text-[#1b2940]">All Orders</h1>

        <article className="mt-5 overflow-hidden rounded-xl border border-[#d9dde3] bg-white shadow-sm">
          {orderHistory.length === 0 ? (
            <p className="p-6 text-sm text-[#5f6f85]">No orders found.</p>
          ) : (
            orderHistory.map((order) => (
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
            ))
          )}
        </article>
      </div>
    </section>
  )
}

export default AllOrdersPage
