const Banner = ({ image, title, description, cta = 'Shop now', reverse = false }) => {
  return (
    <section className="overflow-hidden rounded-3xl bg-base-200">
      <div className={`grid gap-0 md:grid-cols-2 ${reverse ? 'md:[&>*:first-child]:order-2' : ''}`}>
        <div className="relative min-h-72">
          <img src={image} alt={title} className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="flex items-center p-8 md:p-12">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-neutral/50">Limited Collection</p>
            <h3 className="mt-3 text-2xl font-semibold text-neutral md:text-3xl">{title}</h3>
            <p className="mt-3 max-w-md text-sm text-neutral/60 md:text-base">{description}</p>
            <button className="btn btn-primary mt-6 rounded-full px-7">{cta}</button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Banner
