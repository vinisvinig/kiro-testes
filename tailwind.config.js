/** @type {import('tailwindcss').Config} */
// Tokens extraídos do Figma (Site Nova Experiência — Uhuu.com 2026)
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#ee3680', 0: '#fde8f1', 700: '#c51159' }, // 700: hover do botão outline (DS 4126:4916)
        ink: {
          DEFAULT: '#171717', // Texto/Primário
          2: '#404040', // Texto/Secundário
          3: '#737373', // Texto/Terciário
          4: '#a3a3a3', // Texto/Terciário Light
          dark: '#0a0a0a',
          800: '#252525', // Neutro/800
        },
        line: '#d4d4d4', // Border Color
        body: { DEFAULT: '#fafbfb', 2: '#f5f5f5', 3: '#e5e5e5' },
        success: '#15803d',
        alert: '#f59e0b',
        mark: '#fcd34d', // Semânticas/Alerta/300 — destaque do termo no autocomplete
        orange: '#ff8000',
        indigo: '#6366f1',
        info: '#3b82f6',
        danger: '#ef4444',
        night: { DEFAULT: '#18121f', card: '#130d1a' },
        combo: { DEFAULT: '#8000ff', 0: '#f4eaff' }, // Combos (Figma: Secundárias/500-principal e /50)
      },
      fontFamily: {
        sans: ['"Barlow Semi Condensed"', 'system-ui', 'sans-serif'],
        ui: ['Barlow', 'system-ui', 'sans-serif'],
      },
      letterSpacing: { ui: '0.005em' },
      // Margens proporcionais ao Figma (1440 de largura): 88px = 6,111vw; caixas cinza: 40px de recuo + 48px de padding
      maxWidth: { page: 'none', content: 'none' },
      spacing: { 22: '88px', 28: '112px', margem: '6.111vw', caixa: '2.778vw', 'caixa-in': '3.333vw' },
    },
  },
  plugins: [],
}
