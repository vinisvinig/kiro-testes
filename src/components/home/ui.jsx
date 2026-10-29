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
      const { moved, id } = drag
      drag = null
      if (!moved) return
      if (el.hasPointerCapture?.(id)) el.releasePointerCapture(id)
      // Para exatamente onde o usuário soltou (sem "ajeitar" até um card)
      Object.assign(el.style, { scrollSnapType: '', scrollBehavior: '', cursor: '', userSelect: '' })
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
  outlineBrand: 'border border-brand text-brand hover:border-brand-700 hover:text-brand-700',
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

/**
 * Barra de rolagem do trilho (Figma "Barra de Rolagem"): 242px no celular, largura do conteúdo no desktop.
 * No desktop dá para arrastar a barra ou clicar no trilho para rolar.
 */
export function ScrollProgress({ railRef, className = 'w-[242px]', interactive = false }) {
  const [state, setState] = useState({ w: 0.5, x: 0 })
  const track = useRef(null)
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

  // Posição do ponteiro no trilho (0–1) → scrollLeft
  const scrollTo = (clientX, grab = 0.5) => {
    const el = railRef.current
    const r = track.current.getBoundingClientRect()
    const free = 1 - state.w
    if (!el || free <= 0) return
    const x = (clientX - r.left) / r.width - state.w * grab
    el.style.scrollSnapType = 'none'
    el.style.scrollBehavior = 'auto'
    el.scrollLeft = Math.max(0, Math.min(1, x / free)) * (el.scrollWidth - el.clientWidth)
  }
  const onDown = (e) => {
    if (!interactive || e.button !== 0) return
    e.preventDefault()
    const r = track.current.getBoundingClientRect()
    const pos = (e.clientX - r.left) / r.width
    // Agarrou a barra: mantém o ponto agarrado; clicou fora: centraliza a barra no clique
    const grab = pos >= state.x && pos <= state.x + state.w ? (pos - state.x) / state.w : 0.5
    scrollTo(e.clientX, grab)
    const move = (ev) => scrollTo(ev.clientX, grab)
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      const el = railRef.current
      if (el) {
        el.style.scrollSnapType = ''
        el.style.scrollBehavior = ''
      }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div className={`h-[14px] rounded-full bg-black/5 p-1 ${interactive ? 'cursor-pointer' : ''} ${className}`} aria-hidden onPointerDown={onDown}>
      <div ref={track} className="relative h-full overflow-hidden rounded-full">
        <span className="absolute inset-y-0 rounded-full bg-line" style={{ width: `${state.w * 100}%`, left: `${state.x * 100}%` }} />
      </div>
    </div>
  )
}

/**
 * Desktop: estende o trilho até as duas bordas da janela, com padding/scroll-padding iguais à margem,
 * para o 1º e o último card pararem alinhados ao conteúdo e os demais aparecerem até a borda.
 * Medido em px (o % do scroll-padding é relativo ao próprio trilho e não serviria).
 */
function useFullBleed(railRef) {
  useEffect(() => {
    const el = railRef.current
    const box = el?.parentElement
    if (!el || !box) return
    const apply = () => {
      // No fim do trilho, o espaço à direita do último card é igual ao espaço entre os cards
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0
      if (!window.matchMedia('(min-width: 768px)').matches) {
        Object.assign(el.style, { marginLeft: '', marginRight: '', paddingLeft: '', paddingRight: `${gap}px`, scrollPaddingLeft: '', scrollPaddingRight: '' })
        return
      }
      const r = box.getBoundingClientRect()
      const left = Math.max(0, r.left)
      const right = Math.max(0, document.documentElement.clientWidth - r.right)
      Object.assign(el.style, {
        marginLeft: `${-left}px`,
        marginRight: `${-right}px`,
        paddingLeft: `${left}px`,
        paddingRight: `${gap}px`,
        scrollPaddingLeft: `${left}px`,
        scrollPaddingRight: `${gap}px`,
      })
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(document.documentElement)
    return () => ro.disconnect()
  }, [railRef])
}

/**
 * Trilho horizontal de cards.
 * Desktop: barra de rolagem nativa estilizada. Mobile: progresso + setas abaixo,
 * e opcionalmente um botão "Ver tudo" de largura total.
 */
export function Carousel({ railRef, onScroll, gap = 'gap-2 md:gap-8', seeAllHref, seeAllLight = false, children }) {
  useFullBleed(railRef)
  return (
    <div className="flex flex-col gap-5 md:gap-0">
      {/* Desktop: o trilho ocupa a tela toda (os cards passam das margens dos dois lados, como no Figma 6384:38271).
          O padding e o scroll-padding iguais à margem fazem o 1º e o último card pararem alinhados ao conteúdo.
          A barra nativa ficaria da largura da tela, então ela é escondida e a barra própria fica abaixo, na largura do conteúdo. */}
      <div
        ref={railRef}
        className={`no-scrollbar -mx-4 flex overflow-x-auto px-4 ${gap}`}
      >
        {children}
      </div>
      <ScrollProgress railRef={railRef} interactive className="mt-4 hidden w-full md:block" />
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
