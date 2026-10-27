// "Resultado de compra" (Figma 9162:192154 / 9162:191828): pedido efetuado com sucesso.
import { useState } from 'react'
import { maskEmail } from '../auth.js'
import { EVENT } from './eventData.js'
import { Card, Ico, brl } from './parts.jsx'

export default function OrderSuccess({ result, onHome }) {
  const [copied, setCopied] = useState(false)
  const [notice, setNotice] = useState('')
  const soon = (what) => setNotice(`${what} estará disponível na próxima fase do projeto.`)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.number)
    } catch {
      /* sem permissão de área de transferência */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Comprovante simples em texto até existir o PDF real do ingresso.
  const download = () => {
    const text = [
      'Uhuu.com — comprovante do pedido',
      `Pedido #${result.number}`,
      EVENT.title,
      `${result.tickets} ${result.tickets === 1 ? 'ingresso' : 'ingressos'}`,
      `Total pago: ${brl(result.total)} (${result.method === 'pix' ? 'Pix' : 'Cartão de crédito'})`,
    ].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
    a.download = `pedido-${result.number}.txt`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const action = (icon, label, onClick, brand = false) => (
    <button type="button" onClick={onClick} className={`flex items-center gap-2 font-ui text-xs font-semibold ${brand ? 'text-brand' : 'text-ink'}`}>
      <span className={`flex size-10 items-center justify-center rounded-full border ${brand ? 'border-brand' : 'border-line'}`}>
        <Ico name={icon} className={`size-4 ${brand ? '' : 'text-brand'}`} />
      </span>
      {label}
    </button>
  )

  return (
    <div className="bg-body-3 py-8 md:py-12">
      <div className="page-x">
        <div className="mx-auto flex max-w-[660px] flex-col gap-6">
          <Card className="md:!p-7">
            <h1 className="flex items-center gap-3 text-2xl font-bold leading-tight text-brand md:text-[28px]">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f0fdf4] text-success">
                <Ico name="checkCircle" className="size-5" />
              </span>
              Uhuu! Pedido efetuado com sucesso!
            </h1>
            <div className="mt-4 flex items-center gap-2">
              <span className="rounded-lg bg-body-2 px-3 py-1.5 font-ui text-xs text-ink-2">
                Pedido <strong className="ml-1 text-sm text-ink">#{result.number}</strong>
              </span>
              <button type="button" onClick={copy} aria-label="Copiar número do pedido" className="flex size-8 items-center justify-center rounded-lg border border-line text-ink hover:bg-body-2">
                <Ico name="copy" className="size-4" />
              </button>
              <span aria-live="polite" className="font-ui text-xs text-success">
                {copied ? 'Copiado!' : ''}
              </span>
            </div>
            <button
              type="button"
              onClick={() => soon('Adicionar à carteira do Google')}
              className="mt-4 flex items-center gap-2 rounded-full bg-black px-4 py-2.5 font-ui text-sm font-medium text-white hover:bg-ink-dark"
            >
              <span className="h-4 w-5 rounded-sm bg-[linear-gradient(180deg,#ea4335_0_25%,#fbbc04_25%_50%,#34a853_50%_75%,#4285f4_75%)]" aria-hidden />
              Adicionar à carteira do Google
            </button>

            <p className="mt-6 font-ui text-base leading-6 text-ink-2">
              <strong className="text-ink">Seus ingressos serão enviados para o e-mail {maskEmail(result.email)}</strong> bem como todas as informações do pedido.
            </p>
            <p className="mt-2 font-ui text-[11px] text-ink-3">(Não esqueça de conferir o lixo eletrônico ou spam)</p>
            <p className="mt-3 font-ui text-sm leading-6 text-ink-2">
              Confira se o endereço de e-mail está correto para garantir o recebimento dos ingressos. Caso precise corrigi-lo, entre em contato com o suporte.
            </p>
            {result.delivery === 'expressa' && (
              <p className="mt-3 rounded-xl bg-body-2 p-3 font-ui text-sm text-ink-2">Os ingressos físicos chegam pela entrega expressa em até 5 dias úteis.</p>
            )}
            <div className="mt-5 flex flex-wrap gap-6 border-t border-line pt-5">
              {action('download', 'Baixar', download)}
              {action('print', 'Imprimir', () => window.print())}
              {action('ticket', 'Meus Pedidos', () => soon('A área Meus Pedidos'), true)}
            </div>
            {notice && (
              <p role="status" className="mt-4 rounded-xl bg-brand-0 px-4 py-3 font-ui text-sm text-brand">
                {notice}
              </p>
            )}
          </Card>

          <Card className="md:!p-7">
            {/* Mensagem personalizada: um único texto livre, editado pelo produtor no AppADM */}
            <p className="whitespace-pre-line font-ui text-base leading-6 text-ink-2">{EVENT.thankYou}</p>
            <img src={EVENT.hero} alt="" className="mt-4 h-[140px] w-full rounded-lg object-cover" />
          </Card>

          {result.insurance && (
            <Card className="!bg-[#f5f9ff]">
              <p className="flex items-center gap-3 text-base font-bold text-ink">
                <span className="flex size-7 items-center justify-center rounded-full bg-[#dbeafe] text-info">
                  <Ico name="shield" className="size-4" />
                </span>
                Seguro Ingresso Protegido Contratado
              </p>
              <p className="mt-3 font-ui text-sm leading-6 text-ink-2">
                A seguradora enviará um e-mail com todos os detalhes da sua cobertura e instruções sobre como acionar o seguro caso necessário.
              </p>
            </Card>
          )}

          <button type="button" onClick={onHome} className="self-center rounded-full border border-brand px-6 py-[11px] font-ui text-sm font-semibold text-brand hover:bg-brand-0">
            Voltar para a home
          </button>
        </div>
      </div>
    </div>
  )
}
