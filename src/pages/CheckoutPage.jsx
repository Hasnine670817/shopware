import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const formatPrice = (price) => `$${Number(price).toFixed(2)}`

const CheckoutPage = () => {
  const { cartItems, subtotal } = useCart()

  return (
    <section className="bg-[#f5f5f5] px-4 py-12 md:py-16">
      <div className="container-custom">
        <h1 className="mb-6 text-2xl font-semibold uppercase tracking-[0.08em] text-[#222] md:text-4xl">
          Checkout
        </h1>

        {cartItems.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-neutral/70">Your cart is empty.</p>
            <Link to="/shop" className="btn bg-[#323232] text-white shadow-none font-semibold hover:bg-[#323232]/90 transition-all duration-300 mt-4">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[auto_360px]">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <article key={item.id} className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm">
                  <img src={item.image} alt={item.brand} className="h-24 w-20 rounded object-cover" />
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.08em] text-neutral/50">{item.brand}</p>
                    <h3 className="text-sm font-medium text-neutral">{item.title}</h3>
                    <p className="mt-1 text-sm text-neutral/70">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-neutral">{formatPrice(item.price * item.quantity)}</p>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold uppercase tracking-[0.08em] text-neutral">Order Summary</h2>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="text-neutral/60">Subtotal</span>
                <span className="font-semibold text-neutral">{formatPrice(subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-neutral/60">Shipping</span>
                <span className="font-semibold text-neutral">Free</span>
              </div>
              <div className="mt-4 border-t border-base-300 pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral">Total</span>
                  <span className="text-lg font-bold text-neutral">{formatPrice(subtotal)}</span>
                </div>
              </div>
              <Link to="/checkout-info" className="btn bg-[#323232] text-white shadow-none font-semibold hover:bg-[#323232]/90 transition-all duration-300 mt-6 w-full">
                Place Order
              </Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  )
}

export default CheckoutPage
