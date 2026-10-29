import { useState } from 'react'
import { asset, useScroller, CarouselNav, SectionHeader, SeeAll, Pill, Carousel, ScrollProgress } from './ui.jsx'
import EventCard from './EventCard.jsx'
import { categories, collections as collectionsBase, posts } from './data.js'
import { Link } from '../../router.jsx'
import { searchUrl, venueUrl } from '../../search/search.js'
import { EVENTS, VENUES, eventsByTitle } from '../../search/catalog.js'

/** Protótipo: +3 cards repetidos em cada carrossel para ter mais conteúdo para rolar. */
const plus3 = (list) => [...list, ...list.slice(0, 3)]
// Eventos de cada seção, pelo título no catálogo. Sem repetição, para cada card ser um evento diferente.
const trending = eventsByTitle([
  'Guns N’Roses',
  'Curitiba Country Festival',
  'O estranho mundo de Jack de Tim Burton',
  'Kim Walker-Smith — Worship Nights',
  'Rock in Rio Experience',
  'Human Bodies — Exposição Internacional',
  'Calado — Turnê',
])
// "Agenda Rio Grande do Sul": eventos de Porto Alegre
const agenda = eventsByTitle([
  'Lado B — Rap ao Vivo',
  'Human Bodies — Exposição Internacional',
  'Kim Walker-Smith — Worship Nights',
  'Quarteto de Cordas POA',
  'Noite do Choro',
  'Riograndense Fest',
  'Cirque Lumière',
])
const explore = eventsByTitle([
  'Trio Aurora — Acústico',
  'Calado — Turnê',
  'Stand-up Sem Filtro',
  'Pequeno Príncipe',
  'Bossa Nova no Rio',
  'Michel Alcoforado',
  'Jazz na Cidade Baixa',
])
const collections = plus3(collectionsBase)

const PRODUCER_URL = 'https://sobre.uhuu.com/Venda-Na-Uhuu'

/* ---------- Categorias (desktop 6384:38280, mobile 5531:19967) ---------- */
export function Categories() {
  const [ref, scroll] = useScroller()
  return (
    <section className="bg-body py-6 md:px-caixa md:py-8">
      <div className="mx-auto flex flex-col gap-4 overflow-hidden border border-line bg-black/[.03] py-6 md:gap-6 md:rounded-2xl md:px-caixa-in md:py-8">
        <div className="px-5 md:px-0">
          <SectionHeader title="Categorias" mobileActions>
            <CarouselNav onScroll={scroll} />
          </SectionHeader>
        </div>
        {/* Desktop: os itens vão até a borda da caixa (Figma 6384:38280); o 1º fica alinhado ao título */}
        <div ref={ref} className="no-scrollbar flex gap-3 overflow-x-auto pl-5 pr-3 md:-mx-caixa-in md:gap-4 md:pl-caixa-in md:pr-4">
          {categories.map((c) => (
            <Link
              key={c.label}
              to={searchUrl({ categoria: c.label })}
              className="flex shrink-0 snap-start items-center gap-2 rounded-full bg-brand px-4 py-2 transition hover:brightness-110 md:min-w-16 md:px-6 md:py-3"
            >
              <img src={c.icon} alt="" className="size-5 md:size-6" />
              <span className="whitespace-nowrap text-lg font-semibold leading-6 text-white md:text-2xl md:leading-none">{c.label}</span>
            </Link>
          ))}
        </div>
        <ScrollProgress railRef={ref} interactive className="hidden w-full md:block" />
      </div>
    </section>
  )
}

