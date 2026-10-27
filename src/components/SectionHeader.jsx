import Icon from './Icon.jsx'

// Cabeçalho de seção reutilizável. Opcionalmente renderiza um par de setas
// de navegação (usadas pelos carrosséis) e um ícone antes do título.
export default function SectionHeader({ icon, title, onPrev, onNext, showArrows = false }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <h2 className="flex items-center gap-2 text-lg md:text-xl font-bold text-gray-900">
        {icon && <Icon name={icon} className="w-5 h-5 text-brand-pink" />}
        {title}
      </h2>

      {showArrows && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Anterior"
            className="grid place-items-center w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Icon name="chevronLeft" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Próximo"
            className="grid place-items-center w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Icon name="chevronRight" className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
