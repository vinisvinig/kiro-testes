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

/* ---------------- Busca por termo parecido ---------------- */
// Pessoa digitou errado ("guns n roses", "gans en rozes", "estanho mundo"): compara sem espaços e pontuação
// e aceita até 40% de diferença (letras trocadas, faltando ou sobrando) em algum trecho do texto.
export const FUZZY_MIN = 0.4 // semelhança mínima (1 = igual): a partir de ~40% parecido já aparece
const FUZZY_BAND = 0.15 // entre os parecidos, só os próximos do mais parecido (evita lista cheia de resultados fracos)
/** Mantém todos os exatos (score >= 1) e, dos parecidos, só os perto do melhor. */
const FUZZY_WITH_EXACT = 0.75 // com resultado exato, o parecido só entra se for bem parecido
const keepClosest = (rows) => {
  const hasExact = rows.some((r) => r.s >= 1)
  const best = Math.max(0, ...rows.filter((r) => r.s > 0 && r.s < 1).map((r) => r.s))
  const min = hasExact ? FUZZY_WITH_EXACT * 0.9 : best - FUZZY_BAND * 0.9
  return rows.filter((r) => r.s >= 1 || (r.s > 0 && r.s >= min))
}
const compact = (s) => normalize(s).replace(/[^a-z0-9]/g, '')

function levenshtein(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    prev = cur
  }
  return prev[b.length]
}

/** Semelhança (0 a 1) entre a busca e o trecho mais parecido do texto, com tamanho próximo ao da busca. */
export function similarity(text, query) {
  const t = compact(text)
  const q = compact(query)
  if (q.length < 3 || !t) return 0
  if (t.includes(q)) return 1
  let best = 0
  for (const len of [q.length - 2, q.length - 1, q.length, q.length + 1, q.length + 2]) {
    if (len < 2) continue
    if (len >= t.length) {
      best = Math.max(best, 1 - levenshtein(q, t) / Math.max(q.length, t.length))
      continue
    }
    for (let i = 0; i + len <= t.length; i++) best = Math.max(best, 1 - levenshtein(q, t.slice(i, i + len)) / Math.max(q.length, len))
  }
  return best
}

/**
 * 0 = sem match; maior = mais relevante. Termo exato: começo do texto 3 > começo de palavra 2 > meio 1.
 * Termo parecido (>= 60%): entre 0 e 1, proporcional à semelhança, então sempre fica abaixo do exato.
 */
function score(text, q) {
  const t = normalize(text)
  const i = t.indexOf(q)
  if (i < 0) {
    const sim = similarity(text, q)
    return sim >= FUZZY_MIN ? sim * 0.9 : 0
  }
  if (i === 0) return 3
  return /\s|-|\(/.test(t[i - 1]) ? 2 : 1
}

const rank = (items, field, q, limit) =>
  keepClosest(items.map((item) => ({ item, s: score(field(item), q) })))
    .sort((a, b) => b.s - a.s || field(a.item).localeCompare(field(b.item), 'pt-BR'))
    .slice(0, limit)
    .map((r) => r.item)

/** Sugestões agrupadas do dropdown (Figma 6393:37046). */
export function getSuggestions(query, limit = 3) {
  const q = normalize(query)
  if (q.length < MIN_CHARS) return { events: [], cities: [], venues: [], total: 0 }
  // O corte dos parecidos vale para os três grupos juntos: "gans n rozes" traz o Guns e não cidades ou locais pouco parecidos
  const rows = [
    ...EVENTS.map((item) => ({ g: 'events', item, f: item.title })),
    ...CITIES.map((item) => ({ g: 'cities', item, f: item.name })),
    ...VENUES.map((item) => ({ g: 'venues', item, f: item.name })),
  ].map((r) => ({ ...r, s: score(r.f, q) }))
  const kept = keepClosest(rows)
  const group = (g) =>
    kept
      .filter((r) => r.g === g)
      .sort((a, b) => b.s - a.s || a.f.localeCompare(b.f, 'pt-BR'))
      .slice(0, limit)
      .map((r) => r.item)
  const events = group('events')
  const cities = group('cities')
  const venues = group('venues')
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
  // Exato no título vale mais que no local, na cidade e na categoria; o parecido fica sempre abaixo de qualquer exato
  const fieldScore = (text, w) => {
    const v = score(text, nq)
    return v >= 1 ? v * w : v
  }
  const scored = EVENTS.map((e) => ({
    e,
    s: nq ? Math.max(fieldScore(e.title, 3), fieldScore(e.venue, 2), fieldScore(e.cityName, 1), fieldScore(e.category, 1)) : 1,
  }))
  const list = (nq ? keepClosest(scored) : scored).filter(
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
