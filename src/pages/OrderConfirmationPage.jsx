import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const formatPrice = (price) => `$${Number(price).toFixed(2)}`

const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

const OrderConfirmationPage = () => {
  const { lastOrder } = useCart()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 40)
    return () => clearTimeout(t)
  }, [])

  if (!lastOrder) {
    return <Navigate to="/shop" replace />
  }

  return (
    <section className="bg-[#f5f5f5] px-4 py-12 md:py-16">
      <div
        className={`container-custom max-w-4xl transition-all duration-500 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
        }`}
      >
        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-green-100 text-xl text-green-600">
              ✓
            </span>
            <div>
              <h1 className="text-xl font-semibold text-neutral md:text-2xl">Order Confirmed</h1>
              <p className="text-sm text-neutral/60">Thank you! Your order has been placed successfully.</p>
            </div>
          </div>

          <div className="grid gap-4 rounded-xl bg-base-200 p-4 text-sm md:grid-cols-3">
            <p>
              <span className="block text-neutral/50">Order ID</span>
              <span className="font-semibold text-neutral">{lastOrder.orderId}</span>
            </p>
            <p>
              <span className="block text-neutral/50">Date</span>
              <span className="font-semibold text-neutral">{formatDate(lastOrder.createdAt)}</span>
            </p>
            <p>
              <span className="block text-neutral/50">Payment</span>
              <span className="font-semibold text-neutral">
                {lastOrder.paymentInfo.method === 'card'
                  ? `Card ending ${lastOrder.paymentInfo.cardEnding || '****'}`
                  : 'Cash on Delivery'}
              </span>
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {lastOrder.items.map((item) => (
              <article key={item.id} className="flex items-center justify-between rounded-xl border border-base-300 p-3">
                <div className="flex items-center gap-3">
                  <img src={item.image} alt={item.brand} className="h-14 w-12 rounded object-cover" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.08em] text-neutral/50">{item.brand}</p>
                    <p className="text-sm text-neutral">{item.title}</p>
                    <p className="text-xs text-neutral/60">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-neutral">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-6 border-t border-base-300 pt-5">
            <div className="flex items-center justify-between">
              <p className="font-medium text-neutral">Total Paid</p>
              <p className="text-xl font-bold text-neutral">{formatPrice(lastOrder.total)}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/shop" className="btn bg-[#323232] text-white shadow-none font-semibold hover:bg-[#323232]/90 transition-all duration-300">
              Continue Shopping
            </Link>
            <Link to="/" className="btn btn-outline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default OrderConfirmationPage
