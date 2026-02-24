import { Users, Kanban, ClipboardCheck, FileText, LayoutDashboard, Lightbulb } from "lucide-react"

const PILLARS = [
  {
    icon: Users,
    title: "Gestao de Contas",
    description: "Cadastro completo com porte, contato, versao Fluig, modulos contratados e 5 eixos de score calculados automaticamente.",
    highlight: "Score 0-25 com Tier automatico",
  },
  {
    icon: Kanban,
    title: "Pipeline Inteligente",
    description: "Funil visual com 9 estagios, transicao linear obrigatoria, aging automatico e controle de MRR estimado e fechado.",
    highlight: "Kanban + Lista com drag-and-drop",
  },
  {
    icon: ClipboardCheck,
    title: "Roteiro Consultivo",
    description: "Assessment estruturado em 4 eixos de diagnostico: Processos, Tecnologia, Pessoas e Governanca. Com auto-save a cada 30s.",
    highlight: "4 eixos com perguntas sugeridas",
  },
  {
    icon: FileText,
    title: "Relatorios Executivos",
    description: "Geracao automatica de relatorios a partir da visita, com workflow de revisao, exportacao PDF e template corporativo.",
    highlight: "Workflow Rascunho -> Revisao -> Enviado",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard Estrategico",
    description: "7 KPIs em tempo real, semaforo de metas, grafico de funil horizontal, MRR por Tier e alertas automaticos.",
    highlight: "Visao executiva completa",
  },
]

export function SolucaoSection() {
  return (
    <section id="funcionalidades" className="py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent">
              <Lightbulb className="w-5 h-5 text-[#0077b6]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0099a0]">A Solucao</h2>
          </div>
          <div className="h-px bg-border mb-3" />
          <p className="text-muted-foreground max-w-2xl">
            Cinco pilares integrados para transformar sua operacao comercial em um processo previsivel, governado e orientado a dados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PILLARS.map((p, i) => (
            <div
              key={p.title}
              className={`group relative bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md hover:border-[#00a8a8]/40 transition-all duration-300 ${
                i >= 3 ? "lg:col-span-1 md:col-span-1" : ""
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r from-[#0077b6] to-[#00a8a8] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent text-[#0077b6] mb-4 group-hover:scale-110 transition-transform duration-300">
                <p.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.description}</p>
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#00a8a8] bg-[#00a8a8]/10 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00a8a8]" />
                {p.highlight}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
