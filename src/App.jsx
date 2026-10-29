import { useEffect, useMemo } from 'react'
import Header from './components/home/Header.jsx'
import SearchHero from './components/home/SearchHero.jsx'
import Footer from './components/home/Footer.jsx'
import {
  Categories,
  Trending,
  Agenda,
  AdArea,
  Collections,
  Newsletter,
  Explore,
  Venues,
  Blog,
  Producer,
} from './components/home/Sections.jsx'
import SearchPage from './search/SearchPage.jsx'
import LoginDialog from './LoginDialog.jsx'
import LocalPage from './local/LocalPage.jsx'
import EventPage from './event/EventPage.jsx'
import { parseParams } from './search/search.js'
import { useLocation } from './router.jsx'

// Home — "Desktop - Home - nenhuma localização definida (Light)" (Figma 6384:38271)
function Home() {
  return (
    <>
      <SearchHero />
      <Categories />
      <Trending />
      <Agenda />
      <AdArea />
      <Collections />
      <Newsletter />
      <Explore />
      <Venues />
      <Blog />
      <Producer />
    </>
  )
}

export default function App() {
  const { path, search } = useLocation()
  const params = useMemo(() => parseParams(search), [search])
  const localSlug = path.match(/^\/local\/([^/]+)\/?$/)?.[1]
  const eventSlug = path.match(/^\/evento\/([^/]+)\/?$/)?.[1]

  // Título da aba fixo em "Uhuu.com" em todas as páginas (pedido do teste de usuário)
  useEffect(() => {
    document.title = 'Uhuu.com'
  }, [path])

  let page = <Home />
  if (path === '/busca') page = <SearchPage params={params} search={search} />
  else if (localSlug) page = <LocalPage key={localSlug} slug={localSlug} />
  // Todos os eventos de demonstração abrem o mesmo evento modelo do Figma.
  else if (eventSlug) page = <EventPage key={eventSlug} slug={eventSlug} search={search} />

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <Header />
      <main className="flex-1">{page}</main>
      <Footer />
      <LoginDialog />
    </div>
  )
}
