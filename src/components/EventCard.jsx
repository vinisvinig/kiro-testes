import { useState } from 'react'
import { placeholder } from '../lib/placeholder.js'
import Icon from './Icon.jsx'

// Card de evento: imagem, badge de data, título e local.
export default function EventCard({ event }) {
  const [liked, setLiked] = useState(false)

  return (
    <article className="group w-64 shrink-0 rounded-xl bg-white shadow-card overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={placeholder({ w: 320, h: 240, label: event.title, seed: event.seed })}
          alt={event.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {event.tag && (
          <span className="absolute left-2 top-2 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded bg-brand-pink text-white">
            {event.tag}
          </span>
        )}

        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          aria-label={liked ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          aria-pressed={liked}
          className="absolute right-2 top-2 grid place-items-center w-8 h-8 rounded-full bg-white/90 hover:bg-white text-brand-pink transition-colors"
        >
          <Icon name="heart" className={`w-4 h-4 ${liked ? 'fill-brand-pink' : ''}`} strokeWidth={2} />
        </button>
      </div>

      <div className="flex gap-3 p-3">
        {/* Badge de data */}
        <div className="shrink-0 text-center leading-none">
          <div className="text-xl font-extrabold text-gray-900">{event.day}</div>
          <div className="text-[10px] font-bold uppercase text-brand-pink">{event.month}</div>
        </div>

        <div className="min-w-0">
          <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">{event.title}</h3>
          <p className="mt-1 text-xs text-gray-500 line-clamp-2">{event.place}</p>
        </div>
      </div>
    </article>
  )
}
