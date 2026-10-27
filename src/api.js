// Camada de dados. Hoje responde com o catálogo local depois de uma espera
// artificial, para que os skeletons de carregamento apareçam como na produção.
// Para ligar na API real, troque o corpo de cada função por um fetch() que
// devolva o mesmo formato — os componentes não precisam mudar.
import { useEffect, useState } from 'react'
import { searchEvents, paginate } from './search/search.js'
import { EVENTS, VENUES, venueFaq } from './search/catalog.js'

const LATENCY_MS = 650
const wait = (ms = LATENCY_MS) => new Promise((r) => setTimeout(r, ms))

export async function fetchSearch(params) {
  await wait()
  return searchEvents(params)
}

export const VENUE_PAGE_SIZE = 6

export async function fetchVenue(slug) {
  await wait()
  const venue = VENUES.find((v) => v.slug === slug)
  if (!venue) return null
  const events = EVENTS.filter((e) => e.venueSlug === slug).sort((a, b) => a.date.localeCompare(b.date))
  // Destaques: primeiro os que têm selo, depois os mais próximos
  const highlights = [...events].sort((a, b) => b.tags.length - a.tags.length).slice(0, 3)
  return { venue, events, highlights, faq: venueFaq(venue) }
}

export const pageOf = (events, page) => paginate(events, page, VENUE_PAGE_SIZE)

/**
 * Executa `fn` sempre que `key` muda e expõe { data, loading }.
 * Respostas antigas são descartadas se o usuário navegar antes de terminarem.
 */
export function useAsync(fn, key) {
  const [state, setState] = useState({ data: null, loading: true })
  useEffect(() => {
    let alive = true
    setState((s) => ({ data: s.data, loading: true }))
    fn().then((data) => alive && setState({ data, loading: false }))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return state
}
