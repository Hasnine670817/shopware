const Footer = () => {
  return (
    <footer className="mt-16 bg-neutral text-neutral-content">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-5 lg:px-6">
        <div className="space-y-3 lg:col-span-2">
          <a href="#" className="text-2xl font-bold tracking-[0.16em] text-white">
            SHOPWARE
          </a>
          <p className="max-w-sm text-sm text-white/70">
            Premium curation for modern wardrobes and interiors. Crafted with care, shipped with confidence.
          </p>
          <div className="join mt-4 w-full max-w-sm">
            <input type="email" placeholder="Email address" className="input join-item input-bordered w-full text-neutral" />
            <button className="btn btn-primary join-item">Join</button>
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">Shop</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>Women</li>
            <li>Men</li>
            <li>Accessories</li>
            <li>Home Decor</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">Company</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>About</li>
            <li>Journal</li>
            <li>Careers</li>
            <li>Stores</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">Support</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>Contact</li>
            <li>Shipping</li>
            <li>Returns</li>
            <li>Privacy</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-white/60 md:flex-row md:items-center md:justify-between lg:px-6">
          <p>Copyright © 2026 Shopware Studio</p>
          <p>Secure checkout • Trusted by 10,000+ customers</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
