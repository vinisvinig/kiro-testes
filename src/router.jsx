// GitHub Pages usa rotas no hash para permitir abrir e atualizar links internos.
import { useEffect, useState } from 'react'

const hashRoutes = import.meta.env.VITE_ROUTER_MODE === 'hash'
const read = () => {
  if (!hashRoutes) return { path: window.location.pathname, search: window.location.search }
  const route = window.location.hash.slice(1)
  const url = new URL(route.startsWith('/') ? route : '/', window.location.origin)
  return { path: url.pathname, search: url.search }
}

const href = (to) => hashRoutes ? `${import.meta.env.BASE_URL}#${to}` : to

export function navigate(to, { scroll = true } = {}) {
  const { path, search } = read()
  if (to !== path + search) {
    window.history.pushState({}, '', href(to))
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
  if (scroll) window.scrollTo({ top: 0 })
}

export function useLocation() {
  const [loc, setLoc] = useState(read)
  useEffect(() => {
    const onPop = () => setLoc(read())
    window.addEventListener('popstate', onPop)
    window.addEventListener('hashchange', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('hashchange', onPop)
    }
  }, [])
  return loc
}

/** <a> que navega sem recarregar a página (mantém Ctrl/Cmd+clique abrindo em nova aba). */
export function Link({ to, onClick, ...rest }) {
  const handle = (e) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navigate(to)
  }
  return <a href={href(to)} onClick={handle} {...rest} />
}
