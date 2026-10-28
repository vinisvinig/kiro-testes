import { asset, Skel } from '../components/home/ui.jsx'
import EventCard, { EventCardSkeleton, EVENT_GRID } from '../components/home/EventCard.jsx'
import Pagination from '../components/Pagination.jsx'
import { Link } from '../router.jsx'
import { fetchSearch, useAsync } from '../api.js'
import SearchBox from './SearchBox.jsx'
import { searchUrl } from './search.js'
import { formatRange } from './DateRangePicker.jsx'

/**
 * Resultado busca (Figma 5174:49161 termo, 5510:18658 categoria, 6980:55998 um resultado).
 * Enquanto carrega mostra o skeleton (Figma 6755:28843): a página inteira na
 * primeira entrada, e só os resultados quando o usuário muda filtros/página.
 */
export default function SearchPage({ params, search }) {
  const { data, loading } = useAsync(() => fetchSearch(params), search)

  if (!data) return <SearchSkeleton />

  return (
    <>
      <section className="bg-body pt-0 md:pb-6 md:pt-10">
        <div className="md:page-x">
          <SearchBox variant="filters" initial={params} />
        </div>
      </section>

      <section className="bg-body pb-14 pt-6 md:pt-9">
        <div className="page-x">
          <div className="mx-auto flex max-w-content flex-col gap-6 md:gap-10" aria-busy={loading}>
            {loading ? <ResultsSkeleton /> : <Results data={data} params={params} />}
          </div>
        </div>
      </section>
    </>
  )
}

function Results({ data, params }) {
  const { items, total, page, pages } = data
  const context = params.q
    ? `Eventos com ‘${params.q}’`
    : params.local
      ? `Eventos em ‘${params.local}’`
      : params.cidade
        ? `Eventos em ‘${params.cidade}’`
        : ''
  const period = formatRange(params.de, params.ate)

  return (
    <>
      <header className="flex flex-col">
        {context && <p className="text-sm font-medium leading-6 text-ink-2 md:text-base">{context}</p>}
        <h1 className="flex min-h-[36px] items-center text-2xl font-bold leading-none text-ink md:min-h-[46px]">
          {params.categoria && !params.q ? params.categoria : 'Resultados da busca'}
        </h1>
        <p className="text-sm font-medium leading-6 text-ink-2 md:text-base" aria-live="polite">
          {total === 1 ? '1 evento encontrado' : `${total} eventos encontrados`}
          {period && ` · ${period}`}
        </p>
      </header>

      {items.length > 0 ? (
        <ul className={EVENT_GRID}>
          {items.map((e) => (
            <li key={e.id} className="flex">
              <EventCard {...e} grid />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState params={params} />
      )}

      <Pagination page={page} pages={pages} hrefFor={(p) => searchUrl({ ...params, pagina: p })} />
    </>
  )
}

function EmptyState({ params }) {
  const hasFilters = params.cidade || params.categoria || params.local || params.de
  return (
    <div className="flex flex-col items-center gap-4 rounded-[24px] border border-line bg-white px-6 py-16 text-center md:rounded-[40px]">
      <img src={asset('ic-search.svg')} alt="" className="size-8 opacity-60" />
      <p className="text-xl font-bold leading-none text-ink">Nenhum evento encontrado</p>
      <p className="max-w-md text-base leading-6 text-ink-2">Tente outro termo ou remova alguns filtros para ver mais resultados.</p>
      {hasFilters && (
        <Link to={searchUrl({ q: params.q })} className="font-ui text-[15px] font-semibold text-brand hover:underline">
          Limpar filtros
        </Link>
      )}
    </div>
  )
}

function ResultsSkeleton() {
  return (
    <>
      <span className="sr-only" role="status">
        Carregando resultados…
      </span>
      <div className="flex flex-col gap-2">
        <Skel className="h-9 w-[200px] md:h-[46px] md:w-[246px]" />
        <Skel className="h-9 w-[160px] md:h-[46px] md:w-[199px]" />
      </div>
      <div className={EVENT_GRID}>
        {Array.from({ length: 6 }, (_, i) => (
          <EventCardSkeleton key={i} grid />
        ))}
      </div>
      <div className="flex justify-center">
        <Skel className="h-[46px] w-[270px]" />
      </div>
    </>
  )
}

/** Loading (skeleton) - busca completa (Figma 6755:28843). */
function SearchSkeleton() {
  return (
    <>
      <section className="bg-body md:pt-10">
        <div className="mx-auto flex flex-col gap-4 p-4 md:px-margem">
          <Skel className="h-[46px] w-full" />
          <div className="grid gap-4 md:flex">
            {Array.from({ length: 4 }, (_, i) => (
              <Skel key={i} className="h-[46px] md:flex-1" />
            ))}
            <Skel className="h-[46px] md:w-[83px]" />
          </div>
        </div>
      </section>
      <section className="bg-body pb-14 pt-6 md:pt-10">
        <div className="page-x">
          <div className="mx-auto flex max-w-content flex-col gap-6 md:gap-10">
            <ResultsSkeleton />
          </div>
        </div>
      </section>
    </>
  )
}
