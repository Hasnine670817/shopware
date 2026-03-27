import Banner from '../components/Banner'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import SectionTitle from '../components/SectionTitle'

const curatedProducts = [
  {
    title: 'Neutral Knit Cardigan',
    price: '78.00',
    category: 'Women',
    image:
      'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Minimal Work Desk',
    price: '145.00',
    category: 'Home',
    image:
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Ceramic Serving Set',
    price: '62.00',
    category: 'Kitchen',
    image:
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Leather Satchel Bag',
    price: '95.00',
    category: 'Accessories',
    image:
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80',
  },
]

const trendProducts = [
  {
    title: 'Soft Lounge Chair',
    price: '189.00',
    category: 'Living',
    image:
      'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Coastal Summer Dress',
    price: '84.00',
    category: 'New Trends',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Textured Throw Blanket',
    price: '69.00',
    category: 'Bedding',
    image:
      'https://images.unsplash.com/photo-1616628182509-6a512f6f9f53?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Graphic Poster Set',
    price: '52.00',
    category: 'Decor',
    image:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80',
  },
]

const picks = [
  {
    title: 'Linen Everyday Shirt',
    price: '72.00',
    category: 'Women',
    image:
      'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Ceramic Aroma Vase',
    price: '48.00',
    category: 'Home',
    image:
      'https://images.unsplash.com/photo-1611485988300-b7530e81a2cb?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Color Block Sneaker',
    price: '114.00',
    category: 'Footwear',
    image:
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Woven Market Basket',
    price: '39.00',
    category: 'Accessories',
    image:
      'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=80',
  },
]

const features = [
  { title: 'Free Shipping', text: 'On all orders over $99 worldwide.' },
  { title: 'Secure Payments', text: 'SSL-protected checkout experience.' },
  { title: 'Curated Quality', text: 'Handpicked products made to last.' },
  { title: 'Easy Returns', text: 'Hassle-free returns in 30 days.' },
]

const trustedShops = ['Nordic Atelier', 'Amelie House', 'Harlow Lab', 'Object Studio', 'Mode Commune']

const HomePage = () => {
  return (
    <div data-theme="premiumlight" className="bg-base-100 text-neutral">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl space-y-14 px-4 pb-2 pt-5 md:space-y-20 md:px-6">
        <HeroSection />

        <section>
          <SectionTitle
            eyebrow="Selected Picks"
            title="Featured Products"
            subtitle="A modern selection inspired by premium Shopify storefronts."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {curatedProducts.map((product) => (
              <ProductCard key={product.title} {...product} />
            ))}
          </div>
        </section>

        <Banner
          image="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1900&q=80"
          title="Complete Package"
          description="Mix and match textures, tones, and silhouettes with pieces designed to work beautifully together."
          cta="Explore collection"
        />

        <section>
          <SectionTitle
            eyebrow="Trending"
            title="New Trends"
            subtitle="Just landed this week. Loved for clean silhouettes and soft natural tones."
            align="center"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trendProducts.map((product) => (
              <ProductCard key={product.title} {...product} />
            ))}
          </div>
        </section>

        <Banner
          image="https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1900&q=80"
          title="Designed for Every Room"
          description="From statement furniture to functional details, create a calm and intentional home."
          cta="Shop interior"
          reverse
        />

        <section>
          <SectionTitle eyebrow="Our Picks" title="Popular Right Now" subtitle="Most-loved products chosen by our community." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {picks.map((product) => (
              <ProductCard key={product.title} {...product} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <button className="btn btn-outline rounded-full px-8">View all products</button>
          </div>
        </section>

        <section className="rounded-3xl bg-base-200 px-5 py-10 md:px-8">
          <SectionTitle eyebrow="Why Shopware" title="Premium Benefits" align="center" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-2xl bg-base-100 p-5 text-center transition hover:-translate-y-1 hover:shadow-lg">
                <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-base-200 text-sm">✦</div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-neutral">{feature.title}</h3>
                <p className="mt-2 text-sm text-neutral/60">{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-base-300 p-8 text-center">
          <SectionTitle
            eyebrow="Trusted Shops"
            title="Loved by boutiques worldwide"
            subtitle="Brands and creators trust this style framework for storytelling, conversions, and premium aesthetics."
            align="center"
          />
          <div className="grid gap-5 text-sm font-semibold uppercase tracking-[0.15em] text-neutral/70 md:grid-cols-5">
            {trustedShops.map((shop) => (
              <p key={shop}>{shop}</p>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default HomePage
