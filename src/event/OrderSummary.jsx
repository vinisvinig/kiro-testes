// Resumo do pedido (coluna direita, Figma 9401:52957) e barra fixa de compra no celular.
import { useEffect, useId, useRef, useState } from 'react'
import { useModalBehavior } from '../components/home/ui.jsx'
import { SERVICE_FEE, comboDetail, sessionTitle } from './eventData.js'
import { Card, Eyebrow, Ico, brl } from './parts.jsx'

export const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

export const SUMMARY_ID = 'resumo-pedido'

/** Itens, valores, total e código validador: compartilhado entre o card (desktop) e a barra expandida (mobile). */
function SummaryDetails({ order, derived: d, dispatch }) {
  const empty = d.count === 0
  return (
    <>
      <div className="border-t border-line pt-4">
        {empty ? (
          <p className="font-ui text-xs text-ink-3">Nenhum ingresso selecionado</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {d.lines.map((l) => (
              <SummaryLine key={l.key} line={l} codeOk={d.codeOk} onRemove={() => dispatch({ type: 'removeLine', key: l.groupKey, fare: l.fare?.id ?? null, combo: l.kind === 'combo' })} />
            ))}
          </ul>
        )}
      </div>

      <dl className="flex flex-col gap-1.5 border-t border-line pt-4 font-ui text-xs text-ink-2">
        <Row label="Ingressos" value={empty ? 'R$ -' : brl(d.subtotal)} />
        <Row label={`Taxa de serviço, ${SERVICE_FEE * 100}%`} value={empty ? 'R$ -' : brl(d.fee)} />
        <Row label="Possível taxa de parcelamento" value={empty ? 'até R$ -' : `até ${brl(d.installmentFee)}`} />
      </dl>

      <div className="border-t border-line pt-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-base font-bold text-ink">Total à vista</span>
          <span className="text-[28px] font-bold leading-none text-ink">{brl(d.total)}</span>
        </div>
        <p className="mt-1 font-ui text-xs text-ink-3">{empty ? '-' : `Ou parcelado no cartão até 3x de ${brl(d.installment)}`}</p>
      </div>

      {/* Código validador: entre o total e o Comprar */}
      {d.validators.map((v) => (
        <ValidatorBox key={v.id} validator={v} state={order.codes[v.id]} dispatch={dispatch} />
      ))}
    </>
  )
}

const countLabel = (n) => (n === 0 ? 'Nenhum ingresso selecionado' : `${n} ${n === 1 ? 'ingresso' : 'ingressos'}`)

/** Card do resumo na coluna direita (a partir de 1024px; no celular vira a barra expansível). */
export function OrderSummary({ order, derived, dispatch, onFees, onBuy }) {
  const d = derived
  const empty = d.count === 0

  return (
    <Card as="div" id={SUMMARY_ID} className="flex scroll-mt-24 flex-col gap-5">
      <div>
        <Eyebrow>Resumo do pedido</Eyebrow>
        <p className="mt-2 text-2xl font-bold leading-tight text-ink">{countLabel(d.count)}</p>
        {d.sessions > 1 && <p className="mt-1 font-ui text-xs text-ink-3">Em {d.sessions} datas diferentes</p>}
      </div>

      <SummaryDetails order={order} derived={d} dispatch={dispatch} />

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onBuy}
          disabled={!d.canBuy}
          className="w-full rounded-full bg-brand py-[14px] font-ui text-[15px] font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-brand/30"
        >
          Comprar
        </button>
        {!d.canBuy && !empty && (
          <p className="text-center font-ui text-xs text-orange" aria-live="polite">
            {d.blocker}
          </p>
        )}
        <button type="button" onClick={onFees} className="self-center font-ui text-xs font-semibold text-brand underline hover:no-underline">
          Entenda as taxas
        </button>
      </div>
    </Card>
  )
}

