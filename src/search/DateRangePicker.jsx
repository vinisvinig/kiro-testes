import { useEffect, useRef, useState } from 'react'
import { asset, Sheet, useIsDesktop } from '../components/home/ui.jsx'
import { FieldShell } from './Dropdown.jsx'

/* ---------- datas (sempre em horário local, formato ISO yyyy-mm-dd) ---------- */
const pad = (n) => String(n).padStart(2, '0')
export const toIso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const fromIso = (s) => (s ? new Date(`${s}T12:00:00`) : null)
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12)
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1, 12)
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1, 12)
const br = (s) => (s ? s.split('-').reverse().join('/') : '')

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

/** Atalhos do Figma (Date Range List). */
function presets() {
  const t = new Date()
  const today = new Date(t.getFullYear(), t.getMonth(), t.getDate(), 12)
  const endOfWeek = addDays(today, 6 - today.getDay())
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 12)
  return [
    { id: 'hoje', label: 'Hoje', de: toIso(today), ate: toIso(today) },
    { id: 'amanha', label: 'Amanhã', de: toIso(addDays(today, 1)), ate: toIso(addDays(today, 1)) },
    { id: 'semana', label: 'Nesta semana', de: toIso(today), ate: toIso(endOfWeek) },
    { id: 'mes', label: 'Este Mês', de: toIso(today), ate: toIso(endOfMonth) },
  ]
}

export const formatRange = (de, ate) => (!de ? '' : !ate || ate === de ? br(de) : `${br(de)} - ${br(ate)}`)

/**
 * Campo "Data (Período)" com calendário de intervalo.
 * Desktop: popover com atalhos + 2 meses (Figma 5363:21015), aplica ao escolher.
 * Mobile: modal com atalhos em chips + 1 mês + Cancelar/Aplicar (Figma "modal data").
 */
export default function DateRangePicker({ de, ate, onChange, className = '' }) {
  const isDesktop = useIsDesktop()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState({ de, ate })
  const wrapRef = useRef(null)
  const btnRef = useRef(null)

  useEffect(() => {
    if (open) setDraft({ de, ate })
  }, [open, de, ate])

  useEffect(() => {
    if (!open || !isDesktop) return
    const onDown = (e) => wrapRef.current && !wrapRef.current.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && (setOpen(false), btnRef.current?.focus())
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, isDesktop])

  const commit = (v) => {
    onChange(v)
    setOpen(false)
    btnRef.current?.focus()
  }

  const text = formatRange(de, ate)

  return (
    <div ref={wrapRef} className={`relative min-w-0 ${className}`}>
      <FieldShell open={open}>
        <button
          ref={btnRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={text ? `Período: ${text}` : 'Escolher data'}
          onClick={() => setOpen((o) => !o)}
          className="flex h-full w-full items-center rounded-full pl-[22px] pr-4 text-left outline-none"
        >
          <span className={`flex-1 truncate font-ui text-[15px] font-medium leading-none ${text ? 'text-ink' : 'text-ink-3'}`}>
            {text || 'Data'}
          </span>
          {text ? (
            <span
              role="button"
              tabIndex={0}
              aria-label="Limpar data"
              onClick={(e) => {
                e.stopPropagation()
                onChange({ de: '', ate: '' })
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  onChange({ de: '', ate: '' })
                }
              }}
              className="flex size-5 items-center justify-center rounded-full hover:bg-body-2"
            >
              <img src={asset('ic-close.svg')} alt="" className="size-3.5" />
            </span>
          ) : (
            <img src={asset('ic-calendar.svg')} alt="" className="size-4" />
          )}
        </button>
      </FieldShell>

      {open && isDesktop && (
        <div
          role="dialog"
          aria-label="Escolher período"
          className="absolute left-1/2 top-[calc(100%+6px)] z-40 flex -translate-x-1/2 overflow-hidden rounded-xl border border-line bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] xl:left-auto xl:right-0 xl:translate-x-0 2xl:left-1/2 2xl:right-auto 2xl:-translate-x-1/2"
        >
          <PresetList draft={draft} onPick={(p) => commit({ de: p.de, ate: p.ate })} onCustom={() => setDraft({ de: '', ate: '' })} />
          <div className="w-px bg-line" />
          <RangeCalendar
            months={2}
            value={draft}
            onChange={(v) => {
              setDraft(v)
              if (v.de && v.ate) commit(v)
            }}
          />
        </div>
      )}

      <Sheet
        open={open && !isDesktop}
        onClose={() => setOpen(false)}
        title="Selecione a data"
      >
        <div className="flex flex-col gap-6 px-4 pb-4">
          <PresetChips draft={draft} onPick={(p) => setDraft(p ? { de: p.de, ate: p.ate } : { de: '', ate: '' })} />
          <div className="overflow-hidden rounded-xl border border-line">
            <RangeCalendar months={1} value={draft} onChange={setDraft} compact />
            <div className="flex justify-end gap-3 border-t border-line px-4 py-5">
              <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-ink px-4 py-[10px] font-ui text-[15px] font-semibold leading-none text-ink">
                Cancelar
              </button>
              <button type="button" onClick={() => commit(draft)} className="rounded-full bg-brand px-4 py-[10px] font-ui text-[15px] font-semibold leading-none text-white">
                Aplicar
              </button>
            </div>
          </div>
        </div>
      </Sheet>
    </div>
  )
}

