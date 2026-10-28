import { useEffect, useId, useRef, useState } from 'react'
import { asset, Pill, Skel, useDragScroll } from '../components/home/ui.jsx'
import EventCard, { EventCardSkeleton, EVENT_GRID } from '../components/home/EventCard.jsx'
import Pagination from '../components/Pagination.jsx'
import { Link } from '../router.jsx'
import { fetchVenue, pageOf, useAsync } from '../api.js'
import { LocalHero } from './Gallery.jsx'

const mapsSearch = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
const mapsRoute = (q) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`
const mapsEmbed = (q) => `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`

const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

/** Página Casa/Local (Figma 7903:96802 uma imagem, 7990:121303 várias, mobile 8019:130657). */
export default function LocalPage({ slug }) {
  const { data, loading } = useAsync(() => fetchVenue(slug), slug)

  if (loading && !data) return <LocalSkeleton />
  if (!data) return <NotFound />

  const { venue, events, highlights, faq } = data
  return (
    <>
      <Breadcrumb name={venue.name} />
      <LocalHero venue={venue} onSeeEvents={() => scrollToId('eventos-neste-local')} />
      <QuickSummary venue={venue} />
      {highlights.length > 0 && <Highlights events={highlights} />}
      <EventsHere events={events} />
      <About venue={venue} />
      <FullSummary venue={venue} />
      <StayTuned venue={venue} />
      <Directions venue={venue} />
      <Faq items={faq} />
    </>
  )
}

/* ---------------- Breadcrumb (7903:96804) ---------------- */
function Breadcrumb({ name }) {
  return (
    <nav aria-label="Você está em" className="bg-body">
      <ol className="page-x flex items-center gap-4 py-[10px] text-sm leading-5 text-ink md:py-6">
        <li>
          <Link to="/" className="flex items-center gap-[10px] font-medium hover:text-brand">
            <img src={asset('ic-home.svg')} alt="" className="size-4" />
            Home
          </Link>
        </li>
        <li aria-hidden>
          <img src={asset('ic-slash.svg')} alt="" className="size-3" />
        </li>
        <li aria-current="page" className="truncate font-semibold">
          {name}
        </li>
      </ol>
    </nav>
  )
}

/* ---------------- Resumo (7903:96819 e 7925:52705) ---------------- */
function SummaryItem({ icon, label, children }) {
  return (
    <div className="flex items-center gap-3 md:w-[360px]">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand p-2">
        <img src={asset(icon)} alt="" className="size-[18px]" />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        {label && <span className="text-xs font-semibold leading-4 text-ink-3">{label}</span>}
        {children}
      </div>
    </div>
  )
}

const Value = ({ children }) => <span className="text-sm font-bold leading-5 text-ink">{children}</span>

function AddressLink({ venue }) {
  return (
    <a
      href={mapsSearch(`${venue.name}, ${venue.address}`)}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-bold leading-5 text-brand underline hover:no-underline"
    >
      {venue.address}
    </a>
  )
}

const cap = (n) => n.toLocaleString('pt-BR')

function QuickSummary({ venue }) {
  return (
    <section className="bg-body py-8 md:py-12">
      <div className="page-x">
        <div className="mx-auto flex max-w-content flex-col gap-4 rounded-3xl border border-line bg-body-2 p-4 md:flex-row md:flex-wrap md:items-center md:gap-6 md:p-6">
          <SummaryItem icon="res-place.svg" label="Endereço">
            <AddressLink venue={venue} />
          </SummaryItem>
          <SummaryItem icon="res-seat.svg" label="Capacidade">
            <Value>{cap(venue.capacity)}</Value>
          </SummaryItem>
          <SummaryItem icon="res-info.svg">
            <button type="button" onClick={() => scrollToId('sobre-este-local')} className="flex items-center gap-[10px] font-ui text-[15px] font-semibold leading-none text-brand hover:underline">
              Saiba mais sobre
              <img src={asset('ic-dbl-down.svg')} alt="" className="size-[14px]" />
            </button>
          </SummaryItem>
        </div>
      </div>
    </section>
  )
}

function FullSummary({ venue }) {
  return (
    <section className="bg-body-2 py-8 md:py-12">
      <div className="page-x">
        <div className="mx-auto flex max-w-content flex-col gap-4 rounded-3xl border border-line bg-body p-4 md:flex-row md:flex-wrap md:items-start md:gap-6 md:p-6">
          <SummaryItem icon="res-place.svg" label="Endereço">
            <AddressLink venue={venue} />
          </SummaryItem>
          <SummaryItem icon="res-access.svg" label="Acessibilidade">
            <Value>{venue.accessibility}</Value>
          </SummaryItem>
          <SummaryItem icon="res-car.svg" label="Estacionamento">
            <Value>{venue.parking}</Value>
          </SummaryItem>
          <SummaryItem icon="res-seat.svg" label="Capacidade">
            <Value>{cap(venue.capacity)}</Value>
          </SummaryItem>
          {venue.opened && (
            <SummaryItem icon="res-today.svg" label="Data de inauguração">
              <Value>{venue.opened}</Value>
            </SummaryItem>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Eventos ---------------- */
function SectionTitle({ icon, children, id }) {
  return (
    <h2 id={id} className="flex scroll-mt-28 items-center gap-2 text-2xl font-bold leading-none text-ink md:text-[30px]">
      {icon && <img src={asset(icon)} alt="" className="size-6" />}
      {children}
    </h2>
  )
}

function Highlights({ events }) {
  const rail = useRef(null)
  useDragScroll(rail)
  return (
    <section className="bg-body pb-8 pt-14 md:pb-16 md:pt-16">
      <div className="page-x">
        <div className="mx-auto flex max-w-content flex-col gap-5 md:gap-8">
          <SectionTitle icon="ic-sparkle.svg">Destaques</SectionTitle>
          <div
            ref={rail}
            className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 md:-mx-margem md:px-margem lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-[29px] lg:overflow-visible lg:px-0"
          >
            {events.map((e) => (
              <EventCard key={e.id} {...e} grid widthClass="w-[172px] lg:w-full" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function EventsHere({ events }) {
  const [page, setPage] = useState(1)
  const [busy, setBusy] = useState(false)
  const { items, pages } = pageOf(events, page)

  // Troca de página com o skeleton breve, como nos outros carregamentos
  const goPage = (p) => {
    setBusy(true)
    scrollToId('eventos-neste-local')
    setTimeout(() => {
      setPage(p)
      setBusy(false)
    }, 450)
  }

  return (
    <section className="bg-body pb-14 pt-8 md:pb-16 md:pt-16">
      <div className="page-x">
        <div className="mx-auto flex max-w-content flex-col gap-5 md:gap-8" aria-busy={busy}>
          <SectionTitle id="eventos-neste-local">Eventos neste local</SectionTitle>
          {events.length === 0 ? (
            <p className="rounded-3xl border border-line bg-white p-8 text-center text-base text-ink-2">
              Nenhum evento programado neste local no momento.
            </p>
          ) : (
            <ul className={EVENT_GRID}>
              {busy
                ? items.map((e) => (
                    <li key={e.id}>
                      <EventCardSkeleton grid />
                    </li>
                  ))
                : items.map((e) => (
                    <li key={e.id} className="flex">
                      <EventCard {...e} grid />
                    </li>
                  ))}
            </ul>
          )}
          <Pagination page={page} pages={pages} onPage={goPage} />
        </div>
      </div>
    </section>
  )
}

/* ---------------- Sobre (7925:52743) ---------------- */
function About({ venue }) {
  return (
    <section className="bg-body py-12">
      <div className="page-x">
        <div className="mx-auto flex max-w-content flex-col gap-3 md:gap-5">
          <SectionTitle id="sobre-este-local">Sobre este local</SectionTitle>
          <p className="max-w-[960px] text-base leading-5 text-ink-2">{venue.about}</p>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Fique por dentro (8387:250157) — só UI ---------------- */
function StayTuned({ venue }) {
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState({})
  const shortName = venue.name.replace(/^Teatro de Câmara /, 'Teatro ')

  const onSubmit = (e) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const errs = {}
    if (!String(f.get('nome')).trim()) errs.nome = 'Informe seu nome'
    if (!/^\S+@\S+\.\S+$/.test(String(f.get('email')))) errs.email = 'Informe um e-mail válido'
    setErrors(errs)
    // Integração com o ActiveCampaign entra aqui; por enquanto é só interface.
    if (!Object.keys(errs).length) setSent(true)
  }

  return (
    <section className="bg-[radial-gradient(120%_140%_at_100%_0%,#ff8000_0%,#f75b40_35%,#ee3680_75%)] px-5 py-12 md:px-0">
      <div className="md:page-x">
        <div className="mx-auto flex max-w-content flex-col gap-6 rounded-[28px] border border-line bg-white p-6 md:p-8">
          <div className="flex flex-col gap-2 md:gap-4">
            <h2 className="text-3xl font-bold leading-none text-[#1a1a1a] md:text-4xl">Fique por dentro do que acontece na região</h2>
            <p className="text-base leading-6 text-[#666]">
              Seja o primeiro a saber sobre shows, eventos exclusivos e promoções imperdíveis neste local.
              <br />
              <strong>Cadastre-se na Lista</strong> e Não perca nenhuma data do {shortName}.
            </p>
          </div>

          {sent ? (
            <p role="status" className="rounded-lg bg-brand-0 px-4 py-4 text-base font-semibold text-brand">
              Pronto! Você vai receber as novidades do {shortName} no seu e-mail.
            </p>
          ) : (
            <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4 lg:flex-row lg:items-start">
              <FormField name="nome" label="Nome" required placeholder="João Silva" autoComplete="name" error={errors.nome} />
              <FormField name="email" type="email" label="E-mail" required placeholder="seu@email.com" autoComplete="email" error={errors.email} />
              <FormField name="whatsapp" type="tel" label="WhatsApp" optional placeholder="(11) 9000-0000" autoComplete="tel" />
              <div className="flex flex-1 lg:pt-8">
                <Pill type="submit" className="w-full">
                  Entrar na lista
                </Pill>
              </div>
            </form>
          )}

          <p className="flex items-center gap-2 font-ui text-[10px] font-medium leading-4 text-ink-3">
            <img src={asset('ic-lock.svg')} alt="" className="size-3" />
            Seus dados estão protegidos. Cancele quando quiser.
          </p>
        </div>
      </div>
    </section>
  )
}

function FormField({ name, label, required, optional, error, ...input }) {
  const id = useId()
  return (
    <div className="flex flex-1 flex-col gap-2">
      <label htmlFor={id} className="flex gap-2 text-base leading-6">
        <span className="font-bold text-ink">
          {label}
          {required && '*'}
        </span>
        {optional && <span className="text-ink-2">(opcional)</span>}
      </label>
      <input
        id={id}
        name={name}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`h-[46px] rounded-lg border bg-white px-[22px] font-ui text-[15px] font-medium text-ink outline-none placeholder:text-ink-3 focus:border-brand ${
          error ? 'border-danger' : 'border-line'
        }`}
        {...input}
      />
      {error && (
        <span id={`${id}-err`} className="font-ui text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  )
}

/* ---------------- Como chegar (7903:96870) ---------------- */
function Directions({ venue }) {
  const query = `${venue.name}, ${venue.fullAddress}`
  const route = (
    <Pill as="a" href={mapsRoute(query)} target="_blank" rel="noopener noreferrer" font="font-sans" icon={asset('ic-map.svg')} className="max-md:w-full">
      Visualizar rota
    </Pill>
  )
  return (
    <section className="bg-body pb-12 pt-16">
      <div className="page-x">
        <div className="mx-auto flex max-w-content flex-col gap-4 md:gap-6">
          <SectionTitle>Como chegar</SectionTitle>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-10">
            <div className="flex flex-col gap-6 md:w-[500px] md:shrink-0">
              <p className="text-base leading-5 text-ink-2 md:leading-6">{venue.fullAddress}</p>
              <div className="hidden md:block">{route}</div>
            </div>
            <div className="h-[180px] min-w-0 flex-1 overflow-hidden rounded-2xl border border-line bg-body-3 md:h-[260px]">
              <iframe
                title={`Mapa: ${venue.name}`}
                src={mapsEmbed(query)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="size-full border-0"
              />
            </div>
            <div className="md:hidden">{route}</div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- FAQ (7903:96885) ---------------- */
function Faq({ items }) {
  const [open, setOpen] = useState(-1)
  return (
    <section className="bg-body-2 py-16">
      <div className="page-x">
        <div className="mx-auto flex max-w-content flex-col gap-8">
          <SectionTitle>FAQ</SectionTitle>
          <div className="flex flex-col gap-6">
            {items.map((f, i) => (
              <FaqItem key={f.q} item={f} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FaqItem({ item, open, onToggle }) {
  const id = useId()
  const panel = useRef(null)
  const [h, setH] = useState(0)
  useEffect(() => setH(open ? panel.current?.scrollHeight || 0 : 0), [open])
  return (
    <div className="rounded-lg border border-line bg-white">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-p`}
          onClick={onToggle}
          className="flex min-h-[70px] w-full items-center gap-4 px-4 py-6 text-left"
        >
          <span className="flex-1 text-base font-bold leading-tight text-ink md:text-lg">{item.q}</span>
          <img src={asset('ic-faq-expand.svg')} alt="" className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </h3>
      <div id={`${id}-p`} role="region" hidden={!open && h === 0} style={{ height: h }} className="overflow-hidden transition-[height] duration-300">
        <p ref={panel} className="px-4 pb-6 text-base leading-6 text-ink-2">
          {item.a}
        </p>
      </div>
    </div>
  )
}

