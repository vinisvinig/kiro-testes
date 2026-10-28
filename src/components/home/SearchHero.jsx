import { useEffect, useRef, useState } from 'react'
import { asset } from './ui.jsx'
import { heroSlides } from './data.js'
import { Link } from '../../router.jsx'
import SearchBox from '../../search/SearchBox.jsx'

/** Seção Hero Busca e Banner (Figma 6384:38275) */
export default function SearchHero() {
  return (
    <section className="flex flex-col bg-body md:gap-6 md:pb-6 md:pt-10">
      {/* z-30: o dropdown do autocomplete precisa ficar acima do banner */}
      <div className="relative z-30 md:px-10">
        <SearchBox variant="home" />
      </div>
      <div className="hidden md:block">
        <BannerCarousel slides={heroSlides} />
      </div>
      <MobileBanner slides={heroSlides} />
    </section>
  )
}

/**
 * Carrossel em loop infinito (desktop e mobile): o 1º banner começa no centro, o último aparece à
 * esquerda e o 2º à direita. Há uma cópia do último antes do 1º e do 1º depois do último; ao parar
 * numa cópia, o trilho pula sem animação para o banner real, então 3 → 1 → 2 segue sempre no mesmo sentido.
 */
function useLoopCarousel(count) {
  const [pos, setPos] = useState(1) // posição no trilho com cópias: 0 = cópia do último, count+1 = cópia do 1º
  const [animate, setAnimate] = useState(true)
  const busy = useRef(false)
  const index = (pos - 1 + count) % count

  const move = (to) => {
    if (busy.current) return
    busy.current = true
    setAnimate(true)
    setPos(to)
  }
  const go = (dir) => move(pos + dir)
  const goTo = (i) => i !== index && move(i + 1)

  const onTransitionEnd = (e) => {
    if (e.target !== e.currentTarget || e.propertyName !== 'transform') return
    busy.current = false
    if (pos === 0 || pos === count + 1) {
      setAnimate(false)
      setPos(pos === 0 ? count : 1)
    }
  }
  // Religa a animação depois do pulo sem animação
  useEffect(() => {
    if (animate) return
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)))
    return () => cancelAnimationFrame(id)
  }, [animate])

  return { pos, index, animate, go, goTo, onTransitionEnd }
}

/**
 * Arrastar (mouse e toque): o banner acompanha o ponteiro e, ao soltar, passa para o vizinho
 * se o arrasto passou de 60px (ou 1/6 da largura); senão volta. O toque vertical continua rolando a página.
 */
function useSwipe(go) {
  const [dx, setDx] = useState(0)
  const moved = useRef(false)
  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (e.pointerType === 'mouse') e.preventDefault()
    const start = { x: e.clientX, w: e.currentTarget.offsetWidth }
    moved.current = false
    const mv = (ev) => {
      const d = ev.clientX - start.x
      if (Math.abs(d) > 5) moved.current = true
      setDx(d)
    }
    const end = (ev, cancel = false) => {
      window.removeEventListener('pointermove', mv)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cn)
      const d = cancel ? 0 : ev.clientX - start.x
      const limit = Math.min(60, start.w / 6)
      if (d <= -limit) go(1)
      else if (d >= limit) go(-1)
      setDx(0)
    }
    const up = (ev) => end(ev)
    const cn = (ev) => end(ev, true)
    window.addEventListener('pointermove', mv)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cn)
  }
  // Depois de arrastar, o clique não abre o evento
  const blockClick = (e) => {
    if (!moved.current) return false
    e.preventDefault()
    moved.current = false
    return true
  }
  return { dx, onPointerDown, blockClick }
}

function useAutoplay(go, paused, deps) {
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => go(1), 6000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, ...deps])
}

/** Trilho com as cópias nas pontas, compartilhado entre desktop e mobile. */
function LoopTrack({ slides, c, sw, gapPx, className, renderSlide }) {
  const list = [slides.at(-1), ...slides, slides[0]]
  return (
    <div
      onPointerDown={sw.onPointerDown}
      onDragStart={(e) => e.preventDefault()}
      onTransitionEnd={c.onTransitionEnd}
      className={`flex touch-pan-y select-none ${sw.dx ? 'cursor-grabbing' : `cursor-grab ${c.animate ? 'transition-transform duration-700 ease-out' : ''}`} ${className}`}
      style={{ transform: `translateX(calc(${-c.pos} * (100% + ${gapPx}px) + ${sw.dx}px))` }}
    >
      {list.map((s, k) => {
        const i = (k - 1 + slides.length) % slides.length
        const active = k === c.pos
        return renderSlide(s, k, {
          active,
          onClick: (e) => {
            if (sw.blockClick(e)) return
            // Clicar num vizinho traz ele para o centro em vez de abrir o evento
            if (!active) {
              e.preventDefault()
              c.go(k < c.pos ? -1 : 1)
            }
          },
          i,
        })
      })}
    </div>
  )
}

