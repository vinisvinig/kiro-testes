import { useEffect, useRef, useState } from 'react'
import { Link } from '../../router.jsx'

/** Caminho de um asset baixado do Figma (public/figma). */
export const asset = (name) => `${import.meta.env.BASE_URL}figma/${name}`

/**
 * Arrastar com o mouse para rolar um trilho horizontal (no touch o scroll nativo já faz isso).
 * Só começa a arrastar depois de 5px, para não atrapalhar o clique nos cards; quando houve
 * arrasto, o clique que vem em seguida é cancelado para não abrir o link sem querer.
 */
export function useDragScroll(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let drag = null

    const onDown = (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || el.scrollWidth <= el.clientWidth) return
      // Bloqueia o arrasto nativo de links/imagens e a seleção de texto (o clique continua funcionando)
      e.preventDefault()
      drag = { x: e.clientX, left: el.scrollLeft, id: e.pointerId, moved: false }
    }
    const onMove = (e) => {
      if (!drag) return
      const dx = e.clientX - drag.x
      if (!drag.moved) {
        if (Math.abs(dx) < 5) return
        drag.moved = true
        el.setPointerCapture?.(drag.id)
        // Sem snap e sem scroll suave durante o arrasto, senão o trilho "briga" com o mouse
        Object.assign(el.style, { scrollSnapType: 'none', scrollBehavior: 'auto', cursor: 'grabbing', userSelect: 'none' })
      }
      el.scrollLeft = drag.left - dx
    }
    const onUp = () => {
      if (!drag) return
      const { moved, id, left: drag0 } = drag
      drag = null
      if (!moved) return
      if (el.hasPointerCapture?.(id)) el.releasePointerCapture(id)
      // Os cards são largos (402px): se o snap fosse religado aqui, um arrasto menor que meio
      // card voltaria para o card inicial. Então avança até o próximo card na direção do arrasto
      // e só religa o snap quando a rolagem termina.
      const pos = el.scrollLeft
      const forward = pos > drag0
      const box = el.getBoundingClientRect()
      const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0
      const starts = [...el.children].map((c) => c.getBoundingClientRect().left - box.left + pos - pad)
      const max = el.scrollWidth - el.clientWidth
      let target = forward ? starts.find((s) => s > pos + 1) ?? max : [...starts].reverse().find((s) => s < pos - 1) ?? 0
      target = Math.max(0, Math.min(max, target))
      el.style.cursor = ''
      el.style.userSelect = ''
      el.style.scrollBehavior = ''
      el.scrollTo({ left: target, behavior: 'smooth' })
      const restore = () => {
        el.removeEventListener('scrollend', restore)
        clearTimeout(timer)
        el.style.scrollSnapType = ''
      }
      const timer = setTimeout(restore, 700)
      el.addEventListener('scrollend', restore)
      const cancel = (ev) => {
        ev.preventDefault()
        ev.stopPropagation()
      }
      el.addEventListener('click', cancel, { capture: true, once: true })
      setTimeout(() => el.removeEventListener('click', cancel, { capture: true }), 0)
    }
    // Evita o "fantasma" nativo ao arrastar links e imagens dentro do trilho
    const onDragStart = (e) => e.preventDefault()

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('dragstart', onDragStart)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('dragstart', onDragStart)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [ref])
}

/** Ref + função para rolar um carrossel horizontal por "página", com arrasto do mouse. */
export function useScroller() {
  const ref = useRef(null)
  useDragScroll(ref)
  const scroll = (dir) => {
    const el = ref.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' })
  }
  return [ref, scroll]
}

const VARIANTS = {
  primary: 'bg-brand text-white hover:brightness-110',
  soft: 'bg-brand-0 text-brand hover:bg-[#fbd3e5]',
  ghost: 'text-brand hover:bg-brand-0',
  ghostLight: 'text-white hover:bg-white/10',
  outline: 'border border-ink text-brand hover:bg-brand-0',
  outlineNeutral: 'border border-line text-ink hover:bg-body-2',
  outlineBrand: 'border border-brand text-brand hover:bg-brand-0',
  outlineLight: 'border border-white text-white hover:bg-white/10',
}

