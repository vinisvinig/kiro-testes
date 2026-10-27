// Catálogo de exemplo usado pela busca e pelas páginas de Local.
// Substitua por chamadas à API real mantendo o mesmo formato (ver src/api.js).
import { asset } from '../components/home/ui.jsx'
import { TAG } from '../components/home/data.js'

/** Categorias do Figma (dropdown "Categoria" e chips da home), com ícone. */
export const CATEGORIES = [
  { name: 'Show', icon: asset('cat-show.svg') },
  { name: 'Família/Infantil', icon: asset('cat-familia.svg') },
  { name: 'Espetáculo', icon: asset('cat-espetaculo.svg') },
  { name: 'Musical', icon: asset('cat-musical.svg') },
  { name: 'Comédia', icon: asset('cat-comedia.svg') },
  { name: 'Estacionamento', icon: asset('cat-estacionamento.svg') },
  { name: 'Palestra', icon: asset('cat-palestra.svg') },
  { name: 'Circo', icon: asset('cat-circo.svg') },
  { name: 'Exposição', icon: asset('cat-exposicao.svg') },
]

export const CITIES = [
  { name: 'Aracaju', uf: 'SE' },
  { name: 'Curitiba', uf: 'PR' },
  { name: 'Belo Horizonte', uf: 'MG' },
  { name: 'Fortaleza', uf: 'CE' },
  { name: 'Rio de Janeiro', uf: 'RJ' },
  { name: 'São Paulo', uf: 'SP' },
  { name: 'Porto Alegre', uf: 'RS' },
  { name: 'Sorocaba', uf: 'SP' },
  { name: 'Rio Branco', uf: 'AC' },
  { name: 'Rio Grande', uf: 'RS' },
  { name: 'Ribeirão Preto', uf: 'SP' },
  { name: 'Florianópolis', uf: 'SC' },
]

export const slugify = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const TULIO_PIVA = {
  name: 'Teatro de Câmara Túlio Piva',
  type: 'Teatro',
  city: 'Porto Alegre',
  images: ['loc-g1.png', 'loc-g2.png', 'loc-g3.png', 'loc-g4.png', 'loc-g5.png'].map(asset),
  street: 'Rua da República, 575',
  district: 'Cidade Baixa',
  cep: '90050-321',
  capacity: 210000,
  accessibility: 'Sim, integral',
  parking: 'Próximo ao local',
  opened: '10/01/1999',
  about:
    'O Teatro de Câmara Túlio Piva é um dos espaços culturais mais tradicionais de Porto Alegre, localizado no coração da cidade. Com uma programação diversificada que inclui teatro, música, dança e eventos corporativos, o espaço é referência em cultura e entretenimento na capital gaúcha. Com excelente acústica e instalações modernizadas, proporciona experiências inesquecíveis tanto para artistas quanto para o público.',
}

// [nome, tipo, cidade, imagens, endereço]
const RAW_VENUES = [
  ['Teatro Bradesco', 'Teatro', 'São Paulo', ['casa-1.png'], 'Rua Palestra Itália, 500'],
  ['Auditório Araújo Vianna', 'Auditório', 'Porto Alegre', ['casa-2.png'], 'Av. Osvaldo Aranha, 685'],
  ['Riograndense', 'Estádio', 'Porto Alegre', ['casa-2.png'], 'Av. Padre Cacique, 891'],
  ['Rio Venue', 'Casa de Shows', 'São Paulo', ['casa-2.png'], 'Rua Augusta, 1200'],
  ['Estádio do Morumbi', 'Estádio', 'São Paulo', ['casa-2.png'], 'Praça Roberto Gomes Pedrosa, 1'],
  ['Parque Ibirapuera', 'Parque', 'São Paulo', ['casa-1.png'], 'Av. Pedro Álvares Cabral, s/n'],
  ['Teatro Claro MAIS SP', 'Teatro', 'São Paulo', ['casa-1.png'], 'Rua Olimpíadas, 360'],
  ['Jeunesse Arena', 'Arena', 'Rio de Janeiro', ['casa-2.png'], 'Av. Embaixador Abelardo Bueno, 3401'],
  ['Vivo Rio', 'Casa de Shows', 'Rio de Janeiro', ['casa-2.png'], 'Av. Infante Dom Henrique, 85'],
  ['Theatro Municipal do Rio', 'Teatro', 'Rio de Janeiro', ['casa-1.png'], 'Praça Floriano, s/n'],
  ['Teatro Guaíra', 'Teatro', 'Curitiba', ['casa-1.png'], 'R. Conselheiro Laurindo, 175'],
  ['Teatro Via Sul', 'Teatro', 'Fortaleza', ['casa-1.png'], 'Av. Washington Soares, 4335'],
  ['Mineirão', 'Estádio', 'Belo Horizonte', ['casa-2.png'], 'Av. Antônio Abrahão Caram, 1001'],
  ['Centro de Eventos FIERGS', 'Centro de Eventos', 'Porto Alegre', ['casa-2.png'], 'Av. Assis Brasil, 8787'],
]

