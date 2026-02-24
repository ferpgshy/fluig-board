import Link from "next/link"
import { Orbit } from "lucide-react"

const LINKS = {
  Produto: [
    { label: "Gestao de Contas", href: "#funcionalidades" },
    { label: "Pipeline", href: "#funcionalidades" },
    { label: "Roteiro Consultivo", href: "#funcionalidades" },
    { label: "Dashboard", href: "#funcionalidades" },
  ],
  Empresa: [
    { label: "Sobre nos", href: "#" },
    { label: "Carreiras", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contato", href: "#" },
  ],
  Suporte: [
    { label: "Central de Ajuda", href: "#" },
    { label: "Documentacao", href: "#" },
    { label: "Status", href: "#" },
    { label: "Termos de Uso", href: "#" },
  ],
}

export function FooterSection() {
  return (
    <footer className="bg-foreground text-white/80">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#0077b6]">
                <Orbit className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">FluigOrbit</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed max-w-sm mb-6">
              Plataforma estrategica de gestao de contas, pipeline inteligente, roteiro consultivo e relatorios executivos para equipes comerciais de alta performance.
            </p>
            <div className="flex items-center gap-2 text-sm text-white/40">
              <span>contato@fluigorbit.com.br</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{title}</h3>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            {"2025 FluigOrbit. Todos os direitos reservados."}
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              Politica de Privacidade
            </Link>
            <Link href="#" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              Termos de Servico
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
