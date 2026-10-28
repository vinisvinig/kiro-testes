// Aba "Comprar ingressos": data → modalidade → setores (individual) ou combos + resumo.
// A data e a modalidade ficam sempre abertas (só destacam o que foi escolhido), porque o
// pedido pode ter ingressos de várias datas e misturar ingressos individuais e combos.
// Figma: 8522:122498 (sessão), 8592:124686 (individual), 8604:125959 (com assento),
// 8609:123478 (tarifa por assento), 9828:108002 (combos por setor), 9401:52957 (resumo).
import { useEffect, useRef, useState } from 'react'
import {
  COMBOS,
  COMBO_LIMIT,
  SECTORS,
  SECTOR_LIMIT,
  SEAT_ROWS,
  SERVICE_FEE,
  SESSIONS,
  comboItemsLabel,
  comboPrice,
  faresFor,
  minFare,
  occupiedFor,
} from './eventData.js'
import { keyOf, roomIn, takenElsewhere } from './order.js'
import { Badge, Card, CardTitle, Eyebrow, Ico, InfoBanner, Note, Stepper, VenueMap, brl } from './parts.jsx'
import { OrderSummary, MobileBuyBar } from './OrderSummary.jsx'
import { useDragScroll } from '../components/home/ui.jsx'

/** Taxa de serviço sempre com valor (exigência do decreto), em 12px. */
const Fee = ({ value, as: Tag = 'span', className = '' }) => (
  <Tag className={`font-ui text-xs leading-4 ${className || 'text-ink-3'}`}>+ taxa {brl(value * SERVICE_FEE)}</Tag>
)

const MAP_ID = 'mapa-evento'

