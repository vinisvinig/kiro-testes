// Finalização de compra com descoberta progressiva (Figma "Desktop - Pagamento", 9566:234294 a 9926:95446).
// Etapas: Seguro → Clube Planeta → Entrega → Pagamento. Cada uma só abre quando a anterior é respondida;
// as já respondidas viram um resumo com "Editar".
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { EVENT, comboDetail, sessionTitle } from './eventData.js'
import {
  DELIVERY,
  INSTALLMENTS,
  PIX_SECONDS,
  UHUU_COINS,
  cardErrors,
  checkCoupon,
  deriveCheckout,
  formatCard,
  formatExpiry,
  newOrderNumber,
  onlyDigits,
} from './checkout.js'
import { mmss } from './OrderSummary.jsx'
import { Card, Dialog, Eyebrow, Ico, brl } from './parts.jsx'

const SUMMARY_ID = 'resumo-checkout'
const scrollToId = (id) => requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))

export default function Checkout({ order, checkout: c, dispatch, remaining, user, onBack, onPaid }) {
  const t = useMemo(() => deriveCheckout(c, order), [c, order])
  const [pix, setPix] = useState(null) // null | 'generating' | { code, deadline }
  const [status, setStatus] = useState(null) // null | 'processing' | 'failed'
  // Dados do cartão ficam aqui para o "Comprar" da barra do celular saber se está tudo preenchido.
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [cardTouched, setCardTouched] = useState({})
  const [alertStep, setAlertStep] = useState(null) // etapa obrigatória sinalizada em vermelho
  const cardValid = Object.keys(cardErrors(card)).length === 0
  const ready = c.step === 'pagamento' && (c.method === 'pix' || (c.method === 'cartao' && cardValid))
  // Barra fixa do celular (total, cronômetro e Comprar) só depois de escolher Pix ou cartão
  const showBar = c.step === 'pagamento' && !!c.method
  // Respondeu a etapa sinalizada (ou mudou o que faltava): tira o vermelho.
  useEffect(() => setAlertStep(null), [c.step, c.method, cardValid])

  /** Comprar (barra do celular): finaliza se estiver tudo pronto; senão sinaliza e rola até a pendência. */
  const buyMobile = () => {
    if (ready) return c.method === 'pix' ? genPix() : pay('cartao', card)
    const step = c.step || 'pagamento'
    if (step === 'pagamento' && c.method === 'cartao') setCardTouched({ number: true, name: true, expiry: true, cvv: true })
    setAlertStep(step)
    scrollToId(`etapa-${step}`)
  }

  // Ao mudar de etapa, leva o usuário até ela.
  const first = useRef(true)
  useEffect(() => {
    if (first.current) return void (first.current = false)
    if (c.step) scrollToId(`etapa-${c.step}`)
  }, [c.step])

  const finish = (method) =>
    onPaid({
      number: newOrderNumber(),
      email: user?.email,
      method,
      total: method === 'cartao' ? t.cardTotal : t.total,
      insurance: !!c.insurance,
      club: !!c.club,
      delivery: c.delivery,
      tickets: order.count,
    })

  const pay = (method, card) => {
    setStatus('processing')
    setTimeout(() => {
      setStatus(null)
      finish(method)
    }, 2200)
  }

  const genPix = () => {
    setPix('generating')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => setPix({ code: pixCode(t.total), deadline: Date.now() + PIX_SECONDS * 1000 }), 1400)
  }

  if (pix) {
    return (
      <PixScreen
        pix={pix}
        t={t}
        order={order}
        onBack={() => setPix(null)}
        onPaid={() => pay('pix')}
        onExpired={() => setStatus('failed')}
        status={status}
        onRetry={() => (setStatus(null), genPix())}
      />
    )
  }

  return (
    <div className={`page-x pt-6 md:pt-8 lg:pb-16 ${showBar ? 'pb-28' : 'pb-12'}`}>
      <div className="evento-box">
        <BackButton onClick={onBack}>Voltar à seleção de ingressos</BackButton>
        <h1 className="sr-only">Finalizar compra</h1>

        <div className="mt-4 evento-grid">
          <div className="flex min-w-0 flex-col gap-6">
            <EventSummary order={order} />
            {/* Celular: cupom (opcional) logo abaixo dos ingressos e antes do seguro; no desktop fica na coluna da direita */}
            <div className="lg:hidden">
              <Coupons c={c} t={t} order={order} dispatch={dispatch} />
            </div>
            <InsuranceStep c={c} t={t} dispatch={dispatch} alert={alertStep === 'seguro'} />
            <ClubStep c={c} t={t} order={order} dispatch={dispatch} alert={alertStep === 'clube'} />
            <DeliveryStep c={c} dispatch={dispatch} alert={alertStep === 'entrega'} />
            <PaymentStep
              c={c}
              t={t}
              dispatch={dispatch}
              alert={alertStep === 'pagamento'}
              onPix={genPix}
              card={{ value: card, set: setCard, touched: cardTouched, setTouched: setCardTouched }}
              onCard={() => pay('cartao', card)}
            />
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
            <Totals t={t} order={order} remaining={remaining} />
            <div className="hidden lg:block">
              <Coupons c={c} t={t} order={order} dispatch={dispatch} />
            </div>
          </aside>
        </div>
      </div>

      {showBar && <MobileTotal total={t.total} remaining={remaining} ready={ready} onBuy={buyMobile} />}
      <ProcessingDialog open={status === 'processing'} />
      <FailedDialog open={status === 'failed'} onClose={() => setStatus(null)} />
    </div>
  )
}

/** Voltar (Figma 9807:160204): quadrado rosa com seta + texto 24px. */
function BackButton({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="group flex items-center gap-4 text-left">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand text-white transition group-hover:brightness-110">
        <svg viewBox="0 0 24 24" aria-hidden className="size-4 translate-x-[2px] fill-current">
          <path d="M11.67 3.87 9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z" />
        </svg>
      </span>
      <span className="text-xl font-bold leading-none text-ink md:text-2xl">{children}</span>
    </button>
  )
}

const pixCode = (total) =>
  `00020126580014BR.GOV.BCB.PIX0136uhuu-${Date.now().toString(36)}520400005303986540${total.toFixed(2).length}${total.toFixed(2)}5802BR5909UHUU.COM6012PORTO ALEGRE62070503***6304`

