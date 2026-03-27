import { useCart } from '../context/CartContext'

const BADGE_STYLES = {
  soldout: 'bg-slate-200 text-slate-600',
  freeshipping: 'bg-neutral text-white',
  sale: 'bg-red-500 text-white',
  custom: 'bg-amber-400 text-white',
}

const BADGE_LABELS = {
  soldout: 'Sold Out',
  freeshipping: 'Free Shipping',
  sale: 'Sale 19%',
  custom: 'Custom Label',
}

const formatPrice = (price) => `$${Number(price).toFixed(2)}`

const ProductGridCard = ({ product, showQuickAddByDefault = false }) => {
  const { addToCart } = useCart()
  const badgeClass = product.badgeType ? BADGE_STYLES[product.badgeType] : ''
  const badgeLabel = product.badgeType ? BADGE_LABELS[product.badgeType] : ''

  return (
    <article className="group text-center">
      <div className="relative overflow-hidden bg-white">
        {badgeLabel ? (
          <span className={`absolute left-0 top-0 z-10 px-2 py-1 text-[10px] font-medium ${badgeClass}`}>
            {badgeLabel}
          </span>
        ) : null}
        <img
          src={product.image}
          alt={product.brand}
          className="h-[380px] w-full object-cover transition duration-500 group-hover:scale-105 sm:h-64 md:h-[332px]"
          loading="lazy"
        />
        <button
          onClick={() => addToCart(product)}
          className={`absolute bottom-3 left-1/2 w-[78%] -translate-x-1/2 bg-[#1f1f1f] py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition md:py-2.5 ${
            showQuickAddByDefault ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          Add To Cart
        </button>
      </div>

      <div className="px-1 pb-2 pt-3 md:pt-4">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#8f8f8f] sm:text-[10px] md:text-xs">
          {product.brand}
        </p>
        <p className="mt-1 text-sm leading-5 text-[#3f3f3f] sm:text-[11px] md:text-sm">
          (Product {product.id}) {product.title}
        </p>
        <p className="mt-2 text-xs text-[#9b9b9b] sm:text-[10px] md:text-xs">from</p>
        <div className="mt-1 flex items-center justify-center gap-2">
          {product.compareAtPrice ? (
            <span className="text-xs text-[#9b9b9b] line-through md:text-sm">{formatPrice(product.compareAtPrice)}</span>
          ) : null}
          <span
            className={`text-xl font-semibold sm:text-sm md:text-[22px] ${
              product.compareAtPrice ? 'text-[#ef4444]' : 'text-[#1f1f1f]'
            }`}
          >
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </article>
  )
}

export default ProductGridCard