/* ---------- Seções de eventos (Em alta, Agenda, Explore) ---------- */
function EventSection({ bg, padding, header, top, events, seeAll }) {
  const [ref, scroll] = useScroller()
  return (
    <section className={`${bg} ${padding}`}>
      <div className="page-x">
        <div className="mx-auto flex max-w-content flex-col gap-5 md:gap-6">
          {top}
          {header(scroll)}
          <Carousel railRef={ref} onScroll={scroll} seeAllHref={seeAll}>
            {events.map((e, i) => (
              <EventCard key={i} {...e} />
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  )
}

export function Trending() {
  return (
    <EventSection
      bg="bg-body-2"
      padding="py-22 md:pb-28"
      events={trending}
      seeAll={searchUrl({})}
      top={
        <Pill variant="soft" icon={asset('ic-gps.svg')} className="w-full md:hidden">
          Encontre eventos perto de você
        </Pill>
      }
      header={(scroll) => (
        <SectionHeader icon={asset('ic-fire.svg')} title="Em alta agora">
          <Pill variant="soft" icon={asset('ic-gps.svg')}>
            Encontre eventos perto de você
          </Pill>
          <SeeAll href={searchUrl({})} />
          <CarouselNav onScroll={scroll} />
        </SectionHeader>
      )}
    />
  )
}

export function Agenda() {
  return (
    <EventSection
      bg="bg-body"
      padding="py-16 md:py-22"
      events={agenda}
      header={(scroll) => (
        <div className="flex flex-col gap-8 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center">
            <h2 className="text-2xl font-bold leading-none text-ink md:text-[30px]">
              Agenda<span className="md:hidden"> Rio Grande do Sul</span>
            </h2>
            <Pill as={Link} to={searchUrl({ cidade: 'Porto Alegre' })} variant="outline" iconRight={asset('ic-chevron-down.svg')} className="max-md:w-full">
              Porto Alegre
            </Pill>
            <Pill variant="outline" iconRight={asset('ic-chevron-down.svg')} className="max-md:w-full">
              Hoje
            </Pill>
          </div>
          <div className="hidden md:block">
            <CarouselNav onScroll={scroll} />
          </div>
        </div>
      )}
    />
  )
}

export function Explore() {
  return (
    <EventSection
      bg="bg-body"
      padding="py-22 md:py-28"
      events={explore}
      seeAll={searchUrl({})}
      header={(scroll) => (
        <SectionHeader icon={asset('ic-feed.svg')} title="Explore nossos eventos">
          <SeeAll href={searchUrl({})} />
          <CarouselNav onScroll={scroll} />
        </SectionHeader>
      )}
    />
  )
}

/* ---------- Área de anúncio (6384:38334) ---------- */
export function AdArea() {
  return (
    <section className="flex flex-col items-center gap-6 bg-body-3 px-4 py-12 md:py-22">
      <p className="text-center text-xl font-light leading-none text-ink">Área de anúncio</p>
      <div className="flex w-full max-w-[1200px] flex-col gap-2">
        <a href="#" className="relative flex h-[260px] items-start overflow-hidden rounded-xl bg-white p-2">
          <img src={asset('ad.png')} alt="Anúncio" className="absolute inset-0 size-full object-cover" />
          <span className="relative flex h-5 w-[26px] items-center justify-center rounded bg-[#3c3c3c] pb-px font-ui text-[11px] font-bold text-white">
            Ad
          </span>
        </a>
        <div className="flex items-center gap-2 pl-0.5">
          <img src={asset('ad-tool.svg')} alt="" className="h-[15px] w-4 rotate-90" />
          <span className="relative flex size-4 items-center justify-center">
            <img src={asset('ad-info.svg')} alt="" className="size-[15px]" />
            <span className="absolute font-ui text-[10px] font-bold leading-none text-info">i</span>
          </span>
        </div>
      </div>
    </section>
  )
}

/* ---------- Coleções e eventos especiais (6384:38348) ---------- */
export function Collections() {
  const [ref, scroll] = useScroller()
  return (
    <section className="bg-body py-22 md:pb-28">
      <div className="page-x">
        <div className="mx-auto flex max-w-content flex-col gap-5 md:gap-6">
          <SectionHeader icon={asset('ic-favorite.svg')} title="Coleções e eventos especiais">
            <CarouselNav onScroll={scroll} />
          </SectionHeader>
          <Carousel railRef={ref} onScroll={scroll}>
            {collections.map((c, i) => (
              <a
                key={`${c.label}-${i}`}
                href="#"
                aria-label={c.label}
                className="block h-[300px] w-[172px] shrink-0 snap-start overflow-hidden rounded-[20px] md:h-[700px] md:w-[402px] md:rounded-[40px]"
              >
                <img src={c.image} alt={c.label} loading="lazy" className="size-full object-cover transition duration-500 hover:scale-[1.03]" />
              </a>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  )
}

/* ---------- Newsletter (desktop 6384:38367, mobile 5911:47798) — só UI ---------- */
function Field({ id, label, extra, required, ...input }) {
  return (
    <div className="flex w-full flex-col gap-2 md:min-w-[200px] md:flex-1">
      <label htmlFor={id} className="flex gap-2 text-sm leading-5 md:text-base md:leading-6">
        <span className="font-bold text-ink">
          {label}
          {required && <span className="text-danger"> *</span>}
        </span>
        {extra && <span className="text-ink-2">{extra}</span>}
      </label>
      <input
        id={id}
        required={required}
        className="h-[46px] rounded-full border border-line bg-white px-4 font-ui text-[15px] text-ink outline-none placeholder:text-[#8e8e93] focus:border-brand md:h-12"
        {...input}
      />
    </div>
  )
}

export function Newsletter() {
  const [sent, setSent] = useState(false)
  return (
    <section className="bg-body-2 px-4 py-12 md:px-0 md:py-28">
      <div className="md:page-x">
        <div className="mx-auto flex max-w-content flex-col gap-8 rounded-2xl border border-line bg-white p-4 py-6 md:rounded-lg md:border-0 md:bg-transparent md:p-0">
          <div className="flex flex-col gap-3 md:gap-6">
            <h2 className="text-2xl font-normal leading-tight text-brand md:text-4xl md:leading-none">
              Cadastre-se para receber atualizações por email
            </h2>
            <p className="text-sm font-medium leading-5 text-ink-2">Adicione uma mensagem descritiva dizendo o que seu visitante pode esperar aqui.</p>
          </div>
          {sent ? (
            <p role="status" className="rounded-lg bg-brand-0 px-4 py-4 text-base font-semibold text-brand">
              Cadastro recebido! Em breve você recebe as novidades no seu e-mail.
            </p>
          ) : (
            // Integração com o ActiveCampaign entra aqui; por enquanto é só interface.
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setSent(true)
              }}
              className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end"
            >
              <Field id="nl-nome" label="Nome" placeholder="Digite seu nome" autoComplete="name" />
              <Field id="nl-email" label="Email" type="email" placeholder="Digite seu e-mail" autoComplete="email" required />
              <Field id="nl-whats" label="WhatsApp" extra="(opcional)" type="tel" placeholder="Digite seu WhatsApp" autoComplete="tel" />
              <Pill type="submit" className="max-md:mt-4 max-md:w-full max-md:py-[10px]">
                Enviar
              </Pill>
            </form>
          )}
          <div className="flex flex-col gap-1 font-ui leading-none text-ink-4">
            <span className="text-xs font-medium">Marketing por</span>
            <span className="text-base">ActiveCampaign &gt;</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Conheça as casas (desktop 7915:105354, mobile 8260:110555) ---------- */
const HOME_VENUES_BASE = [
  'teatro-de-camara-tulio-piva',
  'teatro-bradesco',
  'auditorio-araujo-vianna',
  'vivo-rio',
  'teatro-guaira',
].map((slug) => {
  const v = VENUES.find((x) => x.slug === slug)
  const n = EVENTS.filter((e) => e.venueSlug === slug).length
  return { ...v, count: `${n} ${n === 1 ? 'evento' : 'eventos'}` }
})
const HOME_VENUES = plus3(HOME_VENUES_BASE)

export function Venues() {
  const [ref, scroll] = useScroller()
  return (
    <section className="bg-body-2 py-16 md:py-28">
      <div className="page-x">
        <div className="mx-auto flex max-w-content flex-col gap-5 md:gap-6">
          <SectionHeader icon={asset('ic-stadium.svg')} title="Conheça as casas">
            <CarouselNav onScroll={scroll} />
          </SectionHeader>
          <Carousel railRef={ref} onScroll={scroll} gap="gap-2 md:gap-6">
            {HOME_VENUES.map((v, i) => (
              <Link
                key={`${v.slug}-${i}`}
                to={venueUrl(v.slug)}
                className="relative flex h-[114px] w-[172px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-line md:h-[267px] md:w-[402px]"
              >
                <img src={v.images[0]} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-[rgba(22,18,31,0)] via-[rgba(22,18,31,0.4)] to-[rgba(22,18,31,0.85)]" />
                <div className="relative flex flex-1 flex-col items-end justify-between p-2 md:p-4">
                  <span className="rounded-full bg-black/40 px-2 py-0.5 font-ui text-[10px] font-medium leading-4 text-white md:px-[10px] md:py-1 md:text-xs">
                    {v.count}
                  </span>
                  <div className="flex w-full flex-col gap-0.5">
                    <p className="truncate text-sm font-bold leading-5 text-white md:text-base md:leading-6">{v.name}</p>
                    <p className="text-xs leading-4 text-white/85 md:text-sm md:leading-5">
                      {v.city} · {v.uf}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  )
}

/* ---------- Blog (desktop 9083:88321, mobile 9115:170670) ---------- */
const BLOG_URL = 'https://sobre.uhuu.com/blog'

export function Blog() {
  return (
    // Desktop: transparente e acima do Produtor, para o roxo dele aparecer atrás da curva (Figma 9185:172171)
    <section className="relative z-10 bg-body-2 md:bg-transparent">
      <div className="bg-night py-12 md:rounded-bl-[112px] md:pb-28 md:pt-22">
        <div className="page-x">
          <div className="mx-auto flex max-w-content flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <img src={asset('ic-article.svg')} alt="" className="size-6" />
                  <h2 className="text-2xl font-bold leading-none text-white md:text-[30px]">Blog Uhuu</h2>
                </div>
                <p className="text-base leading-6 text-white/80 md:text-white">Conteúdo para quem vive, produz e acompanha grandes eventos, shows e bastidores</p>
              </div>
              <Pill as="a" href={BLOG_URL} target="_blank" rel="noopener noreferrer" variant="ghostLight" className="hidden md:inline-flex">
                Ver tudo
              </Pill>
            </div>

            <div className="grid grid-cols-2 gap-2 md:gap-8">
              {posts.map((p) => (
                <article key={p.title} className="flex min-w-0 flex-col overflow-hidden rounded-[20px] border border-night bg-night-card md:gap-6 md:rounded-[40px]">
                  <img src={p.image} alt="" loading="lazy" className="h-[62px] w-full object-cover md:h-[220px] md:rounded-t-[40px]" />
                  <div className="flex flex-1 flex-col gap-2 p-5 md:gap-3 md:p-6 md:pt-0">
                    <h3 className="line-clamp-3 text-base font-semibold leading-tight text-brand md:line-clamp-none md:truncate md:text-lg md:leading-none">{p.title}</h3>
                    <p className="flex items-center gap-2 text-xs font-medium leading-5 text-white md:text-base md:leading-6">
                      <img src={asset('ic-today.svg')} alt="" className="size-2.5 md:size-4" />
                      {p.date}
                    </p>
                    <p className="line-clamp-4 text-xs leading-[13px] text-white md:line-clamp-3 md:text-base md:leading-6">{p.excerpt}</p>
                    <Pill
                      as="a"
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="ghost"
                      font="font-sans"
                      iconRight={asset('ic-chevron-pink.svg')}
                      className="mt-auto self-start !px-0 text-xs hover:bg-transparent hover:underline md:!px-6 md:text-[15px] md:hover:bg-white/5 md:hover:no-underline"
                    >
                      Ler artigo
                    </Pill>
                  </div>
                </article>
              ))}
            </div>
            <Pill as="a" href={BLOG_URL} target="_blank" rel="noopener noreferrer" variant="outlineLight" size="sm" className="w-full md:hidden">
              Ver tudo
            </Pill>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Produtor (desktop 7874:72000, mobile 9115:170696) ---------- */
const BENEFITS = [
  'Marketing e CRM otimizados para o seu evento',
  'Dashboards em tempo real',
  'Inteligência de mercado personalizado',
  'Gestão de acessos no dia do evento',
  'Suporte humanizado 7 dias por semana',
  '… e muito mais!',
]

export function Producer() {
  return (
    <>
      {/* Mobile: seção escura com lista de benefícios */}
      <section className="bg-night px-4 py-12 md:hidden">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="flex items-center gap-2 text-2xl font-bold leading-none text-white">
              <img src={asset('ic-campaign.svg')} alt="" className="size-6" />
              Produtor
            </p>
            <h2 className="text-2xl font-semibold leading-tight text-brand">Plataforma completa de gestão de eventos</h2>
            <p className="text-base leading-6 text-white">Uma plataforma completa para venda, gestão e operação do seu evento</p>
          </div>
          <ul className="flex flex-col gap-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm font-semibold leading-5 text-white">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand">
                  <img src={asset('ic-check.svg')} alt="" className="size-[18px]" />
                </span>
                {b}
              </li>
            ))}
          </ul>
          <Pill as="a" href={PRODUCER_URL} size="sm" font="font-sans" className="w-full">
            Traga seu evento para Uhuu
          </Pill>
        </div>
      </section>

      {/* Desktop (Figma 9093:102618): foto com gradiente roxo; sobe 105px para ficar atrás da curva do Blog */}
      <section className="relative hidden overflow-hidden bg-[#661a68] md:-mt-[105px] md:block">
        <img src={asset('produtor-gradiente.png')} alt="" aria-hidden className="pointer-events-none absolute left-0 top-[-16%] h-[116%] w-full object-cover" />
        <div className="relative pb-22 pt-[185px]">
          <div className="page-x">
            <div className="mx-auto flex max-w-content flex-col gap-8 lg:pl-[108px]">
              <div className="flex flex-col gap-2">
                <p className="flex items-center gap-2 text-[30px] font-bold leading-none text-white">
                  <img src={asset('ic-campaign.svg')} alt="" className="size-6" />
                  Produtor
                </p>
                <h2 className="text-2xl font-semibold leading-tight text-brand">Plataforma completa de gestão de eventos</h2>
                <p className="text-base leading-6 text-white">Uma plataforma completa para venda, gestão e operação do seu evento</p>
              </div>
              <ul className="flex flex-col gap-3">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-base font-semibold leading-6 text-white">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand">
                      <img src={asset('ic-check.svg')} alt="" className="size-[18px]" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
              <Pill as="a" href={PRODUCER_URL} size="sm" className="self-start">
                Traga seu evento para Uhuu
              </Pill>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
