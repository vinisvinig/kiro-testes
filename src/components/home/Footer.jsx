import { asset } from './ui.jsx'

const LINKS = [
  ['Quem somos', 'https://uhuu.com/quem-somos'],
  ['Central de políticas e termos', 'https://uhuu.com/termos'],
  ['Trabalhe conosco', 'https://grupofour.inhire.app/uhuu/vagas'],
  ['Central de ajuda', 'https://ajudauhuu.octadesk.com/kb'],
  ['Faça seu evento na Uhuu', 'https://sobre.uhuu.com/Venda-Na-Uhuu'],
  ['Blog', 'https://sobre.uhuu.com/blog'],
]

const SOCIAL = ['instagram', 'facebook', 'tiktok', 'linkedin', 'spotify', 'blog']

// [arquivo, classes de tamanho] — proporções do Figma
const PAYMENTS = [
  ['pay-visa.svg', 'h-[10.356px] w-8', 'Visa'],
  ['pay-mastercard.svg', 'h-[19.776px] w-8', 'Mastercard'],
  ['pay-elo.svg', 'size-8', 'Elo'],
  ['pay-hipercard.svg', 'size-8', 'Hipercard'],
  ['pay-amex.svg', 'h-[31.921px] w-8', 'American Express'],
  ['pay-diners.svg', 'size-8', 'Diners Club'],
  ['pay-pix.svg', 'size-8', 'Pix'],
]

function ColTitle({ children }) {
  return <p className="text-xl font-bold leading-none text-ink">{children}</p>
}

/** Rodapé (Figma 5438:15887) */
export default function Footer() {
  return (
    <footer className="flex flex-col gap-14 bg-[#fafafa] pt-14">
      <div className="page-x">
        {/* A partir de 1280: as 4 colunas numa linha com espaço automático entre elas (justify-between), então os selos
            ficam alinhados à direita. O gap-8 é o espaço mínimo: em 1440 dá 32px, como no Figma; em telas maiores ele cresce e, entre 1280 e 1440, as 3 primeiras colunas encolhem. */}
        <div className="mx-auto flex flex-col gap-8 md:flex-row md:flex-wrap xl:flex-nowrap xl:justify-between">
          <div className="flex flex-col gap-4 md:w-[271px]">
            <div className="flex h-10 items-center">
              <img src={asset('logo.svg')} alt="Uhuu.com" className="h-8 w-[102.9px]" />
            </div>
            {/* Mobile: lista com divisórias e chevron (Figma 5531:20009) */}
            <nav
              className="flex flex-col border-t border-line text-base leading-6 text-ink md:gap-2 md:border-0 md:text-ink-2"
              aria-label="Institucional"
            >
              {LINKS.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between border-b border-line py-3 hover:text-brand md:border-0 md:py-0"
                >
                  {label}
                  <img src={asset('ic-chevron-right.svg')} alt="" className="size-4 md:hidden" />
                </a>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-4 border-b border-line pb-8 md:w-[271px] md:border-0 md:pb-0">
            <ColTitle>Redes Sociais</ColTitle>
            <div className="flex flex-wrap gap-4">
              {SOCIAL.map((s) => (
                <a key={s} href="#" aria-label={s} className="relative size-8 overflow-hidden transition hover:opacity-80">
                  <img src={asset('soc-branco.svg')} alt="" className="absolute inset-[1.56%]" />
                  <img src={asset(`soc-${s}.svg`)} alt="" className="absolute inset-0 size-full" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 border-b border-line pb-8 md:w-[271px] md:border-0 md:pb-0">
            <ColTitle>Pague com</ColTitle>
            <div className="flex flex-wrap gap-[10px]">
              {PAYMENTS.map(([file, size, label]) => (
                <span key={file} className="flex size-8 items-center justify-center overflow-hidden">
                  <img src={asset(file)} alt={label} className={size} />
                </span>
              ))}
            </div>
          </div>

          <div className="flex w-[355px] max-w-full shrink-0 flex-col gap-4">
            <ColTitle>Selos Reclame Aqui</ColTitle>
            <ReclameAquiSeals />
          </div>
        </div>
      </div>

      <div className="bg-ink-dark px-4 py-8">
        <div className="flex flex-col items-center gap-[10px] text-center text-xs font-light leading-5 text-white md:text-base md:leading-6">
          <p>© 2026 - uhuu.com</p>
          <p>
            Uhuu.com Tecnologia LTDA | Av. Ipiranga, 6681 - Prédio 95 - A - Tecnopuc - Porto Alegre/RS - CEP 90610-970 |
            CNPJ 28.269.175/0001-18
          </p>
        </div>
      </div>
    </footer>
  )
}

/** Selos compostos por várias camadas vetoriais — posições copiadas do Figma. */
function ReclameAquiSeals() {
  const layer = (file, inset) => (
    <img src={asset(file)} alt="" className="absolute block" style={{ inset }} />
  )
  return (
    <div className="flex items-start gap-[10px]" aria-label="Selos Reclame Aqui">
      <div className="flex flex-col items-center gap-[8.645px]">
        <div className="relative h-[44.955px] w-[122.748px] overflow-hidden">
          {layer('ra-v0.svg', '0 0.13%')}
          {layer('ra-v1.svg', '1.92% 0.7% 1.89% 0.7%')}
          {layer('ra-v2.svg', '28.13% 76.82% 27.96% 6.89%')}
          {layer('ra-v3.svg', '40.27% 80.12% 39.89% 10.21%')}
          {layer('ra-xml.svg', '52.5% 7.03% 17.05% 28.17%')}
          {layer('ra-v4.svg', '13.45% 0 12.69% 99.63%')}
          {layer('ra-v5.svg', '12.62% 99.7% 13.55% 0')}
          <p
            className="absolute whitespace-nowrap text-black"
            style={{ inset: '17.31% 16.43% 56% 28.17%', fontFamily: 'Arial, sans-serif', fontSize: 10.525, letterSpacing: 0.21 }}
          >
            Verificada por
          </p>
        </div>
        <img src={asset('ra-selo-bandeira.png')} alt="Prêmio Reclame Aqui" className="h-[145.4px] w-[121px] object-cover" />
      </div>

      <img src={asset('ra-premio.png')} alt="Prêmio Reclame Aqui" className="h-[199px] w-[106px] object-cover" />

      <div className="relative h-[199.7px] w-[106px] rounded-b-[32px] rounded-t-full bg-[#333]" aria-label="RA 1000">
        <img src={asset('ra-g92.svg')} alt="" className="absolute" style={{ left: 12.73, top: 14.29, width: 80.343, height: 84.687 }} />
        <img src={asset('ra-1000.svg')} alt="" className="absolute" style={{ left: 12.7, top: 129.57, width: 80.989, height: 14.13 }} />
        <img
          src={asset('ra-group.svg')}
          alt=""
          className="absolute"
          style={{
            left: 12.7,
            top: 172.32,
            width: 80.937,
            height: 12.928,
            WebkitMaskImage: `url(${asset('ra-mask.svg')})`,
            maskImage: `url(${asset('ra-mask.svg')})`,
            maskSize: '80.989px 12.943px',
            WebkitMaskSize: '80.989px 12.943px',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
          }}
        />
      </div>
    </div>
  )
}
