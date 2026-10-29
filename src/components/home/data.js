// Conteúdo da home, copiado do Figma. Troque aqui pelos dados reais da API.
import { asset } from './ui.jsx'

// Página do evento interna (src/event). Todos os cards de demonstração abrem o evento modelo.
const EVENT_URL = '/evento/o-estranho-mundo-de-jack'

// Cores de borda dos badges (tokens do Figma)
export const TAG = {
  acabando: { label: 'Acabando', icon: asset('ic-whatshot.svg'), color: 'border-orange' },
  corre: { label: 'Corre', icon: asset('ic-run.svg'), color: 'border-orange' },
  popular: { label: 'Popular agora', icon: asset('ic-star-amber.svg'), color: 'border-alert' },
  maisVendidos: { label: 'Mais vendidos', icon: asset('ic-star-amber.svg'), color: 'border-alert' },
  sessaoExtra: { label: 'Sessão extra', icon: asset('ic-star-indigo.svg'), color: 'border-indigo' },
  hoje: { label: 'É hoje', icon: asset('ic-star-blue.svg'), color: 'border-info' },
  ultimos: { label: 'Últimos ingressos', icon: asset('ic-timer.svg'), color: 'border-danger' },
}

export const heroSlides = [
  { image: asset('hero-1.png'), period: '16/06/25 a 03/08/25', title: 'Kim Walker-Smith', href: EVENT_URL },
  { image: asset('hero-2.png'), period: '14/11/26 a 27/11/26', title: 'O estranho mundo de Jack de Tim Burton', href: EVENT_URL },
  { image: asset('hero-3.png'), period: '16/06/25 a 03/08/25', title: 'Guns N’Roses', href: EVENT_URL },
]

export const categories = [
  ['Show', 'cat-show.svg'],
  ['Família/Infantil', 'cat-familia.svg'],
  ['Espetáculo', 'cat-espetaculo.svg'],
  ['Musical', 'cat-musical.svg'],
  ['Comédia', 'cat-comedia.svg'],
  ['Estacionamento', 'cat-estacionamento.svg'],
  ['Palestra', 'cat-palestra.svg'],
  ['Circo', 'cat-circo.svg'],
  ['Exposição', 'cat-exposicao.svg'],
].map(([label, icon]) => ({ label, icon: asset(icon) }))

// Os eventos das seções da home vêm do catálogo (src/search/catalog.js), o mesmo da busca.

export const collections = [
  ['Dia dos Namorados', 'col-namorados.png'],
  ['Dia dos Pais', 'col-pais.png'],
  ['Dia das Mães', 'col-maes.png'],
  ['Carnaval', 'col-carnaval.png'],
  ['Réveillon', 'col-reveillon.png'],
  ['São João', 'col-saojoao.png'],
  ['Halloween', 'col-halloween.png'],
  ['Dia das Crianças', 'col-criancas.png'],
].map(([label, img]) => ({ label, image: asset(img) }))

export const venues = ['casa-1.png', 'casa-2.png', 'casa-1.png', 'casa-2.png', 'casa-2.png'].map((img) => ({
  image: asset(img),
  name: 'Teatro Bradesco',
  city: 'São Paulo · SP',
  count: '24 eventos',
}))

export const posts = [
  {
    image: asset('blog-1.png'),
    title: 'A engenharia por trás do aplauso: Como 50 anos de história moldam o futuro do entretenimento',
    date: '10 de julho de 2026',
    excerpt:
      'Quem vê as luzes se acenderem, o som tomar conta da arena e a multidão cantar em uníssono raramente pensa no relógio. Para o público, o entretenimento ao vivo é feito de momentos congelados no tempo, uma noite inesquecível que dura para sempre na memória. Mas, para quem vive os bastidores, o tempo é medido em precisão, evolução e, acima de tudo, resiliência.',
    href: 'https://sobre.uhuu.com/blog',
  },
  {
    image: asset('blog-2.png'),
    title: 'Cabaré, O Último Encontro: Quando uma história de sucesso chega à reta final',
    date: '10 de julho de 2026',
    excerpt:
      'Alguns encontros simplesmente funcionam. Quando juntam amizade, grandes canções, bom humor e três nomes gigantes da música sertaneja, o resultado pode ser ainda maior: pode virar história. Foi exatamente isso que aconteceu com o Cabaré.',
    href: 'https://sobre.uhuu.com/blog',
  },
]