function SummaryLine({ line: l, codeOk, onRemove }) {
  const isCombo = l.kind === 'combo'
  let pending = null
  if (isCombo && l.missing) pending = l.missing === 1 ? 'Falta 1 lugar' : `Faltam ${l.missing} lugares`
  else if (!isCombo && !l.fare) pending = 'Tarifa pendente'
  else if (l.fare?.validator && !codeOk(l.fare.validator)) pending = 'Validação pendente'

  const detail = isCombo ? `${l.qty}x ${l.combo.name} · ${comboDetail(l.combo)}` : `${l.qty}x ${l.fare ? l.fare.name : 'tarifa a definir'}`
  const what = isCombo ? `${l.qty}x ${l.combo.name}` : `${l.qty}x ${l.fare?.name ?? 'sem tarifa'}`

  return (
    <li className="flex items-start gap-3 rounded-xl border border-line p-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-ink">{sessionTitle(l.session)}</p>
        <p className="flex items-center gap-1.5 font-ui text-xs text-ink-2">
          {isCombo && <span className="rounded bg-combo-0 px-1 font-ui text-[10px] font-semibold text-combo">Combo</span>}
          {l.sector.name}
        </p>
        <p className="font-ui text-[11px] text-ink-3">
          {detail}
          {l.seats.length > 0 && ` · ${l.seats.join(', ')}`}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="font-ui text-xs font-bold text-ink">{isCombo || l.fare ? brl(l.amount) : '—'}</span>
        {pending && <span className="text-right font-ui text-[11px] font-semibold text-orange">{pending}</span>}
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remover ${what} de ${l.sector.name}, ${sessionTitle(l.session)}`}
        className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-danger text-danger hover:bg-[#fef2f2]"
      >
        <Ico name="trash" className="size-4" />
      </button>
    </li>
  )
}

/**
 * Código validador (Figma 8620:124904, movido para o resumo).
 * Confirma o direito a uma tarifa: BIN de cartão, código de empresa parceira etc. Não é cupom.
 */
function ValidatorBox({ validator: v, state = { value: '', status: 'idle' }, dispatch }) {
  const id = useId()
  const { value, status } = state
  const applied = status === 'applied'
  const error = status === 'error'
  const tone = applied ? 'border-[#22c55e] bg-[#f0fdf4]' : error ? 'border-danger bg-[#fef2f2]' : 'border-alert bg-[#fffbeb]'
  const submit = (e) => {
    e.preventDefault()
    if (value && !applied) dispatch({ type: 'codeApply', validator: v.id })
  }
  return (
    <form onSubmit={submit} className={`rounded-2xl border-2 p-4 ${tone}`} aria-labelledby={`${id}-t`}>
      <p id={`${id}-t`} className="text-base font-bold text-ink">
        Código validador
      </p>
      <p className="mt-1 font-ui text-xs leading-4 text-ink-2">
        Necessário para {v.tickets}x {[...v.fares].join(', ')}. {v.help}
      </p>
      <label htmlFor={`${id}-in`} className="sr-only">
        Código validador {v.name}
      </label>
      <div className="mt-3 flex gap-2">
        <input
          id={`${id}-in`}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={20}
          placeholder={v.placeholder}
          value={value}
          readOnly={applied}
          onChange={(e) => dispatch({ type: 'codeInput', validator: v.id, value: e.target.value })}
          aria-invalid={error}
          aria-describedby={`${id}-st`}
          className={`h-11 min-w-0 flex-1 rounded-xl border-2 bg-white px-3 font-ui text-sm tracking-widest text-ink outline-none focus:border-brand ${error ? 'border-danger' : 'border-line'}`}
        />
        {applied ? (
          <button
            type="button"
            onClick={() => dispatch({ type: 'codeInput', validator: v.id, value: '' })}
            className="h-11 shrink-0 rounded-full border border-brand px-4 font-ui text-sm font-semibold text-brand hover:border-brand-700 hover:text-brand-700"
          >
            Alterar
          </button>
        ) : (
          <button type="submit" disabled={!value} className="h-11 shrink-0 rounded-full bg-brand px-5 font-ui text-sm font-semibold text-white hover:brightness-110 disabled:bg-brand/40">
            Validar
          </button>
        )}
      </div>
      <p id={`${id}-st`} className={`mt-2 flex items-center gap-1.5 font-ui text-xs font-semibold ${applied ? 'text-success' : error ? 'text-danger' : 'text-ink-2'}`} aria-live="polite">
        <Ico name={applied ? 'checkCircle' : error ? 'error' : 'info'} className="size-4" />
        {applied ? `Código validado para ${v.tickets} ${v.tickets === 1 ? 'ingresso' : 'ingressos'}.` : error ? 'Código não reconhecido. Confira ou escolha outra tarifa.' : 'Aguardando validação'}
      </p>
      {!applied && <p className="mt-1 font-ui text-[11px] text-ink-3">Simulação: use 123456 como código válido.</p>}
    </form>
  )
}

function Row({ label, value, className = '' }) {
  return (
    <div className={`flex items-center justify-between gap-2 ${className}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

/**
 * Resumo do pedido no celular (Figma 9977:125080): barra fixa com seta, quantidade, total e Comprar.
 * A seta expande o resumo completo (itens, valores e código validador) acima da barra.
 */
export function MobileBuyBar({ order, derived: d, dispatch, onFees, onBuy }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const panel = useRef(null)
  useModalBehavior(open, () => setOpen(false))
  useEffect(() => {
    if (open) panel.current?.focus()
  }, [open])

  return (
    <div className="lg:hidden">
      {open && <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} aria-hidden />}
      <div className="fixed inset-x-0 bottom-0 z-40 flex max-h-[85dvh] flex-col border-t border-line bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        {open && (
          <div
            ref={panel}
            id={panelId}
            role="region"
            aria-label="Resumo do pedido"
            tabIndex={-1}
            className="flex min-h-0 flex-col gap-5 overflow-y-auto px-4 pb-2 pt-5 outline-none"
          >
            <div>
              <Eyebrow>Resumo do pedido</Eyebrow>
              <p className="mt-2 text-2xl font-bold leading-tight text-ink">{countLabel(d.count)}</p>
              {d.sessions > 1 && <p className="mt-1 font-ui text-xs text-ink-3">Em {d.sessions} datas diferentes</p>}
            </div>
            <SummaryDetails order={order} derived={d} dispatch={dispatch} />
            <button type="button" onClick={onFees} className="flex items-center gap-1.5 self-start font-ui text-sm font-semibold text-brand underline hover:no-underline">
              <Ico name="info" className="size-4" /> Entenda as taxas
            </button>
          </div>
        )}

        <div className={`flex items-center gap-6 p-4 ${open ? 'border-t border-line' : ''}`}>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? 'Recolher resumo do pedido' : 'Ver resumo do pedido'}
            className="-m-1 flex shrink-0 items-center gap-6 rounded-lg p-1 text-left"
          >
            <Ico name="expand" className={`size-8 text-ink transition-transform ${open ? '' : 'rotate-180'}`} />
            <span className="flex flex-col gap-1 whitespace-nowrap">
              <span className="text-xs font-light leading-4 text-ink-3">
                {d.count} {d.count === 1 ? 'ingresso' : 'ingressos'} • total à vista
              </span>
              <span className="text-xl font-semibold leading-none text-black">{brl(d.total)}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={onBuy}
            disabled={!d.canBuy}
            className="min-w-0 flex-1 rounded-full bg-brand px-6 py-[14px] font-ui text-[15px] font-semibold leading-[18px] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-brand/30"
          >
            Comprar
          </button>
        </div>
        {/* Pendência (ex.: código validador): toca e abre o resumo para resolver */}
        {!d.canBuy && d.count > 0 && !open && (
          <button type="button" onClick={() => setOpen(true)} className="-mt-2 block truncate px-4 pb-3 text-left font-ui text-[11px] text-orange underline">
            {d.blocker}
          </button>
        )}
        {!d.canBuy && d.count > 0 && open && (
          <p className="px-4 pb-3 text-center font-ui text-xs text-orange" aria-live="polite">
            {d.blocker}
          </p>
        )}
      </div>
    </div>
  )
}
