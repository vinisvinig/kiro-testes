import { collections } from '../data/events.js'
import { placeholder } from '../lib/placeholder.js'
import SectionHeader from './SectionHeader.jsx'

// Grade de "coleções" — cards grandes em formato retrato.
export default function Collections() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-4">
      <SectionHeader icon="heart" title="Coleções e eventos especiais" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => (
          <a
            key={c.id}
            href="#"
            className="group relative block overflow-hidden rounded-2xl aspect-[3/4]"
          >
            <img
              src={placeholder({ w: 480, h: 640, label: c.title, seed: c.seed })}
              alt={c.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 p-5">
              <h3 className="text-white text-lg md:text-xl font-extrabold drop-shadow">{c.title}</h3>
              <p className="text-white/85 text-sm">{c.subtitle}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
