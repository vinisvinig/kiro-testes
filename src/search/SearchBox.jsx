import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { asset, Pill } from '../components/home/ui.jsx'
import { navigate } from '../router.jsx'
import { CATEGORIES, CITIES } from './catalog.js'
import { getSuggestions, splitMatch, searchUrl, venueUrl, SORTS, DEFAULT_SORT, MIN_CHARS } from './search.js'
import Dropdown from './Dropdown.jsx'
import DateRangePicker from './DateRangePicker.jsx'

const CITY_OPTIONS = CITIES.map((c) => ({ value: c.name, label: c.name }))
const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c.name, label: c.name, icon: c.icon }))
const SORT_OPTIONS = SORTS.map((s) => ({ value: s.value, label: s.label }))

const fromInitial = (i) => ({
  cidade: i.cidade || '',
  categoria: i.categoria || '',
  local: i.local || '',
  de: i.de || '',
  ate: i.ate || '',
  ordem: i.ordem || DEFAULT_SORT,
})

/**
 * Busca (Figma 5466:25093).
 * - variant="home": Estado=Padrão/Autocomplete (busca + data + Buscar)
 * - variant="filters": Estado=Filtro (busca com limpar + cidade, categoria, data, ordem, Buscar)
 */
export default function SearchBox({ variant = 'home', initial = {} }) {
  const [q, setQ] = useState(initial.q || '')
  const [filters, setFilters] = useState(() => fromInitial(initial))

  // Mantém os campos em sincronia quando a URL muda (voltar/avançar do navegador)
  useEffect(() => {
    setQ(initial.q || '')
    setFilters(fromInitial(initial))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.q, initial.cidade, initial.categoria, initial.local, initial.de, initial.ate, initial.ordem])

  const set = (k) => (v) => setFilters((f) => ({ ...f, [k]: v }))
  const setRange = ({ de, ate }) => setFilters((f) => ({ ...f, de, ate }))
  const submit = (overrides = {}) => navigate(searchUrl({ q: q.trim(), ...filters, ...overrides, pagina: 1 }))
  const isFilters = variant === 'filters'

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className={`mx-auto flex gap-4 bg-black/5 p-4 md:rounded-2xl ${
        // Home: mesma caixa da seção Categorias (1360 de largura, 48px de recuo), com o campo alinhado ao logo
        isFilters ? 'max-w-content md:px-8' : 'max-w-[1360px] md:px-12'
      } ${
        isFilters ? 'flex-col' : 'flex-col md:flex-row md:items-center'
      }`}
    >
      <Autocomplete value={q} onChange={setQ} onSubmit={submit} clearable={isFilters} />

      {isFilters ? (
        <div className="grid gap-4 md:flex md:flex-wrap md:items-center lg:flex-nowrap">
          <Dropdown label="Cidade" value={filters.cidade} onChange={set('cidade')} options={CITY_OPTIONS} className="md:flex-1" />
          <Dropdown label="Categoria" value={filters.categoria} onChange={set('categoria')} options={CATEGORY_OPTIONS} className="md:flex-1" />
          <DateRangePicker de={filters.de} ate={filters.ate} onChange={setRange} className="md:flex-1" />
          <Dropdown
            label="Relevância"
            sheetTitle="Ordenar por"
            value={filters.ordem}
            onChange={set('ordem')}
            options={SORT_OPTIONS}
            placeholder={false}
            className="md:flex-1"
          />
          <Pill type="submit" className="max-md:w-full max-md:py-[10px]">
            Buscar
          </Pill>
        </div>
      ) : (
        <>
          <DateRangePicker de={filters.de} ate={filters.ate} onChange={setRange} className="md:w-[262px]" />
          <Pill type="submit" className="max-md:w-full max-md:py-[10px]">
            Buscar
          </Pill>
        </>
      )}
    </form>
  )
}

/* ------------------------------------------------------------------ */
/* Autocomplete                                                        */
/* ------------------------------------------------------------------ */