/* ------------------------------------------------------------------ */
/* Evento e ingressos (cabeçalho com lista recolhível)                 */
/* ------------------------------------------------------------------ */
function EventSummary({ order }) {
  const [open, setOpen] = useState(true)
  const id = useId()
  return (
    <Card>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={id} className="flex w-full items-start gap-4 text-left">
        <span className="min-w-0 flex-1">
          <span className="block font-ui text-[10px] font-semibold uppercase tracking-wide text-ink-2">Espetáculo</span>
          <span className="mt-2 block text-2xl font-bold leading-tight text-ink md:text-[28px]">{EVENT.title}</span>
          <span className="mt-1 block font-ui text-xs text-ink-3">{EVENT.venue.name}, São Paulo</span>
        </span>
        <Ico name="expand" className={`mt-2 size-6 text-ink transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul id={id} className="mt-4 flex flex-col gap-4">
          {order.lines.map((l) => (
            // Figma 10115:204765: cada item num fundo claro arredondado, sem linhas divisórias
            <li key={l.key} className="flex items-center gap-3 rounded-3xl bg-body p-4">
              <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${l.kind === 'combo' ? 'bg-combo-0 text-combo' : 'bg-brand-0 text-brand'}`}>
                <Ico name="ticket" className="size-6" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                <span className="block text-sm font-semibold uppercase leading-5 text-ink-3">{sessionTitle(l.session)}</span>
                <span className="block text-base font-semibold leading-6 text-ink">
                  {l.kind === 'combo' ? `${l.qty}x ${l.combo.name}, ${l.sector.name}` : `${l.qty} ${l.qty === 1 ? 'ingresso' : 'ingressos'}, ${l.sector.name}`}
                </span>
                <span className="block text-sm leading-5 text-ink-3">
                  {l.kind === 'combo' ? comboDetail(l.combo) : `${l.qty}x ${l.fare.name}`}
                  {l.seats.length > 0 && ` · ${l.seats.length === 1 ? 'assento' : 'assentos'} ${l.seats.join(', ')}`}
                </span>
              </span>
              <span className="whitespace-nowrap text-base font-semibold leading-6 text-ink">{brl(l.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Blocos de etapa: aberta, concluída, bloqueada                       */
/* ------------------------------------------------------------------ */
function StepShell({ id, state, icon, title, subtitle, summary, onEdit, declined = false, alert = false, lockedText = 'Disponível após a etapa anterior', children }) {
  if (state === 'locked') {
    return (
      <section id={`etapa-${id}`} aria-disabled="true" className="scroll-mt-24 rounded-3xl border border-line bg-white px-6 py-5 opacity-80">
        <div className="flex items-center gap-4">
          <span className="flex size-8 items-center justify-center rounded-full bg-body-3 text-ink-2">
            <Ico name={icon} className="size-4" />
          </span>
          <div>
            <h2 className="text-xl font-bold leading-tight text-ink-2">{title}</h2>
            <p className="mt-1 font-ui text-xs text-ink-3">{lockedText}</p>
          </div>
        </div>
      </section>
    )
  }
  if (state === 'done') {
    return (
      <section id={`etapa-${id}`} className="scroll-mt-24 rounded-3xl border border-line bg-white px-6 py-5">
        <div className="flex items-center gap-4">
          {/* Verde quando o adicional foi contratado; cinza (como etapa não preenchida) quando a pessoa continuou sem */}
          <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${declined ? 'bg-body-3 text-ink-2' : 'bg-[#22c55e] text-white'}`}>
            <Ico name={icon} className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold leading-tight text-ink">{title}</h2>
            <p className="mt-1 font-ui text-xs text-ink-2">{summary}</p>
          </div>
          <button type="button" onClick={onEdit} className="rounded-full px-3 py-2 font-ui text-sm font-semibold text-brand hover:bg-brand-0" aria-label={`Editar ${title}`}>
            Editar
          </button>
        </div>
      </section>
    )
  }
  return (
    <section
      id={`etapa-${id}`}
      aria-labelledby={`etapa-${id}-t`}
      className={`scroll-mt-24 rounded-3xl border bg-white p-5 transition-colors md:p-6 ${alert ? 'border-danger ring-1 ring-danger' : 'border-line'}`}
    >
      {alert && (
        <p role="alert" className="mb-4 flex items-center gap-2 rounded-xl bg-[#fef2f2] px-3 py-2 font-ui text-xs font-semibold text-danger">
          <Ico name="error" className="size-4" /> {id === 'pagamento' ? 'Escolha a forma de pagamento e preencha os dados para comprar.' : 'Responda esta etapa para continuar.'}
        </p>
      )}
      <div className="flex items-start gap-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-white">
          <Ico name={icon} className="size-4" />
        </span>
        <div>
          <h2 id={`etapa-${id}-t`} className="text-xl font-bold leading-tight text-ink md:text-2xl">
            {title}
          </h2>
          {subtitle && <p className="mt-1 font-ui text-xs text-ink-2">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

const stateOf = (c, step, answered) => (c.step === step ? 'open' : answered ? 'done' : 'locked')

function CheckOption({ checked, onChange, title, detail }) {
  return (
    <label className={`flex cursor-pointer items-center gap-4 rounded-2xl border bg-white px-4 py-4 transition ${checked ? 'border-brand ring-1 ring-brand' : 'border-line hover:border-ink-4'}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-brand" />
      <span>
        <span className="block text-sm font-semibold text-ink">{title}</span>
        <span className="mt-1 block font-ui text-xs text-ink-2">{detail}</span>
      </span>
    </label>
  )
}

const PrimaryButton = ({ className = '', ...rest }) => (
  <button
    type="button"
    className={`rounded-full bg-brand px-10 py-[13px] font-ui text-[15px] font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-brand/30 max-sm:w-full ${className}`}
    {...rest}
  />
)

/* ---------------- Aceite de termos ---------------- */
const INSURANCE_TERMS =
  'https://s3.us-east-1.amazonaws.com/portal.uhuu.com.br/ingresso-seguro/UHUU+Ingresso+Protegido-+Condi%C3%A7%C3%B5es+Contratuais+VF.pdf'
const INSURANCE_PRIVACY =
  'https://s3.us-east-1.amazonaws.com/portal.uhuu.com.br/ingresso-seguro/Privacidade+de+dados+e+Demais+Disposi%C3%A7%C3%B5es+do+Seguro_VF.pdf'
// Links do Figma 9569:41706
const UHUU_TERMS = 'https://uhuu.com/termos'
const UHUU_PRIVACY = 'https://uhuu.com/privacidade'
const UHUU_CANCEL = 'https://uhuu.com/cancelamento'

const TermLink = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand underline hover:no-underline">
    {children}
  </a>
)

/** Aceite dos termos da compra, acima do botão final (Figma 9569:41706). */
const PurchaseTerms = ({ action }) => (
  <p className="mt-4 rounded-lg border border-line bg-white px-3 py-2.5 text-base leading-6 text-ink">
    Ao clicar em {action} eu declaro que li e tenho conhecimento e concordo com os <TermLink href={UHUU_TERMS}>Termos de Uso</TermLink>,{' '}
    <TermLink href={UHUU_PRIVACY}>Políticas de Privacidade</TermLink> e <TermLink href={UHUU_CANCEL}>Política de Cancelamento</TermLink>.
  </p>
)

/* ---------------- 02 · Seguro ---------------- */
function InsuranceStep({ c, t, dispatch, alert }) {
  const [info, setInfo] = useState(false)
  return (
    <StepShell
      id="seguro"
      alert={alert}
      state={stateOf(c, 'seguro', c.insurance !== null)}
      icon="shield"
      title={c.step === 'seguro' ? 'Quer proteger seus ingressos?' : 'Seguro'}
      subtitle="Seguro opcional"
      summary={c.insurance ? `Seguro MetLife contratado · ${brl(t.insuranceValue)}` : 'Sem seguro'}
      onEdit={() => dispatch({ type: 'edit', step: 'seguro' })}
      declined={c.insurance === false}
    >
      <p className="text-base font-bold text-ink">Seguro MetLife</p>
      {/* Textos do Figma 9564:40662 */}
      <div className="mt-2 flex flex-col gap-2 text-base leading-6 text-ink-2">
        <p>Reembolso sujeito à análise da seguradora, às coberturas contratadas e às condições do seguro.</p>
        <p>Cobertura em caso de imprevistos, como problemas de saúde.</p>
        <p>Não cobre simples desistência ou mudança de planos.</p>
      </div>
      <button type="button" onClick={() => setInfo(true)} className="mt-2 font-ui text-xs text-brand underline hover:no-underline">
        Ver condições e como solicitar reembolso
      </button>
      {/* Aceite dos termos do seguro (Figma 9652:43944) */}
      <p className="mt-6 rounded-xl border border-line bg-body px-3 py-2.5 text-base leading-6 text-ink-2">
        Ao selecionar Quero contratar o seguro, eu declaro que li e tenho conhecimento e concordo com os{' '}
        <TermLink href={INSURANCE_TERMS}>Termos e Condições</TermLink> do seguro, e dos{' '}
        <TermLink href={INSURANCE_PRIVACY}>Termos de Privacidade de Dados e Demais Disposições do Seguro</TermLink>.
      </p>
      <div className="mt-5">
        <CheckOption
          checked={c.insuranceDraft}
          onChange={(v) => dispatch({ type: 'draft', key: 'insuranceDraft', value: v })}
          title="Quero contratar o seguro"
          detail={`+ ${brl(t.insuranceValue)} no pedido`}
        />
      </div>
      <div className="mt-5 flex justify-end">
        <PrimaryButton onClick={() => dispatch({ type: 'answer', key: 'insurance', value: c.insuranceDraft })}>
          {c.insuranceDraft ? 'Continuar' : 'Continuar sem seguro'}
        </PrimaryButton>
      </div>
      <InfoDialog open={info} onClose={() => setInfo(false)} title="Sobre o seguro MetLife">
        {/* Texto do Figma 9640:241163 */}
        <div className="flex flex-col gap-6 font-sans text-base leading-6">
          <p>
            O Ingresso Protegido pode reembolsar o valor do ingresso e da taxa de serviço em situações cobertas pelo seguro. A solicitação é realizada diretamente com a MetLife e depende de análise e aprovação.
          </p>
          <p>Pode cobrir doenças graves, internação hospitalar, morte acidental, fratura óssea e desemprego involuntário, conforme as condições da apólice.</p>
          <p>Não cobre simples desistência, conflito de agenda ou insatisfação com o evento. Aplicam-se carências, limites e exclusões.</p>
          <p>
            Consulte as{' '}
            <a href="https://uhuu.com.br/ingresso-seguro" target="_blank" rel="noopener noreferrer" className="text-brand underline hover:no-underline">
              condições do seguro
            </a>{' '}
            antes da contratação.
          </p>
        </div>
      </InfoDialog>
    </StepShell>
  )
}

/* ---------------- 03 · Clube Planeta ---------------- */
function ClubStep({ c, t, order, dispatch, alert }) {
  const [info, setInfo] = useState(false)
  const per = t.clubValue / Math.max(1, order.count)
  return (
    <StepShell
      id="clube"
      alert={alert}
      state={stateOf(c, 'clube', c.club !== null)}
      icon="club"
      title={c.step === 'clube' ? 'Quer adicionar o Clube Planeta?' : 'Clube Planeta'}
      subtitle="Adesão opcional"
      summary={c.club ? `Clube Planeta adicionado · ${order.count} ${order.count === 1 ? 'ingresso' : 'ingressos'} · ${brl(t.clubValue)}` : 'Sem Clube Planeta'}
      onEdit={() => dispatch({ type: 'edit', step: 'clube' })}
      declined={c.club === false}
    >
      {/* Textos do Figma 9564:40694 */}
      <p className="text-base font-bold leading-6 text-ink">Benefícios e descontos exclusivos em eventos participantes.</p>
      <ul className="mt-2 list-disc pl-6 text-base leading-6 text-ink-2">
        <li>Descontos exclusivos em ingressos parceiros</li>
        <li>Prioridade na compra de eventos selecionados</li>
        <li>Vantagens administradas pela Uhuu</li>
      </ul>
      <button type="button" onClick={() => setInfo(true)} className="mt-2 font-ui text-xs text-brand underline hover:no-underline">
        Ver benefícios e condições do Clube Planeta
      </button>
      <div className="mt-5">
        <CheckOption
          checked={c.clubDraft}
          onChange={(v) => dispatch({ type: 'draft', key: 'clubDraft', value: v })}
          title="Quero adicionar o Clube Planeta"
          detail={`${brl(per)} por ingresso + ${brl(t.clubValue)} no pedido`}
        />
      </div>
      <div className="mt-5 flex justify-end">
        <PrimaryButton onClick={() => dispatch({ type: 'answer', key: 'club', value: c.clubDraft })}>{c.clubDraft ? 'Continuar' : 'Continuar sem clube'}</PrimaryButton>
      </div>
      <InfoDialog open={info} onClose={() => setInfo(false)} title="Sobre o Clube Planeta">
        <p>Benefícios e descontos exclusivos em eventos e ingressos participantes.</p>
        <p>Descontos em ingressos parceiros, prioridade na compra de eventos selecionados e vantagens administradas pela Uhuu.</p>
        <p>
          Neste pedido: {brl(per)} por ingresso, total de {brl(t.clubValue)} para {order.count} {order.count === 1 ? 'ingresso' : 'ingressos'}. Regras de adesão e
          elegibilidade precisam ser validadas.
        </p>
      </InfoDialog>
    </StepShell>
  )
}

/* ---------------- 04 · Entrega ---------------- */
function DeliveryStep({ c, dispatch, alert }) {
  const [adding, setAdding] = useState(false)
  const [duplicate, setDuplicate] = useState(false) // pop-up "Endereço já cadastrado"
  const chosen = DELIVERY.find((d) => d.id === c.delivery)
  const express = c.delivery === 'expressa'
  const addr = c.addresses.find((a) => a.id === c.address)

  const pick = (id) => {
    dispatch({ type: 'delivery', id })
    // Retirada não pede mais nada: a etapa conclui na hora.
    if (id === 'bilheteria') dispatch({ type: 'confirmDelivery' })
  }

  return (
    <StepShell
      id="entrega"
      alert={alert}
      state={stateOf(c, 'entrega', c.deliveryDone)}
      icon="truck"
      title={c.step === 'entrega' ? (express ? 'Para onde enviamos?' : 'Escolha a modalidade de entrega') : 'Entrega'}
      subtitle={c.step === 'entrega' ? (express ? 'Entrega expressa' : 'Entrega') : undefined}
      summary={chosen ? `${chosen.name} · ${chosen.price ? brl(chosen.price) : 'Grátis'}${express && addr ? ` · ${addr.street}` : ''}` : ''}
      onEdit={() => dispatch({ type: 'edit', step: 'entrega' })}
    >
      <p className="font-ui text-xs text-ink-2">As modalidades disponíveis dependem do evento.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Modalidade de entrega">
        {DELIVERY.map((d) => {
          const on = c.delivery === d.id
          return (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => pick(d.id)}
              className={`flex flex-col items-start rounded-2xl border bg-white p-4 text-left transition ${on ? 'border-brand ring-1 ring-brand' : 'border-line hover:border-ink-4'}`}
            >
              <Ico name={d.icon} className={`size-6 ${on ? 'text-brand' : 'text-ink'}`} />
              <span className="mt-3 text-base font-semibold text-ink">{d.name}</span>
              <span className="mt-1 font-ui text-xs text-ink-3">{d.desc}</span>
              <span className="mt-3 font-ui text-xs font-bold uppercase text-brand">{d.price ? brl(d.price) : 'Grátis'}</span>
            </button>
          )
        })}
      </div>

      {express && (
        <>
          <fieldset className="mt-4 rounded-2xl border border-line bg-body-2 p-4">
            <legend className="sr-only">Endereço de entrega</legend>
            <p className="text-sm font-semibold text-ink" aria-hidden>
              Endereço de entrega
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {c.addresses.map((a) => {
                const on = c.address === a.id
                return (
                  <label key={a.id} className={`flex cursor-pointer items-center gap-4 rounded-2xl border bg-white px-4 py-4 ${on ? 'border-brand ring-1 ring-brand' : 'border-line hover:border-ink-4'}`}>
                    <input type="radio" name="endereco" checked={on} onChange={() => dispatch({ type: 'address', id: a.id })} className="size-4 accent-brand" />
                    <span>
                      {a.main && <span className="block font-ui text-[11px] text-brand">Principal</span>}
                      <span className="block text-sm font-semibold text-ink">{a.street}</span>
                      <span className="mt-1 block font-ui text-xs text-ink-2">{a.detail}</span>
                    </span>
                  </label>
                )
              })}
            </div>
            {adding ? (
              <AddressForm
                onCancel={() => setAdding(false)}
                onSave={(address) => {
                  // Não permite cadastrar o mesmo endereço duas vezes (Figma 10080:39933); o formulário fica aberto para corrigir
                  if (c.addresses.some((a) => addressKey(a) === addressKey(address))) return setDuplicate(true)
                  dispatch({ type: 'addAddress', address })
                  setAdding(false)
                }}
              />
            ) : (
              <button type="button" onClick={() => setAdding(true)} className="mt-4 rounded-full border border-brand px-4 py-[10px] font-ui text-sm font-semibold text-brand hover:border-brand-700 hover:text-brand-700">
                Adicionar novo endereço
              </button>
            )}
          </fieldset>
          <div className="mt-5 flex justify-end">
            <PrimaryButton disabled={!addr || adding} onClick={() => dispatch({ type: 'confirmDelivery' })}>
              Confirmar endereço
            </PrimaryButton>
          </div>
          <DuplicateAddressDialog open={duplicate} onClose={() => setDuplicate(false)} />
        </>
      )}
    </StepShell>
  )
}

/** Chave para comparar endereços: rua e número, CEP e complemento, sem diferenciar maiúsculas, acentos e espaços. */
const norm = (t = '') => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
function addressKey(a) {
  const parts = a.detail.split(' · ')
  const i = parts.findIndex((x) => x.startsWith('CEP '))
  const cep = onlyDigits(parts[i] || '')
  const extra = i >= 0 ? parts.slice(i + 1).join(' ') : ''
  return `${norm(a.street)}|${cep}|${norm(extra)}`
}

/** "Endereço já cadastrado" (Figma 10080:39933) */
function DuplicateAddressDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} labelledBy="dup-address-title" className="max-w-[344px] !rounded-lg !px-6 !pb-10 !pt-6">
      <div className="flex justify-end">
        <button type="button" onClick={onClose} aria-label="Fechar" className="flex size-8 items-center justify-center rounded-full text-ink hover:bg-body-2">
          <Ico name="close" className="size-6" />
        </button>
      </div>
      <div className="mt-2 flex flex-col items-center gap-8 text-center">
        <Ico name="warning" className="size-16 text-ink" />
        <h2 id="dup-address-title" className="text-2xl font-bold leading-tight text-ink">
          Endereço já cadastrado
        </h2>
        <button type="button" onClick={onClose} className="w-full rounded-full bg-brand py-[10px] font-ui text-[15px] font-semibold text-white hover:brightness-110">
          Entendi
        </button>
      </div>
    </Dialog>
  )
}

