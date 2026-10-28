import { useEffect, useRef, useState } from 'react'
import { asset } from './ui.jsx'
import { heroSlides } from './data.js'
import { Link } from '../../router.jsx'
import SearchBox from '../../search/SearchBox.jsx'

/** Seção Hero Busca e Banner (Figma 6384:38275) */
export default function SearchHero() {
  return (
    <section className="flex flex-col bg-body md:gap-6 md:pb-6 md:pt-10">
      {/* z-30: o dropdown do autocomplete precisa ficar acima do banner */}
      <div className="relative z-30 md:px-10">
        <SearchBox variant="home" />
      </div>
      <div className="hidden md:block">
        <BannerCarousel slides={heroSlides} />
      </div>
      <MobileBanner slides={heroSlides} />
    </section>
  )
}

/** Banner Carrossel mobile (Figma 6133:37830): 358×477, raio 24, legenda à esquerda, arrastável. */
function MobileBanner({ slides }) {
  const [i, setI] = useState(0)
  const ref = useRef(null)
  const onScroll = () => {
    const el = ref.current
    if (el) setI(Math.round(el.scrollLeft / (el.firstChild?.offsetWidth + 8 || 1)))
  }
  const goTo = (n) => {
    const el = ref.current
    el?.scrollTo({ left: n * (el.firstChild.offsetWidth + 8), behavior: 'smooth' })
  }
  return (
    <div className="relative px-4 py-16 md:hidden">
      <div ref={ref} onScroll={onScroll} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 scroll-px-4">
        {slides.map((s) => (
          <Link key={s.title} to={s.href} className="relative flex h-[477px] w-full shrink-0 snap-start flex-col justify-end overflow-hidden rounded-3xl">
            <img src={s.image} alt="" className="absolute inset-0 size-full object-cover" />
            <div className="relative flex flex-col items-start gap-3 bg-black/50 p-4 pb-6">
              <span className="rounded-md bg-brand px-[14px] py-[11px] text-xs font-medium leading-4 text-white">{s.period}</span>
              <p className="text-3xl font-bold leading-none text-white">{s.title}</p>
              <div className="h-1.5" />
            </div>
          </Link>
        ))}
      </div>
      <div className="absolute bottom-[84px] left-8 flex gap-2">
        {slides.map((s, n) => (
          <button
            key={s.title}
            type="button"
            aria-label={`Ir para o slide ${n + 1}`}
            aria-current={n === i}
            onClick={() => goTo(n)}
            className={`h-1.5 rounded-full transition-all ${n === i ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  )
}

function BannerCarousel({ slides }) {
  const [index, setIndex] = useState(1) // o Figma mostra o 2º slide ativo
  const go = (dir) => setIndex((i) => (i + dir + slides.length) % slides.length)

  useEffect(() => {
    const id = setInterval(() => go(1), 6000)
    return () => clearInterval(id)
  }, [index])

  return (
    <div className="page-x">
      {/* Mesma largura do conteúdo (1264), alinhado ao logo e às seções; as setas ficam por cima/para fora */}
      <div className="relative mx-auto max-w-content">
        {/* Sem overflow-hidden: os banners vizinhos aparecem nas margens, à esquerda e à direita (Figma 6384:38279).
            Uma cópia do último antes e do primeiro depois garante vizinhos nas pontas. */}
        <div className="rounded-2xl">
          <div
            className="flex gap-10 transition-transform duration-700 ease-out"
            style={{ transform: `translateX(calc(${-(index + 1)} * (100% + 40px)))` }}
          >
            {[slides.at(-1), ...slides, slides[0]].map((s, k) => {
              const i = k - 1
              return (
              <Link
                key={k}
                to={s.href}
                aria-hidden={i !== index}
                tabIndex={i === index ? 0 : -1}
                onClick={(e) => {
                  // Clicar num vizinho traz ele para o centro em vez de abrir o evento
                  if (i !== index) {
                    e.preventDefault()
                    setIndex((i + slides.length) % slides.length)
                  }
                }}
                className="relative flex h-[300px] w-full shrink-0 items-end overflow-hidden rounded-2xl md:h-[420px]"
              >
                <img src={s.image} alt="" className="absolute inset-0 size-full object-cover" />
                <div className="relative flex w-full flex-col items-center gap-5 bg-black/[.56] px-4 py-5">
                  <div className="flex flex-col items-center gap-3 pt-[10px]">
                    <span className="rounded-md bg-brand px-[14px] py-[11px] font-ui text-xs font-medium leading-4 text-white">
                      {s.period}
                    </span>
                    <p className="text-center text-3xl font-bold leading-none text-white md:text-5xl">{s.title}</p>
                  </div>
                  <div className="h-[10px]" />
                </div>
              </Link>
              )
            })}
          </div>
        </div>

        {/* Paginação */}
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((s, i) => (
            <button
              key={s.title}
              type="button"
              aria-label={`Ir para o slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`h-[10px] rounded-full transition-all ${i === index ? 'w-8 bg-white' : 'w-[10px] bg-white/50'}`}
            />
          ))}
        </div>

        {/* Setas: no Figma ficam 48px para fora do container de 1264 */}
        <ArrowButton side="left" onClick={() => go(-1)} />
        <ArrowButton side="right" onClick={() => go(1)} />
      </div>
    </div>
  )
}

function ArrowButton({ side, onClick }) {
  const pos = side === 'left' ? 'left-2 xl:-left-12' : 'right-2 xl:-right-12'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Slide anterior' : 'Próximo slide'}
      className={`absolute top-1/2 flex size-[46px] -translate-y-1/2 items-center justify-center rounded-full border border-ink bg-white transition hover:bg-body-2 ${pos}`}
    >
      <img src={asset(side === 'left' ? 'ic-hero-left.svg' : 'ic-hero-right.svg')} alt="" className="size-5" />
    </button>
  )
}
