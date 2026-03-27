import { Link } from 'react-router-dom'
import { useProducts } from '../context/ProductContext'
import ProductGridCard from './ProductGridCard'

const NewTrendsSection = () => {
  const { products, loading, error } = useProducts()
  const trendProducts = products.slice(0, 8)

  return (
    <section className="bg-[#f5f5f5] py-12 md:py-16">
      <div className="container-custom">
        <div className="mb-8 text-center md:mb-10">
          <div className="mx-auto flex max-w-[760px] items-center gap-5 md:gap-8">
            <span className="h-px flex-1 bg-black/30" />
            <h2 className="text-lg font-semibold uppercase tracking-[0.08em] text-[#222] md:text-[30px]">New Trends</h2>
            <span className="h-px flex-1 bg-black/30" />
          </div>
          <Link
            to="/shop"
            className="mt-6 inline-block text-xs text-[#606060] underline underline-offset-4 transition hover:text-black md:text-sm"
          >
            View All
          </Link>
        </div>

        {loading ? <p className="text-center text-sm text-neutral/60">Loading products...</p> : null}
        {error ? <p className="text-center text-sm text-red-500">{error}</p> : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
          {trendProducts.map((product, index) => (
            <ProductGridCard
              key={product.id}
              product={product}
              showQuickAddByDefault={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default NewTrendsSection