function AddressForm({ onSave, onCancel }) {
  const id = useId()
  const [f, setF] = useState({ cep: '', street: '', number: '', extra: '', district: '', city: '', uf: '' })
  const [errors, setErrors] = useState({})
  const [looking, setLooking] = useState(false)
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: k === 'cep' ? onlyDigits(e.target.value).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2') : e.target.value }))

  // Preenche o endereço pelo CEP (ViaCEP). Se falhar, o usuário digita manualmente.
  useEffect(() => {
    const cep = onlyDigits(f.cep)
    if (cep.length !== 8) return
    const ctrl = new AbortController()
    setLooking(true)
    fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => {
        if (d.erro) return setErrors((e) => ({ ...e, cep: 'CEP não encontrado. Preencha o endereço manualmente.' }))
        setErrors((e) => ({ ...e, cep: undefined }))
        setF((x) => ({ ...x, street: d.logradouro || x.street, district: d.bairro || x.district, city: d.localidade || x.city, uf: d.uf || x.uf }))
      })
      .catch(() => {})
      .finally(() => setLooking(false))
    return () => ctrl.abort()
  }, [f.cep])

  const save = () => {
    const e = {}
    if (onlyDigits(f.cep).length !== 8) e.cep = 'CEP inválido.'
    for (const k of ['street', 'number', 'district', 'city']) if (!f[k].trim()) e[k] = 'Obrigatório.'
    if (!/^[A-Za-z]{2}$/.test(f.uf)) e.uf = 'UF inválida.'
    setErrors(e)
    if (Object.keys(e).length) return
    onSave({
      street: `${f.street.trim()}, ${f.number.trim()}`,
      detail: `${f.district.trim()} · ${f.city.trim()}/${f.uf.toUpperCase()} · CEP ${f.cep}${f.extra.trim() ? ` · ${f.extra.trim()}` : ''}`,
    })
  }

  const field = (k, label, props = {}, cls = '') => (
    <div className={`flex flex-col gap-1.5 ${cls}`}>
      <label htmlFor={`${id}-${k}`} className="font-ui text-xs font-semibold text-ink">
        {label}
      </label>
      <input
        id={`${id}-${k}`}
        value={f[k]}
        onChange={set(k)}
        aria-invalid={!!errors[k]}
        className={`h-11 rounded-lg border bg-white px-3 font-ui text-sm text-ink outline-none focus:border-brand ${errors[k] ? 'border-danger' : 'border-line'}`}
        {...props}
      />
      {errors[k] && <span className="font-ui text-[11px] text-danger">{errors[k]}</span>}
    </div>
  )

  return (
    <div className="mt-4 rounded-2xl border border-line bg-white p-4">
      <p className="text-sm font-semibold text-ink">Novo endereço</p>
      <div className="mt-3 grid grid-cols-6 gap-3">
        {field('cep', looking ? 'CEP (buscando…)' : 'CEP', { inputMode: 'numeric', autoComplete: 'postal-code', placeholder: '00000-000' }, 'col-span-6 sm:col-span-2')}
        {field('street', 'Rua', { autoComplete: 'address-line1' }, 'col-span-6 sm:col-span-4')}
        {field('number', 'Número', { inputMode: 'numeric' }, 'col-span-2')}
        {field('extra', 'Complemento (opcional)', { autoComplete: 'address-line2' }, 'col-span-4')}
        {field('district', 'Bairro', {}, 'col-span-6 sm:col-span-2')}
        {field('city', 'Cidade', { autoComplete: 'address-level2' }, 'col-span-4 sm:col-span-3')}
        {field('uf', 'UF', { maxLength: 2, autoComplete: 'address-level1' }, 'col-span-2 sm:col-span-1')}
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-full px-4 py-[10px] font-ui text-sm font-semibold text-ink-2 hover:bg-body-2">
          Cancelar
        </button>
        <button type="button" onClick={save} className="rounded-full bg-brand px-6 py-[10px] font-ui text-sm font-semibold text-white hover:brightness-110">
          Salvar endereço
        </button>
      </div>
    </div>
  )
}