const SIZES = {
  md: 'gap-[10px] px-6 py-[14px]', // Components/Button (Spacing Y 14)
  sm: 'gap-2 px-4 py-[10px]', // _button-small (Spacing Y SM 10)
}

/** Botão em pílula do design system Uhuu. */
export function Pill({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  font = 'font-ui',
  className = '',
  children,
  ...rest
}) {
  return (
    <Tag
      className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full ${font} text-[15px] font-semibold leading-none transition ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {icon && <img src={icon} alt="" className="size-[14px]" />}
      {children}
      {iconRight && <img src={iconRight} alt="" className="size-[14px]" />}
    </Tag>
  )
}

/** Botão redondo 38px com chevron (navegação dos carrosséis). */
export function IconButton({ icon, label, className = '', ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`flex size-[38px] shrink-0 items-center justify-center rounded-full border border-ink-800 transition hover:bg-body-3 ${className}`}
      {...rest}
    >
      <img src={icon} alt="" className="size-4" />
    </button>
  )
}

export function CarouselNav({ onScroll }) {
  return (
    <div className="flex items-center gap-2">
      <IconButton icon={asset('ic-chevron-left.svg')} label="Anterior" onClick={() => onScroll(-1)} />
      <IconButton icon={asset('ic-chevron-right.svg')} label="Próximo" onClick={() => onScroll(1)} />
    </div>
  )
}

/**
 * Cabeçalho de seção: ícone + título (24px mobile / 30px desktop) e ações à direita.
 * As ações só aparecem no desktop; no mobile elas vão para baixo do trilho (ver <Carousel>),
 * a não ser que `mobileActions` seja true.
 */
export function SectionHeader({ icon, title, light = false, mobileActions = false, children }) {
  return (
    <div className="flex items-center gap-4 md:min-h-[62px] md:flex-wrap md:gap-8">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {icon && <img src={icon} alt="" className="size-6 shrink-0" />}
        <h2 className={`text-2xl font-bold leading-none md:text-[30px] ${light ? 'text-white' : 'text-ink'}`}>{title}</h2>
      </div>
      {children && <div className={`${mobileActions ? 'flex' : 'hidden md:flex'} flex-wrap items-center gap-4`}>{children}</div>}
    </div>
  )
}

