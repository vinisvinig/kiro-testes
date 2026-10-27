// "Entrar ou criar conta" (Figma 9552:41480). Login simulado: qualquer e-mail/telefone válido
// e senha com 6+ caracteres entra; a integração real substitui `login()` em auth.js.
import { useEffect, useId, useState } from 'react'
import { closeLogin, login, useAuth } from './auth.js'
import { Dialog, Ico } from './event/parts.jsx'

const isEmail = (v) => /^\S+@\S+\.\S+$/.test(v)
const digits = (v) => v.replace(/\D/g, '')
const isPhone = (v) => /^[\d\s()+-]+$/.test(v) && digits(v).length >= 10

export default function LoginDialog() {
  const { dialog } = useAuth()
  const open = !!dialog
  const id = useId()
  const [step, setStep] = useState('id') // id | password | forgot
  const [who, setWho] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) return
    setStep('id')
    setPass('')
    setError('')
  }, [open])

  const submitId = (e) => {
    e.preventDefault()
    const v = who.trim()
    if (!isEmail(v) && !isPhone(v)) return setError('Informe um e-mail ou telefone válido.')
    setError('')
    setStep('password')
  }
  const submitPass = (e) => {
    e.preventDefault()
    if (pass.length < 6) return setError('A senha precisa ter pelo menos 6 caracteres.')
    const v = who.trim()
    const email = isEmail(v) ? v.toLowerCase() : `${digits(v).slice(-4)}@telefone.uhuu.com`
    login({ name: email.split('@')[0], email, phone: isPhone(v) ? v : null })
  }
  const google = () => login({ name: 'Visitante', email: 'visitante@gmail.com', provider: 'google' })

  const input = `h-[46px] w-full rounded-lg border bg-white px-4 font-ui text-[15px] text-ink outline-none placeholder:text-ink-3 focus:border-brand ${error ? 'border-danger' : 'border-line'}`

  return (
    <Dialog open={open} onClose={closeLogin} labelledBy={`${id}-t`} className="max-w-[560px] bg-body-2 !p-8 md:!p-10">
      <div className="flex justify-end">
        <button type="button" onClick={closeLogin} aria-label="Fechar" className="flex size-8 items-center justify-center rounded-full text-ink hover:bg-body-3">
          <Ico name="close" className="size-6" />
        </button>
      </div>
      <h2 id={`${id}-t`} className="mt-2 text-[28px] font-bold leading-tight text-ink">
        {step === 'forgot' ? 'Recuperar senha' : 'Entrar ou criar conta'}
      </h2>

      {step === 'id' && (
        <form onSubmit={submitId} noValidate>
          <p className="mt-2 font-ui text-base leading-6 text-ink-2">
            Entre na Uhuu com a sua conta.
            <br />
            Se você não tiver conta, precisará criar uma.
          </p>
          <label htmlFor={`${id}-who`} className="mt-8 block text-sm font-bold text-ink">
            E-mail ou Telefone
          </label>
          <input
            id={`${id}-who`}
            autoFocus
            autoComplete="username"
            value={who}
            onChange={(e) => (setWho(e.target.value), setError(''))}
            placeholder="seu@email.com ou +55 11 9000-0000"
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-err` : undefined}
            className={`mt-3 ${input}`}
          />
          {error && (
            <p id={`${id}-err`} className="mt-2 font-ui text-xs text-danger">
              {error}
            </p>
          )}
          <button type="button" onClick={() => (setError(''), setStep('forgot'))} className="mt-6 font-ui text-sm font-semibold text-brand underline hover:no-underline">
            Esqueci minha senha
          </button>
          <button type="submit" className="mt-8 w-full rounded-full bg-brand py-[14px] font-ui text-[15px] font-semibold text-white hover:brightness-110">
            Continuar
          </button>
          <div className="my-6 flex items-center gap-4 font-ui text-sm text-ink" aria-hidden>
            <span className="h-px flex-1 bg-line" /> ou <span className="h-px flex-1 bg-line" />
          </div>
          <button
            type="button"
            onClick={google}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-line bg-white py-[13px] font-ui text-[15px] font-semibold text-ink hover:bg-body-2"
          >
            <GoogleIcon /> Entrar com o Google
          </button>
        </form>
      )}

      {step === 'password' && (
        <form onSubmit={submitPass} noValidate>
          <p className="mt-2 font-ui text-base leading-6 text-ink-2">
            Entrando como <strong className="text-ink">{who.trim()}</strong>.{' '}
            <button type="button" onClick={() => (setError(''), setStep('id'))} className="font-semibold text-brand underline hover:no-underline">
              Trocar
            </button>
          </p>
          <label htmlFor={`${id}-pass`} className="mt-8 block text-sm font-bold text-ink">
            Senha
          </label>
          <input
            id={`${id}-pass`}
            type="password"
            autoFocus
            autoComplete="current-password"
            value={pass}
            onChange={(e) => (setPass(e.target.value), setError(''))}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-err` : `${id}-hint`}
            className={`mt-3 ${input}`}
          />
          {error ? (
            <p id={`${id}-err`} className="mt-2 font-ui text-xs text-danger">
              {error}
            </p>
          ) : (
            <p id={`${id}-hint`} className="mt-2 font-ui text-xs text-ink-3">
              Simulação: qualquer senha com 6 ou mais caracteres entra.
            </p>
          )}
          <button type="submit" className="mt-8 w-full rounded-full bg-brand py-[14px] font-ui text-[15px] font-semibold text-white hover:brightness-110">
            Entrar
          </button>
        </form>
      )}

      {step === 'forgot' && (
        <div>
          <p className="mt-2 font-ui text-base leading-6 text-ink-2">
            {who.trim()
              ? `Se houver uma conta para ${who.trim()}, enviaremos as instruções para criar uma nova senha.`
              : 'Informe seu e-mail ou telefone na tela anterior para receber as instruções de recuperação.'}
          </p>
          <button type="button" onClick={() => setStep('id')} className="mt-8 w-full rounded-full bg-brand py-[14px] font-ui text-[15px] font-semibold text-white hover:brightness-110">
            Voltar para o login
          </button>
        </div>
      )}
    </Dialog>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}