/* ---------------- 05/06 · Pagamento ---------------- */
function PaymentStep({ c, t, dispatch, onPix, onCard, card, alert }) {
  const open = c.step === 'pagamento'
  const [coinsInfo, setCoinsInfo] = useState(false)
  const coinsId = useId()
  return (
    <StepShell
      id="pagamento"
      alert={alert}
      state={open ? 'open' : 'locked'}
      icon="card"
      title="Escolha como pagar"
      subtitle="Selecione uma forma de pagamento para continuar"
      lockedText="Disponível após escolher a entrega"
    >
      {/* Moedas: faixa discreta; Pix e cartão logo abaixo ganham mais destaque (Figma 9807:159890) */}
      {/* htmlFor explícito: sem ele o navegador liga o <label> ao 1º controle de dentro (o botão de ajuda),
          e tocar em qualquer ponto da faixa abria o pop-up em vez de aplicar as moedas. */}
      <label htmlFor={coinsId} className="flex cursor-pointer flex-wrap items-center gap-3 rounded-[14px] border border-line bg-body px-4 py-3">
        <span className="flex size-6 items-center justify-center rounded-full bg-brand text-white">
          <Ico name="coin" className="size-4" />
        </span>
        <span className="flex items-center gap-2 text-base font-semibold text-ink">
          Usar moedas Uhuu
          {/* Botão fora do efeito do <label>: abre a explicação sem ligar/desligar as moedas */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setCoinsInfo(true)
            }}
            aria-label="O que são as moedas Uhuu?"
            className="-m-1.5 flex items-center justify-center rounded-full p-1.5 text-ink-3 hover:bg-body-3 hover:text-ink"
          >
            <Ico name="help" className="size-[18px]" />
          </button>
        </span>
        <span className="ml-auto font-ui text-sm text-ink-3">Saldo elegível para este pedido</span>
        <span className="text-base font-semibold text-ink">{brl(UHUU_COINS)}</span>
        <span className="relative inline-flex">
          <input id={coinsId} type="checkbox" role="switch" checked={c.coins} onChange={() => dispatch({ type: 'coins' })} className="peer sr-only" aria-label="Usar moedas Uhuu" />
          <span className="h-6 w-11 rounded-full bg-body-3 transition peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2" />
          <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
        </span>
      </label>
      {/* "Sobre a moeda Uhuu" (Figma 9968:42371) */}
      <InfoDialog open={coinsInfo} onClose={() => setCoinsInfo(false)} title="O que são os créditos?">
        <p className="font-sans text-base leading-6">
          Crédito é a moeda Uhuu, criada para garantir que você consiga fazer uma compra utilizando o valor pago em pedidos com eventos cancelados.
        </p>
        <div className="rounded-2xl bg-body-2 p-4 font-sans text-sm leading-5 text-ink-2">
          <p className="font-bold">Regras:</p>
          <ul className="mt-2.5 flex list-disc flex-col gap-2.5 pl-5">
            <li>Ao solicitar a troca por crédito, o seu pedido e ingressos serão cancelados</li>
            <li>Os créditos só podem ser gastos em eventos da mesma produtora</li>
            <li>Você não pode resgatar seus créditos, apenas gastar na plataforma em eventos da mesma produtora</li>
            <li>Os créditos somente serão gerados na carteira do consumidor que realizou a compra</li>
            <li>Você não pode utilizar seus créditos em pedidos contendo mais de um evento</li>
          </ul>
        </div>
      </InfoDialog>

      <div className="mt-4 grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Forma de pagamento">
        {[
          ['pix', 'pix', 'Pix'],
          ['cartao', 'card', 'Cartão de crédito ou débito'],
        ].map(([id, icon, label]) => {
          const on = c.method === id
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => dispatch({ type: 'method', method: id })}
              className={`flex flex-col items-start gap-3 rounded-[14px] border bg-white p-4 text-left text-base font-semibold leading-6 text-ink transition ${
                on ? 'border-brand ring-1 ring-brand' : 'border-line hover:border-ink-4'
              }`}
            >
              <Ico name={icon} className={`size-6 ${on ? 'text-brand' : ''}`} />
              {label}
            </button>
          )
        })}
      </div>

      {c.method === 'pix' && (
        <div className="mt-5">
          <div className="rounded-2xl border border-line bg-body-2 p-4 font-ui text-sm leading-6 text-ink-2">
            Ao gerar o Pix, você terá <strong className="text-ink">10 minutos</strong> para pagar <strong className="text-ink">{brl(t.total)}</strong> pelo app do seu banco. A
            confirmação costuma ser imediata.
          </div>
          <PurchaseTerms action="Gerar Pix" />
          <div className="mt-5 flex justify-end">
            <PrimaryButton onClick={onPix}>Gerar Pix</PrimaryButton>
          </div>
        </div>
      )}
      {c.method === 'cartao' && <CardForm c={c} t={t} dispatch={dispatch} card={card} onSubmit={onCard} />}
      {!c.method && <p className="mt-4 font-ui text-xs text-ink-3">Escolha Pix ou Cartão de crédito para continuar.</p>}
    </StepShell>
  )
}

