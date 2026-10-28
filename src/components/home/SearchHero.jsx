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
      <div className="relative z-30 md:px-caixa">
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
 * Carrossel em loop infinito (desktop e mobile), começando no 2º banner (1º à esquerda, 3º à direita).
 * O trilho tem 3 cópias completas da lista e fica sempre na cópia do meio: ao sair dela, pula sem
 * animação para a posição equivalente no meio. Como as cópias são iguais, o pulo é invisível e sempre
 * há banners dos dois lados, então 3 → 1 → 2 segue fluido no mesmo sentido.
 */
function useLoopCarousel(count, start = 1) {
  const [pos, setPos] = useState(count + start) // posição no trilho de 3 cópias
  const [animate, setAnimate] = useState(true)
  const index = pos % count

  const go = (dir) => {
    setAnimate(true)
    setPos((p) => p + dir)
  }
  const goTo = (i) => i !== index && go(i - index)

  const onTransitionEnd = (e) => {
    if (e.target !== e.currentTarget || e.propertyName !== 'transform') return
    if (pos < count || pos >= 2 * count) {
      setAnimate(false)
      setPos(count + (pos % count))
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

/** Trilho com 3 cópias da lista, compartilhado entre desktop e mobile. */
function LoopTrack({ slides, c, sw, gap, className, renderSlide }) {
  const list = [...slides, ...slides, ...slides]
  return (
    <div
      onPointerDown={sw.onPointerDown}
      onDragStart={(e) => e.preventDefault()}
      onTransitionEnd={c.onTransitionEnd}
      className={`flex touch-pan-y select-none ${sw.dx ? 'cursor-grabbing' : `cursor-grab ${c.animate ? 'transition-transform duration-700 ease-out' : ''}`} ${className}`}
      style={{ transform: `translateX(calc(${-c.pos} * (100% + ${gap}) + ${sw.dx}px))` }}
    >
      {list.map((s, k) => {
        const i = k % slides.length
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
        gap="8px"
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
      {/* Mesma largura do conteúdo; altura na proporção do Figma (1264×420) e espaço entre banners de 40px em 1440 (2,778vw), alinhado ao logo e às seções; as setas ficam por cima/para fora.
          Sem overflow-hidden: os banners vizinhos aparecem nas margens (Figma 6384:38279). */}
      <div className="relative mx-auto max-w-content">
        <LoopTrack
          slides={slides}
          c={c}
          sw={sw}
          gap="2.778vw"
          className="gap-[2.778vw]"
          renderSlide={(s, k, { active, onClick }) => (
            <Link
              key={k}
              to={s.href}
              aria-hidden={!active}
              tabIndex={active ? 0 : -1}
              draggable={false}
              onClick={onClick}
              className="relative flex h-[300px] w-full shrink-0 items-end overflow-hidden rounded-2xl md:aspect-[1264/420] md:h-auto md:min-h-[300px]"
            >
              <img src={s.image} alt="" draggable={false} className="absolute inset-0 size-full object-cover" />
              <div className="relative flex w-full flex-col items-center gap-5 bg-black/[.56] px-4 py-5">
                <div className="flex flex-col items-center gap-3 pt-[10px]">
                  <span className="rounded-md bg-brand px-[14px] py-[11px] font-ui text-xs font-medium leading-4 text-white">{s.period}</span>
                  <p className="text-center text-3xl font-bold leading-none text-white md:text-4xl lg:text-5xl">{s.title}</p>
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
