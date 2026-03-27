const ProductCard = ({ image, title, price, category, rating = 5 }) => {
  return (
    <article className="group">
      <div className="relative overflow-hidden rounded-2xl bg-base-200">
        <img
          src={image}
          alt={title}
          className="h-64 w-full object-cover transition duration-500 group-hover:scale-105 md:h-72"
          loading="lazy"
        />
        <button className="btn btn-primary btn-sm absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 shadow-premium transition duration-300 group-hover:opacity-100">
          Quick Add
        </button>
      </div>
      <div className="pt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral/50">{category}</p>
        <h3 className="mt-1 text-base font-semibold text-neutral">{title}</h3>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm font-medium text-neutral/80">${price}</p>
          <span className="text-xs text-amber-500">{'★'.repeat(rating)}</span>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
