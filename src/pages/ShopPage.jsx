import { useMemo, useState } from 'react'
import { useProducts } from '../context/ProductContext'
import ProductGridCard from '../components/ProductGridCard'

const SORT_OPTIONS = [
  { value: 'date-old', label: 'Date, old to new' },
  { value: 'date-new', label: 'Date, new to old' },
  { value: 'price-low', label: 'Price, low to high' },
  { value: 'price-high', label: 'Price, high to low' },
  { value: 'name-asc', label: 'Name, A to Z' },
]

const ShopPage = () => {
  const { products, loading, error } = useProducts()
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortBy, setSortBy] = useState('date-old')

  const categories = useMemo(
    () => ['All', ...new Set(products.map((product) => product.category))],
    [products],
  )

  const visibleProducts = useMemo(() => {
    const filtered =
      activeCategory === 'All'
        ? products
        : products.filter((product) => product.category === activeCategory)

    const sorted = [...filtered]
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'date-new':
          return b.id - a.id
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'name-asc':
          return a.brand.localeCompare(b.brand)
        case 'date-old':
        default:
          return a.id - b.id
      }
    })
    return sorted
  }, [activeCategory, products, sortBy])

  return (
    <section className="bg-[#f5f5f5] px-4 py-12 md:py-16">
      <div className="container-custom">
        <div className="mb-8 text-center md:mb-10">
          <h1 className="text-2xl font-semibold uppercase tracking-[0.08em] text-[#222] md:text-4xl">Shop</h1>
          <p className="mt-3 text-sm text-[#606060] md:text-base">
            Explore our full catalog with premium curation and trend-forward picks.
          </p>
        </div>

        {loading ? <p className="text-center text-sm text-neutral/60">Loading products...</p> : null}
        {error ? <p className="text-center text-sm text-red-500">{error}</p> : null}

        <div className="grid gap-6 lg:grid-cols-[240px_auto]">
          <aside className="hidden self-start bg-[#efefef] p-5 lg:block sticky top-[110px]">
            <div className="border-b border-black/20 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#2b2b2b]">Categories</h3>
            </div>
            <ul className="space-y-1 pt-3">
              {categories.map((category) => (
                <li key={category}>
                  <button
                    className={`w-full text-left text-xs transition ${
                      activeCategory === category
                        ? 'font-semibold text-[#1f1f1f]'
                        : 'text-[#5f5f5f] hover:text-[#1f1f1f]'
                    }`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-y border-black/15 py-3">
              <div className="flex items-center gap-2 lg:hidden">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#555]">Category</span>
                <select
                  className="select select-bordered select-sm w-44 rounded-none bg-white text-xs"
                  value={activeCategory}
                  onChange={(event) => setActiveCategory(event.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#555]">Sort by: </span>
                <select
                  className="select select-bordered select-sm w-44 rounded-none bg-white text-xs ps-3"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 md:gap-6">
              {visibleProducts.map((product, index) => (
                <ProductGridCard
                  key={product.id}
                  product={product}
                  showQuickAddByDefault={index === 0}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ShopPage