function CardForm({ c, t, dispatch, card: cs, onSubmit }) {
  const id = useId()
  const { value: card, set: setCard, touched, setTouched } = cs
  const errors = cardErrors(card)
  const valid = Object.keys(errors).length === 0
  const set = (k, fmt = (v) => v) => (e) => setCard((x) => ({ ...x, [k]: fmt(e.target.value) }))
  const blur = (k) => () => setTouched((x) => ({ ...x, [k]: true }))

  const field = (k, label, props, cls = '') => {
    const err = touched[k] && errors[k]
    return (
      <div className={`flex flex-col gap-2 ${cls}`}>
        <label htmlFor={`${id}-${k}`} className="text-sm font-semibold text-ink">
          {label}
        </label>
        <input
          id={`${id}-${k}`}
          value={card[k]}
          onBlur={blur(k)}
          aria-invalid={!!err}
          aria-describedby={err ? `${id}-${k}-e` : undefined}
          className={`h-11 rounded-lg border bg-white px-3 font-ui text-sm text-ink outline-none placeholder:text-ink-3 focus:border-brand ${err ? 'border-danger' : 'border-line'}`}
          {...props}
        />
        {err && (
          <span id={`${id}-${k}-e`} className="font-ui text-[11px] text-danger">
            {err}
          </span>
        )}
      </div>
    )
  }

  return (
    <form
      className="mt-5 grid grid-cols-2 gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (valid) onSubmit()
        else setTouched({ number: true, name: true, expiry: true, cvv: true })
      }}
      noValidate
    >
      {field('number', 'Número do cartão', { inputMode: 'numeric', autoComplete: 'cc-number', placeholder: '0000 0000 0000 0000', onChange: set('number', formatCard) }, 'col-span-2')}
      {field('name', 'Nome impresso no cartão', { autoComplete: 'cc-name', placeholder: 'Como aparece no cartão', onChange: set('name', (v) => v.toUpperCase()) }, 'col-span-2')}
      {field('expiry', 'Validade', { inputMode: 'numeric', autoComplete: 'cc-exp', placeholder: 'MM/AA', onChange: set('expiry', formatExpiry) })}
      {field('cvv', 'Código de segurança', { inputMode: 'numeric', autoComplete: 'cc-csc', placeholder: 'CVV', maxLength: 4, onChange: set('cvv', (v) => onlyDigits(v).slice(0, 4)) })}
      <div className="col-span-2 flex flex-col gap-2">
        <label htmlFor={`${id}-inst`} className="text-sm font-semibold text-ink">
          Parcelamento
        </label>
        <select
          id={`${id}-inst`}
          value={c.installments}
          onChange={(e) => dispatch({ type: 'installments', n: +e.target.value })}
          className="h-11 rounded-lg border border-line bg-white px-3 font-ui text-sm text-ink outline-none focus:border-brand"
        >
          {INSTALLMENTS.map((i) => {
            const total = t.total * (1 + i.rate)
            return (
              <option key={i.n} value={i.n}>
                {i.n}x de {brl(total / i.n)} {i.rate ? `(total ${brl(total)}, com juros)` : 'sem juros'}
              </option>
            )
          })}
        </select>
      </div>
      <p className="col-span-2 font-ui text-xs text-ink-3">
        {valid ? `Total no cartão: ${brl(t.cardTotal)}.` : 'Preencha os dados do cartão para finalizar a compra.'}
      </p>
      <div className="col-span-2">
        <PurchaseTerms action="Finalizar compra" />
      </div>
      <div className="col-span-2 flex justify-end">
        <PrimaryButton type="submit" disabled={!valid}>
          Finalizar compra
        </PrimaryButton>
      </div>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/* Coluna direita: resumo e cupons                                     */
