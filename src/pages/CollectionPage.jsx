import { useMemo, useState } from 'react'
import { useProducts } from '../context/ProductContext'
import ProductGridCard from '../components/ProductGridCard'

const CollectionPage = () => {
  const { products, collections, loading, error } = useProducts()
  const [activeCollection, setActiveCollection] = useState('All')

  const filteredProducts = useMemo(() => {
    if (activeCollection === 'All') return products
    return products.filter((product) => product.collection === activeCollection)
  }, [activeCollection, products])

  return (
    <section className="bg-[#f5f5f5] px-4 py-12 md:py-16">
      <div className="container-custom">
        <div className="mb-8 text-center md:mb-10">
          <h1 className="text-2xl font-semibold uppercase tracking-[0.08em] text-[#222] md:text-4xl">Collection</h1>
          <p className="mt-3 text-sm text-[#606060] md:text-base">
            Browse curated collections by style, season, and customer favorites.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap justify-center gap-2 md:mb-8">
          {collections.map((collection) => (
            <button
              key={collection}
              className={`btn btn-sm rounded-full px-5 ${
                activeCollection === collection ? 'btn-neutral' : 'btn-outline'
              }`}
              onClick={() => setActiveCollection(collection)}
            >
              {collection}
            </button>
          ))}
        </div>

        {loading ? <p className="text-center text-sm text-neutral/60">Loading collections...</p> : null}
        {error ? <p className="text-center text-sm text-red-500">{error}</p> : null}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductGridCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default CollectionPage
