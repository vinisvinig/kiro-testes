// Evento de demonstração da Página do evento (Figma 8515:120880) e da seleção de ingressos
// (Figma 8522:122498 e variantes). Troque pelos dados reais da API quando existirem.
import { asset } from '../components/home/ui.jsx'

export const EVENT_SLUG = 'o-estranho-mundo-de-jack'
export const EVENT_HREF = `/evento/${EVENT_SLUG}`

export const SERVICE_FEE = 0.15 // Taxa de serviço Uhuu
export const INSTALLMENT_FEE = 0.03 // Teto da taxa de parcelamento (3x)
export const RESERVE_SECONDS = 15 * 60 // Reserva garantida por 15 min
export const SECTOR_LIMIT = 4 // Limite de ingressos por pedido em cada setor (modalidade individual)

export const COMBO_LIMIT = 4 // Máximo de unidades do mesmo combo por sessão

/**
 * Códigos validadores: confirmam o direito a uma tarifa (BIN de cartão Banrisul/Bradesco,
 * código de empresa parceira etc.). Não são cupom de desconto.
 * `codes` simula a validação; na integração real isso vem da API.
 */
export const VALIDATORS = {
  banrisul: {
    id: 'banrisul',
    name: 'Cliente Banrisul',
    help: 'Informe os 6 primeiros dígitos do cartão Banrisul. O restante do cartão não é solicitado.',
    placeholder: 'Ex.: 627780',
    codes: ['123456', '627780', '636117', '506776'],
  },
}

const MON = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const DOW = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

const day = (d, extra = {}) => {
  const date = new Date(2026, 10, d)
  return {
    id: `2026-11-${String(d).padStart(2, '0')}`,
    kind: 'data',
    dow: DOW[date.getDay()],
    label: `${d} ${MON[10]}`,
    time: '20:30',
    mult: 1,
    ...extra,
  }
}

/** Sessões: passaporte + 10 datas. */
export const SESSIONS = [
  { id: 'passaporte', kind: 'passaporte', dow: 'Passaporte', label: '14–16 Nov', time: '3 dias', mult: 2.5 },
  day(14),
  day(15),
  day(17),
  day(18),
  day(20),
  day(21),
  day(22, { soldOut: true }),
  day(25),
  day(26),
  day(27),
]

export const sessionTitle = (s) => (s.kind === 'passaporte' ? `Passaporte ${s.label} (3 dias)` : `${s.label}, ${s.time}`)

/** Setores (Figma "Escolha onde você quer ficar"). kind: 'livre' = pista/sem assento, 'assento' = lugar marcado. */
export const SECTORS = [
  { id: 'pista-premium', name: 'Pista Premium', kind: 'livre', badge: 'Setor livre', lot: 'LOTE 1 · Portão B', base: 195.5 },
  { id: 'area-exclusiva', name: 'Área Exclusiva', kind: 'livre', badge: 'Espaço Aberto', lot: 'LOTE 1 · Espaço Aberto, Entrada Principal', base: 178 },
  { id: 'area-vip', name: 'Área VIP', kind: 'livre', badge: 'Espaço Aberto', lot: 'LOTE 1 · Espaço Aberto, Entrada Principal', base: 184 },
  { id: 'area-vip-livre', name: 'Área VIP', kind: 'livre', badge: 'Espaço Livre', lot: 'LOTE 1 · Espaço Livre, Entrada Principal', base: 184, soldOut: true },
  { id: 'cadeira-coberta', name: 'Cadeira Coberta', kind: 'assento', badge: 'Assento marcado', lot: 'LOTE 1 · Assentos numerados, Portão A', base: 391 },
]

/** Tarifas disponíveis em todos os setores. */
export function faresFor(sector, session) {
  const full = sector.base * (session?.mult ?? 1)
  return [
    { id: 'inteira', name: 'Inteira', desc: 'Valor integral', price: full },
    { id: 'meia', name: 'Meia-entrada estudante', desc: 'Comprovação na entrada', price: full / 2 },
    { id: 'banrisul', name: 'Cliente Banrisul 50% OFF', desc: 'Cartão elegível · sujeito à validação', price: full / 2, validator: 'banrisul' },
  ]
}

export const minFare = (sector, session) => Math.min(...faresFor(sector, session).map((f) => f.price))

/**
 * Combos (Figma 9828:108002 "Combo com setor"): cada combo pertence a um setor e já traz as
 * tarifas definidas (ex.: 3 inteiras, 1 meia e 1 cortesia), então o usuário não escolhe tarifa.
 * Em setor com assento marcado ele só escolhe os lugares no mapa.
 */
export const COMBO_FARES = { inteira: 'Inteira', meia: 'Meia-entrada', cortesia: 'Cortesia' }
const combo = (id, name, desc, sector, price, items) => ({ id, name, desc, sector, price, items, size: items.reduce((a, [, n]) => a + n, 0) })
export const COMBOS = [
  combo('conexoes-pista', 'Combo de Conexões', '5 lugares, sendo 1 cortesia.', 'pista-premium', 391, [['inteira', 3], ['meia', 1], ['cortesia', 1]]),
  combo('amizade-especial', 'Combo de Amizade Especial', '5 lugares, com 30% de desconto.', 'pista-premium', 391, [['inteira', 5]]),
  combo('amizade-premium', 'Combo de Amizade Premium', '5 lugares, sendo 1 cortesia.', 'pista-premium', 391, [['inteira', 4], ['cortesia', 1]]),
  combo('conexoes-coberta', 'Combo de Conexões', '5 lugares, sendo 1 cortesia.', 'cadeira-coberta', 391, [['inteira', 3], ['meia', 1], ['cortesia', 1]]),
  combo('amigos-coberta', 'Combo Amigos', '5 lugares, sendo 1 cortesia.', 'cadeira-coberta', 391, [['inteira', 4], ['cortesia', 1]]),
]
export const comboPrice = (c, session) => c.price * (session?.mult ?? 1)
/** "3 Inteira, 1 Meia-entrada e 1 Cortesia" */
export const comboItemsLabel = (c) => {
  const parts = c.items.map(([f, n]) => `${n} ${COMBO_FARES[f]}`)
  return parts.length > 1 ? `${parts.slice(0, -1).join(', ')} e ${parts.at(-1)}` : parts[0]
}

