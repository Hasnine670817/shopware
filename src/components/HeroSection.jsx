const highlights = [
  {
    title: 'Furniture',
    image:
      'https://i.ibb.co.com/Dg6bgkSD/image3.jpg',
  },
  {
    title: 'Multimedia',
    image:
      'https://i.ibb.co.com/5X4vvQcM/image2.jpg',
  },
  {
    title: 'Fashion',
    image:
      'https://i.ibb.co.com/d44xyJ6t/image1.jpg',
  },
]

import heroImage from '../assets/banner-bg-1.jpg';

const HeroSection = () => {
  return (
    <section className="space-y-4">
      <div className='relative bg-[#FC8483]'>
        <img src={heroImage} alt="Hero Image" className="w-full h-full object-cover absolute inset-0 z-0 hidden md:block" />
        <div className="container-custom">
          <div className="relative overflow-hidden rounded-3xl">
            <div className="" />
            <div className="relative py-6 text-white md:inset-y-0 md:flex md:items-center sm:py-10 md:py-16 xl:py-[150px]">
              <div className="max-w-xl">
                <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl text-[#323232] text-uppercase" style={{ textTransform: 'uppercase' }}>Top Shopware <br className='hidden md:block lg:hidden' /> Theme</h1>
                <span className='w-[60px] h-[2px] bg-[#323232] block mt-4 mb-4'></span>
                <p className="mt-3 max-w-lg text-xs md:text-sm text-[#323232] max-w-[300px] xl:max-w-[450px]">
                  Curated premium goods for everyday life. Discover statement pieces designed for modern living.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button className="btn rounded-sm bg-[#323232] border-0 text-white font-semibold px-8 text-neutral hover:bg-base-200 hover:text-[#323232]">Shop now</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='py-10'>
        <div className='container-custom'>
          <div className="grid gap-4 sm:grid-cols-3">
            {highlights.map((item) => (
              <article key={item.title} className="group relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-[200px] w-full object-cover transition duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-semibold uppercase tracking-[0.16em] text-white">
                  {item.title}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