function Autocomplete({ value, onChange, onSubmit, clearable }) {
  const id = useId()
  const listId = `${id}-list`
  const inputRef = useRef(null)
  const wrapRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)

  const { events, cities, venues, total } = useMemo(() => getSuggestions(value), [value])
  const term = value.trim()

  // Lista plana de opções navegáveis por teclado, na ordem visual do dropdown
  const options = useMemo(() => {
    if (!total) return []
    const opts = []
    const add = (o) => opts.push({ ...o, key: `${o.group}-${opts.length}` })
    if (events.length) {
      events.forEach((e) =>
        add({ group: 'evento', title: e.title, sub: `${e.category} · ${e.venue}, ${e.cityName}`, go: () => window.open(e.href, '_blank', 'noopener') }),
      )
      add({ group: 'evento', more: `Ver todos os eventos com “${term}”`, go: () => onSubmit({ q: term }) })
    }
    if (cities.length) {
      cities.forEach((c) => add({ group: 'cidade', title: c.name, sub: c.uf, go: () => goTo({ cidade: c.name }) }))
      add({ group: 'cidade', more: 'Ver eventos por cidade', go: () => goTo({ cidade: cities[0].name }) })
    }
    if (venues.length) {
      venues.forEach((v) =>
        add({
          group: 'local',
          title: v.name,
          sub: `${v.type} · ${v.city}`,
          go: () => {
            setOpen(false)
            navigate(venueUrl(v.slug))
          },
        }),
      )
      add({ group: 'local', more: 'Ver eventos por locais', go: () => goTo({ local: venues[0].name }) })
    }
    return opts
  }, [events, cities, venues, total, term, onSubmit])

  function goTo(params) {
    setOpen(false)
    navigate(searchUrl(params))
  }

  const showList = open && term.length >= MIN_CHARS
  useEffect(() => setActive(-1), [value])

  // Fecha ao clicar fora
  useEffect(() => {
    const close = (e) => wrapRef.current && !wrapRef.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const choose = (opt) => {
    setOpen(false)
    opt.go()
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!showList) return setOpen(true)
      if (!options.length) return
      const dir = e.key === 'ArrowDown' ? 1 : -1
      setActive((i) => {
        const n = i + dir
        if (n >= options.length) return 0
        if (n < 0) return options.length - 1
        return n
      })
    } else if (e.key === 'Enter') {
      if (showList && active >= 0 && options[active]) {
        e.preventDefault()
        choose(options[active])
      } else {
        setOpen(false) // deixa o form fazer o submit
      }
    } else if (e.key === 'Escape') {
      if (showList) {
        e.preventDefault()
        setOpen(false)
      }
    }
  }

  // Mantém a opção ativa visível ao navegar pelo teclado
  useEffect(() => {
    if (active < 0) return
    document.getElementById(`${id}-opt-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, id])

  let idx = -1
  const renderOption = (opt) => {
    idx += 1
    const i = idx
    const isActive = i === active
    const common = {
      id: `${id}-opt-${i}`,
      role: 'option',
      'aria-selected': isActive,
      onMouseDown: (e) => e.preventDefault(), // não tira o foco do input
      onClick: () => choose(opt),
      onMouseEnter: () => setActive(i),
    }
    if (opt.more) {
      return (
        <li key={opt.key} {...common} className="cursor-pointer px-6 py-3">
          <span
            className={`inline-flex items-center gap-[10px] font-ui text-[15px] font-semibold leading-none text-brand ${
              isActive ? 'underline underline-offset-4' : ''
            }`}
          >
            {opt.more}
            <img src={asset('sug-arrow.svg')} alt="" className="size-[14px]" />
          </span>
        </li>
      )
    }
    const [before, match, after] = splitMatch(opt.title, term)
    return (
      <li
        key={opt.key}
        {...common}
        className={`flex cursor-pointer flex-col gap-0.5 px-6 py-2 ${isActive ? 'bg-brand-0' : ''}`}
      >
        <span className={`whitespace-pre text-sm font-bold leading-5 ${isActive ? 'text-brand' : 'text-ink'}`}>
          {before}
          {match && <mark className="rounded bg-mark px-1 py-px text-inherit">{match}</mark>}
          {after}
        </span>
        <span className="text-xs leading-4 text-ink-3">{opt.sub}</span>
      </li>
    )
  }

  const groups = [
    ['evento', 'Eventos', 'sug-event.svg'],
    ['cidade', 'Cidades', 'sug-place.svg'],
    ['local', 'Locais', 'sug-city.svg'],
  ].filter(([g]) => options.some((o) => o.group === g))

  return (
    <div ref={wrapRef} className="relative z-20 min-w-0 flex-1">
      <div
        className={`flex items-center rounded-full border bg-white transition-shadow ${
          showList ? 'border-brand shadow-[0_0_0_4px_rgba(238,54,128,0.25)]' : 'border-line focus-within:border-brand'
        }`}
      >
        <span className="flex items-center py-[14px] pl-[22px] pr-4">
          <img src={asset('ic-search.svg')} alt="" className="size-4" />
        </span>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label="Busque seu evento, local ou cidade"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={showList && active >= 0 ? `${id}-opt-${active}` : undefined}
          autoComplete="off"
          enterKeyHint="search"
          value={value}
          placeholder="Busque seu evento, local ou cidade..."
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 bg-transparent py-[14px] pr-[22px] font-ui text-[15px] font-medium leading-none text-ink outline-none placeholder:text-ink-3 [&::-webkit-search-cancel-button]:hidden"
        />
        {clearable && value && (
          <button
            type="button"
            aria-label="Limpar busca"
            onClick={() => {
              onChange('')
              inputRef.current?.focus()
            }}
            className="flex items-center px-4 py-[14px]"
          >
            <img src={asset('ic-close.svg')} alt="" className="size-4" />
          </button>
        )}
      </div>

      {showList && (
        <div className="absolute left-0 top-[calc(100%+2px)] w-full max-w-[811px] overflow-hidden rounded-xl border border-line bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
          <ul id={listId} role="listbox" aria-label="Sugestões" className="uhuu-dropdown max-h-[min(70vh,520px)] overflow-y-auto py-2">
            {groups.length === 0 && (
              <li role="presentation" className="px-6 py-4 text-sm leading-5 text-ink-3">
                Nenhuma sugestão para “{term}”. Tecle Enter para buscar mesmo assim.
              </li>
            )}
            {groups.map(([g, label, icon], gi) => (
              <li key={g} role="presentation">
                {gi > 0 && (
                  <div className="py-2" aria-hidden>
                    <div className="h-px bg-line" />
                  </div>
                )}
                <div className="flex items-center gap-2 px-6 pb-[6px] pt-[10px]" aria-hidden>
                  <span className="flex size-6 items-center justify-center rounded-xl bg-brand-0">
                    <img src={asset(icon)} alt="" className="size-[14px]" />
                  </span>
                  <span className="font-ui text-[11px] font-bold uppercase leading-none tracking-[0.05em] text-brand">{label}</span>
                </div>
                <ul role="group" aria-label={label}>
                  {options.filter((o) => o.group === g).map(renderOption)}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
      <span className="sr-only" aria-live="polite">
        {showList ? `${total} sugestões disponíveis` : ''}
      </span>
    </div>
  )
}