const venueBase = (v) => {
  const city = CITIES.find((c) => c.name === v.city)
  return {
    capacity: 1200,
    accessibility: 'Sim, integral',
    parking: 'Próximo ao local',
    opened: null,
    about: `O ${v.name} é um dos espaços mais procurados de ${v.city} para ${v.type === 'Estádio' ? 'grandes shows e festivais' : 'shows, espetáculos e eventos culturais'}, com estrutura completa para receber o público com conforto e segurança.`,
    ...v,
    slug: slugify(v.name),
    uf: city.uf,
    get address() {
      return `${this.street}, ${this.city} - ${this.uf}`
    },
    // "Rua da República, 575 — Cidade Baixa, Porto Alegre — RS, 90050-321"
    get fullAddress() {
      const district = this.district ? `${this.district}, ` : ''
      return `${this.street} — ${district}${this.city} — ${this.uf}${this.cep ? `, ${this.cep}` : ''}`
    },
  }
}

export const VENUES = [
  venueBase(TULIO_PIVA),
  ...RAW_VENUES.map(([name, type, city, imgs, street]) => venueBase({ name, type, city, images: imgs.map(asset), street })),
]

/** FAQ padrão do local (Figma "Categoria expande - FAQ"). */
export const venueFaq = (v) => [
  {
    q: 'Quais são as opções de estacionamento próximas?',
    a: `${v.parking}. Recomendamos chegar com antecedência em dias de evento, pois as vagas costumam lotar.`,
  },
  {
    q: 'O local possui acessibilidade para pessoas com deficiência?',
    a: `${v.accessibility}. Há rampas de acesso, banheiros adaptados e espaços reservados para cadeirantes e acompanhantes.`,
  },
  {
    q: 'Qual a capacidade máxima de público deste local?',
    a: `A capacidade máxima é de ${v.capacity.toLocaleString('pt-BR')} pessoas, podendo variar conforme a configuração de cada evento.`,
  },
  {
    q: 'Como chegar ao local usando transporte público?',
    a: `O ${v.name} fica em ${v.address}. Use o botão “Visualizar rota” para ver as opções de ônibus, metrô e aplicativos no Google Maps.`,
  },
]

const IMAGES = ['ev-1.png', 'ev-2.png', 'ev-3.png', 'ev-5.png', 'ev-6.png', 'ev-7.png', 'ev-4.png'].map(asset)
const EVENT_URL = '/evento/o-estranho-mundo-de-jack'

