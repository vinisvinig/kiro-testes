// Sessão do usuário (simulada). A escolha de ingressos é livre; o login é pedido no "Comprar".
// Troque login/logout pela integração real (API de autenticação) quando existir.
import { useSyncExternalStore } from 'react'

const KEY = 'uhuu-user'
const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null
  } catch {
    return null
  }
}

let state = { user: read(), dialog: null } // dialog: { onSuccess } quando o login está aberto
const listeners = new Set()
const set = (patch) => {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}
const subscribe = (l) => (listeners.add(l), () => listeners.delete(l))

export function useAuth() {
  return useSyncExternalStore(subscribe, () => state)
}

export const getUser = () => state.user

/** Abre o login. `onSuccess` roda depois de entrar (ex.: seguir para o pagamento). */
export function openLogin(onSuccess) {
  if (state.user) return onSuccess?.(state.user)
  set({ dialog: { onSuccess } })
}

export const closeLogin = () => set({ dialog: null })

export function login(user) {
  localStorage.setItem(KEY, JSON.stringify(user))
  const cb = state.dialog?.onSuccess
  set({ user, dialog: null })
  cb?.(user)
}

export function logout() {
  localStorage.removeItem(KEY)
  set({ user: null })
}

/** vi•••@uhuu.com */
export const maskEmail = (email = '') => {
  const [u, d] = email.split('@')
  return d ? `${u.slice(0, 2)}•••@${d}` : email
}
