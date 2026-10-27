// Estado do pedido (seleção de ingressos) e cálculos do resumo.
// Mantido puro (reducer + derive) para facilitar trocar pela API real depois.
//
// O pedido pode ter ingressos de várias datas: a seleção é guardada por "sessão|setor"
// (ou "sessão|combo"), e trocar de data só muda o que está sendo exibido.
import { COMBOS, COMBO_LIMIT, INSTALLMENT_FEE, SECTOR_LIMIT, SECTORS, SERVICE_FEE, SESSIONS, VALIDATORS, comboPrice, faresFor } from './eventData.js'

export const initialOrder = {
  sessionId: null, // data exibida agora
  modality: null, // 'individual' | 'combo' (exibição; o pedido pode misturar os dois)
  open: null, // setor ou combo expandido
  qty: {}, // setores livres: { 'sessão|setor': { inteira: 2, meia: 1 } }
  seats: {}, // lugar marcado: { 'sessão|setor': [{ id: 'A1', fare: null | 'inteira' | ... }] }
  openSeat: null, // assento com o seletor de tarifa aberto
  combos: {}, // { 'sessão|combo': { n: 1, seats: ['A1', ...] } }
  codes: {}, // códigos validadores: { banrisul: { value, status: idle | applied | error } }
}

export const keyOf = (sessionId, id) => `${sessionId}|${id}`
const split = (k) => k.split('|')
const sectorById = (id) => SECTORS.find((s) => s.id === id)
const sessionById = (id) => SESSIONS.find((s) => s.id === id)
export const comboById = (id) => COMBOS.find((c) => c.id === id)
const sumQty = (q = {}) => Object.values(q).reduce((a, n) => a + n, 0)

/** Ingressos individuais já escolhidos no setor, na data exibida. */
export function usedIn(o, sectorId) {
  const k = keyOf(o.sessionId, sectorId)
  return sectorById(sectorId).kind === 'assento' ? (o.seats[k] || []).length : sumQty(o.qty[k])
}
export const roomIn = (o, sectorId) => SECTOR_LIMIT - usedIn(o, sectorId)

/** Assentos do setor (na data exibida) já usados por outra seleção do pedido. */
export function takenElsewhere(o, sectorId, exceptKey) {
  const taken = new Set()
  const sk = keyOf(o.sessionId, sectorId)
  if (sk !== exceptKey) for (const s of o.seats[sk] || []) taken.add(s.id)
  for (const [k, c] of Object.entries(o.combos)) {
    const [sid, cid] = split(k)
    if (k !== exceptKey && sid === o.sessionId && comboById(cid).sector === sectorId) c.seats.forEach((id) => taken.add(id))
  }
  return taken
}

