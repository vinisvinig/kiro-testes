// Gera uma imagem placeholder como data-URI SVG (sem dependência de rede).
// Útil para manter o layout fiel ao mock sem baixar imagens externas.

const PALETTES = [
  ['#1f2937', '#4b5563'],
  ['#7c2d12', '#b91c1c'],
  ['#78350f', '#d97706'],
  ['#3730a3', '#6366f1'],
  ['#831843', '#db2777'],
  ['#064e3b', '#059669'],
  ['#1e3a8a', '#3b82f6'],
  ['#4a044e', '#a21caf'],
]

function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

/**
 * @param {object} opts
 * @param {number} opts.w largura
 * @param {number} opts.h altura
 * @param {string} [opts.label] texto exibido
 * @param {string} [opts.seed] semente para escolher a cor
 */
export function placeholder({ w = 400, h = 300, label = '', seed = '' }) {
  const key = seed || label || `${w}x${h}`
  const [c1, c2] = PALETTES[hashString(key) % PALETTES.length]
  const fontSize = Math.max(14, Math.round(Math.min(w, h) / 12))
  const safeLabel = String(label)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${c1}"/>
        <stop offset="1" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <text x="50%" y="50%" fill="rgba(255,255,255,0.92)" font-family="'Barlow Semi Condensed', Arial, sans-serif"
      font-size="${fontSize}" font-weight="700" text-anchor="middle" dominant-baseline="middle">${safeLabel}</text>
  </svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
