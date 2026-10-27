import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { asset, Sheet, useIsDesktop } from '../components/home/ui.jsx'
import { normalize } from './search.js'

/** Campo em pílula (Figma _input pilled). `open` aplica o anel de foco rosa do estado aberto. */
export function FieldShell({ open, className = '', children, ...rest }) {
  return (
    <div
      className={`relative flex h-[46px] items-center rounded-full border bg-white transition-shadow ${
        open ? 'border-brand shadow-[0_0_0_4px_rgba(238,54,128,0.25)]' : 'border-line'
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

/**
 * Select próprio do design system (Figma Selectbox Cidade/Categoria/Relevância).
 * Desktop: lista suspensa de 220px. Mobile: modal "Selecione a …".
 * options: [{ value, label, icon? }]
 */
export default function Dropdown({
  label,
  sheetTitle,
  value,
  onChange,
  options,
  placeholder = true,
  searchable = false,
  className = '',
}) {
  const id = useId()
  const isDesktop = useIsDesktop()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [filter, setFilter] = useState('')
  const wrapRef = useRef(null)
  const btnRef = useRef(null)
  const current = options.find((o) => o.value === value)

  const list = useMemo(() => {
    const f = normalize(filter)
    return f ? options.filter((o) => normalize(o.label).includes(f)) : options
  }, [options, filter])

  const close = (focus = true) => {
    setOpen(false)
    setFilter('')
    if (focus) btnRef.current?.focus()
  }
  const choose = (o) => {
    onChange(o.value === value && placeholder ? '' : o.value)
    close()
  }

  useEffect(() => {
    if (!open || !isDesktop) return
    const onDown = (e) => wrapRef.current && !wrapRef.current.contains(e.target) && close(false)
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open, isDesktop])

  useEffect(() => {
    if (open) setActive(Math.max(0, list.findIndex((o) => o.value === value)))
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open && isDesktop) document.getElementById(`${id}-o-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open, isDesktop, id])

  const onKeyDown = (e) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        setOpen(true)
      }
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(list.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (list[active]) choose(list[active])
    } else if (e.key === 'Tab') {
      close(false)
    }
  }

  const option = (o, i, mobile) => {
    const selected = o.value === value
    return (
      <li
        key={o.value}
        id={`${id}-o-${i}`}
        role="option"
        aria-selected={selected}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => choose(o)}
        onMouseEnter={() => setActive(i)}
        className={`flex cursor-pointer items-center gap-2 font-ui text-sm font-medium leading-5 ${
          mobile ? 'border-b border-line px-4 py-5 text-base' : 'px-4 py-3'
        } ${selected ? 'bg-brand-0 text-brand' : 'text-ink'} ${!selected && i === active && !mobile ? 'bg-body-2' : ''}`}
      >
        {/* Os ícones de categoria são brancos (feitos para os chips rosa); no dropdown ficam pretos como no Figma */}
        {o.icon && <img src={o.icon} alt="" className="size-4 brightness-0" />}
        {o.label}
      </li>
    )
  }

  return (
    <div ref={wrapRef} className={`relative min-w-0 ${className}`}>
      <FieldShell open={open}>
        <button
          ref={btnRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-label={current ? `${label}: ${current.label}` : label}
          aria-activedescendant={open && isDesktop ? `${id}-o-${active}` : undefined}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={onKeyDown}
          className="flex h-full w-full items-center rounded-full pl-[22px] pr-4 text-left outline-none"
        >
          <span className={`flex-1 truncate font-ui text-[15px] font-medium leading-none ${current ? 'text-ink' : 'text-ink-3'}`}>
            {current ? current.label : label}
          </span>
          <img src={asset('ic-expand.svg')} alt="" className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </FieldShell>

      {open && isDesktop && (
        <ul
          id={`${id}-list`}
          role="listbox"
          aria-label={label}
          className="uhuu-dropdown absolute left-0 top-[calc(100%+6px)] z-40 max-h-[192px] w-[220px] overflow-y-auto rounded-xl border border-line bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
        >
          {list.map((o, i) => option(o, i, false))}
        </ul>
      )}

      <Sheet open={open && !isDesktop} onClose={() => close()} title={sheetTitle || `Selecione a ${label.toLowerCase()}`}>
        {searchable && (
          <div className="px-4 pb-6">
            <input
              autoFocus
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={`Busque pela ${label.toLowerCase()}`}
              aria-label={`Buscar ${label.toLowerCase()}`}
              className="h-[46px] w-full rounded-full border border-line px-[22px] font-ui text-[15px] text-ink outline-none placeholder:text-ink-3 focus:border-brand"
            />
          </div>
        )}
        <ul id={`${id}-list`} role="listbox" aria-label={label} className="mx-4 border-t border-line pb-4">
          {list.map((o, i) => option(o, i, true))}
          {list.length === 0 && <li className="px-4 py-5 text-sm text-ink-3">Nenhum resultado</li>}
        </ul>
      </Sheet>
    </div>
  )
}