// [título, categoria, local, data ISO, preço mín, preço máx, tags]
const RAW = [
  ['Rio 2', 'Show', 'Estádio do Morumbi', '2026-10-10', 120, 690, ['popular']],
  ['Rios de Alegria', 'Show', 'Parque Ibirapuera', '2026-10-12', 0, 80, ['hoje']],
  ['Rock in Rio Experience', 'Show', 'Jeunesse Arena', '2026-10-17', 250, 980, ['acabando', 'maisVendidos']],
  ['Samba do Rio', 'Show', 'Vivo Rio', '2026-10-18', 60, 220, []],
  ['O Rio que Mora em Mim', 'Espetáculo', 'Theatro Municipal do Rio', '2026-10-21', 40, 180, ['sessaoExtra']],
  ['Riograndense Fest', 'Show', 'Riograndense', '2026-10-24', 35, 150, ['corre']],
  ['Noite Carioca', 'Show', 'Rio Venue', '2026-10-25', 50, 200, []],
  ['Rio Comedy Club', 'Comédia', 'Vivo Rio', '2026-10-30', 45, 120, ['popular']],
  ['Do Rio ao Sertão', 'Musical', 'Teatro Bradesco', '2026-11-01', 70, 320, []],
  ['Rio Kids — A Aventura', 'Família/Infantil', 'Jeunesse Arena', '2026-11-02', 30, 90, []],
  ['Circo do Rio', 'Circo', 'Riograndense', '2026-11-06', 40, 140, ['acabando']],
  ['Rio Antigo: Fotografias', 'Exposição', 'Theatro Municipal do Rio', '2026-11-08', 0, 25, []],
  ['Palestra: O Futuro do Rio', 'Palestra', 'Rio Venue', '2026-11-12', 90, 250, []],
  ['Bossa Nova no Rio', 'Show', 'Vivo Rio', '2026-11-14', 80, 280, ['maisVendidos']],
  ['Rio Grande Rodeio', 'Show', 'Centro de Eventos FIERGS', '2026-11-20', 25, 110, []],
  ['Riocorrente', 'Espetáculo', 'Teatro Guaíra', '2026-11-22', 50, 160, []],
  ['Curitiba Country Festival', 'Show', 'Teatro Claro MAIS SP', '2026-10-10', 5, 599, ['acabando', 'popular']],
  ['Guns N’Roses', 'Show', 'Mineirão', '2026-10-15', 290, 1400, ['corre', 'maisVendidos', 'ultimos']],
  ['Kim Walker-Smith', 'Show', 'Auditório Araújo Vianna', '2026-10-19', 150, 520, []],
  ['O estranho mundo de Jack', 'Exposição', 'Parque Ibirapuera', '2026-10-20', 60, 140, ['popular']],
  ['Human Bodies', 'Exposição', 'Centro de Eventos FIERGS', '2026-10-27', 50, 120, []],
  ['Calado — Turnê 2026', 'Musical', 'Teatro Via Sul', '2026-11-05', 80, 300, ['sessaoExtra']],
  ['Michel Alcoforado', 'Palestra', 'Teatro Bradesco', '2026-11-10', 90, 260, []],
  ['Stand-up Sem Filtro', 'Comédia', 'Teatro Guaíra', '2026-11-13', 40, 100, []],
  ['Pequeno Príncipe', 'Família/Infantil', 'Teatro Claro MAIS SP', '2026-11-16', 35, 90, []],
  ['Cirque Lumière', 'Circo', 'Auditório Araújo Vianna', '2026-11-27', 70, 240, ['hoje']],
  ['Morilo', 'Show', 'Teatro de Câmara Túlio Piva', '2026-10-09', 5, 599, ['corre', 'maisVendidos', 'ultimos', 'popular']],
  // Programação do Teatro de Câmara Túlio Piva (página de Local)
  ['Quarteto de Cordas POA', 'Musical', 'Teatro de Câmara Túlio Piva', '2026-10-11', 40, 120, ['popular']],
  ['Dança Contemporânea: Raízes', 'Espetáculo', 'Teatro de Câmara Túlio Piva', '2026-10-14', 30, 90, ['acabando']],
  ['Noite do Choro', 'Show', 'Teatro de Câmara Túlio Piva', '2026-10-16', 35, 80, []],
  ['Improviso Total', 'Comédia', 'Teatro de Câmara Túlio Piva', '2026-10-18', 40, 70, ['sessaoExtra']],
  ['Histórias de Vó', 'Família/Infantil', 'Teatro de Câmara Túlio Piva', '2026-10-19', 20, 50, []],
  ['Recital de Piano', 'Musical', 'Teatro de Câmara Túlio Piva', '2026-10-23', 50, 140, []],
  ['Palestra: Cultura em Cena', 'Palestra', 'Teatro de Câmara Túlio Piva', '2026-10-26', 0, 40, ['hoje']],
  ['Monólogos Gaúchos', 'Espetáculo', 'Teatro de Câmara Túlio Piva', '2026-10-31', 30, 80, []],
  ['Jazz na Cidade Baixa', 'Show', 'Teatro de Câmara Túlio Piva', '2026-11-04', 45, 110, ['maisVendidos']],
  ['Mostra de Curtas', 'Exposição', 'Teatro de Câmara Túlio Piva', '2026-11-09', 0, 20, []],
]

const DOW = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const MON = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
const brl = (v) => (v === 0 ? 'Grátis' : `R$ ${v}`)

export const EVENTS = RAW.map(([title, category, venueName, date, min, max, tags], i) => {
  const venue = VENUES.find((v) => v.name === venueName)
  const d = new Date(`${date}T12:00:00`)
  return {
    id: i + 1,
    title,
    category,
    venue: venue.name,
    venueSlug: venue.slug,
    cityName: venue.city,
    uf: venue.uf,
    date,
    priceMin: min,
    priceMax: max,
    // Campos no formato do <EventCard>
    image: IMAGES[i % IMAGES.length],
    href: EVENT_URL,
    tags: tags.map((t) => TAG[t]),
    dates: [{ dow: DOW[d.getDay()], day: String(d.getDate()).padStart(2, '0'), mon: MON[d.getMonth()] }],
    priceFrom: brl(min),
    priceTo: brl(max),
    city: `${venue.city} · ${venue.uf}`,
  }
})
