// Página do evento (Figma 8515:120880) com as abas "Informações do evento" e "Comprar ingressos".
import { useEffect, useMemo, useReducer, useState } from 'react'
import { flushSync } from 'react-dom'
import { Lightbox } from '../local/Gallery.jsx'
import { navigate } from '../router.jsx'
import BuyTab from './BuyTab.jsx'
import { EVENT, RESERVE_SECONDS, SECTORS, SESSIONS, minFare } from './eventData.js'
import { deriveOrder, initialOrder, orderReducer } from './order.js'
import { checkoutReducer, initialCheckout } from './checkout.js'
import { Card, CardTitle, Dialog, Eyebrow, FeesDialog, Ico, VenueMap, brl } from './parts.jsx'
import Checkout from './Checkout.jsx'
import OrderSuccess from './OrderSuccess.jsx'
import { openLogin, useAuth } from '../auth.js'

const mapsSearch = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
const mapsEmbed = (q) => `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`

/** Contagem regressiva da reserva (só durante a jornada de compra). */
function useCountdown(deadline) {
  const [, tick] = useState(0)
  useEffect(() => {
    if (!deadline) return
    const id = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [deadline])
  // Lê o relógio na renderização para não começar com um horário antigo.
  return deadline ? Math.max(0, Math.floor((deadline - Date.now()) / 1000)) : RESERVE_SECONDS
}

const EXTEND_AT = 5 * 60 // segundos restantes que disparam o bônus
const EXTEND_SECONDS = 5 * 60

const VIEWS = { ingressos: 'buy', pagamento: 'checkout', pedido: 'done' }

export default function EventPage({ slug, search }) {
  const view = VIEWS[new URLSearchParams(search).get('aba')] || 'info'
  const tab = view === 'buy' ? 'buy' : 'info'
  const [order, dispatch] = useReducer(orderReducer, initialOrder)
  const [checkout, dispatchCheckout] = useReducer(checkoutReducer, initialCheckout)
  const [result, setResult] = useState(null)
  const [deadline, setDeadline] = useState(null)
  const [extended, setExtended] = useState(false) // já ganhou os +5 minutos nesta reserva
  const [bonus, setBonus] = useState(false) // pop-up "Seu tempo está acabando"
  const [fees, setFees] = useState(false)
  const { user } = useAuth()
  const remaining = useCountdown(deadline)
  const expired = deadline && remaining === 0 && view === 'checkout'

  const session = SESSIONS.find((s) => s.id === order.sessionId) || null
  const derived = useMemo(() => deriveOrder(order), [order])

  const base = `/evento/${slug}`
  const go = (aba, opts) => navigate(aba ? `${base}?aba=${aba}` : base, opts)

  // O tempo de reserva existe só na jornada de compra: começa ao entrar na finalização e
  // para quando o usuário volta para a seleção.
  useEffect(() => {
    if (view === 'checkout' && !deadline) {
      setDeadline(Date.now() + RESERVE_SECONDS * 1000)
      setExtended(false)
    }
    if (view !== 'checkout' && deadline) setDeadline(null)
  }, [view, deadline])

  // Quando faltam 5 minutos, a reserva ganha +5 minutos uma única vez (Figma 9945:124592).
  useEffect(() => {
    if (view !== 'checkout' || !deadline || extended || remaining > EXTEND_AT) return
    setExtended(true)
    setDeadline((d) => d + EXTEND_SECONDS * 1000)
    setBonus(true)
  }, [view, deadline, extended, remaining])

  // Sem ingressos válidos (ou sem login), a finalização volta para a seleção; sem pedido, o resultado também.
  useEffect(() => {
    if (view === 'checkout' && (!derived.canBuy || !user)) go('ingressos', { scroll: false })
    if (view === 'done' && !result) go('ingressos', { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, derived.canBuy, user, result])

  const goTab = (t) => go(t === 'buy' ? 'ingressos' : null, { scroll: false })
  const startBuy = () => {
    goTab('buy')
    requestAnimationFrame(() => document.getElementById('abas-evento')?.scrollIntoView({ behavior: 'smooth' }))
  }
  // Escolher ingressos não exige login; o "Comprar" pede login antes de seguir para o pagamento.
  const buy = () => derived.canBuy && openLogin(() => go('pagamento'))
  const restart = () => {
    dispatch({ type: 'reset' })
    dispatchCheckout({ type: 'reset' })
    setDeadline(null)
    go('ingressos')
  }
  const paid = (r) => {
    // A troca de URL (popstate) renderiza com prioridade; grava o resultado antes para a
    // tela de sucesso já abrir com ele.
    flushSync(() => {
      setResult(r)
      setDeadline(null)
    })
    go('pedido')
  }
  // Limpa a seleção só depois que a tela de sucesso abriu (senão a finalização redirecionaria antes).
  useEffect(() => {
    if (view !== 'done' || !result) return
    dispatch({ type: 'reset' })
    dispatchCheckout({ type: 'reset' })
  }, [view, result])

  if (view === 'checkout' && derived.canBuy && user) {
    return (
      <>
        <Checkout
          order={derived}
          checkout={checkout}
          dispatch={dispatchCheckout}
          remaining={remaining}
          user={user}
          onBack={() => go('ingressos')}
          onPaid={paid}
        />
        <ExpiredDialog open={!!expired} onRestart={restart} />
        <ExtraTimeDialog open={bonus && !expired} onClose={() => setBonus(false)} />
      </>
    )
  }
  if (view === 'done' && result) return <OrderSuccess result={result} onHome={() => navigate('/')} />

  return (
    <>
      <Hero />
      <Tabs tab={tab} onTab={goTab} />
      <div className={tab === 'buy' ? 'pb-24 lg:pb-0' : ''}>
        {tab === 'info' ? (
          <InfoTab onBuy={startBuy} onFees={() => setFees(true)} />
        ) : (
          <BuyTab
            order={order}
            dispatch={dispatch}
            derived={derived}
            session={session}
            onFees={() => setFees(true)}
            onBuy={buy}
          />
        )}
      </div>

      <FeesDialog open={fees} onClose={() => setFees(false)} />
    </>
  )
}

/* ---------------- Hero (Figma: banner com cantos arredondados) ---------------- */
function Hero() {
  return (
    <section className="relative h-[320px] overflow-hidden rounded-b-[32px] bg-ink-dark md:h-[468px] md:rounded-bl-[80px] md:rounded-br-none">
      <img src={EVENT.hero} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-4 pb-8 pt-20 md:pb-10">
        <span className="rounded-md bg-brand px-[14px] py-[9px] font-ui text-xs font-medium leading-4 text-white">{EVENT.period}</span>
        <h1 className="text-center text-3xl font-bold leading-none text-white md:text-5xl">{EVENT.title}</h1>
      </div>
    </section>
  )
}

/* ---------------- Abas ---------------- */
function Tabs({ tab, onTab }) {
  const item = (id, icon, label) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === id}
      onClick={() => onTab(id)}
      className={`flex items-center gap-2 border-b-2 px-2 py-4 font-ui text-sm font-semibold transition md:px-4 ${
        tab === id ? 'border-brand text-ink' : 'border-transparent text-ink-2 hover:text-ink'
      }`}
    >
      <Ico name={icon} className="size-4" />
      {label}
    </button>
  )
  return (
    <div id="abas-evento" className="scroll-mt-20 border-b border-line bg-body">
      <div className="page-x">
        <div role="tablist" aria-label="Seções do evento" className="no-scrollbar evento-box flex gap-2 overflow-x-auto md:gap-6">
          {item('info', 'info', 'Informações do evento')}
          {item('buy', 'ticket', 'Comprar ingressos')}
        </div>
      </div>
    </div>
  )
}

/* ---------------- Aba de informações ---------------- */
function InfoTab({ onBuy, onFees }) {
  return (
    <div className="page-x py-6 md:py-8">
      <div className="evento-box evento-grid">
        <div className="flex min-w-0 flex-col gap-6">
          <About />
          <GalleryCard />
          <VenueCard />
          <VenueMap />
          <Faq />
        </div>
        <aside className="order-first lg:order-none lg:sticky lg:top-24 lg:self-start">
          <BuyCard onBuy={onBuy} onFees={onFees} />
        </aside>
      </div>
    </div>
  )
}

function About() {
  const a = EVENT.about
  const [more, setMore] = useState(false)
  return (
    <Card>
      <Eyebrow>{a.eyebrow}</Eyebrow>
      <CardTitle className="mt-2">{a.title}</CardTitle>
      <div id="sobre-mais" className="mt-4 flex flex-col gap-3 font-ui text-sm leading-6 text-ink-2">
        {(more ? [...a.paragraphs, ...a.more] : a.paragraphs).map((p, i, list) => (
          <p key={p}>
            {p}
            {/* "Ver mais" no fim do último parágrafo visível (Figma 9720:324216) */}
            {i === list.length - 1 && a.more.length > 0 && (
              <>
                {' '}
                <button
                  type="button"
                  onClick={() => setMore(!more)}
                  aria-expanded={more}
                  aria-controls="sobre-mais"
                  className="ml-1 whitespace-nowrap text-base font-semibold text-brand underline underline-offset-4 hover:no-underline"
                >
                  {more ? 'Ver menos' : 'Ver mais'}
                </button>
              </>
            )}
          </p>
        ))}
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
        {a.credits.map(([k, v, d]) => (
          // Figma 9720:324216 / 8515:120880: fundo claro, sem borda
          <li key={k} className="flex min-h-[92px] flex-col gap-[5px] rounded-lg bg-body p-[14px]">
            <p className="text-xs font-semibold uppercase leading-4 text-[#ed2a78]">{k}</p>
            <p className="text-[13px] font-semibold leading-tight text-ink">{v}</p>
            {d && <p className="text-xs leading-4 text-ink-2">{d}</p>}
          </li>
        ))}
      </ul>
    </Card>
  )
}

function GalleryCard() {
  const [open, setOpen] = useState(-1)
  const imgs = EVENT.gallery
  return (
    <Card>
      <Eyebrow>Galeria & bastidores</Eyebrow>
      <CardTitle className="mt-2">Veja o que espera por você</CardTitle>
      <div className="mt-6 grid grid-cols-3 gap-2 md:gap-3">
        {imgs.slice(0, 2).map((src, i) => (
          <button key={src} type="button" onClick={() => setOpen(i)} aria-label={`Abrir foto ${i + 1}`} className="aspect-square overflow-hidden rounded-xl">
            <img src={src} alt="" loading="lazy" className="size-full object-cover transition hover:scale-105" />
          </button>
        ))}
        <button type="button" onClick={() => setOpen(0)} className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl bg-night text-white hover:bg-night-card">
          <Ico name="photos" className="size-6" />
          <span className="text-sm font-semibold">Galeria completa</span>
          <span className="font-ui text-xs text-white/70">{imgs.length} fotos</span>
        </button>
      </div>
      {open >= 0 && <Lightbox images={imgs} start={open} title={EVENT.title} onClose={() => setOpen(-1)} />}
    </Card>
  )
}

function VenueCard() {
  const v = EVENT.venue
  const q = `${v.name}, ${v.address}`
  return (
    <Card>
      <Eyebrow>Local do espetáculo</Eyebrow>
      <CardTitle className="mt-2">{v.name}</CardTitle>
      <p className="mt-4 font-ui text-sm leading-6 text-ink-2">
        <strong className="text-ink">Endereço:</strong>{' '}
        <a href={mapsSearch(q)} target="_blank" rel="noopener noreferrer" className="text-brand underline hover:no-underline">
          {v.address}
        </a>
      </p>
      <p className="mt-2 font-ui text-sm leading-6 text-ink-2">{v.tip}</p>
      <div className="relative mt-4 h-[240px] overflow-hidden rounded-2xl border border-line md:h-[300px]">
        <iframe title={`Mapa — ${v.name}`} src={mapsEmbed(q)} loading="lazy" className="size-full border-0" referrerPolicy="no-referrer-when-downgrade" />
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-xl bg-white px-3 py-2 shadow">
          <p className="flex items-center gap-1 text-xs font-semibold text-ink">
            <Ico name="pin" className="size-4 text-brand" /> {v.name}
          </p>
          <p className="font-ui text-[10px] text-ink-3">Show diário {EVENT.rangeLabel}</p>
        </div>
      </div>
    </Card>
  )
}

function Faq() {
  const [open, setOpen] = useState(-1)
  return (
    <Card>
      <Eyebrow>Informações importantes & benefícios</Eyebrow>
      <CardTitle className="mt-2">Tire suas dúvidas antes de comprar</CardTitle>
      <ul className="mt-6 flex flex-col gap-3">
        {EVENT.faq.map((f, i) => {
          const isOpen = open === i
          return (
            <li key={f.q} className="rounded-2xl border border-line bg-white">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-${i}`}
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-semibold text-ink"
              >
                {f.q}
                <Ico name="expand" className={`size-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <p id={`faq-${i}`} className="px-4 pb-4 font-ui text-sm leading-6 text-ink-2">
                  {f.a}
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

/** Card lateral "Escolha a melhor sessão" com o preço inicial. */
function BuyCard({ onBuy, onFees }) {
  const from = Math.min(...SECTORS.filter((s) => !s.soldOut).map((s) => minFare(s)))
  const fee = from * 0.15
  const total = from + fee
  const dates = SESSIONS.filter((s) => s.kind === 'data').length
  return (
    <Card as="div">
      <Eyebrow>Ingressos disponíveis</Eyebrow>
      <p className="mt-2 text-xl font-bold text-ink">Escolha a melhor sessão</p>
      <button type="button" onClick={onBuy} className="mt-4 flex w-full items-center gap-3 rounded-xl border border-line bg-body-2 p-3 text-left hover:border-brand">
        <Ico name="calendar" className="size-6 text-ink" />
        <span>
          <span className="block text-sm font-semibold text-brand">{EVENT.rangeLabel}</span>
          <span className="block font-ui text-xs text-ink-3">{dates} datas e passaporte</span>
        </span>
      </button>
      <div className="mt-5 border-t border-line pt-5">
        <p className="font-ui text-xs text-ink-3">Ingressos a partir de</p>
        <p className="text-2xl font-bold text-ink">{brl(from)}</p>
        <p className="font-ui text-xs text-ink-3">+ {brl(fee)} taxa de serviço</p>
        <p className="mt-3 font-ui text-sm font-semibold text-ink">Total à vista {brl(total)}</p>
        <p className="font-ui text-xs text-ink-3">Ou 3x de {brl((total * 1.03) / 3)} no cartão</p>
        <button type="button" onClick={onFees} className="mt-3 flex items-center gap-1.5 font-ui text-xs font-semibold text-brand underline hover:no-underline">
          <Ico name="info" className="size-4" /> Entenda as taxas
        </button>
      </div>
      <button type="button" onClick={onBuy} className="mt-5 w-full rounded-full bg-brand py-[14px] font-ui text-[15px] font-semibold text-white hover:brightness-110">
        Comprar
      </button>
    </Card>
  )
}

/* ---------------- Diálogos ---------------- */
/** "Tempo esgotado!" (Figma 9376:110185). Fechar ou tentar novamente libera a seleção. */
function ExpiredDialog({ open, onRestart }) {
  return (
    <Dialog open={open} onClose={onRestart} labelledBy="expired-title" className="max-w-[390px] !rounded-lg !px-6 !pb-10 !pt-6">
      <div className="flex justify-end">
        <button type="button" onClick={onRestart} aria-label="Fechar" className="flex size-8 items-center justify-center rounded-full text-ink hover:bg-body-2">
          <Ico name="close" className="size-6" />
        </button>
      </div>
      <div className="mt-2 flex flex-col items-center gap-8 text-center">
        <Ico name="alarmOff" className="size-16 text-ink" />
        <div>
          <h2 id="expired-title" className="font-ui text-2xl font-bold leading-tight text-ink">
            Tempo esgotado!
          </h2>
          <p className="mt-2 font-ui text-sm leading-5 text-ink-2">Infelizmente seu tempo se esgotou, por favor atualize a página e tente novamente.</p>
        </div>
        <button type="button" onClick={onRestart} className="w-full rounded-full bg-brand py-[10px] font-ui text-[15px] font-semibold text-white hover:brightness-110">
          Tentar novamente
        </button>
      </div>
    </Dialog>
  )
}

/** "Seu tempo está acabando" (Figma 9945:124592): a reserva ganha +5 minutos. */
function ExtraTimeDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} labelledBy="extra-title" className="max-w-[390px] !rounded-lg !px-6 !pb-10 !pt-6">
      <div className="flex justify-end">
        <button type="button" onClick={onClose} aria-label="Fechar" className="flex size-8 items-center justify-center rounded-full text-ink hover:bg-body-2">
          <Ico name="close" className="size-6" />
        </button>
      </div>
      <div className="mt-2 flex flex-col items-center gap-8 text-center">
        <Ico name="alarmAdd" className="size-16 text-ink" />
        <div>
          <h2 id="extra-title" className="text-2xl font-bold leading-tight text-ink">
            Seu tempo está acabando
          </h2>
          <p className="mt-2 font-ui text-sm leading-5 text-ink-2" role="status">
            Você ganhou mais <strong className="text-ink">5 minutos</strong> para finalizar
            <br />
            seu pedido.
          </p>
        </div>
        <button type="button" onClick={onClose} className="w-full rounded-full bg-brand py-[10px] font-ui text-[15px] font-semibold text-white hover:brightness-110">
          Entendi
        </button>
      </div>
    </Dialog>
  )
}
