import { useRef } from 'react'
import SectionHeader from './SectionHeader.jsx'
import EventCard from './EventCard.jsx'

// Carrossel horizontal com scroll nativo + setas que deslocam o container.
export default function EventCarousel({ icon, title, events, filters }) {
  const trackRef = useRef(null)

  const scrollBy = (dir) => {
    const el = trackRef.current
    if (!el) return
    // Rola aproximadamente a largura visível para dar sensação de "página".
    el.scrollBy({ left: dir * (el.clientWidth * 0.9), behavior: 'smooth' })
  }

  return (
    <section className="py-4">
      <SectionHeader
        icon={icon}
        title={title}
        showArrows
        onPrev={() => scrollBy(-1)}
        onNext={() => scrollBy(1)}
      />

      {filters && (
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((f, i) => (
            <button
              key={f}
              type="button"
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                i === 0
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      <div
        ref={trackRef}
        className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-2 -mx-1 px-1"
      >
        {events.map((ev) => (
          <EventCard key={ev.id} event={ev} />
        ))}
      </div>
    </section>
  )
}