/** Mapa de assentos da Cadeira Coberta: fileiras A–D, 8 lugares cada. */
export const SEAT_ROWS = ['A', 'B', 'C', 'D'].map((r) => Array.from({ length: 8 }, (_, i) => `${r}${i + 1}`))

const OCCUPIED_BASE = ['A3', 'B2', 'B3', 'C4', 'D7']
/** Assentos ocupados variam um pouco por sessão para parecer real. */
export function occupiedFor(sessionId) {
  const n = [...(sessionId || '')].reduce((a, c) => a + c.charCodeAt(0), 0)
  const extra = SEAT_ROWS.flat().filter((_, i) => (i * 7 + n) % 11 === 0)
  return new Set([...OCCUPIED_BASE, ...extra])
}

export const EVENT = {
  slug: EVENT_SLUG,
  title: 'O estranho mundo de Jack de Tim Burton',
  period: '14/11/26 a 27/11/26',
  hero: asset('hero-2.png'),
  rangeLabel: '14 a 27 de novembro',
  about: {
    eyebrow: 'Sobre o espetáculo',
    title: 'Uma experiência criada para ocupar todo o estádio',
    paragraphs: [
      'O universo de Halloween Town ganha vida em uma montagem que combina música ao vivo, projeções e cenografia em grande escala. O público acompanha Jack Skellington, Sally e toda a turma em uma noite que mistura o clima sombrio e divertido do filme com a energia de um grande show.',
      'Com direção visual premiada, efeitos sincronizados e pulseiras de LED que conectam o público ao palco, o espetáculo foi concebido para ser vivido em conjunto. Os portões abrem às 18h e o show começa às 20h30.',
    ],
    /** Texto revelado pelo "Ver mais". */
    more: [
      'A trilha sonora é executada ao vivo por uma orquestra de 40 músicos, com arranjos inéditos para os temas mais conhecidos do filme. O palco central de 360° permite que todos os setores acompanhem as cenas de perto, e telões de alta definição mostram os detalhes dos bonecos e figurinos.',
      'A classificação indicativa é livre, mas menores de 16 anos devem estar acompanhados dos pais ou responsáveis. A duração aproximada é de 2h, com intervalo de 20 minutos. Não é permitida a entrada com alimentos, bebidas, câmeras profissionais ou guarda-chuvas.',
    ],
    credits: [
      ['Direção criativa', 'Ateliê Caminho de Luzes', 'Concepção da experiência ao vivo'],
      ['Direção musical', 'Orquestra Halloween Town', 'Produção musical e arranjos'],
      ['Direção de palco', 'Cia. Noite Estranha', 'Luz, lasers e efeitos cênicos'],
      ['Produção & realização', 'Uhuu Live', 'Operação oficial da turnê'],
      ['Acessibilidade', 'Áreas e rotas acessíveis', 'Atendimento mediante disponibilidade'],
      ['Sustentabilidade', 'Pulseiras LED reutilizáveis', 'Devolução assistida após o show'],
    ],
  },
  /** Mensagem pós-compra (texto livre do produtor no AppADM). */
  thankYou:
    'Obrigado por comprar com a gente! 🎉\nAgora é só se preparar e aproveitar o show. Mal podemos esperar para ver você em O estranho mundo de Jack de Tim Burton!\n\nBom show! 🤘',
  gallery: ['loc-g1.png', 'loc-g2.png', 'loc-g3.png', 'loc-g4.png'].map(asset),
  venue: {
    name: 'Estádio MorumBIS',
    address: 'Praça Roberto Gomes Pedrosa, 1, Morumbi, São Paulo, SP, CEP 05653-070',
    tip: 'A estação de metrô mais próxima é São Paulo–Morumbi, da Linha 4-Amarela. Programe a chegada considerando o trânsito e a abertura dos portões.',
  },
  faq: [
    {
      q: 'Política de meia-entrada e documentação',
      a: 'Estudantes, professores da rede pública, pessoas com deficiência e acompanhante, jovens de baixa renda e idosos têm direito à meia-entrada. Apresente documento com foto e comprovante válido na entrada.',
    },
    {
      q: 'Desconto para clientes de cartões parceiros',
      a: 'Clientes Banrisul têm 50% de desconto. Na compra, informe no resumo do pedido o código validador (os 6 primeiros dígitos do cartão) para confirmar o benefício. O pagamento deve ser feito com o mesmo cartão.',
    },
    {
      q: 'Acessibilidade física e áreas especiais',
      a: 'O estádio conta com rampas, elevadores e espaços reservados para pessoas com deficiência e mobilidade reduzida. Solicite atendimento na central de ajuda com antecedência.',
    },
    {
      q: 'Pontos de venda físicos e taxa de conveniência',
      a: 'As bilheterias do estádio abrem nos dias de evento a partir das 10h, sem taxa de serviço. Na compra on-line é cobrada a taxa de serviço Uhuu de 15%.',
    },
  ],
}
