import { asset, Skel } from './ui.jsx'
import { Link } from '../../router.jsx'

/*
 * Classes por ponto de quebra. O Tailwind precisa das classes literais no código,
 * por isso cada variante tem o próprio conjunto:
 * - md: carrosséis da home (o card desktop de 402px aparece a partir de 768px).
 * - lg: grades (casas/locais, busca). Entre 768 e 1023px as colunas são estreitas
 *   demais para o layout desktop, então o card mobile (172px) é mantido até 1024px.
 */
const BP = {
  md: {
    card: 'md:rounded-[40px]',
    media: 'md:h-[267px] md:rounded-br-[40px]',
    body: 'md:gap-4 md:p-5',
    tags: 'md:gap-2',
    tag: 'md:h-7 md:gap-1 md:border-2 md:px-4 md:py-[6px]',
    tagIcon: 'md:size-3',
    tagText: 'md:text-xs md:font-medium md:leading-4',
    mobile: 'md:hidden',
    desktop: 'md:flex',
    skel: 'md:h-[386px]',
  },
  lg: {
    card: 'lg:rounded-[40px]',
    media: 'lg:h-[267px] lg:rounded-br-[40px]',
    body: 'lg:gap-4 lg:p-5',
    tags: 'lg:gap-2',
    tag: 'lg:h-7 lg:gap-1 lg:border-2 lg:px-4 lg:py-[6px]',
    tagIcon: 'lg:size-3',
    tagText: 'lg:text-xs lg:font-medium lg:leading-4',
    mobile: 'lg:hidden',
    desktop: 'lg:flex',
    skel: 'lg:h-[386px]',
  },
}

/**
 * Card evento.
 * Desktop (Figma 5236:*): 402px, raio 40, imagem 267, caixa de data à esquerda.
 * Mobile (Figma 7930:119358): 172px, raio 20, imagem 114, data em chip "10 / JUL - qui".
 * `grid`: uso em grade (ver BP.lg) — o card ocupa a largura da coluna.
 */
export default function EventCard({
  image,
  imageClass = '',
  tags = [],
  dates,
  title,
  priceFrom,
  priceTo,
  venue,
  city,
  href,
  grid = false,
  widthClass = grid ? 'w-full' : 'w-[172px] md:w-[402px]',
}) {
  const d = dates[0]
  const b = BP[grid ? 'lg' : 'md']
  return (
    <Link
      to={href}
      draggable={false}
      className={`flex shrink-0 snap-start flex-col overflow-hidden rounded-[20px] border border-line bg-white px-px transition hover:shadow-lg ${b.card} ${widthClass}`}
    >
      <div className={`h-[114px] w-full overflow-hidden rounded-br-[20px] ${b.media}`}>
        <img src={image} alt="" loading="lazy" draggable={false} className={`size-full object-cover ${imageClass}`} />
      </div>

      <div className={`flex flex-1 flex-col gap-2 px-2 py-3 ${b.body}`}>
        {tags.length > 0 && (
          <div className={`flex flex-wrap items-center gap-1 ${b.tags}`}>
            {tags.map((t) => (
              <span key={t.label} className={`inline-flex items-center gap-0.5 rounded-full border-[1.2px] bg-white px-[6px] py-1 ${b.tag} ${t.color}`}>
                <img src={t.icon} alt="" draggable={false} className={`size-2 ${b.tagIcon}`} />
                <span className={`font-ui text-[8px] font-semibold leading-none text-ink ${b.tagText}`}>{t.label}</span>
              </span>
            ))}
          </div>
        )}

        {/* Mobile: chip de data */}
        <div className={`flex flex-col gap-1 ${b.mobile}`}>
          <span className="inline-flex items-center gap-1 self-start rounded bg-body-3 p-1">
            <img src={asset('ic-today-sm.svg')} alt="" draggable={false} className="size-2.5" />
            <span className="font-ui text-[10px] font-semibold leading-none text-ink">
              {d.day} / {d.mon} - {d.dow}
            </span>
          </span>
          <p className="font-ui text-[13px] font-bold leading-tight text-ink">{title}</p>
          <p className="font-ui text-[11px] font-semibold text-ink-2">
            De <span className="text-success">{priceFrom}</span> a <span className="text-success">{priceTo}</span>
          </p>
          <p className="font-ui text-[11px] font-medium text-ink-2">{venue}</p>
          <p className="font-ui text-[10px] font-medium text-ink-3">{city}</p>
        </div>

        {/* Desktop: caixa de data + textos */}
        <div className={`hidden gap-5 ${b.desktop}`}>
          <div className="flex w-[88px] shrink-0 items-center justify-center rounded-[22px] bg-body-3 p-2">
            {dates.map((dt, i) => (
              <div key={i} className="flex items-center">
                {i > 0 && <img src={asset('ic-date-arrow.svg')} alt="" draggable={false} className="size-3" />}
                <div className="flex flex-col items-center text-center text-ink">
                  <span className="text-sm font-medium leading-5">{dt.dow}</span>
                  <span className="text-2xl font-bold leading-none">{dt.day}</span>
                  <span className="text-sm font-semibold leading-5">{dt.mon}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2 pb-5">
            <p className="text-lg font-bold leading-tight text-ink">{title}</p>
            <p className="text-base font-semibold leading-6 text-ink-2">
              De <span className="text-success">{priceFrom}</span> a <span className="text-success">{priceTo}</span>
            </p>
            <p className="text-base font-medium leading-6 text-ink-2">{venue}</p>
            <p className="text-sm font-medium leading-5 text-ink-3">{city}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

/** Placeholder do card enquanto carrega (Figma Skeleton Card). */
export function EventCardSkeleton({ grid = false, className = '' }) {
  return <Skel className={`h-[240px] w-full ${BP[grid ? 'lg' : 'md'].skel} ${className}`} />
}

/**
 * Grade de cards: no celular/tablet as colunas têm o tamanho do card mobile da home
 * (~172px — 2 por linha no celular, mais colunas no tablet em vez de esticar o card);
 * a partir de 1024px, 3 colunas com o card desktop.
 */
export const EVENT_GRID = 'grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 lg:grid-cols-3 lg:gap-x-[29px] lg:gap-y-8'
