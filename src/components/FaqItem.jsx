import { useEffect, useId, useRef, useState } from 'react'
import { Ico } from '../event/parts.jsx'

/**
 * Item de FAQ compartilhado entre a página do evento e a de casas/locais
 * (Figma "Categoria expande - FAQ", 7903:97391): borda #d4d4d4, raio 8px, 16px nas laterais e 24px
 * em cima e embaixo, pergunta em 18px negrito, seta arredondada e resposta em 14px.
 */
export default function FaqItem({ item, open, onToggle }) {
  const id = useId()
  const panel = useRef(null)
  const [h, setH] = useState(0)
  useEffect(() => setH(open ? panel.current?.scrollHeight || 0 : 0), [open])
  return (
    <div className="rounded-lg border border-line bg-white">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-p`}
          onClick={onToggle}
          className="flex min-h-[70px] w-full items-center gap-4 px-4 py-6 text-left"
        >
          <span className="flex-1 text-base font-bold leading-tight text-ink md:text-[18px]">{item.q}</span>
          <Ico name="expand" className={`size-4 text-ink transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </h3>
      <div id={`${id}-p`} role="region" hidden={!open && h === 0} style={{ height: h }} className="overflow-hidden transition-[height] duration-300">
        <p ref={panel} className="px-4 pb-6 font-ui text-sm leading-[22px] text-ink">
          {item.a}
        </p>
      </div>
    </div>
  )
}
