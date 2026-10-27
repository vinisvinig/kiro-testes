import { useState } from 'react'
import Icon from './Icon.jsx'

// Bloco de captura de e-mail. Validação básica no cliente.
export default function Newsletter() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.includes('@')) return
    setSent(true)
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="rounded-2xl bg-gradient-to-r from-brand-pink to-brand-pinkDark text-white p-6 md:p-10">
        <div className="flex items-start gap-3">
          <span className="hidden sm:grid place-items-center w-11 h-11 rounded-full bg-white/15">
            <Icon name="mail" className="w-5 h-5" />
          </span>
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-extrabold">Cadastre-se para receber atualizações por email</h2>
            <p className="mt-1 text-white/85 text-sm">
              Receba as novidades dos melhores eventos direto no seu email. Sem spam.
            </p>

            {sent ? (
              <p className="mt-5 font-semibold">Pronto{name ? `, ${name}` : ''}! Você está na nossa lista. 🎉</p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="rounded-lg px-4 py-2.5 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-white"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu melhor email"
                  className="rounded-lg px-4 py-2.5 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-white"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-white text-brand-pink font-bold px-6 py-2.5 text-sm hover:bg-white/90 transition-colors"
                >
                  Cadastrar
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
