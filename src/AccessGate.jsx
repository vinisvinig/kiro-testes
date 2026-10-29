// "Validar - Acessar o site" (Figma 10047:214591): senha simples para só os participantes do teste
// verem o protótipo. Não é segurança de verdade (o código do site é público); serve para evitar spoiler.
import { useEffect, useRef, useState } from 'react'

const KEY = 'uhuu-acesso'
// SHA-256 de "samambaia" (a senha não fica em texto no código publicado)
const HASH = '5c18951ec7987999eccc210417aa31b5999eea601ca5b8b66efb2f079fec1090'
const LEN = 9

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

const allowed = () => {
  try {
    return localStorage.getItem(KEY) === HASH
  } catch {
    return false
  }
}

export default function AccessGate({ children }) {
  const [ok, setOk] = useState(allowed)
  if (ok) return children
  return <Gate onOk={() => setOk(true)} />
}

function Gate({ onOk }) {
  const [chars, setChars] = useState(Array(LEN).fill(''))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const refs = useRef([])

  useEffect(() => {
    refs.current[0]?.focus()
    document.title = 'Uhuu.com'
  }, [])

  const focus = (i) => refs.current[Math.max(0, Math.min(LEN - 1, i))]?.focus()

  const fill = (start, text) => {
    const letters = text.replace(/\s/g, '').slice(0, LEN - start).split('')
    if (!letters.length) return
    setChars((c) => {
      const next = [...c]
      letters.forEach((l, k) => (next[start + k] = l))
      return next
    })
    setError('')
    focus(start + letters.length)
  }

  const onKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      setError('')
      setChars((c) => {
        const next = [...c]
        if (next[i]) next[i] = ''
        else if (i > 0) {
          next[i - 1] = ''
          focus(i - 1)
        }
        return next
      })
    } else if (e.key === 'ArrowLeft') focus(i - 1)
    else if (e.key === 'ArrowRight') focus(i + 1)
  }

  const submit = async (e) => {
    e.preventDefault()
    const value = chars.join('').toLowerCase()
    if (value.length < LEN) return setError('Preencha a senha completa.')
    setBusy(true)
    const ok = (await sha256(value)) === HASH
    setBusy(false)
    if (!ok) {
      setError('Senha incorreta. Tente novamente.')
      setChars(Array(LEN).fill(''))
      return focus(0)
    }
    try {
      localStorage.setItem(KEY, HASH)
    } catch {
      /* sem localStorage: libera só nesta visita */
    }
    onOk()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-body-3 px-4 py-10">
      <form onSubmit={submit} noValidate className="flex w-full max-w-[560px] flex-col gap-8 rounded-lg bg-body px-5 pb-16 pt-10 sm:px-10">
        {/* Figma 10047:214591 (atualizado): logo, "Nova Experiência", boas-vindas e a palavra secreta */}
        <div className="flex flex-col gap-8">
          <img src={`${import.meta.env.BASE_URL}figma/logo.svg`} alt="Uhuu.com" className="h-8 w-[102.9px]" />
          <div className="flex flex-col gap-4 text-ink">
            <p className="text-[30px] leading-none">Nova Experiência</p>
            <h1 id="gate-title" className="font-ui text-2xl font-bold leading-tight">
              Bem-vindo ao teste de usuário
            </h1>
          </div>
          <div className="flex flex-col gap-3">
            <label htmlFor="gate-0" className="text-xs leading-4 text-ink">
              Informe a palavra secreta para acessar
            </label>
            <div className="flex w-full justify-between gap-1.5" role="group" aria-label="Palavra secreta">
              {chars.map((ch, i) => (
                <input
                  key={i}
                  id={`gate-${i}`}
                  ref={(el) => (refs.current[i] = el)}
                  value={ch}
                  type="text"
                  maxLength={1}
                  inputMode="text"
                  autoCorrect="off"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-label={`Letra ${i + 1} de ${LEN}`}
                  aria-invalid={!!error}
                  onChange={(e) => fill(i, e.target.value.slice(-1))}
                  onKeyDown={(e) => onKeyDown(i, e)}
                  onPaste={(e) => {
                    e.preventDefault()
                    fill(i, e.clipboardData.getData('text'))
                  }}
                  onFocus={(e) => e.target.select()}
                  placeholder="⚬"
                  className={`h-[62px] w-full min-w-0 max-w-[48px] rounded-lg border bg-white text-center font-ui text-lg font-semibold text-ink outline-none placeholder:text-[15px] placeholder:font-medium placeholder:text-ink-3 focus:border-brand focus:ring-1 focus:ring-brand ${
                    error ? 'border-danger' : 'border-line'
                  }`}
                />
              ))}
            </div>
            <p aria-live="polite" className="min-h-4 font-ui text-sm text-danger">
              {error}
            </p>
          </div>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-brand px-4 py-[14px] font-ui text-[15px] font-semibold text-white hover:brightness-110 disabled:opacity-60"
        >
          Continuar
        </button>
      </form>
    </main>
  )
}
