import { useEffect, useMemo, useRef, useState } from 'react'
import { logout, openLogin, useAuth } from '../../auth.js'
import { asset, Pill, Sheet, useHideOnScroll, useIsDesktop } from './ui.jsx'
import { Link, navigate } from '../../router.jsx'
import { CITIES } from '../../search/catalog.js'
import { normalize, searchUrl } from '../../search/search.js'

const PRODUCER_URL = 'https://sobre.uhuu.com/Venda-Na-Uhuu'

// Coordenadas aproximadas para o "Perto de mim" escolher a cidade mais próxima
const COORDS = {
  Aracaju: [-10.91, -37.07],
  Curitiba: [-25.43, -49.27],
  'Belo Horizonte': [-19.92, -43.94],
  Fortaleza: [-3.73, -38.52],
  'Rio de Janeiro': [-22.91, -43.17],
  'São Paulo': [-23.55, -46.63],
  'Porto Alegre': [-30.03, -51.23],
  Sorocaba: [-23.5, -47.46],
  'Rio Branco': [-9.97, -67.81],
  'Rio Grande': [-32.03, -52.1],
  'Ribeirão Preto': [-21.18, -47.81],
  Florianópolis: [-27.59, -48.55],
}

/** Cabeçalho Navbar (desktop 6647:43003, mobile 5549:26459) */
export default function Header() {
  const isDesktop = useIsDesktop()
  const hidden = useHideOnScroll(!isDesktop)
  const [menu, setMenu] = useState(false)
  const [cities, setCities] = useState(false)
  const { user } = useAuth()

  const openCities = () => {
    setMenu(false)
    setCities(true)
  }

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b border-line bg-white transition-transform duration-300 ${hidden ? '-translate-y-full' : ''}`}
      >
        <div className="page-x flex items-center justify-between gap-4 py-4 md:py-[18px]">
          <Link to="/" className="flex h-10 shrink-0 items-center" aria-label="Uhuu.com — página inicial">
            <img src={asset('logo.svg')} alt="Uhuu.com" className="h-8 w-[102.9px]" />
          </Link>

          {/* Desktop */}
          <nav className="hidden items-center gap-5 md:flex" aria-label="Principal">
            <Pill as="a" href={PRODUCER_URL} size="sm" className="hidden lg:inline-flex">
              Faça seu evento na Uhuu
            </Pill>
            <span className="hidden h-6 w-px bg-line lg:block" aria-hidden />
            <div className="flex items-center gap-2">
              <Pill variant="outlineNeutral" size="sm" icon={asset('ic-place.svg')} onClick={openCities} font="font-ui">
                Selecione a cidade
              </Pill>
              <CartButton />
              <AccountButton />
            </div>
          </nav>

          {/* Mobile */}
          <div className="flex items-center gap-5 md:hidden">
            <span className="h-6 w-px bg-line" aria-hidden />
            <div className="flex items-center gap-6">
              <CartButton bordered />
              <button
                type="button"
                onClick={() => setMenu(true)}
                aria-label="Abrir menu"
                aria-expanded={menu}
                className="flex size-[38px] items-center justify-center rounded-lg border border-line bg-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
              >
                <img src={asset('ic-menu.svg')} alt="" className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modal nav - mobile (light) — Figma 5543:22420 */}
      <Sheet open={menu} onClose={() => setMenu(false)} labelledBy="menu-title">
        <h2 id="menu-title" className="sr-only">
          Menu
        </h2>
        <nav className="flex flex-col gap-4 px-4 pb-8 pt-8" aria-label="Menu">
          {user ? (
            <>
              <p className="text-center font-ui text-sm text-ink-2">
                Olá, <strong className="text-ink">{user.email}</strong>
              </p>
              <Pill variant="outlineNeutral" size="sm" className="w-full" onClick={() => (logout(), setMenu(false))}>
                Sair da conta
              </Pill>
            </>
          ) : (
            <Pill size="sm" className="w-full" onClick={() => (setMenu(false), openLogin())}>
              Entrar
            </Pill>
          )}
          <Pill variant="outlineNeutral" size="sm" icon={asset('ic-place.svg')} className="w-full" onClick={openCities}>
            Selecione a cidade
          </Pill>
          <Pill as="a" href={PRODUCER_URL} variant="outlineBrand" size="sm" className="w-full">
            Faça seu evento na Uhuu
          </Pill>
        </nav>
      </Sheet>

      <CityPicker open={cities} onClose={() => setCities(false)} />
    </>
  )
}

/** "Entrar" ou, com sessão, "Minha Conta" com opção de sair. */
function AccountButton() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user)
    return (
      <Pill size="sm" onClick={() => openLogin()}>
        Entrar
      </Pill>
    )
  return (
    <div ref={ref} className="relative">
      <Pill size="sm" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu">
        Minha Conta
      </Pill>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-line bg-white p-3 shadow-xl">
          <p className="truncate px-2 pb-2 font-ui text-xs text-ink-3">{user.email}</p>
          <button
            type="button"
            role="menuitem"
            onClick={() => (logout(), setOpen(false))}
            className="w-full rounded-lg px-2 py-2 text-left font-ui text-sm font-semibold text-ink hover:bg-body-2"
          >
            Sair da conta
          </button>
        </div>
      )}
    </div>
  )
}

function CartButton({ bordered = false }) {
  return (
    <button
      type="button"
      aria-label="Carrinho, 0 itens"
      className={`relative flex size-[38px] items-center justify-center rounded-lg ${
        bordered ? 'border border-line bg-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]' : 'hover:bg-body-2'
      }`}
    >
      <img src={asset('ic-cart.svg')} alt="" className="size-4" />
      <span className="absolute -right-1 -top-1 rounded-full border border-line bg-white px-[5.5px] py-px font-ui text-[10px] font-medium leading-4 text-ink-2 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
        0
      </span>
    </button>
  )
}

/** "modal cidades - nav" (Figma 6462:31335): busca, Perto de mim e lista de cidades. */
function CityPicker({ open, onClose }) {
  const [filter, setFilter] = useState('')
  const [geo, setGeo] = useState('')
  const list = useMemo(() => {
    const f = normalize(filter)
    return f ? CITIES.filter((c) => normalize(c.name).includes(f)) : CITIES
  }, [filter])

  const pick = (city) => {
    onClose()
    setFilter('')
    navigate(searchUrl({ cidade: city }))
  }

  const nearMe = () => {
    if (!navigator.geolocation) return setGeo('Seu navegador não permite localização.')
    setGeo('Buscando sua localização…')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const dist = ([la, lo]) => (la - coords.latitude) ** 2 + (lo - coords.longitude) ** 2
        const nearest = Object.entries(COORDS).sort((a, b) => dist(a[1]) - dist(b[1]))[0][0]
        setGeo('')
        pick(nearest)
      },
      () => setGeo('Não conseguimos acessar sua localização.'),
      { timeout: 8000 },
    )
  }

  return (
    <Sheet open={open} onClose={onClose} title="Selecione a cidade">
      <div className="px-4 pb-6">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Busque pela cidade"
          aria-label="Buscar cidade"
          className="h-[46px] w-full rounded-full border border-line px-[22px] font-ui text-[15px] text-ink outline-none placeholder:text-ink-3 focus:border-brand"
        />
      </div>
      <ul className="mx-4 border-t border-line pb-4">
        <li className="border-b border-line">
          <button type="button" onClick={nearMe} className="flex w-full items-center gap-2 px-4 py-5 text-left font-ui text-base font-medium text-ink hover:bg-body-2">
            <img src={asset('ic-gps.svg')} alt="" className="size-4 brightness-0" />
            Perto de mim
          </button>
          {geo && (
            <p role="status" className="px-4 pb-4 font-ui text-sm text-ink-3">
              {geo}
            </p>
          )}
        </li>
        {list.map((c) => (
          <li key={c.name} className="border-b border-line">
            <button type="button" onClick={() => pick(c.name)} className="w-full px-4 py-5 text-left font-ui text-base font-medium text-ink hover:bg-body-2">
              {c.name}
            </button>
          </li>
        ))}
        {list.length === 0 && <li className="px-4 py-5 text-sm text-ink-3">Nenhuma cidade encontrada</li>}
      </ul>
    </Sheet>
  )
}
