import { useState, useEffect, useCallback } from 'react'
import { heroSlides } from '../data/events.js'
import { placeholder } from '../lib/placeholder.js'
import Icon from './Icon.jsx'

// Carrossel de destaque com autoplay, setas e indicadores (dots).
export default function Hero() {
  const [index, setIndex] = useState(0)
  const count = heroSlides.length

  const go = useCallback((n) => setIndex(((n % count) + count) % count), [count])
  const next = useCallback(() => go(index + 1), [go, index])
  const prev = useCallback(() => go(index - 1), [go, index])

  // Autoplay simples com pausa ao passar o mouse (via estado paused).
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 5000)
    return () => clearInterval(t)
  }, [paused, count])

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6">
      <div
        className="relative overflow-hidden rounded-2xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {heroSlides.map((slide) => (
            <div key={slide.id} className="w-full shrink-0">
              <div className="relative aspect-[21/9] md:aspect-[24/8]">
                <img
                  src={placeholder({ w: 1440, h: 480, label: slide.title, seed: slide.seed })}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5 md:p-8 max-w-2xl">
                  {slide.tag && (
                    <span className="inline-block text-[10px] md:text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded bg-brand-pink text-white">
                      {slide.tag}
                    </span>
                  )}
                  <h2 className="mt-2 text-xl md:text-3xl font-extrabold text-white drop-shadow">
                    {slide.title}
                  </h2>
                  {slide.subtitle && (
                    <p className="mt-1 text-sm md:text-base text-white/80">{slide.subtitle}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Setas */}
        <button
          type="button"
          onClick={prev}
          aria-label="Slide anterior"
          className="absolute left-3 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow transition-colors"
        >
          <Icon name="chevronLeft" className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Próximo slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow transition-colors"
        >
          <Icon name="chevronRight" className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
          {heroSlides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Ir para o slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