/* ------------------------------------------------------------------ */
function Totals({ t, order, remaining, title = 'Total à vista', showTimer = true }) {
  const low = remaining <= 120
  const row = (label, value, cls = 'text-ink-2') => (
    <div className={`flex items-center justify-between gap-2 ${cls}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
  return (
    <Card as="div" id={SUMMARY_ID} className="scroll-mt-24">
      {showTimer && (
        <div className={`flex items-center gap-2 rounded-full border px-4 py-2.5 ${low ? 'border-danger bg-[#fef2f2]' : 'border-brand bg-brand-0'}`} role="timer" aria-live="off">
          <Ico name="timer" className="size-4 text-ink" />
          <span className="flex-1 font-ui text-xs text-ink-2">Reserva garantida por</span>
          <span className={`font-ui text-sm font-bold ${low ? 'text-danger' : 'text-ink'}`}>{mmss(remaining)}</span>
        </div>
      )}
      <Eyebrow className={showTimer ? 'mt-5' : ''}>Resumo do pedido</Eyebrow>
      <p className="mt-2 text-2xl font-bold leading-tight text-ink">
        {order.count} {order.count === 1 ? 'ingresso' : 'ingressos'}
      </p>
      <dl className="mt-5 flex flex-col gap-2 border-t border-line pt-4 font-ui text-xs">
        {row('Ingressos', brl(t.subtotal))}
        {t.couponOff > 0 && row('Cupons de desconto', `− ${brl(t.couponOff)}`, 'rounded-md bg-[#f0fdf4] px-2 py-1.5 text-success')}
        {order.validators.length > 0 && row('Código validador', 'Validado', 'rounded-md bg-[#f0fdf4] px-2 py-1.5 text-success')}
        {row('Taxa de serviço', brl(t.fee))}
        {row('Seguro', brl(t.insurance))}
        {row('Clube Planeta', brl(t.club))}
        {row('Entrega', t.shipping === null ? 'A definir' : t.shipping ? brl(t.shipping) : 'Grátis')}
        {t.coins > 0 && row('Moedas Uhuu', `− ${brl(t.coins)}`, 'text-success')}
      </dl>
      <div className="mt-4 border-t border-line pt-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-base font-bold text-ink">{title}</span>
          <span className="text-[28px] font-bold leading-none text-ink">{brl(t.total)}</span>
        </div>
        <p className="mt-2 font-ui text-xs text-ink-3">Ou parcelado no cartão até 3x de {brl(t.maxInstallment)}</p>
      </div>
    </Card>
  )
}

function Coupons({ c, t, order, dispatch }) {
  const id = useId()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const apply = (e) => {
    e.preventDefault()
    const err = checkCoupon(code, order.lines, c.coupons)
    if (err) return setError(err)
    setBusy(true)
    setError('')
    // Simula a validação na API
    setTimeout(() => {
      dispatch({ type: 'coupon', code: code.trim().toUpperCase() })
      setCode('')
      setBusy(false)
    }, 700)
  }
  return (
    <Card as="div">
      <p className="text-base font-bold text-ink">{c.coupons.length > 1 ? 'Cupons de desconto' : 'Cupom de desconto'}</p>
      {t.applied.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {t.applied.map((a) => (
            <li key={a.code} className="flex items-center gap-3 rounded-xl border border-line bg-body-2 px-3 py-2.5">
              <span className="min-w-0 flex-1">
                <span className="block font-ui text-sm font-semibold text-ink">{a.code}</span>
                <span className="block font-ui text-[11px] text-ink-3">
                  {a.tickets}x {a.tickets === 1 ? 'ingresso' : 'ingressos'}
                </span>
              </span>
              <span className="font-ui text-sm font-semibold text-success">− {brl(a.off)}</span>
              <button
                type="button"
                onClick={() => dispatch({ type: 'removeCoupon', code: a.code })}
                aria-label={`Remover cupom ${a.code}`}
                className="flex size-8 items-center justify-center rounded-lg border border-danger text-danger hover:bg-[#fef2f2]"
              >
                <Ico name="trash" className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {t.applied.length > 0 && <p className="mt-3 font-ui text-[11px] leading-4 text-ink-2">Use vários cupons. Cada um tem seu limite de aplicações, e cada ingresso recebe apenas 1 cupom.</p>}
      <form onSubmit={apply} className="mt-4 flex flex-col gap-3" noValidate>
        <label htmlFor={`${id}-c`} className="sr-only">
          Cupom de desconto
        </label>
        <input
          id={`${id}-c`}
          value={code}
          onChange={(e) => (setCode(e.target.value.toUpperCase()), setError(''))}
          placeholder="Digite seu cupom"
          autoComplete="off"
          aria-invalid={!!error}
          aria-describedby={`${id}-s`}
          className={`h-12 rounded-lg border bg-white px-4 font-ui text-sm uppercase text-ink outline-none placeholder:normal-case placeholder:text-ink-3 focus:border-brand ${error ? 'border-danger' : 'border-line'}`}
        />
        <p id={`${id}-s`} aria-live="polite" className={`font-ui text-xs ${error ? 'text-danger' : 'text-ink-3'}`}>
          {error || (busy ? 'Validando cupom…' : 'Simulação: DESCONTO10 (10%, até 2 ingressos) ou UHUU20 (R$ 20, 1 ingresso).')}
        </p>
        <button type="submit" disabled={busy} className="rounded-full border border-brand py-[13px] font-ui text-[15px] font-semibold text-brand hover:border-brand-700 hover:text-brand-700 disabled:opacity-60">
          {busy ? 'Validando…' : 'Aplicar cupom'}
        </button>
      </form>
    </Card>
  )
}

/** Barra fixa no celular com o total; leva até o resumo. */
/**
 * Barra fixa no celular: total + Comprar. O botão fica em contorno enquanto falta algo obrigatório
 * (ao tocar, sinaliza a etapa pendente em vermelho e rola até ela) e preenchido quando está tudo pronto.
 */
function MobileTotal({ total, remaining, ready, onBuy }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-line bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:hidden">
      <div className="min-w-0 flex-1">
        <p className="font-ui text-[11px] text-ink-3">
          Total à vista · <span className={remaining <= 120 ? 'font-semibold text-danger' : ''}>reserva {mmss(remaining)}</span>
        </p>
        <p className="text-xl font-bold leading-tight text-ink">{brl(total)}</p>
      </div>
      <button
        type="button"
        onClick={onBuy}
        aria-describedby={ready ? undefined : 'comprar-pendente'}
        className={`min-w-[140px] rounded-full border px-8 py-[13px] font-ui text-[15px] font-semibold leading-[18px] transition ${
          ready ? 'border-brand bg-brand text-white hover:brightness-110' : 'border-brand bg-white text-brand hover:border-brand-700 hover:text-brand-700'
        }`}
      >
        Comprar
      </button>
      {!ready && (
        <span id="comprar-pendente" className="sr-only">
          Ainda há etapas obrigatórias pendentes
        </span>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Pix (07 · Gerando Pix, 08 · Pagar com Pix)                          */
/* ------------------------------------------------------------------ */
function PixScreen({ pix, t, order, onBack, onPaid, onExpired, status, onRetry }) {
  const [now, setNow] = useState(Date.now())
  const [copied, setCopied] = useState(false)
  const ready = typeof pix === 'object'
  const left = ready ? Math.min(PIX_SECONDS, Math.max(0, Math.ceil((pix.deadline - now) / 1000))) : PIX_SECONDS

  useEffect(() => {
    if (!ready) return
    setNow(Date.now())
    const i = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(i)
  }, [ready])
  useEffect(() => {
    if (ready && left === 0 && !status) onExpired()
  }, [ready, left, status, onExpired])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pix.code)
    } catch {
      /* sem permissão: o código continua visível para copiar manualmente */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="page-x pb-16 pt-6 md:pt-10">
      <div className="evento-box">
        <BackButton onClick={onBack}>Trocar forma de pagamento</BackButton>
        <h1 className="mt-4 text-[28px] font-bold leading-tight text-ink md:text-[32px]">Finalizar compra</h1>
        {/* grid-cols-1 + min-w-0: sem isso o código Pix (uma linha longa) alargava o card além da tela no celular */}
        <div className="mt-6 evento-grid">
          <Card className="min-w-0 md:!p-8">
            {!ready ? (
              <div className="flex flex-col items-center gap-4 py-16 text-center" role="status">
                <Spinner />
                <p className="text-2xl font-bold text-ink">Gerando seu Pix</p>
                <p className="font-ui text-sm text-ink-2">Estamos criando o QR Code do pagamento. Isso leva só alguns segundos.</p>
              </div>
            ) : (
              <>
                <h2 className="text-[28px] font-bold leading-tight text-ink">Pague com Pix</h2>
                <p className="mt-4 font-ui text-sm text-ink-2">Escaneie o QR Code no app do seu banco ou use o código copia e cola.</p>
                <div className={`mt-6 flex items-center gap-3 rounded-full border px-5 py-3 ${left <= 60 ? 'border-danger bg-[#fef2f2]' : 'border-brand bg-brand-0'}`} role="timer">
                  <Ico name="timer" className="size-5 text-ink" />
                  <span className="flex-1 font-ui text-sm text-ink">Pague dentro de</span>
                  <span className="text-[28px] font-bold leading-none text-ink">{mmss(left)}</span>
                </div>
                <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="self-start rounded-2xl border border-line bg-body-2 p-4">
                    <FakeQr seed={pix.code} />
                  </div>
                  <div>
                    <p className="font-ui text-xs text-ink-3">Total a pagar</p>
                    <p className="mt-2 text-[28px] font-bold leading-none text-ink">{brl(t.total)}</p>
                    <p className="mt-3 font-ui text-sm text-ink-2">Confira o valor antes de confirmar no seu banco.</p>
                  </div>
                </div>
                <p className="mt-8 text-sm font-semibold text-ink">Pix copia e cola</p>
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-line bg-body-2 px-4 py-3">
                  <span className="min-w-0 flex-1 truncate font-ui text-xs text-ink-2">{pix.code}</span>
                  <button type="button" onClick={copy} className="flex items-center gap-1.5 rounded-lg px-2 py-1 font-ui text-xs font-semibold text-ink hover:bg-body-3" aria-label="Copiar código Pix">
                    <Ico name="copy" className="size-4" />
                    <span aria-live="polite">{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <p className="mt-8 text-sm font-semibold text-ink">Como pagar</p>
                <ol className="mt-3 list-decimal pl-4 font-ui text-xs leading-6 text-ink-2">
                  <li>Abra o app do seu banco e acesse a área Pix.</li>
                  <li>Leia o QR Code ou cole o código.</li>
                  <li>Confira o valor e confirme o pagamento.</li>
                </ol>
                <p className="mt-4 font-ui text-xs text-ink-2">Assim que o pagamento for identificado, esta tela será atualizada.</p>
                <button
                  type="button"
                  onClick={onPaid}
                  className="mt-6 w-full rounded-full border border-brand py-[13px] font-ui text-[15px] font-semibold text-brand hover:border-brand-700 hover:text-brand-700"
                >
                  Já paguei
                </button>
              </>
            )}
          </Card>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Totals t={t} order={order} title="Total a pagar" showTimer={false} />
          </aside>
        </div>
      </div>
      <ProcessingDialog open={status === 'processing'} />
      <FailedDialog open={status === 'failed'} onClose={onRetry} actionLabel="Gerar novo Pix" />
    </div>
  )
}

/** QR ilustrativo (o real virá da API do Pix). */
function FakeQr({ seed }) {
  const n = 25
  const cells = useMemo(() => {
    let h = 0
    for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
    const out = []
    for (let i = 0; i < n * n; i++) {
      h = (h * 1103515245 + 12345) >>> 0
      out.push((h >>> 16) & 1)
    }
    return out
  }, [seed])
  const finder = (x, y) => {
    for (const [fx, fy] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
      const dx = x - fx
      const dy = y - fy
      if (dx >= 0 && dx < 7 && dy >= 0 && dy < 7) return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4) ? 1 : 0
    }
    return null
  }
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="size-[180px]" role="img" aria-label="QR Code do Pix" shapeRendering="crispEdges">
      <rect width={n} height={n} fill="#fff" />
      {cells.map((v, i) => {
        const x = i % n
        const y = Math.floor(i / n)
        const f = finder(x, y)
        return (f ?? v) ? <rect key={i} x={x} y={y} width="1" height="1" fill="#000" /> : null
      })}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Pop-ups                                                             */
/* ------------------------------------------------------------------ */
function InfoDialog({ open, onClose, title, children }) {
  const id = useId()
  return (
    <Dialog open={open} onClose={onClose} labelledBy={id}>
      <div className="flex justify-end">
        <button type="button" onClick={onClose} aria-label="Fechar" className="flex size-8 items-center justify-center rounded-full text-ink hover:bg-body-2">
          <Ico name="close" className="size-6" />
        </button>
      </div>
      <h2 id={id} className="text-2xl font-bold leading-tight text-ink">
        {title}
      </h2>
      <div className="mt-3 flex flex-col gap-5 font-ui text-sm leading-6 text-ink-2">{children}</div>
      <button type="button" onClick={onClose} className="mt-6 w-full rounded-full bg-brand py-[14px] font-ui text-[15px] font-semibold text-white hover:brightness-110">
        Entendi
      </button>
    </Dialog>
  )
}

const Spinner = () => (
  <span className="relative block size-16" aria-hidden>
    <span className="absolute inset-0 rounded-full border-[6px] border-brand-0" />
    <span className="absolute inset-0 animate-spin rounded-full border-[6px] border-transparent border-t-brand" />
  </span>
)

/** "Status de pagamento" (Figma 8657:159577). */
function ProcessingDialog({ open }) {
  return (
    <Dialog open={open} onClose={() => {}} labelledBy="proc-t" className="max-w-[560px] text-center !p-10">
      <div className="flex justify-center">
        <Spinner />
      </div>
      <p className="mt-6 font-ui text-xs font-medium uppercase tracking-wide text-brand">Transação em análise</p>
      <h2 id="proc-t" className="mt-3 text-[32px] font-bold leading-tight text-ink">
        Estamos processando o seu pagamento
      </h2>
      <p className="mt-3 font-ui text-sm text-ink-2" role="status">
        Aguarde enquanto validamos a transação e atualizamos o pedido. Não feche ou recarregue esta página.
      </p>
      <p className="mt-6 flex items-center gap-3 rounded-xl bg-brand px-5 py-4 text-left text-sm font-bold text-white">
        <Ico name="lock" className="size-5" /> Sua reserva de ingresso continua ativa
      </p>
    </Dialog>
  )
}

/** "Pagamento não identificado" (Figma 9951:39291). */
function FailedDialog({ open, onClose, actionLabel = 'Tentar novamente' }) {
  return (
    <Dialog open={open} onClose={onClose} labelledBy="fail-t" className="max-w-[344px] text-center">
      <div className="flex justify-end">
        <button type="button" onClick={onClose} aria-label="Fechar" className="flex size-8 items-center justify-center rounded-full text-ink hover:bg-body-2">
          <Ico name="close" className="size-6" />
        </button>
      </div>
      <div className="flex justify-center text-ink">
        <Ico name="moneyOff" className="size-14" />
      </div>
      <h2 id="fail-t" className="mt-6 text-2xl font-bold leading-tight text-ink">
        Não identificamos seu pagamento
      </h2>
      <p className="mt-2 font-ui text-sm text-ink-2">Nenhum valor foi cobrado. Sua reserva continua ativa enquanto o tempo não acabar.</p>
      <button type="button" onClick={onClose} className="mt-6 w-full rounded-full bg-brand py-[14px] font-ui text-[15px] font-semibold text-white hover:brightness-110">
        {actionLabel}
      </button>
    </Dialog>
  )
}
