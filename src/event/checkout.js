// Jornada de compra (Figma "Desktop - Pagamento", 9566:* a 9926:*), com descoberta progressiva:
// seguro → Clube Planeta → entrega → pagamento. Cada etapa só abre depois que a anterior é respondida.
// Estado puro (reducer + derive) para trocar pela API real depois.

export const STEPS = ['seguro', 'clube', 'entrega', 'pagamento']

export const INSURANCE_RATE = 0.06 // Seguro MetLife: 6% do valor dos ingressos
export const CLUB_PER_TICKET = 19.9 // Clube Planeta por ingresso
export const UHUU_COINS = 50 // Saldo de moedas Uhuu da conta (simulação)
export const PIX_SECONDS = 10 * 60

export const DELIVERY = [
  { id: 'bilheteria', name: 'Retirada na bilheteria', desc: 'Com documento oficial', price: 0, icon: 'box' },
  { id: 'expressa', name: 'Entrega expressa', desc: 'Em até 5 dias úteis', price: 31.9, icon: 'truck' },
]

export const SAVED_ADDRESSES = [
  { id: 'a1', main: true, street: 'Rua Atlântida, 211', detail: 'Ipanema · Porto Alegre/RS · CEP 91760-150' },
  { id: 'a2', street: 'Avenida Arlindo Pasqualini, 210', detail: 'Jardim Isabel · Porto Alegre/RS · CEP 91760-140 · Apto. 601' },
]

/** Parcelas do cartão: juros a partir de 2x. */
export const INSTALLMENTS = [
  { n: 1, rate: 0 },
  { n: 2, rate: 0.02 },
  { n: 3, rate: 0.03 },
]

/**
 * Cupons de desconto (simulação). Vários cupons podem ser usados; cada um tem um limite de
 * ingressos e cada ingresso recebe no máximo 1 cupom. Não confundir com o código validador.
 */
export const COUPONS = {
  DESCONTO10: { code: 'DESCONTO10', kind: 'pct', value: 0.1, max: 2 },
  UHUU20: { code: 'UHUU20', kind: 'fixed', value: 20, max: 1 },
}

export const initialCheckout = {
  step: 'seguro', // etapa aberta agora (null quando tudo foi respondido)
  insurance: null, // true | false | null (não respondido)
  insuranceDraft: false,
  club: null,
  clubDraft: false,
  delivery: null, // 'bilheteria' | 'expressa'
  address: 'a1',
  addresses: SAVED_ADDRESSES,
  deliveryDone: false,
  coupons: [], // códigos aplicados, em ordem
  coins: false,
  method: null, // 'pix' | 'cartao'
  installments: 1,
}

/** Próxima etapa ainda sem resposta (descoberta progressiva). */
function nextOpen(c) {
  if (c.insurance === null) return 'seguro'
  if (c.club === null) return 'clube'
  if (!c.deliveryDone) return 'entrega'
  return 'pagamento'
}

export function checkoutReducer(c, a) {
  switch (a.type) {
    case 'edit': {
      // Reabre uma etapa já respondida; o rascunho começa com a resposta atual.
      const drafts = a.step === 'seguro' ? { insuranceDraft: !!c.insurance } : a.step === 'clube' ? { clubDraft: !!c.club } : {}
      return { ...c, ...drafts, step: a.step, ...(a.step === 'entrega' ? { deliveryDone: false } : {}) }
    }
    case 'draft':
      return { ...c, [a.key]: a.value }
    case 'answer': {
      const next = { ...c, [a.key]: a.value }
      return { ...next, step: nextOpen(next) }
    }
    case 'delivery':
      return { ...c, delivery: a.id, deliveryDone: a.id === 'bilheteria' ? false : c.deliveryDone }
    case 'address':
      return { ...c, address: a.id }
    case 'addAddress': {
      const id = `n${c.addresses.length + 1}`
      return { ...c, addresses: [...c.addresses, { ...a.address, id }], address: id }
    }
    case 'confirmDelivery': {
      const next = { ...c, deliveryDone: true }
      return { ...next, step: nextOpen(next) }
    }
    case 'coupon':
      return { ...c, coupons: [...c.coupons, a.code] }
    case 'removeCoupon':
      return { ...c, coupons: c.coupons.filter((x) => x !== a.code) }
    case 'coins':
      return { ...c, coins: !c.coins }
    case 'method':
      return { ...c, method: a.method, installments: 1 }
    case 'installments':
      return { ...c, installments: a.n }
    case 'reset':
      return initialCheckout
    default:
      return c
  }
}

