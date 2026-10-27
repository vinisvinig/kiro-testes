import { useEffect, useRef, useState } from 'react'
import { asset, Pill, useModalBehavior } from '../components/home/ui.jsx'

/** Compartilhar: Web Share API no celular, senão copia o link. */
export function useShare() {
  const [toast, setToast] = useState('')
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2500)
    return () => clearTimeout(t)
  }, [toast])
  const share = async (title) => {
    const url = window.location.href
    try {
      if (navigator.share) return await navigator.share({ title, url })
      await navigator.clipboard.writeText(url)
      setToast('Link copiado')
    } catch (e) {
      if (e?.name !== 'AbortError') setToast('Não foi possível compartilhar')
    }
  }
  const node = toast ? (
    <div role="status" className="fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-full bg-ink px-5 py-3 font-ui text-sm font-semibold text-white shadow-lg">
      {toast}
    </div>
  ) : null
  return [share, node]
}

function ShareButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Compartilhar"
      className={`flex items-center justify-center rounded-full border border-white/40 bg-white/20 p-3 backdrop-blur-sm transition hover:bg-white/30 ${className}`}
    >
      <img src={asset('ic-share.svg')} alt="" className="size-5" />
    </button>
  )
}

function LocationBadge({ venue }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5">
      <img src={asset('ic-place-white.svg')} alt="" className="size-3.5" />
      <span className="text-xs font-bold leading-4 text-white">
        {venue.city} · {venue.uf}
      </span>
    </span>
  )
}

/**
 * Hero do Local.
 * Desktop: 1 imagem (Figma 8020:93441) ou 1 grande + grade 2×2 com "Ver galeria" (7990:121676).
 * Mobile: imagem cheia com barras de progresso estilo stories e botão Galeria (8020:96509).
 */
