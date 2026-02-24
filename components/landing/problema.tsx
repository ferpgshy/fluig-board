import { AlertTriangle, Eye, TrendingDown, ShieldAlert } from "lucide-react"

const PROBLEMS = [
  {
    icon: Eye,
    title: "Falta de visao do pipeline",
    description: "Sem visibilidade centralizada das oportunidades, estagios e gargalos do funil comercial.",
  },
  {
    icon: TrendingDown,
    title: "Oportunidades estagnadas",
    description: "Deals parados sem aging automatico, sem alertas e sem acompanhamento de prazo.",
  },
  {
    icon: AlertTriangle,
    title: "Score subjetivo",
    description: "Classificacao de contas baseada em intuicao, sem criterios padronizados ou recalculo automatico.",
  },
  {
    icon: ShieldAlert,
    title: "Falta de governanca",
    description: "Ausencia de relatorios executivos, trilha de auditoria e controle sobre a operacao comercial.",
  },
]

export function ProblemaSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent">
              <AlertTriangle className="w-5 h-5 text-[#0077b6]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0099a0]">O Problema</h2>
          </div>
          <div className="h-px bg-border mb-3" />
          <p className="text-muted-foreground max-w-2xl">
            Times comerciais enfrentam desafios criticos que comprometem a previsibilidade de receita e a eficiencia operacional.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROBLEMS.map((p) => (
            <div
              key={p.title}
              className="group bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md hover:border-[#0077b6]/30 transition-all duration-300"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#f44336]/10 text-[#f44336] mb-4 group-hover:scale-110 transition-transform duration-300">
                <p.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
