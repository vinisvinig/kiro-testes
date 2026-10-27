import { promoBanner } from '../data/events.js'
import { placeholder } from '../lib/placeholder.js'

// Banner promocional largo (full-width dentro do container).
export default function PromoBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <a href="#" className="block relative overflow-hidden rounded-2xl group">
        <div className="aspect-[24/6] md:aspect-[24/5]">
          <img
            src={placeholder({ w: 1440, h: 300, label: promoBanner.title, seed: promoBanner.seed })}
            alt={promoBanner.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
        <div className="absolute inset-0 bg-black/25 flex items-center">
          <div className="px-6 md:px-10">
            <h3 className="text-white text-lg md:text-2xl font-extrabold drop-shadow">{promoBanner.title}</h3>
            <p className="text-white/80 text-sm md:text-base">{promoBanner.subtitle}</p>
          </div>
        </div>
      </a>
    </section>
  )
}
