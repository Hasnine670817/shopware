const ContactPage = () => {
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
              <p>Email: support@shopware.com</p>
              <p>Phone: +880 1234 567 890</p>
              <p>Address: 21 Premium Street, Dhaka</p>
            </div>
          </article>

          <article className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <form className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral/80">Name</label>
                <input type="text" className="input input-bordered w-full px-4 border border-[#CBCBCB]" placeholder="Your name" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral/80">Email</label>
                <input type="email" className="input input-bordered w-full px-4 border border-[#CBCBCB]" placeholder="you@example.com" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral/80">Message</label>
                <textarea className="textarea textarea-bordered h-32 w-full px-4 py-3 border border-[#CBCBCB]" placeholder="Write your message..." />
              </div>
              <button type="submit" className="btn btn-neutral w-full bg-[#323232] text-white shadow-none font-semibold hover:bg-[#323232]/90 transition-all duration-300">
                Send Message
              </button>
            </form>
          </article>
        </div>
      </div>
    </section>
  )
}

export default ContactPage