export function orderReducer(o, a) {
  switch (a.type) {
    case 'session':
      return { ...o, sessionId: a.id, open: null, openSeat: null }
    case 'modality':
      return { ...o, modality: a.modality, open: null, openSeat: null }
    case 'open':
      return { ...o, open: o.open === a.id ? null : a.id, openSeat: null }
    case 'qty': {
      const k = keyOf(o.sessionId, a.sector)
      const cur = o.qty[k] || {}
      const n = Math.max(0, Math.min(a.n, roomIn(o, a.sector) + (cur[a.fare] || 0)))
      return { ...o, qty: { ...o.qty, [k]: { ...cur, [a.fare]: n } } }
    }
    case 'seat': {
      const k = keyOf(o.sessionId, a.sector)
      const list = o.seats[k] || []
      const has = list.some((s) => s.id === a.seat)
      if (!has && (roomIn(o, a.sector) <= 0 || takenElsewhere(o, a.sector, k).has(a.seat))) return o
      const next = has ? list.filter((s) => s.id !== a.seat) : [...list, { id: a.seat, fare: null }]
      // Abre o seletor de tarifa do primeiro assento ainda sem tarifa.
      const pending = next.find((s) => !s.fare)
      return { ...o, seats: { ...o.seats, [k]: next }, openSeat: pending ? pending.id : null }
    }
    case 'seatPick': {
      // Assento + tarifa escolhidos juntos no mapa; se o assento já é do usuário, só troca a tarifa.
      const k = keyOf(o.sessionId, a.sector)
      const list = o.seats[k] || []
      if (list.some((s) => s.id === a.seat)) {
        return { ...o, seats: { ...o.seats, [k]: list.map((s) => (s.id === a.seat ? { ...s, fare: a.fare } : s)) } }
      }
      if (roomIn(o, a.sector) <= 0 || takenElsewhere(o, a.sector, k).has(a.seat)) return o
      return { ...o, seats: { ...o.seats, [k]: [...list, { id: a.seat, fare: a.fare }] } }
    }
    case 'seatFare': {
      const k = keyOf(o.sessionId, a.sector)
      const list = (o.seats[k] || []).map((s) => (s.id === a.seat ? { ...s, fare: a.fare } : s))
      const pending = list.find((s) => !s.fare)
      return { ...o, seats: { ...o.seats, [k]: list }, openSeat: pending ? pending.id : null }
    }
    case 'openSeat':
      return { ...o, openSeat: o.openSeat === a.seat ? null : a.seat }
    case 'comboQty': {
      const c = comboById(a.combo)
      const k = keyOf(o.sessionId, c.id)
      const n = Math.max(0, Math.min(a.n, COMBO_LIMIT))
      const seats = (o.combos[k]?.seats || []).slice(0, n * c.size)
      return { ...o, combos: { ...o.combos, [k]: { n, seats } } }
    }
    case 'comboSeat': {
      // Combo com assento marcado é sempre 1 unidade: entra no pedido no 1º lugar escolhido
      // e sai quando todos os lugares são removidos.
      const c = comboById(a.combo)
      const k = keyOf(o.sessionId, c.id)
      const cur = o.combos[k] || { n: 0, seats: [] }
      const has = cur.seats.includes(a.seat)
      if (!has && (cur.seats.length >= c.size || takenElsewhere(o, c.sector, k).has(a.seat))) return o
      const seats = has ? cur.seats.filter((s) => s !== a.seat) : [...cur.seats, a.seat]
      return { ...o, combos: { ...o.combos, [k]: { n: seats.length ? 1 : 0, seats } } }
    }
    case 'removeLine': {
      if (a.combo) return { ...o, combos: { ...o.combos, [a.key]: { n: 0, seats: [] } } }
      const [, sector] = split(a.key)
      if (sectorById(sector).kind === 'assento') {
        const list = (o.seats[a.key] || []).filter((s) => (s.fare || null) !== a.fare)
        return { ...o, seats: { ...o.seats, [a.key]: list } }
      }
      return { ...o, qty: { ...o.qty, [a.key]: { ...o.qty[a.key], [a.fare]: 0 } } }
    }
    case 'codeInput':
      // Aceita letras e números: pode ser BIN de cartão ou código de uma empresa parceira.
      return { ...o, codes: { ...o.codes, [a.validator]: { value: a.value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 20), status: 'idle' } } }
    case 'codeApply': {
      const cur = o.codes[a.validator] || { value: '' }
      const ok = VALIDATORS[a.validator].codes.includes(cur.value)
      return { ...o, codes: { ...o.codes, [a.validator]: { ...cur, status: ok ? 'applied' : 'error' } } }
    }
    case 'reset':
      return { ...initialOrder, sessionId: o.sessionId, modality: o.modality }
    default:
      return o
  }
}

const sessionOrder = (id) => SESSIONS.findIndex((s) => s.id === id)

