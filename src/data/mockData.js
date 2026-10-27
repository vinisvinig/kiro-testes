import { placeholder } from '../lib/placeholder'

// Categorias (chips com ícone) — o icon é o nome usado no componente Icon.
export const categories = [
  { id: 'shows', label: 'Shows', icon: 'music' },
  { id: 'familia', label: 'Família e infantil', icon: 'family' },
  { id: 'experiencias', label: 'Experiências', icon: 'star' },
  { id: 'teatro', label: 'Teatro', icon: 'masks' },
  { id: 'congressos', label: 'Congressos', icon: 'mic' },
  { id: 'gastronomia', label: 'Gastronomia', icon: 'food' },
]

// Slides do banner de destaque no topo.
export const heroSlides = [
  {
    id: 'jack',
    title: 'O estranho mundo de Jack de Tim Burton',
    subtitle: 'A experiência imersiva chegou ao Brasil',
    cta: 'Comprar ingressos',
    image: placeholder({ w: 1200, h: 380, label: 'O estranho mundo de Jack', seed: 'jack' }),
  },
  {
    id: 'rock',
    title: 'Festival de Rock 2026',
    subtitle: 'Dois dias de música ao vivo',
    cta: 'Ver line-up',
    image: placeholder({ w: 1200, h: 380, label: 'Festival de Rock 2026', seed: 'rock' }),
  },
  {
    id: 'stand',
    title: 'Noite do Stand-up',
    subtitle: 'Os melhores comediantes em um só lugar',
    cta: 'Garantir lugar',
    image: placeholder({ w: 1200, h: 380, label: 'Noite do Stand-up', seed: 'stand' }),
  },
]

// Banner promocional (faixa larga no meio da página).
export const promoBanner = {
  id: 'minecraft',
  title: 'Minecraft Experience',
  image: placeholder({ w: 1200, h: 200, label: 'MINECRAFT EXPERIENCE', seed: 'minecraft' }),
}

function makeEvent(id, title, seed) {
  return {
    id,
    title,
    venue: 'Centro de Eventos • Porto Alegre',
    date: { day: '18', month: 'MAI' },
    price: 'A partir de R$ 60,00',
    tag: id % 2 === 0 ? 'Últimos ingressos' : null,
    image: placeholder({ w: 400, h: 240, label: title, seed }),
  }
}

export const trendingEvents = [
  makeEvent(1, 'Human Bodies', 'ev-human'),
  makeEvent(2, "Guns N' Roses Tribute", 'ev-guns'),
  makeEvent(3, 'Ópera & Dança', 'ev-opera'),
  makeEvent(4, 'Festival Gastronômico', 'ev-gastro'),
  makeEvent(5, 'Mágica ao Vivo', 'ev-magic'),
  makeEvent(6, 'Cine Concerto', 'ev-cine'),
]

export const agendaRS = [
  makeEvent(11, 'Human Bodies', 'rs-human'),
  makeEvent(12, 'O Estranho Mundo de Jack', 'rs-jack'),
  makeEvent(13, 'Teatro Infantil', 'rs-teatro'),
  makeEvent(14, 'Feira de Vinhos', 'rs-vinho'),
  makeEvent(15, 'Jazz na Serra', 'rs-jazz'),
  makeEvent(16, 'Corrida Noturna', 'rs-corrida'),
]

export const exploreEvents = [
  makeEvent(21, 'Human Bodies', 'ex-human'),
  makeEvent(22, 'O Estranho Mundo de Jack', 'ex-jack'),
  makeEvent(23, 'Workshop de Fotografia', 'ex-foto'),
  makeEvent(24, 'Festival de Cinema', 'ex-cinema'),
  makeEvent(25, 'Show de Talentos', 'ex-talentos'),
  makeEvent(26, 'Exposição de Arte', 'ex-arte'),
]

// Cards grandes de coleções/eventos especiais.
export const collections = [
  {
    id: 'namorados',
    title: 'Dia dos Namorados',
    subtitle: 'Eventos especiais',
    image: placeholder({ w: 400, h: 420, label: 'Dia dos Namorados', seed: 'col-namorados' }),
  },
  {
    id: 'pais',
    title: "Happy Father's Day",
    subtitle: 'Comemore com quem você ama',
    image: placeholder({ w: 400, h: 420, label: "Father's Day", seed: 'col-pais' }),
  },
  {
    id: 'maes',
    title: 'Dia das Mães',
    subtitle: 'Eventos especiais',
    image: placeholder({ w: 400, h: 420, label: 'Dia das Mães', seed: 'col-maes' }),
  },
]

export const agendaFilters = ['Presencial', 'Online']