/** Cada ingresso (ou combo) vira uma unidade, para distribuir os cupons. */
function unitsOf(lines) {
  const units = []
  for (const l of lines) {
    const price = l.kind === 'combo' ? l.amount / l.qty : l.fare.price
    for (let i = 0; i < l.qty; i++) units.push({ key: `${l.key}#${i}`, price })
  }
  return units.sort((a, b) => b.price - a.price)
}

/** Distribui os cupons nas unidades mais caras ainda sem cupom. */
export function applyCoupons(lines, codes) {
  const units = unitsOf(lines)
  const used = new Set()
  const applied = codes.map((code) => {
    const cp = COUPONS[code]
    const free = units.filter((u) => !used.has(u.key)).slice(0, cp.max)
    free.forEach((u) => used.add(u.key))
    const off = free.reduce((s, u) => s + Math.min(u.price, cp.kind === 'pct' ? u.price * cp.value : cp.value), 0)
    return { code, tickets: free.length, off }
  })
  return { applied, freeUnits: units.length - used.size }
}

/** Valida um cupom novo contra o pedido (simula a chamada à API). */
export function checkCoupon(code, lines, codes) {
  const c = code.trim().toUpperCase()
  if (!c) return 'Digite um cupom.'
  if (codes.includes(c)) return 'Este cupom já foi aplicado.'
  if (!COUPONS[c]) return 'Cupom inválido ou expirado.'
  if (applyCoupons(lines, codes).freeUnits === 0) return 'Todos os ingressos já receberam um cupom.'
  return null
}

const round = (v) => Math.round(v * 100) / 100

/** Totais da finalização: ingressos, taxas, cupons, adicionais, entrega e moedas. */
export function deriveCheckout(c, order) {
  const { lines, subtotal, count } = order
  const { applied } = applyCoupons(lines, c.coupons)
  const couponOff = applied.reduce((s, x) => s + x.off, 0)
  const tickets = Math.max(0, subtotal - couponOff)
  const fee = round(tickets * 0.15)
  const insuranceValue = round(subtotal * INSURANCE_RATE)
  const clubValue = round(CLUB_PER_TICKET * count)
  const insurance = c.insurance ? insuranceValue : 0
  const club = c.club ? clubValue : 0
  const delivery = DELIVERY.find((d) => d.id === c.delivery)
  const shipping = c.deliveryDone && delivery ? delivery.price : null
  const before = tickets + fee + insurance + club + (shipping ?? 0)
  const coins = c.coins ? Math.min(UHUU_COINS, before) : 0
  const total = round(before - coins)
  const inst = INSTALLMENTS.find((i) => i.n === c.installments) || INSTALLMENTS[0]
  const cardTotal = round(total * (1 + inst.rate))
  return {
    applied,
    couponOff,
    subtotal,
    fee,
    insuranceValue,
    clubValue,
    insurance,
    club,
    shipping,
    coins,
    total,
    cardTotal,
    installment: cardTotal / inst.n,
    maxInstallment: round((total * (1 + INSTALLMENTS.at(-1).rate)) / INSTALLMENTS.at(-1).n),
  }
}

/* ---------------- Cartão ---------------- */
export const onlyDigits = (v) => v.replace(/\D/g, '')
export const formatCard = (v) => onlyDigits(v).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
export const formatExpiry = (v) => {
  const d = onlyDigits(v).slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

export function cardErrors(card, now = new Date()) {
  const e = {}
  // Protótipo de teste com usuários: qualquer número é aceito, basta ter os 16 dígitos.
  if (onlyDigits(card.number).length !== 16) e.number = 'O número do cartão deve ter 16 dígitos.'
  if (card.name.trim().split(/\s+/).length < 2) e.name = 'Digite o nome como aparece no cartão.'
  const [mm, yy] = card.expiry.split('/').map(Number)
  const end = new Date(2000 + yy, mm, 1)
  if (!(mm >= 1 && mm <= 12 && yy >= 0) || end <= now) e.expiry = 'Validade inválida.'
  if (!/^\d{3,4}$/.test(card.cvv)) e.cvv = 'CVV inválido.'
  return e
}


export const newOrderNumber = () => String(Math.floor(40000000 + Math.random() * 9999999))
