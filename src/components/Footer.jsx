import SocialIcon from './SocialIcon.jsx'

const linkColumns = [
  {
    title: 'Eventos',
    links: ['Shows', 'Teatro', 'Festas e baladas', 'Cursos e workshops', 'Games e Geek'],
  },
  {
    title: 'Institucional',
    links: ['Sobre nós', 'Trabalhe conosco', 'Imprensa', 'Blog', 'Contato'],
  },
  {
    title: 'Ajuda',
    links: ['Central de ajuda', 'Como comprar', 'Meus ingressos', 'Termos de uso', 'Privacidade'],
  },
]

const socials = ['facebook', 'instagram', 'twitter', 'youtube', 'tiktok']

export default function Footer() {
  return (
    <footer className="bg-brand-darker text-white/80 mt-16">
      <div className="mx-auto max-w-7xl px-4 py-12 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
        {/* Marca + social */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-pink font-extrabold text-white">E</span>
            <span className="text-lg font-extrabold tracking-tight text-white">eventos</span>
          </div>
          <p className="mt-4 text-sm max-w-xs">
            A plataforma para descobrir e comprar ingressos para os melhores eventos da sua cidade.
          </p>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Redes sociais</p>
            <div className="mt-3 flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s}
                  href="#"
                  aria-label={s}
                  className="grid place-items-center w-9 h-9 rounded-full bg-white/10 hover:bg-brand-pink transition-colors text-white"
                >
                  <SocialIcon name={s} className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Formas de pagamento</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {['VISA', 'MASTER', 'ELO', 'AMEX', 'PIX', 'BOLETO'].map((p) => (
                <span
                  key={p}
                  className="text-[10px] font-bold px-2 py-1 rounded bg-white text-gray-700"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Colunas de links */}
        {linkColumns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-white">{col.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-white transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Selos + copyright */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>© {new Date().getFullYear()} Eventos. Todos os direitos reservados.</p>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-green-600 text-white font-semibold">Site Seguro</span>
            <span className="px-2.5 py-1 rounded bg-white/10 text-white font-semibold">SSL 256 bits</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
