// Peças compartilhadas pela Página do evento e pela seleção de ingressos.
import { useEffect, useRef } from 'react'
import { useModalBehavior } from '../components/home/ui.jsx'

export const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/* ------------------------------------------------------------------ */
/* Ícones (Material Symbols, preenchidos)                              */
/* ------------------------------------------------------------------ */
const PATHS = {
  ticket:
    'M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-9 7.5h-2v-2h2v2zm0-4.5h-2v-2h2v2zm0-4.5h-2v-2h2v2z',
  seat: 'M4 18v3h3v-3h10v3h3v-6H4zm15-8h3v3h-3zM2 10h3v3H2zm15 3H7V5c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v8z',
  check: 'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  checkCircle: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  info: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  error: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  warning: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
  trash: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  timer:
    'M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61 1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z',
  calendar:
    'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z',
  expand: 'M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z',
  left: 'M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z',
  right: 'M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
  plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  minus: 'M19 13H5v-2h14v2z',
  tag: 'M21.41 11.41l-8.83-8.83c-.37-.37-.88-.58-1.41-.58H4c-1.1 0-2 .9-2 2v7.17c0 .53.21 1.04.59 1.41l8.83 8.83c.78.78 2.05.78 2.83 0l7.17-7.17c.78-.78.78-2.04-.01-2.83zM6.5 8C5.67 8 5 7.33 5 6.5S5.67 5 6.5 5 8 5.67 8 6.5 7.33 8 6.5 8z',
  card: 'M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z',
  pix: 'M12 2.5 7.25 7.25 12 12l4.75-4.75zM7.25 16.75 12 21.5l4.75-4.75L12 12zM2.5 12l4.75 4.75L12 12 7.25 7.25zM16.75 7.25 12 12l4.75 4.75L21.5 12z',
  close: 'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  photos: 'M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4 2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z',
  star: 'M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  gift: 'M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 12 7.4l3.38 4.6L17 10.83 14.92 8H20v6z',
  pin: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z',
  shield: 'M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z',
  club: 'M20 2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h4v5l4-2 4 2v-5h4c1.11 0 2-.89 2-2V4c0-1.11-.89-2-2-2zm0 13H4v-2h16v2zm0-5H4V4h16v6z',
  truck:
    'M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9 1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
  box: 'M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5 6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z',
  copy: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z',
  lock: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
  coin: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z',
  download: 'M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z',
  print: 'M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z',
  moneyOff:
    'M12.5 6.9c1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-.53.12-1.03.3-1.48.54l1.47 1.47c.41-.17.91-.27 1.51-.27zM5.33 4.06 4.06 5.33 7.5 8.77c0 2.08 1.56 3.21 3.91 3.91l3.51 3.51c-.34.48-1.05.91-2.42.91-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c.96-.18 1.82-.55 2.45-1.12l2.22 2.22 1.27-1.27L5.33 4.06z',
  arrowLeft: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
  alarmOff:
    'M10.04 6.29C10.66 6.11 11.32 6 12 6c3.86 0 7 3.14 7 7 0 .68-.11 1.34-.29 1.96l1.56 1.56c.47-1.08.73-2.27.73-3.52 0-4.97-4.03-9-9-9-1.25 0-2.44.26-3.53.72l1.57 1.57zm7.297-4.48 4.607 3.845-1.28 1.535-4.61-3.843zM3.02 2.1 1.61 3.51l1.37 1.37-.92.77 1.28 1.54 1.06-.88.8.8C3.83 8.69 3 10.75 3 13c0 4.97 4.02 9 9 9 2.25 0 4.31-.83 5.89-2.2l2.2 2.2 1.41-1.41L3.02 2.1zM12 20c-3.86 0-7-3.14-7-7 0-1.7.61-3.26 1.62-4.47l9.85 9.85C15.26 19.39 13.7 20 12 20zM7.48 3.73l.46-.38-1.28-1.54-.6.5z',
  alarmAdd:
    'm7.88 3.39-1.28-1.53L2 5.71l1.29 1.53 4.59-3.85zM22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9a9 9 0 0 0 0-18zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm1-11h-2v3H8v2h3v3h2v-3h3v-2h-3V9z',
  help: 'M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z',
}

