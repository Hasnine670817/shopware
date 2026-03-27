const iconClass = 'h-5 w-5 stroke-[1.8]'

const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 bg-base-100/95 backdrop-blur">
      <div className="bg-neutral px-4 py-2 text-center text-xs font-medium uppercase tracking-[0.2em] text-white md:text-sm">
        Free shipping worldwide - 30 day easy returns
      </div>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <a href="#" className="text-xl font-bold tracking-[0.2em] text-neutral">
          SHOPWARE
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium uppercase tracking-[0.14em] text-neutral/70 lg:flex">
          {['Home', 'Shop', 'New In', 'Collection', 'Journal', 'Contact'].map((item) => (
            <a key={item} href="#" className="transition hover:text-neutral">
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button className="btn btn-ghost btn-circle btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={iconClass}>
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.05 6.05a7.5 7.5 0 0 0 10.6 10.6Z" />
            </svg>
          </button>
          <button className="btn btn-ghost btn-circle btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={iconClass}>
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.39c.51 0 .95.36 1.05.86L5.7 8.5m0 0h13.52c.5 0 .93.35 1.03.84l.84 3.9a1.06 1.06 0 0 1-1.03 1.28H8.15a1.06 1.06 0 0 1-1.03-.82L5.7 8.5Zm2.8 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm10.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
            </svg>
          </button>
          <button className="btn btn-ghost btn-circle btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={iconClass}>
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M17.98 18.73a9 9 0 0 0-11.96 0M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 1a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