function activePreset(draft) {
  return presets().find((p) => p.de === draft.de && p.ate === draft.ate)?.id || (draft.de ? 'custom' : '')
}

function PresetList({ draft, onPick, onCustom }) {
  const act = activePreset(draft)
  const item = (id, label, onClick) => (
    <button
      key={id}
      type="button"
      onClick={onClick}
      aria-pressed={act === id}
      className={`w-full whitespace-nowrap rounded-lg border px-4 py-[10px] text-left font-ui text-sm font-medium leading-5 text-ink ${
        act === id ? 'border-line bg-white' : 'border-transparent hover:bg-white'
      }`}
    >
      {label}
    </button>
  )
  return (
    <div className="flex w-[200px] shrink-0 flex-col gap-1 bg-[#fafafa] p-4">
      {presets().map((p) => item(p.id, p.label, () => onPick(p)))}
      {item('custom', 'Período personalizado', onCustom)}
    </div>
  )
}

function PresetChips({ draft, onPick }) {
  const act = activePreset(draft)
  return (
    <div className="uhuu-scroll -mx-4 flex gap-2 overflow-x-auto px-4 pb-3">
      {presets().map((p) => {
        const on = act === p.id
        return (
          <button
            key={p.id}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(on ? null : p)}
            className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-[10px] font-ui text-sm font-medium leading-none ${
              on ? 'border-transparent bg-[#f8a5c8] text-ink' : 'border-brand text-brand'
            }`}
          >
            {on && <span aria-hidden>✓</span>}
            {p.label}
            {on && (
              <span aria-hidden className="flex size-4 items-center justify-center rounded-full bg-brand text-[10px] text-white">
                ✕
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/** Calendário de intervalo: 1º clique = início, 2º = fim (inverte se vier antes). */
function RangeCalendar({ months, value, onChange, compact = false }) {
  const todayIso = toIso(new Date())
  const [view, setView] = useState(() => startOfMonth(fromIso(value.de) || new Date()))
  const [hover, setHover] = useState('')

  const pick = (iso) => {
    if (!value.de || value.ate) return onChange({ de: iso, ate: '' })
    if (iso < value.de) return onChange({ de: iso, ate: value.de })
    onChange({ de: value.de, ate: iso })
  }

  const end = value.ate || (value.de && hover > value.de ? hover : '')

  return (
    <div className={`flex gap-8 ${compact ? 'p-4' : 'px-6 pb-4 pt-5'}`}>
      {Array.from({ length: months }, (_, m) => {
        const month = addMonths(view, m)
        const first = month.getDay()
        const days = Array.from({ length: 42 }, (_, i) => addDays(month, i - first))
        return (
          <div key={m} className={`flex shrink-0 flex-col ${compact ? 'w-full max-w-[308px]' : 'w-[322px]'}`}>
            <div className="flex items-center justify-between">
              {m === 0 ? (
                <button type="button" aria-label="Mês anterior" onClick={() => setView(addMonths(view, -1))} className="flex size-8 items-center justify-center rounded-full hover:bg-body-2">
                  <img src={asset('ic-chevron-left.svg')} alt="" className="size-4" />
                </button>
              ) : (
                <span className="size-8" />
              )}
              <p className="font-ui text-lg font-medium leading-none text-ink" aria-live="polite">
                {MONTHS[month.getMonth()]} de {month.getFullYear()}
              </p>
              {m === months - 1 ? (
                <button type="button" aria-label="Próximo mês" onClick={() => setView(addMonths(view, 1))} className="flex size-8 items-center justify-center rounded-full hover:bg-body-2">
                  <img src={asset('ic-chevron-right.svg')} alt="" className="size-4" />
                </button>
              ) : (
                <span className="size-8" />
              )}
            </div>
            <div className="grid grid-cols-7 pb-4 pt-6">
              {WEEK.map((w) => (
                <span key={w} className={`text-center font-ui text-sm font-medium leading-5 text-ink-3 ${compact ? 'w-11' : 'w-[46px]'}`}>
                  {w}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1" role="grid" onMouseLeave={() => setHover('')}>
              {days.map((d) => {
                const iso = toIso(d)
                const outside = d.getMonth() !== month.getMonth()
                const past = iso < todayIso
                const disabled = outside || past
                const isStart = iso === value.de
                const isEnd = iso === end
                const inRange = value.de && end && iso > value.de && iso < end
                const edge = isStart || isEnd
                return (
                  <div
                    key={iso}
                    className={`flex justify-center ${compact ? 'h-11' : 'h-[46px]'} ${
                      !outside && (inRange || (edge && value.de && end && value.de !== end)) ? 'bg-[#f5f5f5]' : ''
                    } ${!outside && isStart && end && value.de !== end ? 'rounded-l-full' : ''} ${!outside && isEnd && value.de !== end ? 'rounded-r-full' : ''}`}
                  >
                    <button
                      type="button"
                      disabled={disabled}
                      aria-label={d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      aria-pressed={edge}
                      onClick={() => pick(iso)}
                      onMouseEnter={() => setHover(iso)}
                      className={`flex items-center justify-center rounded-full font-ui text-sm font-medium leading-5 ${compact ? 'size-11' : 'size-[46px]'} ${
                        outside
                          ? 'text-line'
                          : edge
                            ? 'bg-brand text-white'
                            : past
                              ? 'text-line'
                              : 'text-ink hover:bg-brand-0'
                      }`}
                    >
                      {d.getDate()}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