export function LocalHero({ venue, onSeeEvents }) {
  const [lightbox, setLightbox] = useState(-1)
  const [share, toast] = useShare()
  const imgs = venue.images
  const multi = imgs.length >= 5

  const overlay = (
    <div className="absolute bottom-12 left-12 flex w-[min(640px,calc(100%-96px))] flex-col items-start gap-4">
      <LocationBadge venue={venue} />
      <h1 className="text-5xl font-bold leading-none text-white">{venue.name}</h1>
      <Pill onClick={onSeeEvents} font="font-sans">
        Ver eventos neste local
      </Pill>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <section className="hidden bg-body md:block">
        <div className="page-x">
          <div className="mx-auto flex h-[480px] max-w-content gap-2 overflow-hidden rounded-3xl">
            <div className={`relative h-full ${multi ? 'w-1/2' : 'w-full'}`}>
              <button type="button" onClick={() => setLightbox(0)} aria-label="Abrir galeria de fotos" className="absolute inset-0">
                <img src={imgs[0]} alt={`Foto do ${venue.name}`} className="size-full object-cover" />
              </button>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-40% to-black/80" />
              <ShareButton onClick={() => share(venue.name)} className="absolute right-6 top-6" />
              {overlay}
            </div>
            {multi && (
              <div className="grid h-full w-1/2 grid-cols-2 grid-rows-2 gap-2">
                {imgs.slice(1, 4).map((src, i) => (
                  <button key={src} type="button" onClick={() => setLightbox(i + 1)} aria-label={`Abrir foto ${i + 2}`} className="overflow-hidden">
                    <img src={src} alt="" className="size-full object-cover transition duration-500 hover:scale-105" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setLightbox(4)}
                  className="relative flex flex-col items-center justify-center gap-[10px] overflow-hidden bg-ink-800"
                >
                  <img src={imgs[4]} alt="" className="absolute inset-0 size-full object-cover opacity-20" />
                  <img src={asset('ic-gallery.svg')} alt="" className="relative size-8" />
                  <span className="relative text-sm font-bold leading-5 text-white">Ver galeria</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile */}
      <MobileHero venue={venue} onShare={() => share(venue.name)} onOpen={setLightbox} onSeeEvents={onSeeEvents} />

      {lightbox >= 0 && <Lightbox images={imgs} start={lightbox} title={venue.name} onClose={() => setLightbox(-1)} />}
      {toast}
    </>
  )
}

function MobileHero({ venue, onShare, onOpen, onSeeEvents }) {
  const imgs = venue.images
  const [i, setI] = useState(0)
  const scroller = useRef(null)
  const onScroll = () => {
    const el = scroller.current
    if (el) setI(Math.round(el.scrollLeft / el.clientWidth))
  }
  return (
    <section className="relative h-[430px] overflow-hidden md:hidden">
      <div ref={scroller} onScroll={onScroll} className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto">
        {imgs.map((src, n) => (
          <button key={src} type="button" onClick={() => onOpen(n)} aria-label={`Abrir foto ${n + 1}`} className="h-full w-full shrink-0 snap-start">
            <img src={src} alt={n === 0 ? `Foto do ${venue.name}` : ''} className="size-full object-cover" />
          </button>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-40% to-black/80" />
      {imgs.length > 1 && (
        <div className="absolute inset-x-4 top-3 flex gap-1" aria-hidden>
          {imgs.map((src, n) => (
            <span key={src} className={`h-1 flex-1 rounded-full ${n <= i ? 'bg-white' : 'bg-white/40'}`} />
          ))}
        </div>
      )}
      <ShareButton onClick={onShare} className="absolute right-4 top-6 p-2.5" />
      <div className="absolute inset-x-4 bottom-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <LocationBadge venue={venue} />
          <span className="rounded-full bg-brand px-2 py-0.5 font-ui text-xs font-medium text-white">{venue.type}</span>
        </div>
        <h1 className="text-2xl font-bold leading-none text-white">{venue.name}</h1>
        <div className="flex items-center justify-between gap-3">
          <Pill onClick={onSeeEvents} font="font-sans">
            Ver eventos neste local
          </Pill>
          {imgs.length > 1 && (
            <button
              type="button"
              onClick={() => onOpen(0)}
              className="flex items-center gap-2 rounded-full border border-white/40 bg-black/40 px-4 py-[10px] font-ui text-sm font-semibold text-white"
            >
              <img src={asset('ic-gallery.svg')} alt="" className="size-4" />
              Galeria
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

/** Visualizador em tela cheia: setas, teclado (← → Esc) e arrastar no celular. */
export function Lightbox({ images, start = 0, title, onClose }) {
  const [i, setI] = useState(start)
  const touch = useRef(0)
  const closeRef = useRef(null)
  const go = (d) => setI((n) => (n + d + images.length) % images.length)
  useModalBehavior(true, onClose)
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const nav = (dir, label, icon, pos) =>
    images.length > 1 && (
      <button
        type="button"
        onClick={() => go(dir)}
        aria-label={label}
        className={`absolute top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white transition hover:bg-body-2 ${pos}`}
      >
        <img src={asset(icon)} alt="" className="size-5" />
      </button>
    )

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Galeria de fotos — ${title}`}
      className="fixed inset-0 z-[110] flex flex-col bg-black/95"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touch.current
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
      }}
    >
      <div className="flex items-center justify-between px-4 py-4 text-white md:px-8">
        <p className="font-ui text-sm font-semibold" aria-live="polite">
          {i + 1} / {images.length}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Fechar galeria" className="flex size-10 items-center justify-center rounded-full bg-white">
          <img src={asset('ic-x.svg')} alt="" className="size-6" />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 md:px-24">
        <img src={images[i]} alt={`Foto ${i + 1} de ${images.length}`} className="max-h-full max-w-full rounded-xl object-contain" />
        {nav(-1, 'Foto anterior', 'ic-hero-left.svg', 'left-2 md:left-8')}
        {nav(1, 'Próxima foto', 'ic-hero-right.svg', 'right-2 md:right-8')}
      </div>
      {images.length > 1 && (
        <div className="no-scrollbar flex justify-center gap-2 overflow-x-auto px-4 pb-6">
          {images.map((src, n) => (
            <button
              key={src}
              type="button"
              onClick={() => setI(n)}
              aria-label={`Ver foto ${n + 1}`}
              aria-current={n === i}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${n === i ? 'border-brand' : 'border-transparent opacity-60'}`}
            >
              <img src={src} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
