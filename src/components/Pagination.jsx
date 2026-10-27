import { asset } from './home/ui.jsx'
import { Link } from '../router.jsx'
import { pageWindow } from '../search/search.js'

/**
 * Pagination (Figma 5408:76310): ‹ 1 2 3 ••• 10 ›
 * Use `hrefFor` para paginar pela URL ou `onPage` para paginar no estado local.
 */
export default function Pagination({ page, pages, hrefFor, onPage }) {
  if (pages <= 1) return null

  const Item = ({ p, label, className, children, current }) => {
    const common = { 'aria-label': label, 'aria-current': current ? 'page' : undefined, className }
    return hrefFor ? (
      <Link to={hrefFor(p)} {...common}>
        {children}
      </Link>
    ) : (
      <button type="button" onClick={() => onPage(p)} {...common}>
        {children}
      </button>
    )
  }

  const arrow = (target, icon, label) =>
    target < 1 || target > pages ? (
      <span className="flex h-[38px] items-center px-3 opacity-30" aria-hidden>
        <img src={asset(icon)} alt="" className="size-4" />
      </span>
    ) : (
      <Item p={target} label={label} className="flex h-[38px] items-center rounded-full px-3 hover:bg-body-3">
        <img src={asset(icon)} alt="" className="size-4" />
      </Item>
    )

  return (
    <nav aria-label="Paginação" className="flex justify-center">
      <div className="flex items-center">
        {arrow(page - 1, 'pg-left.svg', 'Página anterior')}
        {pageWindow(page, pages).map((n, i) =>
          n === '…' ? (
            <span key={`e${i}`} aria-hidden className="flex size-[38px] items-center justify-center font-ui text-xs font-medium text-[#6b7280]">
              •••
            </span>
          ) : (
            <Item
              key={n}
              p={n}
              label={`Página ${n}`}
              current={n === page}
              className={`flex size-[38px] items-center justify-center rounded-full font-ui text-base font-medium leading-6 text-ink ${
                n === page ? 'border border-brand' : 'hover:bg-body-3'
              }`}
            >
              {n}
            </Item>
          ),
        )}
        {arrow(page + 1, 'pg-right.svg', 'Próxima página')}
      </div>
    </nav>
  )
}