export function Ico({ name, className = 'size-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={`shrink-0 ${className}`}>
      <path d={PATHS[name]} />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Blocos de layout                                                    */
/* ------------------------------------------------------------------ */

/** Cartão branco com borda (Figma: raio 24, borda #d4d4d4, padding 24). */
export function Card({ as: Tag = 'section', className = '', children, ...rest }) {
  return (
    <Tag className={`rounded-3xl border border-line bg-white p-4 md:p-6 ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

export const Eyebrow = ({ children, className = '' }) => (
  <p className={`font-ui text-xs font-medium uppercase leading-4 tracking-wide text-brand ${className}`}>{children}</p>
)

export const CardTitle = ({ children, as: Tag = 'h2', className = '' }) => (
  <Tag className={`text-xl font-bold leading-tight text-ink md:text-2xl ${className}`}>{children}</Tag>
)

/** Selo pequeno com borda (ex.: SETOR LIVRE, ASSENTO MARCADO, COMBO). */
export function Badge({ children, tone = 'brand' }) {
  const tones = {
    brand: 'border-brand text-brand',
    combo: 'border-combo text-combo',
    muted: 'border-ink-4 text-ink-3',
  }
  return <span className={`inline-flex rounded-md border px-1.5 py-0.5 font-ui text-[10px] font-medium uppercase leading-3 ${tones[tone]}`}>{children}</span>
}

/** Botão +/- com contador (Figma Stepper). */
export function Stepper({ value, onChange, min = 0, canAdd = true, label }) {
  const btn = 'flex size-8 items-center justify-center rounded-full transition disabled:cursor-not-allowed'
  return (
    <div className="flex items-center gap-2" role="group" aria-label={`Quantidade de ${label}`}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Remover um ingresso ${label}`}
        className={`${btn} bg-body-3 text-ink hover:bg-line disabled:bg-body-2 disabled:text-ink-4`}
      >
        <Ico name="minus" className="size-4" />
      </button>
      <span className="w-6 text-center font-ui text-sm font-semibold text-ink" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={!canAdd}
        aria-label={`Adicionar um ingresso ${label}`}
        className={`${btn} bg-body-3 text-ink hover:bg-line disabled:bg-body-2 disabled:text-ink-4`}
      >
        <Ico name="plus" className="size-4" />
      </button>
    </div>
  )
}

/** Nota de rodapé com ícone de informação. */
export const Note = ({ children, className = '' }) => (
  <p className={`flex items-start gap-1.5 font-ui text-xs leading-4 text-ink-3 ${className}`}>
    <Ico name="info" className="mt-px size-3.5 text-ink-3" />
    <span>{children}</span>
  </p>
)

/** Faixa azul de orientação (Figma: Semânticas/Info 50). */
export const InfoBanner = ({ children, title }) => (
  <div className="flex items-start gap-3 rounded-2xl border border-info bg-[#eff6ff] px-4 py-3">
    {!title && <Ico name="info" className="mt-0.5 size-5 text-info" />}
    <div className="flex flex-col gap-1">
      {title && <p className="text-base font-bold leading-6 text-ink md:text-lg">{title}</p>}
      <p className="font-ui text-sm leading-5 text-ink-2">{children}</p>
    </div>
  </div>
)

/* ------------------------------------------------------------------ */
/* Mapa referencial do evento (Figma "Mapa referencial do evento")     */
/* ------------------------------------------------------------------ */
const MAP_BLOCKS = [
  { label: 'Cadeira coberta 1', sector: 'cadeira-coberta', cls: 'bg-[#c4b5fd]' },
  { label: 'Pista Premium', sector: 'pista-premium', cls: 'bg-[#fcd34d]', star: true },
  { label: 'Cadeira coberta A', sector: 'cadeira-coberta', cls: 'bg-[#f0abfc]' },
  { label: 'Cadeira coberta 2', sector: 'cadeira-coberta', cls: 'bg-[#c4b5fd]' },
  { label: 'Pista semi Premium', sector: 'area-exclusiva', cls: 'bg-[#fcd34d]', star: true },
  { label: 'Cadeira coberta B', sector: 'cadeira-coberta', cls: 'bg-[#f0abfc]' },
]

/**
 * Mapa estático, exibido como imagem: serve só para o usuário se localizar e já chegar na compra
 * sabendo qual setor quer. A versão interativa (clicar no setor abre a lista; setor aberto em destaque)
 * ficou comentada abaixo; para reativar, volte a aceitar { onPick, active } e use os trechos comentados.
 */
export function VenueMap() {
  return (
    <Card>
      <CardTitle>Mapa referencial do evento</CardTitle>
      <p className="mt-4 text-sm font-medium text-ink md:mt-6">Visão geral do local</p>
      <div className="mt-4 rounded-2xl border border-line bg-body-2 px-3 pb-4 pt-6 md:px-6 md:pt-8">
        <div
          role="img"
          aria-label={`Mapa do local: palco à frente; setores ${MAP_BLOCKS.map((b) => b.label).join(', ')}`}
          className="pointer-events-none relative mx-auto max-w-[460px] select-none rounded-[50%] bg-[#b8b0bf] p-2 md:p-3"
        >
          <div aria-hidden="true" className="flex flex-col items-center gap-2 rounded-[50%] bg-[#ddd6e1] px-3 py-5 md:px-4 md:py-6">
            <span className="w-1/3 rounded bg-ink-dark py-1.5 text-center font-ui text-[10px] font-semibold text-white md:text-xs">Palco</span>
            <div className="grid w-full grid-cols-3 gap-1.5 md:gap-2">
              {MAP_BLOCKS.map((b) => {
                // const isActive = active && active === b.sector
                const cls = `rounded-md px-1 py-3 text-center font-ui text-[10px] font-semibold leading-tight text-ink md:py-4 md:text-xs ${b.cls}`
                // Interativo: ${isActive ? 'ring-2 ring-brand ring-offset-2' : ''} na classe e, com onPick,
                // <button type="button" onClick={() => onPick(b.sector)} className={`${cls} transition hover:brightness-95`}>
                return (
                  <span key={b.label} className={cls}>
                    {b.star && <Ico name="star" className="mr-0.5 inline size-3 align-[-2px]" />}
                    {b.label}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
        <Note className="mt-6">
          Este mapa apresenta somente a localização dos setores.
          {/* Interativo: {onPick ? 'Selecione um setor acima para ver ingressos ou assentos disponíveis.' : 'Escolha a sessão em “Comprar ingressos” para ver os setores disponíveis.'} */}
        </Note>
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Pop-up "Entenda as taxas" (Figma 9147:141007)                       */
/* ------------------------------------------------------------------ */
const FEES = [
  ['tag', 'Taxa de serviço Uhuu', 'Ajuda a manter a plataforma, a operação da compra e o suporte ao cliente.'],
  ['card', 'Taxa da operadora do cartão', 'Pode variar conforme a forma de pagamento escolhida.'],
  ['card', 'Juros de parcelamento', 'Podem aumentar conforme o número de parcelas selecionado.'],
  ['pix', 'Outras formas de pagamento', 'PIX ou outras opções podem ter condições diferentes.'],
]

export function Dialog({ open, onClose, labelledBy, children, className = 'max-w-[390px]' }) {
  const ref = useRef(null)
  useModalBehavior(open, onClose)
  useEffect(() => {
    if (open) requestAnimationFrame(() => ref.current?.focus())
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3" onMouseDown={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
        className={`max-h-[calc(100dvh-24px)] w-full overflow-y-auto rounded-3xl bg-white p-6 outline-none ${className}`}
      >
        {children}
      </div>
    </div>
  )
}

export function FeesDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} labelledBy="fees-title">
      <div className="flex justify-end">
        <button type="button" onClick={onClose} aria-label="Fechar" className="flex size-8 items-center justify-center rounded-full text-ink hover:bg-body-2">
          <Ico name="close" className="size-6" />
        </button>
      </div>
      <h2 id="fees-title" className="mt-4 text-[28px] font-bold leading-tight text-ink">
        Entenda as taxas
      </h2>
      <p className="mt-2 font-ui text-base leading-6 text-ink-2">Todos os valores são apresentados antes da confirmação da compra.</p>
      <ul className="mt-6">
        {FEES.map(([icon, title, desc]) => (
          <li key={title} className="flex gap-4 border-b border-line py-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#f3e8ff] text-ink">
              <Ico name={icon} className="size-5" />
            </span>
            <div>
              <p className="text-base font-bold leading-6 text-ink">{title}</p>
              <p className="font-ui text-sm leading-5 text-ink-2">{desc}</p>
            </div>
          </li>
        ))}
      </ul>
      {/* Figma 9147:141007: sem o aviso azul; o Entendi fica 32px abaixo da lista */}
      <button type="button" onClick={onClose} className="mt-8 w-full rounded-full bg-brand py-[14px] font-ui text-[15px] font-semibold text-white hover:brightness-110">
        Entendi
      </button>
    </Dialog>
  )
}
