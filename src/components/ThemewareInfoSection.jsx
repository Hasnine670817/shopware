const checklist = [
  'People love clear and concise USP lists.',
  "Focus on 5-7 essential points.",
  'Emphasize the most important benefits.',
  'Maintain consistent length for each point.',
  'Highlight key words to draw attention.',
]

import handImage from '../assets/hand-make.jpg';
import handImage2 from '../assets/hand-make2.jpg';

const ThemewareInfoSection = () => {
  return (
    <section className="bg-[#eeeeee] py-12 md:py-16 lg:py-20">
      <div className="container-custom space-y-6 md:space-y-8">
        <div className="grid gap-5 xl:grid-cols-12">
          <article className="bg-[#e7e7e7] px-6 py-7 xl:col-span-8 md:px-10 md:py-9">
            <h3 className="text-base font-bold uppercase tracking-[0.03em] text-[#242424] md:text-lg">
              Designed to boost sales and highly customizable
            </h3>
            <p className="mt-4 text-sm leading-7 text-[#4a4a4a] md:text-sm">
              By now, you have likely familiar with the benefits of ThemeWare for the store description. Instead,
              let me share some tips and inspiration for creating an excellent shopping experience.
            </p>
            <p className="mt-4 text-sm leading-7 text-[#4a4a4a] md:text-sm">
              Let&apos;s dive right in. Summarize what your shop represents in your Shopping Experience. Highlight the
              key point or two as your headline, just like I&apos;ve done here.
            </p>
          </article>

          <article className="bg-[#f2f2f2] px-6 py-7 xl:col-span-4 md:px-7 md:py-8">
            <h4 className="text-sm font-bold uppercase tracking-[0.03em] text-[#242424] md:text-[18px]">
              Key Benefits At A Glance
            </h4>
            <ul className="mt-4 space-y-3">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs leading-5 text-[#4a4a4a] md:text-[13px]">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#e44b38]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <h3 className="py-2 text-center text-sm font-bold uppercase tracking-[0.03em] text-[#242424] md:text-lg">
          Shopware 5, Shopware 6 (Self-hosted), and Shopware 6 (Cloud)
        </h3>

        <div className="grid gap-5 lg:grid-cols-[350px_auto] xl:grid-cols-[450px_auto]">
          <article className="overflow-hidden bg-[#f2f2f2]">
            <img src={handImage} alt="Woman writing at desk" className="h-full w-full object-cover md:min-h-[330px]" loading="lazy" />
          </article>
          <article className="bg-[#f2f2f2] px-6 py-7 md:px-8 md:py-8">
            <h4 className="text-sm font-bold text-[#242424] md:text-[20px]">Catering to various reading phases</h4>
            <p className="mt-4 text-sm leading-7 text-[#4a4a4a] md:text-sm">
              As promised in the USPs, let me explain why these are so crucial. One reason lies in the different reading phases. When potential customers first visit your online shop, they don&apos;t immediately dive into the text.
            </p>
            <p className="mt-4 text-sm leading-7 text-[#4a4a4a] md:text-sm">
              Instead, they briefly skim through it, a subconscious process. This initial glance gives them the impression that your shop is relevant.
            </p>
            <p className="mt-4 text-sm leading-7 text-[#4a4a4a] md:text-sm">
              The second phase begins when they scan the headlines. Key highlights catch their attention, prompting them to start reading. They stay on your shop, and it successfully passes the reading phase.
            </p>
          </article>
        </div>

        <div className="grid gap-5 lg:grid-cols-[auto_350px] xl:grid-cols-[auto_450px]">
          <article className="bg-[#f2f2f2] px-6 py-7 md:px-8 md:py-8">
            <h4 className="text-sm font-bold text-[#242424] md:text-[20px]">Have you heard the story of ThemeWare?</h4>
            <p className="mt-4 text-sm leading-7 text-[#4a4a4a] md:text-sm">
              We started as a web agency specializing in sales promotion but grew weary of the daily routine over
              time. Thomas had always envisioned creating a customizable theme. It was through a client request that
              we first discovered Shopware.
            </p>
            <p className="mt-4 text-sm leading-7 text-[#4a4a4a] md:text-sm">
              For Thomas, the vision was clear: a customizable Shopware theme. As for me, I&apos;m passionate about
              helping others achieve real success. And that&apos;s how ThemeWare came to life.
            </p>
          </article>
          <article className="overflow-hidden bg-[#f2f2f2]">
            <img src={handImage2} alt="Themeware story illustration" className="h-full w-full object-cover md:min-h-[330px]" loading="lazy" />
          </article>
        </div>
      </div>
    </section>
  )
}

export default ThemewareInfoSection