/** Resumo do pedido: linhas agrupadas, totais e o que falta para comprar. */
export function deriveOrder(o) {
  const lines = []

  // Ingressos individuais, agrupados por data + setor + tarifa
  const fareLine = (k, sector, session, fare) => {
    const key = `${k}:${fare?.id ?? 'pendente'}`
    let line = lines.find((l) => l.key === key)
    if (!line) {
      line = { key, groupKey: k, kind: 'fare', session, sector, fare, qty: 0, tickets: 0, seats: [], amount: 0 }
      lines.push(line)
    }
    return line
  }
  for (const [k, q] of Object.entries(o.qty)) {
    const [sid, secId] = split(k)
    const session = sessionById(sid)
    const sector = sectorById(secId)
    for (const f of faresFor(sector, session)) {
      const n = q[f.id] || 0
      if (!n) continue
      const l = fareLine(k, sector, session, f)
      l.qty += n
      l.tickets += n
      l.amount += n * f.price
    }
  }
  for (const [k, list] of Object.entries(o.seats)) {
    const [sid, secId] = split(k)
    const session = sessionById(sid)
    const sector = sectorById(secId)
    const fares = faresFor(sector, session)
    for (const s of list) {
      const f = fares.find((x) => x.id === s.fare) || null
      const l = fareLine(k, sector, session, f)
      l.qty += 1
      l.tickets += 1
      l.seats.push(s.id)
      l.amount += f?.price ?? 0
    }
  }

  // Combos
  for (const [k, c] of Object.entries(o.combos)) {
    if (!c.n) continue
    const [sid, cid] = split(k)
    const session = sessionById(sid)
    const combo = comboById(cid)
    const sector = sectorById(combo.sector)
    const needed = sector.kind === 'assento' ? c.n * combo.size : 0
    lines.push({
      key: k,
      groupKey: k,
      kind: 'combo',
      session,
      sector,
      combo,
      qty: c.n,
      tickets: c.n * combo.size,
      seats: c.seats,
      missing: Math.max(0, needed - c.seats.length),
      amount: c.n * comboPrice(combo, session),
    })
  }

  lines.sort((a, b) => sessionOrder(a.session.id) - sessionOrder(b.session.id) || SECTORS.indexOf(a.sector) - SECTORS.indexOf(b.sector))

  const count = lines.reduce((a, l) => a + l.tickets, 0)
  const bySession = {}
  for (const l of lines) bySession[l.session.id] = (bySession[l.session.id] || 0) + l.tickets

  const subtotal = lines.reduce((a, l) => a + l.amount, 0)
  const fee = subtotal * SERVICE_FEE
  const total = subtotal + fee
  const installmentFee = total * INSTALLMENT_FEE

  const pendingFares = lines.filter((l) => l.kind === 'fare' && !l.fare).reduce((a, l) => a + l.qty, 0)
  const incomplete = lines.filter((l) => l.kind === 'combo' && l.missing > 0)

  // Códigos validadores exigidos pelas tarifas escolhidas
  const validators = []
  for (const l of lines) {
    const v = l.kind === 'fare' && l.fare?.validator
    if (!v) continue
    let entry = validators.find((x) => x.id === v)
    if (!entry) validators.push((entry = { ...VALIDATORS[v], tickets: 0, fares: new Set() }))
    entry.tickets += l.qty
    entry.fares.add(l.fare.name)
  }
  const codeOk = (id) => o.codes[id]?.status === 'applied'
  const pendingCodes = validators.filter((v) => !codeOk(v.id))

  let blocker = null
  if (!count) blocker = 'Selecione ao menos um ingresso.'
  else if (incomplete.length) {
    const l = incomplete[0]
    blocker = `Escolha mais ${l.missing} ${l.missing === 1 ? 'lugar' : 'lugares'} no mapa do ${l.combo.name} (${l.sector.name}).`
  } else if (pendingFares) blocker = `Defina a tarifa de ${pendingFares} ${pendingFares === 1 ? 'assento' : 'assentos'}.`
  else if (pendingCodes.length) blocker = 'Informe e valide o código validador no resumo do pedido.'

  return {
    lines,
    count,
    bySession,
    sessions: Object.keys(bySession).length,
    subtotal,
    fee,
    total,
    installmentFee,
    installment: (total + installmentFee) / 3,
    validators,
    codeOk,
    pendingFares,
    blocker,
    canBuy: !blocker,
  }
}
