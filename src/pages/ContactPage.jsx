import { useState } from 'react'
import Swal from 'sweetalert2'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  message: '',
}

const ContactPage = () => {
  const [form, setForm] = useState(initialForm)
  const [isSending, setIsSending] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSending) return

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      message: form.message.trim(),
    }

    if (!payload.name || !payload.email || !payload.message) {
      await Swal.fire({
        icon: 'warning',
        title: 'Missing required fields',
        text: 'Please fill name, email, and message.',
        confirmButtonColor: '#323232',
      })
      return
    }

    setIsSending(true)
    try {
      const response = await fetch('https://formsubmit.co/ajax/hasninetorun@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          phone: payload.phone || 'Not provided',
          message: payload.message,
          _subject: 'New Contact Message - Shopware',
          _captcha: 'false',
          _template: 'table',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message.')
      }

      const data = await response.json()
      if (data?.success !== 'true') {
        throw new Error(data?.message || 'Failed to send message.')
      }

      await Swal.fire({
        icon: 'success',
        title: 'Message sent!',
        text: 'Thanks for reaching out. We will contact you soon.',
        confirmButtonColor: '#323232',
      })
      setForm(initialForm)
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Could not send message',
        text: error.message || 'Please try again shortly.',
        confirmButtonColor: '#323232',
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <section className="bg-[#f5f5f5] py-12 md:py-16">
      <div className="container-custom">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <h1 className="text-2xl font-semibold text-neutral">Contact Us</h1>
            <p className="mt-3 text-sm text-neutral/60">
              Have questions about products, shipping, or your order? Send us a message and we&apos;ll get back soon.
            </p>
            <div className="mt-6 space-y-3 text-sm text-neutral/80">
              <p>Email: hasninetorun@gmail.com</p>
              <p>Phone: +880 1703 661 296</p>
              <p>Address: Dhaka, Bangladesh</p>
            </div>
          </article>

          <article className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral/80">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input input-bordered w-full px-4 border border-[#CBCBCB]"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral/80">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input input-bordered w-full px-4 border border-[#CBCBCB]"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral/80">Phone (Optional)</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="input input-bordered w-full px-4 border border-[#CBCBCB]"
                  placeholder="+880 1XXXXXXXXX"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral/80">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  className="textarea textarea-bordered h-32 w-full px-4 py-3 border border-[#CBCBCB]"
                  placeholder="Write your message..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSending}
                className="btn btn-neutral w-full bg-[#323232] text-white shadow-none font-semibold hover:bg-[#323232]/90 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSending ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending...
                  </span>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </article>
        </div>
      </div>
    </section>
  )
}

export default ContactPage
