import { useState } from 'react'
import Icon from './Icon.jsx'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-brand-darker text-white">
      {/* Faixa superior fina */}
      <div className="hidden md:block bg-black/30">
        <div className="mx-auto max-w-7xl px-4 py-1.5 flex items-center justify-end gap-4 text-xs text-white/70">
          <a href="#" className="hover:text-white transition-colors">Central de ajuda</a>
          <span className="h-3 w-px bg-white/20" />
          <a href="#" className="hover:text-white transition-colors">Crie seu evento</a>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3 md:gap-6">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 shrink-0">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-pink font-extrabold">E</span>
          <span className="hidden sm:block text-lg font-extrabold tracking-tight">eventos</span>
        </a>

        {/* Busca */}
        <div className="flex-1 max-w-2xl">
          <label className="relative block">
            <span className="sr-only">Buscar eventos</span>
            <Icon
              name="search"
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              placeholder="Pesquise por eventos, shows, cidades..."
              className="w-full rounded-full bg-white text-gray-800 placeholder:text-gray-400 pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-pink"
            />
          </label>
        </div>

        {/* Ações desktop */}
        <nav className="hidden md:flex items-center gap-4 shrink-0 text-sm">
          <a href="#" className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors">
            <Icon name="location" className="w-4 h-4" />
            Porto Alegre
          </a>
          <a href="#" className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors">
            <Icon name="user" className="w-4 h-4" />
            Entrar
          </a>
          <a
            href="#"
            className="rounded-full bg-brand-pink hover:bg-brand-pinkDark transition-colors px-4 py-2 font-semibold"
          >
            Criar evento
          </a>
        </nav>

        {/* Botão mobile */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden p-2 -mr-2 text-white/90"
          aria-label="Abrir menu"
          aria-expanded={mobileOpen}
        >
          <Icon name="menu" className="w-6 h-6" />
        </button>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-brand-darker">
          <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1 text-sm">
            <a href="#" className="flex items-center gap-2 py-2 text-white/90">
              <Icon name="location" className="w-4 h-4" /> Porto Alegre
            </a>
            <a href="#" className="flex items-center gap-2 py-2 text-white/90">
              <Icon name="user" className="w-4 h-4" /> Entrar
            </a>
            <a
              href="#"
              className="mt-1 text-center rounded-full bg-brand-pink hover:bg-brand-pinkDark transition-colors px-4 py-2 font-semibold"
            >
              Criar evento
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
