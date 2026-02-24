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
    { label: "Sobre nos", href: "#diferenciais" },
    { label: "Como Funciona", href: "#como-funciona" },
    { label: "Solicitar Acesso", href: "/cadastro" },
    { label: "Entrar", href: "/login" },
  ],
  Suporte: [
    { label: "Solicitar Acesso", href: "/cadastro" },
    { label: "Login", href: "/login" },
    { label: "Contato", href: "/contato" },
    { label: "Politica de Privacidade", href: "/privacidade" },
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
              <span className="text-xl font-bold text-white">Fluig | Ação Comercial</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed max-w-sm mb-6">
              Plataforma estrategica de gestao de contas, pipeline inteligente, roteiro consultivo e relatorios executivos para equipes comerciais de alta performance.
            </p>
            <a
              href="mailto:contato@fluigboard.com.br"
              className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              contato@fluigboard.com.br
            </a>
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
            {"© 2025 Fluig | Ação Comercial. Todos os direitos reservados."}
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacidade" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              Politica de Privacidade
            </Link>
            <Link href="/contato" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              Contato
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
