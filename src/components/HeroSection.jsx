const highlights = [
  {
    title: 'Handmade Knitwear',
    image:
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Studio Objects',
    image:
      'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Fresh Essentials',
    image:
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
  },
]

const HeroSection = () => {
  return (
    <section className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl">
        <img
          src="https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=1900&q=80"
          alt="Fashion editorial"
          className="h-[60vh] min-h-[420px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white md:inset-y-0 md:flex md:items-center md:p-12">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.28em] text-white/85 md:text-sm">Spring Summer 2026</p>
            <h1 className="mt-4 text-3xl font-bold leading-tight md:text-6xl">Top Shopware Theme</h1>
            <p className="mt-3 max-w-lg text-sm text-white/90 md:text-lg">
              Curated premium goods for everyday life. Discover statement pieces designed for modern living.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button className="btn rounded-full border-0 bg-white px-8 text-neutral hover:bg-base-200">Shop now</button>
              <button className="btn btn-outline rounded-full border-white px-8 text-white hover:border-white hover:bg-white hover:text-neutral">
                New arrivals
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {highlights.map((item) => (
          <article key={item.title} className="group relative overflow-hidden rounded-2xl">
            <img
              src={item.image}
              alt={item.title}
              className="h-44 w-full object-cover transition duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            <p className="absolute bottom-4 left-4 text-sm font-semibold uppercase tracking-[0.16em] text-white">
              {item.title}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default HeroSection