/** Barra de progresso do trilho no mobile (Figma "Barra de Rolagem" 242px). */
export function ScrollProgress({ railRef }) {
  const [state, setState] = useState({ w: 0.5, x: 0 })
  useEffect(() => {
    const el = railRef.current
    if (!el) return
    const on = () => {
      const w = Math.min(1, el.clientWidth / el.scrollWidth)
      const max = el.scrollWidth - el.clientWidth
      setState({ w, x: max > 0 ? (el.scrollLeft / max) * (1 - w) : 0 })
    }
    on()
    el.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      el.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [railRef])
  return (
    <div className="h-[14px] w-[242px] rounded-full bg-body p-1" aria-hidden>
      <div className="relative h-full overflow-hidden rounded-full">
        <span className="absolute inset-y-0 rounded-full bg-line" style={{ width: `${state.w * 100}%`, left: `${state.x * 100}%` }} />
      </div>
    </div>
  )
}

/**
 * Trilho horizontal de cards.
 * Desktop: barra de rolagem nativa estilizada. Mobile: progresso + setas abaixo,
 * e opcionalmente um botão "Ver tudo" de largura total.
 */
export function Carousel({ railRef, onScroll, gap = 'gap-2 md:gap-8', seeAllHref, seeAllLight = false, children }) {
  return (
    <div className="flex flex-col gap-5 md:gap-0">
      <div ref={railRef} className={`max-md:no-scrollbar md:uhuu-scroll -mx-4 flex snap-x overflow-x-auto px-4 md:mx-0 md:px-0 md:pb-4 ${gap}`}>
        {children}
      </div>
      <div className="flex items-center justify-between md:hidden">
        <ScrollProgress railRef={railRef} />
        <CarouselNav onScroll={onScroll} />
      </div>
      {seeAllHref && (
        <Pill
          as={Link}
          to={seeAllHref}
          variant={seeAllLight ? 'outlineLight' : 'outlineBrand'}
          size="sm"
          iconRight={seeAllLight ? undefined : asset('ic-chevron-pink.svg')}
          className="w-full md:hidden"
        >
          Ver tudo
        </Pill>
      )}
    </div>
  )
}

export function SeeAll({ href = '/busca' }) {
  return (
    <Pill as={Link} to={href} variant="ghost">
      Ver tudo
    </Pill>
  )
}

/* ------------------------------------------------------------------ */
/* Utilitários compartilhados (skeleton, media query, modal)           */
/* ------------------------------------------------------------------ */

/** Bloco cinza de carregamento (Figma: Components/Skeleton #e5e5e5, raio 8). */
export function Skel({ className = '' }) {
  return <div aria-hidden className={`animate-pulse rounded-lg bg-body-3 ${className}`} />
}

/** true quando a media query casa (ex.: '(min-width: 768px)'). */
export function useMediaQuery(query) {
  const get = () => typeof window !== 'undefined' && window.matchMedia(query).matches
  const [matches, setMatches] = useState(get)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatches(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return matches
}

export const useIsDesktop = () => useMediaQuery('(min-width: 768px)')

/*
 * Trava de scroll com contador: vários modais podem abrir/fechar fora de ordem (ex.: resumo
 * mobile aberto → login → navegação para o pagamento). Guardar o "valor anterior" de cada um
 * deixava o body preso em overflow:hidden; com o contador, o scroll volta quando o último fecha.
 */
let scrollLocks = 0
const lockScroll = () => {
  if (scrollLocks++ === 0) document.body.style.overflow = 'hidden'
}
const unlockScroll = () => {
  scrollLocks = Math.max(0, scrollLocks - 1)
  if (scrollLocks === 0) document.body.style.overflow = ''
}

/** Fecha com Esc e trava o scroll do body enquanto aberto. */
export function useModalBehavior(open, onClose) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    lockScroll()
    return () => {
      document.removeEventListener('keydown', onKey)
      unlockScroll()
    }
  }, [open, onClose])
}

/**
 * Modal mobile (Figma "modal cidades/categorias/data", "Modal nav"):
 * cartão branco raio 16 sobre fundo escuro, botão fechar no canto.
 */
export function Sheet({ open, onClose, title, children, footer, labelledBy }) {
  const ref = useRef(null)
  useModalBehavior(open, onClose)
  useEffect(() => {
    if (open) requestAnimationFrame(() => ref.current?.focus())
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/80 p-2 pt-4" onMouseDown={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={labelledBy ? undefined : title}
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
        className="flex max-h-[calc(100dvh-24px)] w-full max-w-[420px] flex-col overflow-hidden rounded-2xl bg-white outline-none"
      >
        <div className="flex justify-end px-4 pt-4">
          <button type="button" onClick={onClose} aria-label="Fechar" className="flex size-8 items-center justify-center rounded-full hover:bg-body-2">
            <img src={asset('ic-x.svg')} alt="" className="size-6" />
          </button>
        </div>
        {title && <h2 className="px-4 pb-6 pt-4 text-xl font-bold leading-none text-ink">{title}</h2>}
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer}
      </div>
    </div>
  )
}

/** Esconde ao rolar para baixo e mostra ao rolar para cima (anotação do header mobile no Figma). */
export function useHideOnScroll(enabled) {
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    if (!enabled) return setHidden(false)
    let last = window.scrollY
    const on = () => {
      const y = window.scrollY
      if (Math.abs(y - last) < 6) return
      setHidden(y > last && y > 80)
      last = y
    }
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [enabled])
  return hidden
}
