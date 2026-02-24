import { Monitor, Users, Kanban, BarChart3, FileText } from "lucide-react"

const SCREENS = [
  {
    icon: Users,
    title: "Gestao de Contas",
    description: "Tabela com filtros por Tier, Onda e Responsavel. Score visual com 5 eixos e acoes rapidas.",
    mockup: AccountsMockup,
  },
  {
    icon: Kanban,
    title: "Pipeline Kanban",
    description: "Visualizacao Kanban com drag-and-drop e lista alternativa. 9 estagios com contadores e MRR.",
    mockup: PipelineMockup,
  },
  {
    icon: BarChart3,
    title: "Dashboard KPI",
    description: "7 indicadores em tempo real, semaforo de metas, funil horizontal e MRR por Tier.",
    mockup: DashboardMockup,
  },
  {
    icon: FileText,
    title: "Relatorio Executivo",
    description: "Geracao automatica a partir da visita, workflow de aprovacao e exportacao PDF corporativo.",
    mockup: ReportMockup,
  },
]

function AccountsMockup() {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-3 w-20 rounded bg-[#0077b6]/20" />
        <div className="h-3 w-16 rounded bg-border" />
        <div className="h-3 w-16 rounded bg-border" />
        <div className="ml-auto h-7 w-20 rounded bg-[#0077b6]/15 border border-[#0077b6]/20" />
      </div>
      <div className="space-y-2">
        {[
          { name: "TOTVS S.A.", tier: "A", score: 22, color: "#0077b6" },
          { name: "Natura &Co", tier: "A", score: 20, color: "#0077b6" },
          { name: "Embraer", tier: "B", score: 16, color: "#f59e0b" },
          { name: "Votorantim", tier: "B", score: 14, color: "#f59e0b" },
          { name: "BRF S.A.", tier: "C", score: 9, color: "#6b7280" },
        ].map((r) => (
          <div key={r.name} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/50 border border-border/50">
            <span className="text-xs font-medium text-foreground w-28 truncate">{r.name}</span>
            <span
              className="text-[10px] font-bold w-6 h-5 flex items-center justify-center rounded text-white"
              style={{ backgroundColor: r.color }}
            >
              {r.tier}
            </span>
            <div className="flex-1 bg-border rounded-full h-2 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(r.score / 25) * 100}%`, backgroundColor: r.color }} />
            </div>
            <span className="text-[10px] text-muted-foreground w-8 text-right">{r.score}/25</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PipelineMockup() {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex gap-3 overflow-hidden">
        {[
          { stage: "Selecionado", count: 12, color: "#0077b6" },
          { stage: "Contato", count: 8, color: "#0077b6" },
          { stage: "Visita", count: 5, color: "#00a8a8" },
          { stage: "Diagnostico", count: 3, color: "#00a8a8" },
          { stage: "Proposta", count: 2, color: "#4caf50" },
        ].map((col) => (
          <div key={col.stage} className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium text-muted-foreground truncate">{col.stage}</span>
              <span className="text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center text-white" style={{ backgroundColor: col.color }}>
                {col.count}
              </span>
            </div>
            <div className="space-y-1.5">
              {Array.from({ length: Math.min(col.count, 3) }).map((_, i) => (
                <div key={i} className="rounded-md border border-border bg-muted/30 p-2">
                  <div className="h-2 w-full rounded bg-border mb-1" />
                  <div className="h-1.5 w-2/3 rounded bg-border/70" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DashboardMockup() {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { label: "MRR Pipeline", val: "R$ 48.5k" },
          { label: "MRR Fechado", val: "R$ 22.1k" },
          { label: "Conversao", val: "34%" },
          { label: "Aging Medio", val: "12d" },
        ].map((k) => (
          <div key={k.label} className="rounded-lg border border-border bg-muted/30 p-2 text-center">
            <div className="text-[8px] text-muted-foreground uppercase tracking-wider">{k.label}</div>
            <div className="text-sm font-bold text-foreground">{k.val}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <div className="flex-1 rounded-lg border border-border bg-muted/30 p-3 flex flex-col justify-end">
          <div className="flex items-end gap-1 h-16">
            {[40, 65, 50, 80, 55, 70, 90].map((h, i) => (
              <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, backgroundColor: i % 2 === 0 ? "#0077b6" : "#00a8a8" }} />
            ))}
          </div>
        </div>
        <div className="w-1/3 rounded-lg border border-border bg-muted/30 p-3">
          <div className="space-y-2">
            {[
              { label: "Tier A", pct: 35 },
              { label: "Tier B", pct: 45 },
              { label: "Tier C", pct: 20 },
            ].map((t) => (
              <div key={t.label}>
                <div className="flex justify-between text-[9px] text-muted-foreground mb-0.5">
                  <span>{t.label}</span>
                  <span>{t.pct}%</span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#0077b6]" style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReportMockup() {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center gap-3 mb-3 pb-2 border-b border-border">
        <div className="h-6 w-6 rounded bg-[#0077b6]/20" />
        <div>
          <div className="h-2.5 w-32 rounded bg-[#0099a0]/30 mb-1" />
          <div className="h-1.5 w-24 rounded bg-border" />
        </div>
        <div className="ml-auto flex gap-1">
          <div className="h-5 w-14 rounded bg-[#4caf50]/20 border border-[#4caf50]/30" />
          <div className="h-5 w-10 rounded bg-[#0077b6]/15 border border-[#0077b6]/20" />
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <div className="h-2 w-24 rounded bg-[#0099a0]/20 mb-1.5" />
          <div className="h-1.5 w-full rounded bg-border" />
          <div className="h-1.5 w-4/5 rounded bg-border mt-1" />
          <div className="h-1.5 w-3/5 rounded bg-border mt-1" />
        </div>
        <div>
          <div className="h-2 w-20 rounded bg-[#0099a0]/20 mb-1.5" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-8 rounded bg-[#f44336]/10 border border-[#f44336]/20" />
            <div className="h-8 rounded bg-[#f44336]/10 border border-[#f44336]/20" />
          </div>
        </div>
        <div>
          <div className="h-2 w-28 rounded bg-[#0099a0]/20 mb-1.5" />
          <div className="h-1.5 w-full rounded bg-border" />
          <div className="h-1.5 w-2/3 rounded bg-border mt-1" />
        </div>
      </div>
    </div>
  )
}

export function ProdutoSection() {
  return (
    <section id="produto" className="py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent">
              <Monitor className="w-5 h-5 text-[#0077b6]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0099a0]">Visual do Produto</h2>
          </div>
          <div className="h-px bg-border mb-3" />
          <p className="text-muted-foreground max-w-2xl">
            Interface moderna e intuitiva projetada para produtividade, com componentes visuais claros e navegacao fluida.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {SCREENS.map((s) => (
            <div key={s.title} className="group">
              <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="p-5 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0077b6]/10 text-[#0077b6]">
                      <s.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
                      <p className="text-xs text-muted-foreground">{s.description}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <s.mockup />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
