import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const formatPrice = (price) => `$${Number(price).toFixed(2)}`
const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  })

const OrderDetailsPage = () => {
  const { orderId } = useParams()
  const { isAuthenticated } = useAuth()
  const { orderHistory } = useCart()
  const order = orderHistory.find((item) => item.orderId === orderId)

  if (!isAuthenticated) {
    return (
      <section className="bg-[#f1f1f1] py-10 md:py-12">
        <div className="container-custom">
          <div className="rounded-xl border border-[#d9dde3] bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-[#5f6f85]">Please login to view order details.</p>
            <Link to="/login" className="btn btn-neutral mt-4">Go to Login</Link>
          </div>
        </div>
      </section>
    )
  }

  if (!order) {
    return (
      <section className="bg-[#f1f1f1] py-10 md:py-12">
        <div className="container-custom">
          <div className="rounded-xl border border-[#d9dde3] bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-[#5f6f85]">Order not found.</p>
            <Link to="/dashboard/orders" className="btn btn-neutral mt-4">Back to All Orders</Link>
          </div>
        </div>
      </section>
    )
  }

  const shippingAddress = order.customerInfo?.address
    ? `${order.customerInfo.address}${order.customerInfo.city ? `, ${order.customerInfo.city}` : ''}`
    : 'Address not provided'

  return (
    <section className="bg-[#f1f1f1] py-8 md:py-12">
      <div className="container-custom">
        <Link to="/dashboard/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1363df] hover:underline">
          <span>←</span> Back
        </Link>

        <h1 className="mt-4 text-3xl font-semibold text-[#1b2940]">Order {order.orderId.replace('ORD-', '#')}</h1>
        <div className="mt-2 flex items-center gap-4 text-sm">
          <p className="text-[#6e7f95]">{formatDate(order.createdAt)}</p>
          <p className="font-semibold uppercase tracking-[0.06em] text-[#0d9f42]">{order.status || 'pending'}</p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[auto_320px]">
          <article className="overflow-hidden rounded-xl border border-[#d9dde3] bg-white shadow-sm">
            <div className="border-b border-[#eceff3] px-5 py-4">
              <h2 className="text-2xl font-semibold text-[#1b2940]">Items</h2>
            </div>

            <div className="space-y-4 p-5">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between rounded-xl bg-[#f6f7f9] p-4">
                  <div className="sm:flex gap-3 items-center">
                    <img src={item.image} alt={item.brand} className="h-14 w-12 rounded object-cover mb-2 sm:mb-0" />
                    <div>
                      <p className="text-sm font-semibold text-[#1b2940]">{item.brand}</p>
                      <p className="text-xs text-[#5f6f85] my-1">Quantity: {item.quantity}</p>
                      <p className="mt-1 inline-block rounded bg-[#eceff3] px-2 py-1 text-[10px] text-[#6e7f95]">
                        {item.title}
                      </p>
                    </div>
                  </div>
                  <p className="text-base font-semibold text-[#1b2940]">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-[#eceff3] px-5 py-4 text-right">
              <p className="text-lg font-semibold text-[#1b2940]">Total: {formatPrice(order.total)}</p>
            </div>
          </article>

          <div className="space-y-4">
            <article className="rounded-xl border border-[#d9dde3] bg-white p-5 shadow-sm">
              <h3 className="text-xl font-semibold text-[#1b2940]">Shipping Address</h3>
              <p className="mt-3 text-sm text-[#1f3351]">{shippingAddress}</p>
            </article>
            <article className="rounded-xl border border-[#d9dde3] bg-white p-5 shadow-sm">
              <h3 className="text-xl font-semibold text-[#1b2940]">Payment Method</h3>
              <p className="mt-3 text-sm text-[#1f3351] capitalize">
                {order.paymentInfo?.method === 'card' ? 'credit-card' : 'cash-on-delivery'}
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}

export default OrderDetailsPage
