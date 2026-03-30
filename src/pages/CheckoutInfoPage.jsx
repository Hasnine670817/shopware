import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useCart } from '../context/CartContext'

const formatPrice = (price) => `$${Number(price).toFixed(2)}`

const CheckoutInfoPage = () => {
  const navigate = useNavigate()
  const { cartItems, subtotal, placeOrder } = useCart()
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  })

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitOrder = async (event) => {
    event.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    const customerInfo = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      zipCode: formData.zipCode,
    }

    const paymentInfo = {
      method: paymentMethod,
      cardNumber: paymentMethod === 'card' ? formData.cardNumber : '',
    }

    try {
      const order = await placeOrder({ customerInfo, paymentInfo })
      if (order) {
        await Swal.fire({
          icon: 'success',
          title: 'Order placed successfully',
          text: 'Preparing your confirmation...',
          timer: 900,
          showConfirmButton: false,
        })
        navigate('/order-confirmation', { replace: true })
        return
      }
      await Swal.fire({
        icon: 'error',
        title: 'Order failed',
        text: 'Could not place your order. Please try again.',
        confirmButtonColor: '#323232',
      })
    } catch {
      await Swal.fire({
        icon: 'error',
        title: 'Something went wrong',
        text: 'Please try again in a moment.',
        confirmButtonColor: '#323232',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <section className="bg-[#f5f5f5] py-12 md:py-16">
        <div className="container-custom">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-neutral/70">Your cart is empty.</p>
            <Link to="/shop" className="btn btn-neutral mt-4">
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-[#f5f5f5] py-12 md:py-16">
      <div className="container-custom">
        <h1 className="mb-6 text-2xl font-semibold uppercase tracking-[0.08em] text-[#222] md:text-4xl">
          Checkout Information
        </h1>

        <form onSubmit={handleSubmitOrder} className="grid gap-6 lg:grid-cols-[auto_360px]">
          <div className="space-y-6">
            <article className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-base font-semibold text-neutral">Customer Information</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral/80">Full Name</label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="input input-bordered w-full px-4 border border-[#CBCBCB]"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral/80">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input input-bordered w-full px-4 border border-[#CBCBCB]"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral/80">Phone</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input input-bordered w-full px-4 border border-[#CBCBCB]"
                    placeholder="+880 1XXXXXXXXX"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral/80">City</label>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="input input-bordered w-full px-4 border border-[#CBCBCB]"
                    placeholder="Your city"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-neutral/80">Address</label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="input input-bordered w-full px-4 border border-[#CBCBCB]"
                    placeholder="House, street, area"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-neutral/80">ZIP Code</label>
                  <input
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="input input-bordered w-full px-4 border border-[#CBCBCB]"
                    placeholder="Postal code"
                    required
                  />
                </div>
              </div>
            </article>

            <article className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-base font-semibold text-neutral">Payment Information</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`btn btn-sm rounded-sm shadow-none px-5 ${paymentMethod === 'card' ? 'bg-[#E2E2E2]' : 'btn-outline'}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  Card
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-sm shadow-none px-5 ${paymentMethod === 'cod' ? 'bg-[#E2E2E2]' : 'btn-outline'}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  Cash on Delivery
                </button>
              </div>

              {paymentMethod === 'card' ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-neutral/80">Card Number</label>
                    <input
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="input input-bordered w-full px-4 border border-[#CBCBCB]"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-neutral/80">Card Holder Name</label>
                    <input
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      className="input input-bordered w-full px-4 border border-[#CBCBCB]"
                      placeholder="Name on card"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral/80">Expiry</label>
                    <input
                      name="expiry"
                      value={formData.expiry}
                      onChange={handleInputChange}
                      className="input input-bordered w-full px-4 border border-[#CBCBCB]"
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral/80">CVV</label>
                    <input
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      className="input input-bordered w-full px-4 border border-[#CBCBCB]"
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-4 rounded-xl bg-base-200 p-4 text-sm text-neutral/70">
                  Pay in cash when your order arrives. We will contact you for confirmation.
                </p>
              )}
            </article>
          </div>

          <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold uppercase tracking-[0.08em] text-neutral">Order Summary</h2>
            <div className="mt-5 space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <p className="line-clamp-1 text-neutral/70">
                    {item.brand} x {item.quantity}
                  </p>
                  <p className="font-medium text-neutral">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-base-300 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral">Total</span>
                <span className="text-lg font-bold text-neutral">{formatPrice(subtotal)}</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-neutral mt-6 w-full bg-[#323232] text-white shadow-none hover:bg-[#323232]/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </span>
              ) : (
                'Place Order'
              )}
            </button>
          </aside>
        </form>
      </div>
    </section>
  )
}

export default CheckoutInfoPage
