// Lógica de busca: normalização, sugestões do autocomplete, filtros, ordenação e URL.
// É síncrona sobre o catálogo local; src/api.js embrulha em Promises simulando a rede.
import { EVENTS, CITIES, VENUES } from './catalog.js'

export const MIN_CHARS = 2
export const PAGE_SIZE = 9

/** Minúsculas e sem acento, para comparar "sao" com "São". */
export const normalize = (s = '') =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

/**
 * Divide o texto em [antes, trecho encontrado, depois] para destacar o termo.
 * Remover acentos não altera o tamanho das letras comuns do português, então
 * os índices do texto normalizado servem no original.
 */
export function splitMatch(text, query) {
  const q = normalize(query)
  const i = q ? normalize(text).indexOf(q) : -1
  if (i < 0) return [text, '', '']
  return [text.slice(0, i), text.slice(i, i + q.length), text.slice(i + q.length)]
}

/** 0 = sem match; maior = mais relevante (começo do texto > começo de palavra > meio). */
function score(text, q) {
  const t = normalize(text)
  const i = t.indexOf(q)
  if (i < 0) return 0
  if (i === 0) return 3
  return /\s|-|\(/.test(t[i - 1]) ? 2 : 1
}

const rank = (items, field, q, limit) =>
  items
    .map((item) => ({ item, s: score(field(item), q) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || field(a.item).localeCompare(field(b.item), 'pt-BR'))
    .slice(0, limit)
    .map((r) => r.item)

/** Sugestões agrupadas do dropdown (Figma 6393:37046). */
export function getSuggestions(query, limit = 3) {
  const q = normalize(query)
  if (q.length < MIN_CHARS) return { events: [], cities: [], venues: [], total: 0 }
  const events = rank(EVENTS, (e) => e.title, q, limit)
  const cities = rank(CITIES, (c) => c.name, q, limit)
  const venues = rank(VENUES, (v) => v.name, q, limit)
  return { events, cities, venues, total: events.length + cities.length + venues.length }
}

/** Opções do select "Relevância" (Figma 5363:20803). */
export const SORTS = [
  { value: 'relevancia', label: 'Relevância' },
  { value: 'recentes', label: 'Mais recente' },
]
export const DEFAULT_SORT = 'relevancia'

/** Resultados da página de busca, já filtrados, ordenados e paginados. */
export function searchEvents({ q = '', cidade = '', categoria = '', local = '', de = '', ate = '', ordem = DEFAULT_SORT, pagina = 1 }) {
  const nq = normalize(q)
  const list = EVENTS.map((e) => ({
    e,
    s: nq ? Math.max(score(e.title, nq) * 3, score(e.venue, nq) * 2, score(e.cityName, nq), score(e.category, nq)) : 1,
  })).filter(
    ({ e, s }) =>
      s > 0 &&
      (!cidade || e.cityName === cidade) &&
      (!categoria || e.category === categoria) &&
      (!local || e.venue === local) &&
      (!de || e.date >= de) &&
      (!ate || e.date <= ate),
  )

  const byDate = (a, b) => a.e.date.localeCompare(b.e.date)
  list.sort(ordem === 'recentes' ? byDate : (a, b) => b.s - a.s || byDate(a, b))

  return paginate(
    list.map((r) => r.e),
    pagina,
    PAGE_SIZE,
  )
}

export function paginate(all, pagina, size) {
  const total = all.length
  const pages = Math.max(1, Math.ceil(total / size))
  const page = Math.min(Math.max(1, Number(pagina) || 1), pages)
  return { items: all.slice((page - 1) * size, page * size), total, page, pages }
}

/** Página 1, 2, 3 … N com reticências (Figma Pagination). */
export function pageWindow(page, pages) {
  const nums = []
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 1 || (page <= 3 && p <= 3) || (page >= pages - 2 && p >= pages - 2)) {
      nums.push(p)
    } else if (nums[nums.length - 1] !== '…') {
      nums.push('…')
    }
  }
  return nums
}

const KEYS = ['q', 'cidade', 'categoria', 'local', 'de', 'ate', 'ordem', 'pagina']

export function parseParams(search) {
  const p = new URLSearchParams(search)
  return Object.fromEntries(KEYS.map((k) => [k, p.get(k) || '']))
}

/** Monta /busca?... omitindo valores vazios e os padrões. */
export function searchUrl(params) {
  const p = new URLSearchParams()
  KEYS.forEach((k) => {
    const v = params[k]
    if (!v || (k === 'ordem' && v === DEFAULT_SORT) || (k === 'pagina' && Number(v) <= 1)) return
    p.set(k, v)
  })
  const s = p.toString()
  return `/busca${s ? `?${s}` : ''}`
}

export const venueUrl = (slug) => `/local/${slug}`