export default function BuyTab({ order, dispatch, derived, session, onFees, onBuy }) {
  const listRef = useRef(null)

  const pickSession = (id) => id !== order.sessionId && dispatch({ type: 'session', id })
  const pickModality = (m) => {
    if (m !== order.modality) dispatch({ type: 'modality', modality: m })
    requestAnimationFrame(() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  const showList = session && order.modality
  // Mapa referencial agora é estático (só para o usuário se localizar). Interação desativada, mantida para reuso:
  // const openFromMap = (sectorId) => {
  //   if (!showList) return
  //   // No combo, abre o primeiro combo do setor clicado; no individual, o próprio setor.
  //   const target = order.modality === 'combo' ? COMBOS.find((c) => c.sector === sectorId)?.id : sectorId
  //   if (!target) return
  //   if (order.open !== target) dispatch({ type: 'open', id: target })
  //   requestAnimationFrame(() => document.getElementById(`item-${target}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  // }
  const toMap = () => document.getElementById(MAP_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="page-x py-6 md:py-8">
      <div className={`mx-auto grid gap-6 ${order.sessionId ? 'lg:grid-cols-[minmax(0,1fr)_360px]' : 'max-w-[744px]'}`}>
        <div className="flex min-w-0 flex-col gap-6">
          <SessionPicker selected={order.sessionId} counts={derived.bySession} onPick={pickSession} />

          {session && <ModalityPicker session={session} selected={order.modality} onPick={pickModality} />}

          {showList && (
            <div ref={listRef} className="scroll-mt-24">
              {order.modality === 'combo' ? (
                <Combos order={order} dispatch={dispatch} session={session} onMap={toMap} />
              ) : (
                <Sectors order={order} dispatch={dispatch} session={session} onMap={toMap} />
              )}
            </div>
          )}

          <div id={MAP_ID} className="scroll-mt-24">
            {/* Estático: sem clique nem destaque do setor aberto. Versão interativa:
                <VenueMap onPick={showList ? openFromMap : undefined} active={showList ? (COMBOS.find((c) => c.id === order.open)?.sector ?? order.open) : undefined} /> */}
            <VenueMap />
          </div>
        </div>

        {order.sessionId && (
          <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
            <OrderSummary order={order} derived={derived} dispatch={dispatch} onFees={onFees} onBuy={onBuy} />
          </aside>
        )}
      </div>
      {order.sessionId && <MobileBuyBar order={order} derived={derived} dispatch={dispatch} onFees={onFees} onBuy={onBuy} />}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sessão: "Escolha uma data ou passaporte" (sempre aberta)            */
/* ------------------------------------------------------------------ */
function SessionPicker({ selected, counts, onPick }) {
  const railRef = useRef(null)
  useDragScroll(railRef)
  const [calendar, setCalendar] = useState(false)
  const scroll = (d) => railRef.current?.scrollBy({ left: d * 300, behavior: 'smooth' })

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <Eyebrow>Sessão</Eyebrow>
          <CardTitle className="mt-2">Escolha uma data ou passaporte</CardTitle>
        </div>
        <div className="hidden gap-2 md:flex">
          {[
            [-1, 'left', 'Datas anteriores'],
            [1, 'right', 'Próximas datas'],
          ].map(([d, icon, label]) => (
            <button key={icon} type="button" onClick={() => scroll(d)} aria-label={label} className="flex size-[38px] items-center justify-center rounded-full border border-ink-800 hover:bg-body-3">
              <Ico name={icon} />
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-5">
        <div ref={railRef} className="uhuu-scroll flex snap-x gap-3 overflow-x-auto pb-3" role="listbox" aria-label="Sessões disponíveis">
          <button
            type="button"
            onClick={() => setCalendar((v) => !v)}
            aria-expanded={calendar}
            className="flex w-[56px] shrink-0 flex-col items-center justify-center gap-2 rounded-xl border border-line bg-white px-1 py-3 text-ink hover:border-brand"
          >
            <Ico name="calendar" className="size-5" />
            <span className="text-center font-ui text-[10px] leading-3 text-brand">Selecionar data</span>
          </button>
          {SESSIONS.map((s) => {
            const active = s.id === selected
            const n = counts[s.id] || 0
            return (
              <button
                key={s.id}
                type="button"
                role="option"
                aria-selected={active}
                aria-label={`${s.dow} ${s.label}, ${s.soldOut ? 'esgotado' : s.time}${n ? `, ${n} no pedido` : ''}`}
                disabled={s.soldOut}
                onClick={() => onPick(s.id)}
                className={`flex shrink-0 snap-start flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left transition ${s.kind === 'passaporte' ? 'w-[108px]' : 'w-[92px]'} ${
                  active ? 'border-brand bg-brand text-white' : 'border-line bg-white text-ink hover:border-brand'
                } disabled:cursor-not-allowed disabled:bg-body-2 disabled:opacity-60 disabled:hover:border-line`}
              >
                {s.kind === 'passaporte' ? (
                  <span className={`rounded px-1.5 py-0.5 font-ui text-[10px] font-medium leading-3 ${active ? 'bg-white text-brand' : 'bg-brand text-white'}`}>Passaporte</span>
                ) : (
                  <span className={`font-ui text-[10px] font-medium uppercase leading-4 ${active ? 'text-white' : 'text-ink-2'}`}>{s.dow}</span>
                )}
                <span className="mt-1 text-sm font-semibold leading-5">{s.label}</span>
                <span className={`text-lg font-bold leading-6 ${active ? 'text-white' : s.soldOut ? 'text-ink-3' : 'text-brand'}`}>{s.soldOut ? 'Esgotado' : s.time}</span>
                {n > 0 && (
                  <span className={`mt-0.5 rounded-full px-1.5 font-ui text-[10px] font-semibold leading-4 ${active ? 'bg-white text-brand' : 'bg-brand-0 text-brand'}`}>{n} no pedido</span>
                )}
              </button>
            )
          })}
        </div>
        {calendar && <CalendarPopover selected={selected} onPick={(id) => (setCalendar(false), onPick(id))} onClose={() => setCalendar(false)} />}
      </div>
    </Card>
  )
}

/** Calendário de novembro/2026 com as datas disponíveis (Figma 8529:121216). */
function CalendarPopover({ selected, onPick, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const onDown = (e) => !ref.current?.contains(e.target) && onClose()
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])
  const first = new Date(2026, 10, 1).getDay()
  const byDay = Object.fromEntries(SESSIONS.filter((s) => s.kind === 'data').map((s) => [Number(s.id.slice(-2)), s]))
  const cells = [...Array(first).fill(null), ...Array.from({ length: 30 }, (_, i) => i + 1)]
  return (
    <div ref={ref} className="absolute left-0 top-full z-20 mt-2 w-[300px] rounded-2xl border border-line bg-white p-4 shadow-xl" role="dialog" aria-label="Calendário de sessões">
      <p className="text-center text-base font-bold text-ink">Novembro 2026</p>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center font-ui text-[11px] text-ink-3">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
        {cells.map((d, i) => {
          const s = d && byDay[d]
          if (!d) return <span key={i} />
          const ok = s && !s.soldOut
          return (
            <button
              key={i}
              type="button"
              disabled={!ok}
              onClick={() => onPick(s.id)}
              aria-label={ok ? `${d} de novembro, ${s.time}` : `${d} de novembro, indisponível`}
              className={`flex aspect-square items-center justify-center rounded-full text-sm ${
                s?.id === selected ? 'bg-brand font-bold text-white' : ok ? 'font-semibold text-ink hover:bg-brand-0' : 'text-ink-4'
              } ${s?.soldOut ? 'line-through' : ''}`}
            >
              {d}
            </button>
          )
        })}
      </div>
      <p className="mt-3 font-ui text-[11px] text-ink-3">Datas em destaque têm sessão às 20:30.</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Modalidade: "Como você quer comprar?" (sempre aberta)               */
/* ------------------------------------------------------------------ */
function ModalityPicker({ session, selected, onPick }) {
  const open = SECTORS.filter((s) => !s.soldOut)
  const individualFrom = Math.min(...open.map((s) => minFare(s, session)))
  const comboFrom = Math.min(...COMBOS.map((c) => comboPrice(c, session)))
  const opts = [
    { id: 'individual', title: 'Ingresso individual', desc: 'Escolha tipos e quantidades.', from: individualFrom, icon: 'ticket', on: 'bg-brand', iconIdle: 'bg-brand-0 text-brand', iconOn: 'bg-brand-0 text-brand' },
    { id: 'combo', title: 'Combos', desc: 'Pacotes de ingressos com benefícios.', from: comboFrom, icon: 'ticket', on: 'bg-combo', iconIdle: 'bg-combo-0 text-combo', iconOn: 'bg-combo-0 text-combo' },
  ]
  return (
    <Card>
      <CardTitle>Como você quer comprar?</CardTitle>
      <div className="mt-6 grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Modalidade do ingresso">
        {opts.map((o) => {
          const on = selected === o.id
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onPick(o.id)}
              className={`flex items-center gap-3 rounded-[14px] border p-4 text-left transition ${on ? `${o.on} border-transparent text-white` : 'border-line bg-body text-ink hover:border-ink-4'}`}
            >
              <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${on ? o.iconOn : o.iconIdle}`}>
                <Ico name={o.icon} className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold leading-6">{o.title}</span>
                <span className={`block font-ui text-xs leading-4 ${on ? 'text-white' : 'text-ink-3'}`}>{o.desc}</span>
              </span>
              <span className={`flex flex-col items-end ${on ? 'text-white' : ''}`}>
                <span className={`font-ui text-[10px] font-medium leading-4 ${on ? '' : 'text-ink-3'}`}>A partir de</span>
                <span className="text-sm font-semibold leading-5">{brl(o.from)}</span>
                <Fee value={o.from} className={on ? 'text-white' : ''} />
              </span>
            </button>
          )
        })}
      </div>
    </Card>
  )
}

/** "Ver mapa completo": rola até o Mapa referencial do evento (estático) no fim da página. */
const MapButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-2 rounded-full border border-brand px-4 py-[10px] font-ui text-[15px] font-semibold leading-none text-brand hover:bg-brand-0"
  >
    Ver mapa completo <Ico name="pin" className="size-[14px]" />
  </button>
)

/* ------------------------------------------------------------------ */
/* Setores (ingresso individual): "Escolha onde você quer ficar"       */
/* ------------------------------------------------------------------ */
function Sectors({ order, dispatch, session, onMap }) {
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Eyebrow>Setores</Eyebrow>
          <CardTitle className="mt-2">Escolha onde você quer ficar</CardTitle>
        </div>
        <MapButton onClick={onMap} />
      </div>

      <ul className="mt-6 flex flex-col gap-4">
        {/* Esgotados sempre por último, mantendo a ordem original dos demais */}
        {[...SECTORS.filter((s) => !s.soldOut), ...SECTORS.filter((s) => s.soldOut)].map((s) => {
          const k = keyOf(order.sessionId, s.id)
          const count = s.kind === 'assento' ? (order.seats[k] || []).length : Object.values(order.qty[k] || {}).reduce((a, n) => a + n, 0)
          const open = !s.soldOut && order.open === s.id
          return (
            <li key={s.id} id={`item-${s.id}`} className="scroll-mt-28">
              <SectorRow sector={s} session={session} open={open} onToggle={() => dispatch({ type: 'open', id: s.id })} count={count} />
              {open && (
                <div className="mt-2">
                  {s.kind === 'assento' ? (
                    <SeatBody sector={s} order={order} dispatch={dispatch} session={session} />
                  ) : (
                    <FreeBody sector={s} order={order} dispatch={dispatch} session={session} />
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

function SectorRow({ sector, session, open, onToggle, count }) {
  const icon = sector.kind === 'assento' ? 'seat' : 'ticket'
  const disabled = sector.soldOut
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-expanded={disabled ? undefined : open}
      className={`flex w-full items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-left transition md:gap-4 ${
        open ? 'border-brand ring-1 ring-brand' : 'border-line hover:border-ink-4'
      } disabled:cursor-not-allowed disabled:bg-body-2 disabled:hover:border-line`}
    >
      {/* No celular o ícone fica oculto para sobrar espaço ao nome e ao preço (Figma 9986:126801) */}
      <Ico name={icon} className={`hidden size-6 md:block ${disabled ? 'text-ink-4' : 'text-ink'}`} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <Badge tone={disabled ? 'muted' : 'brand'}>{sector.badge}</Badge>
          {count > 0 && <span className="rounded-full bg-brand-0 px-2 py-0.5 font-ui text-[10px] font-semibold text-brand">{count} selecionado{count > 1 ? 's' : ''}</span>}
        </span>
        <span className={`mt-1 block text-lg font-semibold leading-6 ${disabled ? 'text-ink-3' : 'text-ink'}`}>{sector.name}</span>
        <span className="block font-ui text-xs leading-4 text-ink-3">{sector.lot}</span>
      </span>
      {disabled ? (
        <span className="rounded-full bg-ink-2 px-6 py-1 font-ui text-[11px] font-medium text-white">Esgotado</span>
      ) : (
        <>
          <span className="flex flex-col items-end text-right">
            <span className="font-ui text-[11px] text-ink-3">a partir de</span>
            <span className="text-lg font-bold leading-6 text-brand">{brl(minFare(sector, session))}</span>
            <Fee value={minFare(sector, session)} />
          </span>
          <span className="flex size-9 items-center justify-center rounded-full bg-body-3 text-ink">
            <Ico name="expand" className={`size-5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </span>
        </>
      )}
    </button>
  )
}

/** Aviso abaixo de uma tarifa que exige código validador (o campo fica no resumo do pedido). */
const ValidatorHint = () => (
  <p className="flex items-center gap-1.5 rounded-xl bg-[#fffbeb] px-3 py-2 font-ui text-xs text-ink-2">
    <Ico name="info" className="size-4 text-alert" />
    Este tipo de ingresso pede um código validador. Informe no resumo do pedido, acima do botão Comprar.
  </p>
)

/* Setor livre (pista / sem assento) */
function FreeBody({ sector, order, dispatch, session }) {
  const fares = faresFor(sector, session)
  const q = order.qty[keyOf(order.sessionId, sector.id)] || {}
  const room = roomIn(order, sector.id)

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-body-2 p-3 md:p-4">
      {fares.map((f) => {
        const n = q[f.id] || 0
        return (
          <div key={f.id} className={`rounded-2xl border bg-white transition ${n > 0 ? 'border-brand' : 'border-line'}`}>
            {/* Celular (Figma 9986:126783): tarifa e preço na mesma linha, quantidade abaixo à direita, sem ícone */}
            <div className="flex flex-col items-end gap-3 p-4 md:flex-row md:items-center">
              <Ico name="ticket" className="hidden size-6 text-ink md:block" />
              <div className="flex w-full min-w-0 flex-1 items-start gap-3 md:items-center">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="text-sm font-bold leading-5 text-ink md:text-base md:font-semibold">{f.name}</p>
                  <p className="text-xs leading-4 text-ink-2 md:font-ui md:text-ink-3">{f.desc}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
                  <p className="text-sm font-bold leading-5 text-ink">{brl(f.price)}</p>
                  <Fee value={f.price} as="p" />
                </div>
              </div>
              <Stepper label={f.name} value={n} canAdd={room > 0} onChange={(v) => dispatch({ type: 'qty', sector: sector.id, fare: f.id, n: v })} />
            </div>
            {f.validator && n > 0 && (
              <div className="px-3 pb-3">
                <ValidatorHint />
              </div>
            )}
          </div>
        )
      })}
      <Note>Limite de {SECTOR_LIMIT} ingressos por pedido neste setor, em cada data.</Note>
    </div>
  )
}

/* Mapa de assentos (compartilhado entre ingresso individual e combo) */
function SeatMap({ sector, occupied, selected, full, onToggle, hint, fareFor }) {
  // Com `fareFor`, clicar no assento abre o balão de tarifas dentro do mapa (estilo seats.io).
  const wrap = useRef(null)
  const rail = useRef(null)
  const [pop, setPop] = useState(null) // { id, x, y, above }
  const click = (id, e) => {
    if (!fareFor) return onToggle(id)
    const w = wrap.current.getBoundingClientRect()
    const b = e.currentTarget.getBoundingClientRect()
    const x = Math.min(Math.max(b.left + b.width / 2 - w.left, 152), w.width - 152)
    // Abre para cima quando o assento está na metade de baixo do mapa
    const above = b.top - w.top > w.height / 2
    setPop({ id, x, y: above ? b.top - w.top - 8 : b.bottom - w.top + 8, above })
  }
  useEffect(() => {
    if (!pop) return
    const close = () => setPop(null)
    const r = rail.current
    r?.addEventListener('scroll', close, { passive: true })
    window.addEventListener('resize', close)
    return () => {
      r?.removeEventListener('scroll', close)
      window.removeEventListener('resize', close)
    }
  }, [pop])
  return (
    <div ref={wrap} className="relative rounded-2xl border border-line bg-white p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-base font-semibold text-ink">{sector.name}</p>
        <p className="font-ui text-xs text-ink-3">{hint}</p>
      </div>
      <div className="mt-4 rounded-md bg-ink-dark py-2 text-center font-ui text-xs font-semibold uppercase text-white">Palco</div>
      <div ref={rail} className="no-scrollbar mt-5 overflow-x-auto">
        <div className="mx-auto flex w-max flex-col gap-3" role="grid" aria-label={`Mapa de assentos — ${sector.name}`}>
          {SEAT_ROWS.map((row) => (
            <div key={row[0]} role="row" className="flex items-end gap-2 md:gap-3">
              <span className="w-4 pb-5 font-ui text-xs font-semibold text-ink-3" aria-hidden>
                {row[0][0]}
              </span>
              {row.map((id, i) => {
                const taken = occupied.has(id)
                const isSel = selected.has(id)
                const blocked = taken || (!isSel && full)
                return (
                  <div key={id} role="gridcell" className={`flex flex-col items-center gap-1 ${i === 4 ? 'ml-3 md:ml-5' : ''}`}>
                    <button
                      type="button"
                      onClick={(e) => click(id, e)}
                      disabled={blocked}
                      aria-pressed={isSel}
                      aria-haspopup={fareFor ? 'dialog' : undefined}
                      aria-expanded={fareFor ? pop?.id === id : undefined}
                      aria-label={`Assento ${id}${taken ? ', ocupado' : isSel ? ', selecionado' : ', disponível'}`}
                      className={`flex size-8 items-center justify-center rounded-md border transition md:size-9 ${
                        isSel
                          ? 'border-brand bg-brand text-white'
                          : taken
                            ? 'cursor-not-allowed border-body-3 bg-body-3 text-ink-4'
                            : full
                              ? 'cursor-not-allowed border-line bg-white text-ink-4'
                              : 'border-ink-4 bg-white text-ink hover:border-brand hover:text-brand'
                      }`}
                    >
                      <Ico name="seat" className="size-4" />
                    </button>
                    <span className={`font-ui text-[10px] ${isSel && fareFor?.(id) ? 'font-semibold text-brand' : 'text-ink-3'}`}>{isSel && fareFor?.(id) ? fareFor(id).short : id}</span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-6 font-ui text-xs text-ink-3">
        <span className="flex items-center gap-1.5">
          <i className="size-2.5 rounded-sm border border-ink-4 bg-white" /> Disponível
        </span>
        <span className="flex items-center gap-1.5 text-brand">
          <i className="size-2.5 rounded-sm bg-brand" /> Selecionado
        </span>
        <span className="flex items-center gap-1.5">
          <i className="size-2.5 rounded-sm bg-ink-3" /> Ocupado
        </span>
      </div>
      {pop && fareFor && (
        <FarePopover
          sector={sector}
          seat={pop.id}
          current={selected.has(pop.id) ? fareFor(pop.id)?.id : null}
          fares={fareFor.fares}
          style={{ left: pop.x, top: pop.y, transform: `translate(-50%, ${pop.above ? '-100%' : '0'})` }}
          onPick={(fare) => (fareFor.pick(pop.id, fare), setPop(null))}
          onRemove={selected.has(pop.id) ? () => (onToggle(pop.id), setPop(null)) : null}
          onClose={() => setPop(null)}
        />
      )}
    </div>
  )
}

/** Balão de tarifas do assento (referência seats.io): seção, linha e assento + lista de tarifas. */
function FarePopover({ sector, seat, current, fares, style, onPick, onRemove, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    ref.current?.querySelector('[role=radio]')?.focus()
    const onDown = (e) => !ref.current?.contains(e.target) && !e.target.closest?.('[role=gridcell]') && onClose()
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [seat, onClose])
  const cell = (label, value) => (
    <div className="flex flex-col items-center justify-center px-3 py-2 text-center">
      <span className="font-ui text-[9px] font-medium uppercase tracking-wide text-ink-3">{label}</span>
      <span className="text-base font-bold leading-tight text-ink">{value}</span>
    </div>
  )
  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={`Tarifa do assento ${seat}`}
      style={style}
      className="absolute z-30 w-[288px] overflow-hidden rounded-2xl border border-line bg-white shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
    >
      <div className="grid grid-cols-[1fr_auto_auto] divide-x divide-line border-b border-line">
        {cell('Seção', sector.name)}
        {cell('Linha', seat[0])}
        {cell('Assento', seat.slice(1))}
      </div>
      <p className="bg-body-2 px-4 py-2 font-ui text-xs font-semibold text-brand">Escolha a tarifa</p>
      <div className="flex max-h-[220px] flex-col gap-2 overflow-y-auto bg-body-2 px-3 pb-3" role="radiogroup" aria-label="Tarifas">
        {fares.map((f) => (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={current === f.id}
            onClick={() => onPick(f.id)}
            className={`flex items-center justify-between gap-3 rounded-xl border bg-white px-3 py-3 text-left transition hover:border-brand focus-visible:border-brand focus-visible:outline-none ${
              current === f.id ? 'border-brand ring-1 ring-brand' : 'border-line'
            }`}
          >
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-tight text-ink">{f.name}</span>
              {f.validator && <span className="mt-0.5 block font-ui text-[10px] text-ink-3">Pede código validador</span>}
            </span>
            <span className="flex shrink-0 flex-col items-end">
              <span className="text-sm font-bold text-ink">{brl(f.price)}</span>
              <Fee value={f.price} />
            </span>
          </button>
        ))}
      </div>
      <div className="flex gap-2 border-t border-line bg-white p-3">
        {onRemove && (
          <button type="button" onClick={onRemove} className="flex-1 rounded-full border border-danger py-2 font-ui text-sm font-semibold text-danger hover:bg-[#fef2f2]">
            Remover
          </button>
        )}
        <button type="button" onClick={onClose} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-ink-3 py-2 font-ui text-sm font-semibold text-white hover:bg-ink-2">
          <Ico name="close" className="size-4" /> Cancelar
        </button>
      </div>
    </div>
  )
}

function SeatChips({ ids, onRemove }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ids.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onRemove(id)}
          aria-label={`Remover assento ${id}`}
          className="group flex items-center gap-1.5 rounded-full border border-brand bg-white px-3 py-1 font-ui text-xs font-semibold text-ink hover:bg-brand-0"
        >
          <Ico name="seat" className="size-3.5" />
          {id}
          <Ico name="close" className="size-3.5 text-ink-3 group-hover:text-brand" />
        </button>
      ))}
    </div>
  )
}

/* Lugar marcado, ingresso individual: a tarifa é escolhida no próprio mapa */
const SHORT = { inteira: 'Inteira', meia: 'Meia', banrisul: 'Banrisul' }

function SeatBody({ sector, order, dispatch, session }) {
  const k = keyOf(order.sessionId, sector.id)
  const fares = faresFor(sector, session)
  const mine = order.seats[k] || []
  const occupied = new Set([...occupiedFor(order.sessionId), ...takenElsewhere(order, sector.id, k)])
  const needsCode = mine.some((s) => fares.find((f) => f.id === s.fare)?.validator)
  const toggle = (seat) => dispatch({ type: 'seat', sector: sector.id, seat })
  const fareOf = (id) => fares.find((f) => f.id === mine.find((s) => s.id === id)?.fare)

  const fareFor = Object.assign((id) => {
    const f = fareOf(id)
    return f && { ...f, short: SHORT[f.id] || f.name }
  }, { fares, pick: (seat, fare) => dispatch({ type: 'seatPick', sector: sector.id, seat, fare }) })

  return (
    <div className="flex flex-col gap-3">
      <InfoBanner>Clique em um assento disponível no mapa e escolha a tarifa (inteira, meia etc.) ali mesmo.</InfoBanner>
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-body-2 p-3 md:p-4">
        <SeatMap
          sector={sector}
          occupied={occupied}
          selected={new Set(mine.map((s) => s.id))}
          full={mine.length >= SECTOR_LIMIT}
          onToggle={toggle}
          fareFor={fareFor}
          hint={`Selecione até ${SECTOR_LIMIT} assentos`}
        />
        {mine.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-base font-semibold text-ink">
              {mine.length} {mine.length === 1 ? 'assento selecionado' : 'assentos selecionados'}
            </p>
            <ul className="flex flex-col gap-2">
              {mine.map((s) => {
                const f = fareOf(s.id)
                return (
                  <li key={s.id} className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand font-ui text-xs font-semibold text-white">{s.id}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink">{f?.name}</span>
                      <span className="block font-ui text-xs text-ink-3">
                        Linha {s.id[0]} · Assento {s.id.slice(1)} · {f ? `${brl(f.price)} + taxa ${brl(f.price * SERVICE_FEE)}` : ''}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => toggle(s.id)}
                      aria-label={`Remover assento ${s.id}`}
                      className="flex size-8 items-center justify-center rounded-lg border border-danger text-danger hover:bg-[#fef2f2]"
                    >
                      <Ico name="trash" className="size-4" />
                    </button>
                  </li>
                )
              })}
            </ul>
            <Note>Para trocar a tarifa, clique de novo no assento no mapa.</Note>
            {needsCode && <ValidatorHint />}
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Combos disponíveis (Figma 9828:108506)                              */
/* ------------------------------------------------------------------ */
function Combos({ order, dispatch, session, onMap }) {
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Eyebrow>Combo</Eyebrow>
          <CardTitle className="mt-1">Combos disponíveis</CardTitle>
        </div>
        <MapButton onClick={onMap} />
      </div>

      <ul className="mt-6 flex flex-col gap-4">
        {COMBOS.map((c) => {
          const sector = SECTORS.find((s) => s.id === c.sector)
          const state = order.combos[keyOf(order.sessionId, c.id)] || { n: 0, seats: [] }
          const seated = sector.kind === 'assento'
          const open = seated && order.open === c.id
          return (
            <li key={c.id} id={`item-${c.id}`} className="scroll-mt-28">
              <ComboRow
                combo={c}
                sector={sector}
                session={session}
                state={state}
                open={open}
                onToggle={() => dispatch({ type: 'open', id: c.id })}
                onQty={(n) => dispatch({ type: 'comboQty', combo: c.id, n })}
              />
              {open && (
                <div className="mt-2">
                  <ComboSeats combo={c} sector={sector} order={order} state={state} dispatch={dispatch} />
                </div>
              )}
            </li>
          )
        })}
      </ul>
      <Note className="mt-4">As tarifas de cada combo já estão incluídas. Nos combos com assento marcado, escolha todos os lugares no mapa para liberar a compra.</Note>
    </Card>
  )
}

function ComboRow({ combo, sector, session, state, open, onToggle, onQty }) {
  const seated = sector.kind === 'assento'
  const price = comboPrice(combo, session)
  const missing = seated ? state.n * combo.size - state.seats.length : 0
  const selected = state.n > 0
  const body = (
    <>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-combo text-white">
        <Ico name="ticket" className="size-6" />
      </span>
      <span className="grid min-w-0 flex-1 gap-2 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] md:items-center md:gap-4">
        <span className="min-w-0">
          <span className="block text-base font-semibold leading-6 text-ink">{combo.name}</span>
          <span className="block font-ui text-xs leading-4 text-ink-3">{combo.desc}</span>
        </span>
        <span className="min-w-0">
          <Badge>{sector.badge}</Badge>
          <span className="mt-1 block text-lg font-bold leading-tight text-ink">{sector.name}</span>
        </span>
        <span className="flex items-baseline gap-2 md:flex-col md:items-end md:gap-0">
          <span className="text-sm font-semibold leading-5 text-ink">{brl(price)}</span>
          <Fee value={price} />
        </span>
        {selected && (
          <span className="flex flex-wrap gap-2 md:col-span-3">
            <span className="rounded-full bg-combo-0 px-2 py-0.5 font-ui text-[10px] font-semibold text-combo">
              {seated ? 'No pedido' : `${state.n} ${state.n === 1 ? 'combo' : 'combos'} no pedido`}
            </span>
            {missing > 0 && (
              <span className="rounded-full bg-[#fffbeb] px-2 py-0.5 font-ui text-[10px] font-semibold text-orange">
                {missing === 1 ? 'Falta 1 lugar' : `Faltam ${missing} lugares`}
              </span>
            )}
          </span>
        )}
      </span>
    </>
  )
  const frame = `flex w-full items-center gap-4 rounded-[14px] border bg-body p-4 text-left transition ${
    open || selected ? 'border-combo ring-1 ring-combo' : 'border-line hover:border-ink-4'
  }`

  // Com assento marcado: a linha expande o mapa para escolher os lugares (1 combo = 1 mapa).
  if (seated) {
    return (
      <button type="button" onClick={onToggle} aria-expanded={open} className={frame}>
        {body}
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-body-3 text-ink">
          <Ico name="expand" className={`size-5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
    )
  }
  // Setor livre: basta a quantidade, não há mapa nem tarifa para escolher.
  return (
    <div className={`${frame} max-md:flex-wrap`}>
      {body}
      <div className="max-md:flex max-md:basis-full max-md:justify-end">
        <Stepper label={combo.name} value={state.n} canAdd={state.n < COMBO_LIMIT} onChange={onQty} />
      </div>
    </div>
  )
}

function ComboSeats({ combo, sector, order, state, dispatch }) {
  const k = keyOf(order.sessionId, combo.id)
  const needed = combo.size
  const chosen = state.seats.length
  const occupied = new Set([...occupiedFor(order.sessionId), ...takenElsewhere(order, sector.id, k)])
  const toggle = (seat) => dispatch({ type: 'comboSeat', combo: combo.id, seat })
  const done = chosen === needed

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-body-2 p-3 md:p-4">
      <InfoBanner>
        Escolha os {combo.size} lugares deste combo no mapa: {comboItemsLabel(combo)}. As tarifas já estão incluídas.
      </InfoBanner>
      <div className="rounded-2xl border border-line bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-ink">
            {chosen} de {needed} lugares
          </p>
          <p className={`font-ui text-xs font-semibold ${done ? 'text-success' : 'text-orange'}`} aria-live="polite">
            {done ? 'Todos os lugares escolhidos' : needed - chosen === 1 ? 'Falta 1' : `Faltam ${needed - chosen}`}
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-body-3" role="progressbar" aria-valuemin={0} aria-valuemax={needed} aria-valuenow={chosen} aria-label={`Lugares escolhidos no ${combo.name}`}>
          <div className={`h-full rounded-full transition-all ${done ? 'bg-success' : 'bg-combo'}`} style={{ width: `${(chosen / needed) * 100}%` }} />
        </div>
        {chosen > 0 && !done && <p className="mt-2 font-ui text-xs text-ink-3">O botão Comprar fica disponível quando todos os lugares deste combo forem escolhidos.</p>}
      </div>

      <SeatMap
        sector={sector}
        occupied={occupied}
        selected={new Set(state.seats)}
        full={chosen >= needed}
        onToggle={toggle}
        hint={`Escolha exatamente ${needed} lugares`}
      />
      {chosen > 0 && <SeatChips ids={state.seats} onRemove={toggle} />}
    </div>
  )
}
