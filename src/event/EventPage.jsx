// Página do evento (Figma 8515:120880) com as abas "Informações do evento" e "Comprar ingressos".
import { useEffect, useMemo, useReducer, useState } from 'react'
import { flushSync } from 'react-dom'
import { Lightbox } from '../local/Gallery.jsx'
import { navigate } from '../router.jsx'
import BuyTab from './BuyTab.jsx'
import { EVENT, RESERVE_SECONDS, SECTORS, SERVICE_FEE, SESSIONS, minFare } from './eventData.js'
import { deriveOrder, initialOrder, orderReducer } from './order.js'
import { checkoutReducer, initialCheckout } from './checkout.js'
import { Card, CardTitle, Dialog, Eyebrow, FeesDialog, Ico, VenueMap, brl } from './parts.jsx'
import Checkout from './Checkout.jsx'
import OrderSuccess from './OrderSuccess.jsx'
import { mmss } from './OrderSummary.jsx'
import FaqItem from '../components/FaqItem.jsx'
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
  // A reserva vale na aba Comprar ingressos e na finalização
  const reserving = view === 'buy' || view === 'checkout'
  const expired = deadline && remaining === 0 && reserving

  const session = SESSIONS.find((s) => s.id === order.sessionId) || null
  const derived = useMemo(() => deriveOrder(order), [order])

  const base = `/evento/${slug}`
  const go = (aba, opts) => navigate(aba ? `${base}?aba=${aba}` : base, opts)

  // O tempo de reserva começa ao abrir a aba Comprar ingressos (Figma 9941:50644), segue na finalização
  // e para quando o usuário volta para as informações do evento.
  useEffect(() => {
    if (reserving && !deadline) {
      setDeadline(Date.now() + RESERVE_SECONDS * 1000)
      setExtended(false)
    }
    if (!reserving && deadline) setDeadline(null)
  }, [reserving, deadline])

  // Quando faltam 5 minutos, a reserva ganha +5 minutos uma única vez (Figma 9945:124592).
  useEffect(() => {
    if (!reserving || !deadline || extended || remaining > EXTEND_AT) return
    setExtended(true)
    setDeadline((d) => d + EXTEND_SECONDS * 1000)
    setBonus(true)
  }, [reserving, deadline, extended, remaining])

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
      <Tabs tab={tab} onTab={goTab} remaining={deadline ? remaining : null} />
      {/* Fundo da área de conteúdo: Body Secundário #f5f5f5 (Figma 8677:38376) */}
      <div className={`bg-body-2 ${tab === 'buy' ? 'pb-32 lg:pb-0' : ''}`}>
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
      <ExpiredDialog open={!!expired} onRestart={restart} />
      <ExtraTimeDialog open={bonus && !expired} onClose={() => setBonus(false)} />
    </>
  )
}
/* ---------------- Hero (Figma: banner com cantos arredondados) ---------------- */
function Hero() {
  return (
    // Altura proporcional à largura: celular 390×520 (Figma 10227:101972), desktop 1440×468.
    // Celular: sem cantos arredondados, imagem enquadrada nos personagens e legenda à esquerda numa faixa escura (50%).
    <section className="relative aspect-[390/520] w-full overflow-hidden bg-ink-dark md:aspect-[1440/468] md:rounded-bl-[80px]">
      <img src={EVENT.hero} alt="" className="absolute inset-0 size-full object-cover object-[30.5%_50%] md:object-center" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 bg-black/50 p-4 md:items-center md:bg-transparent md:bg-gradient-to-t md:from-black/70 md:via-black/40 md:to-transparent md:px-4 md:pb-[2.8vw] md:pt-20">
        <span className="rounded-md bg-brand px-[14px] py-[11px] font-ui text-xs font-medium leading-4 text-white md:py-[9px]">{EVENT.period}</span>
        <h1 className="text-3xl font-bold leading-none text-white md:text-center md:text-[clamp(30px,3.4vw,48px)]">{EVENT.title}</h1>
        <div className="h-1.5 md:hidden" />
      </div>
    </section>
  )
}