/** Banner Carrossel mobile (Figma 6133:37830): 358×477, raio 24, legenda à esquerda. */
function MobileBanner({ slides }) {
  const c = useLoopCarousel(slides.length)
  const sw = useSwipe(c.go)
  useAutoplay(c.go, !!sw.dx, [c.pos])
  return (
    <div className="relative px-4 py-16 md:hidden">
      <LoopTrack
        slides={slides}
        c={c}
        sw={sw}
        gapPx={8}
        className="gap-2"
        renderSlide={(s, k, { active, onClick }) => (
          <Link
            key={k}
            to={s.href}
            aria-hidden={!active}
            tabIndex={active ? 0 : -1}
            draggable={false}
            onClick={onClick}
            className="relative flex h-[477px] w-full shrink-0 flex-col justify-end overflow-hidden rounded-3xl"
          >
            <img src={s.image} alt="" draggable={false} className="absolute inset-0 size-full object-cover" />
            <div className="relative flex flex-col items-start gap-3 bg-black/50 p-4 pb-6">
              <span className="rounded-md bg-brand px-[14px] py-[11px] text-xs font-medium leading-4 text-white">{s.period}</span>
              <p className="text-3xl font-bold leading-none text-white">{s.title}</p>
              <div className="h-1.5" />
            </div>
          </Link>
        )}
      />
      <div className="absolute bottom-[84px] left-8 flex gap-2">
        {slides.map((s, n) => (
          <button
            key={s.title}
            type="button"
            aria-label={`Ir para o slide ${n + 1}`}
            aria-current={n === c.index}
            onClick={() => c.goTo(n)}
            className={`h-1.5 rounded-full transition-all ${n === c.index ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  )
}

function BannerCarousel({ slides }) {
  const c = useLoopCarousel(slides.length)
  const sw = useSwipe(c.go)
  useAutoplay(c.go, !!sw.dx, [c.pos])

  return (
    <div className="page-x">
      {/* Mesma largura do conteúdo (1264), alinhado ao logo e às seções; as setas ficam por cima/para fora.
          Sem overflow-hidden: os banners vizinhos aparecem nas margens (Figma 6384:38279). */}
      <div className="relative mx-auto max-w-content">
        <LoopTrack
          slides={slides}
          c={c}
          sw={sw}
          gapPx={40}
          className="gap-10"
          renderSlide={(s, k, { active, onClick }) => (
            <Link
              key={k}
              to={s.href}
              aria-hidden={!active}
              tabIndex={active ? 0 : -1}
              draggable={false}
              onClick={onClick}
              className="relative flex h-[300px] w-full shrink-0 items-end overflow-hidden rounded-2xl md:h-[420px]"
            >
              <img src={s.image} alt="" draggable={false} className="absolute inset-0 size-full object-cover" />
              <div className="relative flex w-full flex-col items-center gap-5 bg-black/[.56] px-4 py-5">
                <div className="flex flex-col items-center gap-3 pt-[10px]">
                  <span className="rounded-md bg-brand px-[14px] py-[11px] font-ui text-xs font-medium leading-4 text-white">{s.period}</span>
                  <p className="text-center text-3xl font-bold leading-none text-white md:text-5xl">{s.title}</p>
                </div>
                <div className="h-[10px]" />
              </div>
            </Link>
          )}
        />

        {/* Paginação */}
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((s, i) => (
            <button
              key={s.title}
              type="button"
              aria-label={`Ir para o slide ${i + 1}`}
              aria-current={i === c.index}
              onClick={() => c.goTo(i)}
              className={`h-[10px] rounded-full transition-all ${i === c.index ? 'w-8 bg-white' : 'w-[10px] bg-white/50'}`}
            />
          ))}
        </div>

        {/* Setas: no Figma ficam 48px para fora do container de 1264 */}
        <ArrowButton side="left" onClick={() => c.go(-1)} />
        <ArrowButton side="right" onClick={() => c.go(1)} />
      </div>
    </div>
  )
}

function ArrowButton({ side, onClick }) {
  const pos = side === 'left' ? 'left-2 xl:-left-12' : 'right-2 xl:-right-12'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Slide anterior' : 'Próximo slide'}
      className={`absolute top-1/2 flex size-[46px] -translate-y-1/2 items-center justify-center rounded-full border border-ink bg-white transition hover:bg-body-2 ${pos}`}
    >
      <img src={asset(side === 'left' ? 'ic-hero-left.svg' : 'ic-hero-right.svg')} alt="" className="size-5" />
    </button>
  )
}
