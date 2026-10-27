// Dados mock para popular a home. Estrutura simples, fácil de trocar por API depois.

export const categories = [
  { id: 'shows', label: 'Shows', icon: 'music' },
  { id: 'teatro', label: 'Teatro e espetáculos', icon: 'masks' },
  { id: 'experiencias', label: 'Experiências', icon: 'star' },
  { id: 'festas', label: 'Festas e baladas', icon: 'party' },
  { id: 'congressos', label: 'Congressos', icon: 'mic' },
  { id: 'games', label: 'Games e Geek', icon: 'game' },
]

export const heroSlides = [
  {
    id: 'jack',
    title: 'O estranho mundo de Jack de Tim Burton',
    subtitle: 'A experiência imersiva',
    seed: 'jack-burton',
    tag: 'Em cartaz',
  },
  {
    id: 'gnr',
    title: "Guns N' Roses — Not in This Lifetime",
    subtitle: 'Turnê mundial',
    seed: 'guns-roses',
    tag: 'Últimos ingressos',
  },
  {
    id: 'gala',
    title: 'Gala do Ópera — Temporada 2026',
    subtitle: 'Noite de estreia',
    seed: 'gala-opera',
    tag: 'Novo',
  },
]

// Fábrica para não repetir a mesma estrutura em cada card.
function makeEvent(id, title, place, date, tag) {
  const [day, month] = date
  return {
    id,
    title,
    place,
    day,
    month,
    tag,
    seed: `${id}-${title}`,
  }
}

export const trendingNow = [
  makeEvent('t1', 'O estranho mundo de Jack', 'Teatro do Bourbon Country • Porto Alegre', ['12', 'OUT'], 'Imperdível'),
  makeEvent('t2', "Guns N' Roses", 'Estádio Beira-Rio • Porto Alegre', ['18', 'NOV'], null),
  makeEvent('t3', 'Gala da Ópera', 'Casa de Espetáculos • Porto Alegre', ['05', 'DEZ'], 'Novo'),
  makeEvent('t4', 'Stand-up Comedy Night', 'Teatro Renascença • Porto Alegre', ['22', 'OUT'], null),
  makeEvent('t5', 'Festival de Jazz', 'Parque da Redenção • Porto Alegre', ['30', 'OUT'], 'Gratuito'),
]

export const agendaRS = [
  makeEvent('a1', 'Human Bodies — Exposição', 'Shopping Iguatemi • Porto Alegre', ['10', 'OUT'], null),
  makeEvent('a2', 'O estranho mundo de Jack', 'Teatro do Bourbon Country • Porto Alegre', ['12', 'OUT'], null),
  makeEvent('a3', 'Noite de Autógrafos', 'Livraria Central • Porto Alegre', ['15', 'OUT'], 'Gratuito'),
  makeEvent('a4', 'Feira Geek POA', 'Centro de Eventos • Porto Alegre', ['19', 'OUT'], null),
  makeEvent('a5', 'Orquestra Sinfônica', 'Theatro São Pedro • Porto Alegre', ['24', 'OUT'], null),
]

export const exploreEvents = [
  makeEvent('e1', 'Human Bodies — Exposição', 'Shopping Iguatemi • Porto Alegre', ['10', 'OUT'], null),
  makeEvent('e2', 'O estranho mundo de Jack', 'Teatro do Bourbon Country • Porto Alegre', ['12', 'OUT'], null),
  makeEvent('e3', 'Workshop de Fotografia', 'Espaço Criativo • Porto Alegre', ['16', 'OUT'], 'Novo'),
  makeEvent('e4', 'Maratona de Cinema', 'Cine Bristol • Porto Alegre', ['21', 'OUT'], null),
  makeEvent('e5', 'Encontro de Cosplay', 'Centro de Eventos • Porto Alegre', ['28', 'OUT'], null),
]

export const collections = [
  {
    id: 'c1',
    title: 'Eventos de Dia das Namoradas',
    subtitle: 'A dois é sempre melhor',
    seed: 'namorados',
  },
  {
    id: 'c2',
    title: "Happy Father's Day",
    subtitle: 'Comemore com quem você ama',
    seed: 'pais',
  },
  {
    id: 'c3',
    title: 'Eventos de Dia das Mães',
    subtitle: 'Momentos inesquecíveis',
    seed: 'maes',
  },
]

export const promoBanner = {
  title: 'MINECRAFT LIVE EXPERIENCE',
  subtitle: 'A aventura em blocos chegou na sua cidade',
  seed: 'minecraft-promo',
}