/* ---------------- Abas ---------------- */
function Tabs({ tab, onTab, remaining }) {
  const item = (id, icon, label) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === id}
      onClick={() => onTab(id)}
      // Celular: abas dividem a largura e o cronômetro fica abaixo do título; desktop: ao lado
      className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 border-b-2 px-2 py-3 font-ui text-sm font-semibold transition md:flex-none md:flex-row md:gap-2 md:px-4 md:py-4 ${
        tab === id ? 'border-brand text-ink' : 'border-transparent text-ink-2 hover:text-ink'
      }`}
    >
      <span className="flex items-center gap-2 whitespace-nowrap">
        <Ico name={icon} className="size-4" />
        {label}
      </span>
      {/* Cronômetro da reserva na aba Comprar ingressos (Figma 9941:50644); oculto no desktop a pedido (Figma 9941:50449) */}
      {id === 'buy' && tab === 'buy' && remaining !== null && (
        <span
          role="timer"
          aria-label={`Reserva garantida por ${mmss(remaining)}`}
          className={`flex items-center gap-1 rounded-full lg:hidden px-2 py-0.5 text-xs font-normal leading-4 text-white ${remaining <= 120 ? 'bg-danger' : 'bg-ink'}`}
        >
          {mmss(remaining)}
          <Ico name="timer" className="size-[14px]" />
        </span>
      )}
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
          {/* Atalhos para cada bloco (Figma 10379:64536), na ordem atual dos blocos */}
          <SectionNav />
          {/* Ordem do Figma 8677:38377: setores e preços logo após o "Sobre"; mapa antes da galeria */}
          <div id="sec-sobre" className="scroll-mt-24">
            <About />
          </div>
          <div id="sec-setores" className="scroll-mt-24">
            <SectorsGuide />
          </div>
          <div id="sec-ingressos" className="scroll-mt-24">
            <PricesCard />
          </div>
          <div id="sec-onde-comprar" className="scroll-mt-24">
            <TopicsCard eyebrow="Onde comprar" title="Pontos de venda" items={EVENT.salesPoints} />
          </div>
          <VenueMap />
          <div id="sec-galeria" className="scroll-mt-24">
            <GalleryCard />
          </div>
          <div id="sec-local" className="scroll-mt-24">
            <VenueCard />
          </div>
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
            <p className="text-xs font-semibold uppercase leading-4 text-combo">{k}</p>
            <p className="text-[13px] font-semibold leading-tight text-ink">{v}</p>
            {d && <p className="text-xs leading-4 text-ink-2">{d}</p>}
          </li>
        ))}
      </ul>
    </Card>
  )
}

const SECTIONS = [
  ['sec-sobre', 'Sobre'],
  ['sec-setores', 'Setores'],
  ['sec-ingressos', 'Ingressos e benefícios'],
  ['sec-onde-comprar', 'Onde comprar'],
  ['sec-galeria', 'Galeria'],
  ['sec-local', 'Local'],
]

/**
 * Atalhos (Figma 10379:64536): faixa cinza com pílulas; a do bloco visível fica rosa.
 * Toque rola até o bloco. No celular a faixa rola para o lado.
 */
function SectionNav() {
  const [active, setActive] = useState(SECTIONS[0][0])
  useEffect(() => {
    // Ativo = último bloco cujo topo já passou de 1/3 da tela
    const onScroll = () => {
      const line = window.innerHeight / 3
      let cur = SECTIONS[0][0]
      for (const [id] of SECTIONS) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) cur = id
      }
      setActive(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const go = (id) => {
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return (
    <nav aria-label="Seções da página" className="rounded-2xl border border-line bg-body-2 p-2">
      <ul className="no-scrollbar flex gap-1 overflow-x-auto">
        {SECTIONS.map(([id, label]) => {
          const on = active === id
          return (
            <li key={id} className="shrink-0">
              <button
                type="button"
                onClick={() => go(id)}
                aria-current={on ? 'true' : undefined}
                className={`whitespace-nowrap rounded-2xl border p-2 text-sm font-semibold leading-5 transition ${
                  on ? 'border-brand bg-brand text-white' : 'border-line bg-white text-ink hover:border-brand'
                }`}
              >
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** "Ver mais" rosa sublinhado (mesmo estilo dos outros blocos). */
const MoreButton = ({ open, onClick, controls }) => (
  <button
    type="button"
    onClick={onClick}
    aria-expanded={open}
    aria-controls={controls}
    className="self-start text-base font-semibold leading-6 text-brand underline underline-offset-2 hover:text-brand-700"
  >
    {open ? 'Ver menos' : 'Ver mais'}
  </button>
)

/** Caixa cinza com borda usada nos dois blocos novos (Figma: #f5f5f5, borda #d4d4d4, raio 16, padding 16). */
const InfoTile = ({ title, titleClass = 'text-ink', gap = 'gap-1', children }) => (
  <li className={`flex flex-col ${gap} rounded-2xl border border-line bg-body-2 p-4`}>
    <p className={`text-base font-semibold leading-6 ${titleClass}`}>{title}</p>
    <p className="text-sm leading-5 text-ink-2">{children}</p>
  </li>
)

/** "Entenda os setores" (Figma 10379:64403): glossário em grade de 2 colunas. */
function SectorsGuide() {
  const [more, setMore] = useState(false)
  const terms = more ? EVENT.sectorTerms : EVENT.sectorTerms.slice(0, 6)
  return (
    <Card className="md:!p-8">
      <Eyebrow>Setores do evento</Eyebrow>
      <CardTitle className="mt-2">Entenda os setores</CardTitle>
      <p className="mt-6 text-sm leading-5 text-ink-2">Saiba o que cada nome costuma indicar antes de escolher.</p>
      <ul id="setores-termos" className="mt-4 grid gap-4 sm:grid-cols-2">
        {terms.map(([t, d]) => (
          <InfoTile key={t} title={t}>
            {d}
          </InfoTile>
        ))}
      </ul>
      <p className="mt-6 text-sm leading-5 text-ink-2">Os setores e serviços variam por evento. Consulte o mapa e as condições para confirmar as opções disponíveis.</p>
      <div className="mt-6 flex">
        <MoreButton open={more} onClick={() => setMore(!more)} controls="setores-termos" />
      </div>
    </Card>
  )
}

/** "Preços e tipos de ingresso" (Figma 10145:90808): Ingresso x Combo e o menor valor de cada setor. */
function PricesCard() {
  const [more, setMore] = useState(false)
  const rows = EVENT.sectorCompare
    .map(([id, trait]) => {
      const s = SECTORS.find((x) => x.id === id && !x.soldOut)
      if (!s) return null
      const price = minFare(s)
      return { id, name: s.name, trait, price, fee: price * SERVICE_FEE }
    })
    .filter(Boolean)
  const shown = more ? rows : rows.slice(0, 3)
  return (
    <Card className="md:!p-8">
      <Eyebrow>Ingressos & benefícios</Eyebrow>
      <CardTitle className="mt-2">Preços e tipos de ingresso</CardTitle>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        <InfoTile title="Ingresso" titleClass="text-brand" gap="gap-2">
          Um ingresso por pessoa. Escolha a quantidade e os assentos, quando houver.
        </InfoTile>
        <InfoTile title="Combo" titleClass="text-combo" gap="gap-2">
          Pacote com quantidade e tipos de ingresso definidos. Assentos no setor do combo.
        </InfoTile>
      </ul>
      <hr className="mt-6 border-line" />
      <h3 className="mt-6 text-xl font-bold leading-6 text-ink">Compare os setores</h3>
      <p className="mt-4 text-sm leading-5 text-ink-2">Menor valor por setor, conforme o tipo de ingresso e suas condições.</p>
      {/* Desktop: cabeçalho Setor | Valor; no celular cada setor vira um bloco com o valor embaixo */}
      <div className="mt-4 hidden gap-4 px-4 py-4 text-base font-semibold leading-6 text-ink sm:grid sm:grid-cols-[minmax(0,300fr)_minmax(0,332fr)]" aria-hidden>
        <span>Setor</span>
        <span>Valor</span>
      </div>
      <ul id="precos-setores" className="mt-4 flex flex-col gap-4 sm:mt-0" aria-label="Menor valor por setor">
        {shown.map((r) => (
          <li key={r.id} className="grid gap-3 rounded-2xl bg-body-2 p-4 sm:grid-cols-[minmax(0,300fr)_minmax(0,332fr)] sm:gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-base font-semibold leading-6 text-ink">{r.name}</p>
              <p className="text-sm leading-5 text-ink-2">{r.trait}</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-lg font-bold leading-[22px] text-brand">A partir de {brl(r.price)}</p>
              <p className="text-sm leading-5 text-ink-2">Taxa a partir de {brl(r.fee)}</p>
              <p className="text-sm font-semibold leading-5 text-ink">Total a partir de {brl(r.price + r.fee)}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-4 text-ink-2">
        Obs.: Valores e taxas a partir de, sujeitos à disponibilidade. Setores e tipos de ingresso podem esgotar até a seleção.
      </p>
      {rows.length > 3 && (
        <div className="mt-6 flex">
          <MoreButton open={more} onClick={() => setMore(!more)} controls="precos-setores" />
        </div>
      )}
    </Card>
  )
}

/** Card de texto por assunto (Figma "Pontos de venda"). */
function TopicsCard({ eyebrow, title, items }) {
  return (
    <Card>
      <Eyebrow>{eyebrow}</Eyebrow>
      <CardTitle className="mt-2">{title}</CardTitle>
      <div className="mt-6 flex flex-col gap-4">
        {items.map(([label, lines, more]) => (
          <div key={label} className="flex flex-col gap-2">
            {/* Figma 10281:52145: título do assunto em preto (antes roxo) */}
            <h3 className="text-lg font-medium leading-none text-ink">{label}</h3>
            <TopicText lines={lines} more={more} />
          </div>
        ))}
      </div>
    </Card>
  )
}

/** Texto do assunto; com `more`, mostra "Ver mais" (rosa, sublinhado) e abre o restante no lugar. */
function TopicText({ lines, more }) {
  const [open, setOpen] = useState(false)
  const all = open && more ? [...lines, ...more] : lines
  return (
    <div className="text-sm leading-5 text-ink-2">
      {all.map((l, i) => (
        <p key={l}>
          {l}
          {more && i === all.length - 1 && (
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              className="ml-2 text-base font-semibold leading-6 text-brand underline underline-offset-2 hover:text-brand-700"
            >
              {open ? 'Ver menos' : 'Ver mais'}
            </button>
          )}
        </p>
      ))}
    </div>
  )
}

function GalleryCard() {
  const [open, setOpen] = useState(-1)
  const imgs = EVENT.gallery
  return (
    // Celular (Figma 10210:52064): fundo claro, fotos empilhadas com 220px e "Galeria completa" com 128px
    <Card className="max-md:bg-body">
      <Eyebrow>Galeria & bastidores</Eyebrow>
      <CardTitle className="mt-1 md:mt-2">Veja o que espera por você</CardTitle>
      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-6 md:grid-cols-3 md:gap-3">
        {imgs.slice(0, 2).map((src, i) => (
          <button key={src} type="button" onClick={() => setOpen(i)} aria-label={`Abrir foto ${i + 1}`} className="h-[220px] overflow-hidden rounded-xl md:aspect-square md:h-auto">
            <img src={src} alt="" loading="lazy" className="size-full object-cover transition hover:scale-105" />
          </button>
        ))}
        <button type="button" onClick={() => setOpen(0)} className="flex h-32 flex-col items-center justify-center gap-2 rounded-xl bg-night text-white hover:bg-night-card md:aspect-square md:h-auto">
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
          <p className="font-ui text-[10px] text-ink-3">Show oficial, {EVENT.rangeLabel}</p>
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
      {/* Mesmo item de FAQ das casas/locais (Figma 7903:97391) */}
      <div className="mt-6 flex flex-col gap-6">
        {EVENT.faq.map((f, i) => (
          <FaqItem key={f.q} item={f} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
        ))}
      </div>
    </Card>
  )
}

/** Card lateral "Compre agora" com o preço inicial (Figma 9150:191556). */
function BuyCard({ onBuy, onFees }) {
  const from = Math.min(...SECTORS.filter((s) => !s.soldOut).map((s) => minFare(s)))
  const fee = from * 0.15
  const total = from + fee
  return (
    <Card as="div">
      <Eyebrow>Ingressos disponíveis</Eyebrow>
      <p className="mt-2 text-2xl font-semibold leading-none text-ink">Compre agora</p>
      {/* Sessão (Figma 9150:191560): ícone + período, sem fundo nem borda. Só informativo, não é clicável. */}
      <p className="mt-6 flex items-center gap-3 text-sm font-semibold leading-5 text-brand">
        <Ico name="calendar" className="size-6 text-ink" />
        {EVENT.rangeLabel}
      </p>
      <div className="mt-6 border-t border-line pt-6">
        <p className="text-sm leading-5 text-ink-2">Ingressos a partir de</p>
        <p className="text-2xl font-bold text-ink">{brl(from)}</p>
        <p className="text-sm leading-5 text-ink-3">+ taxa de serviço a partir de {brl(fee)}</p>
        <p className="mt-4 text-sm font-semibold leading-5 text-ink-2">Total à vista {brl(total)}</p>
        <p className="mt-1 text-xs leading-4 text-ink-3">Ou 3x de {brl((total * 1.03) / 3)}, total {brl(total * 1.03)}</p>
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
