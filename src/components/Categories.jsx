import { categories } from '../data/events.js'
import Icon from './Icon.jsx'

// Faixa de categorias em chips com ícone. Rola horizontalmente no mobile.
export default function Categories() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8">
      <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Categorias</h2>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <a
            key={cat.id}
            href="#"
            className="group flex items-center gap-2 shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-brand-pink hover:text-brand-pink transition-colors"
          >
            <span className="grid place-items-center w-7 h-7 rounded-full bg-gray-100 text-gray-600 group-hover:bg-brand-pink/10 group-hover:text-brand-pink transition-colors">
              <Icon name={cat.icon} className="w-4 h-4" />
            </span>
            {cat.label}
          </a>
        ))}
      </div>
    </section>
  )
}
