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
import { EVENT } from './event/eventData.js'
import { parseParams } from './search/search.js'
import { VENUES } from './search/catalog.js'
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

  useEffect(() => {
    if (eventSlug) {
      document.title = `${EVENT.title} — ingressos | Uhuu.com`
    } else if (localSlug) {
      const v = VENUES.find((x) => x.slug === localSlug)
      document.title = `${v ? v.name : 'Local'} — eventos e ingressos | Uhuu.com`
    } else if (path === '/busca') {
      document.title = `${params.q ? `“${params.q}” — ` : ''}Busca de eventos | Uhuu.com`
    } else {
      document.title = 'Uhuu.com — Ingressos para shows, teatro e eventos'
    }
  }, [path, localSlug, eventSlug, params.q])

  let page = <Home />
  if (path === '/busca') page = <SearchPage params={params} search={search} />
  else if (localSlug) page = <LocalPage key={localSlug} slug={localSlug} />
  // Todos os eventos de demonstração abrem o mesmo evento modelo do Figma.
  else if (eventSlug) page = <EventPage key={eventSlug} slug={eventSlug} search={search} />

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{page}</main>
      <Footer />
      <LoginDialog />
    </div>
  )
}