/* ---------------- Estados ---------------- */
function NotFound() {
  return (
    <section className="page-x flex flex-col items-center gap-4 py-24 text-center">
      <p className="text-3xl font-bold text-ink">Local não encontrado</p>
      <p className="text-base text-ink-2">O endereço pode estar incorreto ou o local não está mais disponível.</p>
      <Pill as={Link} to="/">
        Voltar para a home
      </Pill>
    </section>
  )
}

/** Desktop - Local - Loading (skeleton) (Figma 7864:125945). */
function LocalSkeleton() {
  const item = (k) => (
    <div key={k} className="flex items-center gap-3 md:w-[360px]">
      <Skel className="size-9 shrink-0 rounded-full" />
      <div className="flex flex-col gap-1">
        <Skel className="h-3 w-[60px]" />
        <Skel className="h-4 w-[150px]" />
      </div>
    </div>
  )
  return (
    <div aria-busy="true">
      <span className="sr-only" role="status">
        Carregando local…
      </span>
      <div className="page-x py-3 md:py-6">
        <Skel className="h-4 w-[220px]" />
      </div>
      <div className="md:page-x">
        <div className="relative mx-auto h-[430px] max-w-content animate-pulse overflow-hidden bg-body-3 md:h-[480px] md:rounded-3xl">
          <div className="absolute bottom-6 left-4 flex flex-col gap-4 md:bottom-12 md:left-12">
            <div className="flex gap-2">
              <span className="h-6 w-20 rounded-lg bg-line" />
              <span className="h-6 w-[120px] rounded-lg bg-line" />
            </div>
            <span className="h-12 w-[280px] rounded-lg bg-line md:w-[460px]" />
          </div>
          <span className="absolute right-6 top-6 size-12 rounded-full bg-line" />
          <span className="absolute bottom-12 right-12 hidden h-12 w-[220px] rounded-lg bg-line md:block" />
        </div>
      </div>
      <div className="page-x py-8 md:py-12">
        <div className="mx-auto flex max-w-content flex-col gap-4 rounded-3xl border border-line p-6 md:flex-row md:gap-6">
          {[0, 1].map(item)}
        </div>
      </div>
      <div className="page-x flex flex-col gap-8 pb-16 pt-8">
        <div className="mx-auto w-full max-w-content">
          <Skel className="h-8 w-[260px]" />
        </div>
        <div className={`mx-auto w-full max-w-content ${EVENT_GRID}`}>
          {Array.from({ length: 3 }, (_, i) => (
            <EventCardSkeleton key={i} grid className="lg:h-[334px]" />
          ))}
        </div>
      </div>
      <div className="page-x flex flex-col gap-5 pb-12">
        <div className="mx-auto flex w-full max-w-content flex-col gap-2">
          <Skel className="mb-3 h-[30px] w-[180px]" />
          <Skel className="h-4 w-full" />
          <Skel className="h-4 w-full" />
          <Skel className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  )
}
