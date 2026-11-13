// Evento de demonstração da Página do evento (Figma 8515:120880) e da seleção de ingressos
// (Figma 8522:122498 e variantes). Troque pelos dados reais da API quando existirem.
import { asset } from '../components/home/ui.jsx'

export const EVENT_SLUG = 'o-estranho-mundo-de-jack'
export const EVENT_HREF = `/evento/${EVENT_SLUG}`

export const SERVICE_FEE = 0.15 // Taxa de serviço Uhuu
export const INSTALLMENT_FEE = 0.03 // Teto da taxa de parcelamento (3x)
export const RESERVE_SECONDS = 15 * 60 // Reserva garantida por 15 min
export const SECTOR_LIMIT = 6 // Limite de ingressos por pedido em cada setor (modalidade individual)

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

/** Setores (Figma "Escolha onde você quer ficar"). kind: 'livre' = pista/sem assento, 'assento' = assento marcado. */
export const SECTORS = [
  { id: 'pista-premium', name: 'Pista Premium', kind: 'livre', lot: 'LOTE 1', base: 195.5 },
  { id: 'area-exclusiva', name: 'Área Exclusiva', kind: 'livre', lot: 'LOTE 1', base: 178 },
  { id: 'area-vip', name: 'Área VIP', kind: 'livre', lot: 'LOTE 1', base: 184 },
  { id: 'area-vip-livre', name: 'Área VIP', kind: 'livre', lot: 'LOTE 1', base: 184, soldOut: true },
  { id: 'cadeira-coberta', name: 'Cadeira Coberta', kind: 'assento', badge: 'Assento marcado', lot: 'LOTE 1', base: 391 },
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
 * Em setor com assento marcado ele só escolhe os assentos no mapa.
 */
export const COMBO_FARES = { inteira: 'Inteira', meia: 'Meia-entrada', cortesia: 'Cortesia' }
const combo = (id, name, desc, sector, price, items) => ({ id, name, desc, sector, price, items, size: items.reduce((a, [, n]) => a + n, 0) })
export const COMBOS = [
  combo('conexoes-pista', 'Combo de Conexões', '5 ingressos, sendo 1 cortesia.', 'pista-premium', 391, [['inteira', 3], ['meia', 1], ['cortesia', 1]]),
  combo('amizade-especial', 'Combo de Amizade Especial', '5 ingressos, com 30% de desconto.', 'pista-premium', 391, [['inteira', 5]]),
  combo('amizade-premium', 'Combo de Amizade Premium', '5 ingressos, sendo 1 cortesia.', 'pista-premium', 391, [['inteira', 4], ['cortesia', 1]]),
  combo('conexoes-coberta', 'Combo de Conexões', '5 ingressos, sendo 1 cortesia.', 'cadeira-coberta', 391, [['inteira', 3], ['meia', 1], ['cortesia', 1]]),
  combo('amigos-coberta', 'Combo Amigos', '5 ingressos, sendo 1 cortesia.', 'cadeira-coberta', 391, [['inteira', 4], ['cortesia', 1]]),
]
export const comboPrice = (c, session) => c.price * (session?.mult ?? 1)
/** Mesmo texto da lista de combos, sem o ponto final (ex.: "5 ingressos, sendo 1 cortesia"). */
export const comboDetail = (c) => c.desc.replace(/\.$/, '')
/** "3 Inteira, 1 Meia-entrada e 1 Cortesia" */
export const comboItemsLabel = (c) => {
  const parts = c.items.map(([f, n]) => `${n} ${COMBO_FARES[f]}`)
  return parts.length > 1 ? `${parts.slice(0, -1).join(', ')} e ${parts.at(-1)}` : parts[0]
}

/** Mapa de assentos da Cadeira Coberta: fileiras A–D, 8 assentos cada. */
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
      'Não é permitida a entrada com alimentos, bebidas, câmeras profissionais ou guarda-chuvas. Recomendamos chegar com antecedência para passar pela revista e encontrar seu setor com tranquilidade.',
    ],
    /** Informações práticas do evento (Figma 9720:324216): [rótulo, valor, detalhe] */
    credits: [
      ['Local', 'Estádio MorumBIS', 'Morumbi · São Paulo/SP'],
      ['Data e horário', '14 a 27 de novembro às 20h30', 'Abertura dos portões às 18h'],
      ['Estacionamento', 'Estacionamento no local', 'Pago à parte e sujeito à lotação'],
      ['Classificação etária', '16 anos', 'Menores somente acompanhados dos responsáveis'],
      ['Acessibilidade', 'Espaços e acessos adaptados', ''],
      ['Duração', 'Aproximadamente 2 horas', 'Sem intervalo'],
    ],
  },
  /** "Entenda os setores" (Figma 10379:64403): glossário; os 6 primeiros aparecem, o resto abre no "Ver mais". */
  sectorTerms: [
    ['Pista', 'Área em pé, geralmente sem lugar marcado.'],
    ['Mezanino', 'Piso elevado, com assentos ou espaço em pé, conforme o local.'],
    ['Camarote', 'Área reservada. Capacidade, mobiliário e serviços variam.'],
    ['Plateia e cadeiras', 'Área com assentos. Confira se há lugar marcado.'],
    ['Balcão nobre', 'Área elevada com assentos, conforme a configuração do teatro.'],
    ['Frisa', 'Grupos de assentos em áreas laterais ou em níveis do teatro.'],
    // Abertos no "Ver mais" (Figma 10444:192507)
    ['Galeria', 'Área lateral ou elevada. Posição e visibilidade variam.'],
    ['Frontstage', 'Área próxima ao palco, geralmente sem lugar marcado.'],
    ['Jirau', 'Área em nível elevado. Confira a localização no mapa.'],
    ['Suíte', 'Espaço reservado para um grupo, com capacidade indicada.'],
    ['Lounge', 'Área de experiência com os benefícios descritos na oferta.'],
    ['Rooftop e terraço', 'Área elevada. Open bar e outros serviços só quando indicados.'],
    ['Gold, VIP e Premium', 'Categorias especiais. Localização e benefícios variam.'],
    ['Espaço reduzido', 'Assento ou fileira com menos espaço, conforme o local.'],
    ['Banco extra', 'Assento adicional. Confira posição e regras de venda.'],
    ['Cadeirante e acompanhante', 'Espaços e lugares identificados no mapa de acessibilidade.'],
  ],
  /** "Compare os setores" (Figma 10145:90808): setor do protótipo e a característica; os 3 primeiros aparecem. */
  sectorCompare: [
    ['pista-premium', 'Em pé · próximo ao palco'],
    ['cadeira-coberta', 'Assento marcado · área coberta'],
    ['area-exclusiva', 'Em pé · lugar livre'],
    ['area-vip', 'Em pé · área reservada'],
  ],
  /** Blocos de texto da página do evento (Figma 10145:90808 e 10145:90822): [título, linhas do texto] */
  salesPoints: [
    ['Compra on-line · Uhuu.com', ['Compre pelo site oficial. A taxa de serviço e o total da compra são apresentados antes do pagamento. Confira os valores antes de concluir seu pedido.']],
    ['Bilheteria física · Estádio MorumBIS', ['Praça Roberto Gomes Pedrosa, 1 · Morumbi · São Paulo/SP.', 'Nos dias de evento, a partir das 10h. Compra na bilheteria sem taxa de serviço.']],
    ['Formas de pagamento', ['Consulte as opções disponíveis no pagamento on-line.'], ['Para a compra presencial, confirme os meios aceitos diretamente com a bilheteria.']],
  ],
  /** Mensagem pós-compra (texto livre do produtor no AppADM). */
  thankYou:
    'Obrigado por comprar com a gente! 🎉\nAgora é só se preparar e aproveitar o show. Mal podemos esperar para ver você em O estranho mundo de Jack de Tim Burton!\n\nBom show! 🤘',
  gallery: ['loc-g1.png', 'loc-g2.png', 'loc-g3.png', 'loc-g4.png'].map(asset),
  venue: {
    name: 'Estádio MorumBIS',
    city: 'São Paulo',
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

/** Linha de detalhe dos cards de setor: só o lote ("LOTE 1"), mesmo que o dado traga portão ou modalidade. */
export const lotLabel = (sector) => (sector.lot || '').split('·')[0].trim()

/* ------------------------------------------------------------------ */
/* Outros eventos com a mesma página                                   */
/* ------------------------------------------------------------------ */
// Mesma estrutura de datas, setores e preços do evento modelo; muda o conteúdo e, no Guns, a cortesia automática.
const BASE_EVENT = JSON.parse(JSON.stringify(EVENT))

export const GUNS_SLUG = 'guns-n-roses'
const GUNS = {
  slug: GUNS_SLUG,
  title: 'Guns N’Roses',
  hero: asset('hero-3.png'),
  heroPos: 'object-center', // celular: centraliza no globo (o logo não cabe inteiro na largura)
  /**
   * Cortesia automática (teste neste evento): a cada `every` ingressos no pedido, 1 sai como cortesia
   * (o de menor valor). Sem a escolha entre Ingresso e Pacote: os setores já vêm abertos.
   */
  autoCourtesy: { every: 5 },
  about: {
    eyebrow: 'Sobre o show',
    title: 'Uma noite de rock para cantar do começo ao fim',
    paragraphs: [
      'O Guns N’ Roses volta ao Brasil com a turnê Because What You Want & What You Get Are Two Completely Different Things. Axl Rose, Slash e Duff McKagan sobem ao palco com um repertório de quase três horas, que passa pelos clássicos de Appetite for Destruction, Use Your Illusion e as músicas mais recentes da banda.',
      'Telões de alta definição, iluminação de estádio e um som pensado para todos os setores fazem de cada música um coro coletivo. Os portões abrem às 16h e o show principal começa às 20h30.',
    ],
    more: [
      'Sweet Child O’ Mine, November Rain, Paradise City e Welcome to the Jungle estão entre as músicas mais esperadas da noite. A abertura fica por conta de uma banda convidada, anunciada na semana do show.',
      'Não é permitida a entrada com alimentos, bebidas, câmeras profissionais ou guarda-chuvas. Recomendamos chegar com antecedência para passar pela revista e encontrar seu setor com tranquilidade.',
    ],
    credits: [
      ['Local', 'Mineirão', 'Pampulha · Belo Horizonte/MG'],
      ['Data e horário', '14 a 27 de novembro às 20h30', 'Abertura dos portões às 16h'],
      ['Estacionamento', 'Estacionamento no local', 'Pago à parte e sujeito à lotação'],
      ['Classificação etária', '16 anos', 'Menores somente acompanhados dos responsáveis'],
      ['Acessibilidade', 'Espaços e acessos adaptados', ''],
      ['Duração', 'Aproximadamente 3 horas', 'Com show de abertura'],
    ],
  },
  salesPoints: [
    ['Compra on-line · Uhuu.com', ['Compre pelo site oficial. A taxa de serviço e o total da compra são apresentados antes do pagamento. Confira os valores antes de concluir seu pedido.']],
    ['Bilheteria física · Mineirão', ['Av. Antônio Abrahão Caram, 1001 · Pampulha · Belo Horizonte/MG.', 'Nos dias de show, a partir das 10h. Compra na bilheteria sem taxa de serviço.']],
    ['Formas de pagamento', ['Consulte as opções disponíveis no pagamento on-line.'], ['Para a compra presencial, confirme os meios aceitos diretamente com a bilheteria.']],
  ],
  thankYou:
    'Obrigado por comprar com a gente! 🎸\nAgora é só aquecer a voz para Sweet Child O’ Mine. Nos vemos no Mineirão para o show do Guns N’ Roses!\n\nWelcome to the jungle! 🤘',
  venue: {
    name: 'Mineirão',
    city: 'Belo Horizonte',
    address: 'Av. Antônio Abrahão Caram, 1001, Pampulha, Belo Horizonte, MG, CEP 31275-000',
    tip: 'O Mineirão fica na região da Pampulha. Há linhas de ônibus especiais nos dias de show; programe a chegada considerando o trânsito e a abertura dos portões.',
  },
  faq: [
    BASE_EVENT.faq[0],
    BASE_EVENT.faq[1],
    {
      q: 'Cortesia a cada 5 ingressos',
      a: 'Neste show, a cada 5 ingressos no mesmo pedido, 1 sai como cortesia: o de menor valor fica de graça, sem taxa de serviço. A cortesia é aplicada automaticamente no resumo do pedido.',
    },
    {
      q: 'Acessibilidade física e áreas especiais',
      a: 'O Mineirão conta com rampas, elevadores e espaços reservados para pessoas com deficiência e mobilidade reduzida. Solicite atendimento na central de ajuda com antecedência.',
    },
    {
      q: 'Pontos de venda físicos e taxa de conveniência',
      a: 'A bilheteria do Mineirão abre nos dias de show a partir das 10h, sem taxa de serviço. Na compra on-line é cobrada a taxa de serviço Uhuu de 15%.',
    },
  ],
}

const EXTRA_EVENTS = { [GUNS_SLUG]: GUNS }

/** Troca o conteúdo do evento exibido (chamado pela página do evento ao abrir pelo endereço). */
export function setActiveEvent(slug) {
  const next = EXTRA_EVENTS[slug]
  if ((EVENT.slug === (next ? next.slug : BASE_EVENT.slug))) return
  for (const k of Object.keys(EVENT)) delete EVENT[k]
  Object.assign(EVENT, JSON.parse(JSON.stringify(BASE_EVENT)), next ? JSON.parse(JSON.stringify(next)) : {})
}

/** Cortesia automática: quantos ingressos faltam para a próxima e quantas já foram ganhas. */
export function courtesyProgress(count) {
  const every = EVENT.autoCourtesy?.every
  if (!every) return null
  const won = Math.floor(count / every)
  return { every, won, missing: every - (count % every) }
}
