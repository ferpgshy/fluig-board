import { Zap, RefreshCw, Clock, ShieldCheck, ArrowRightLeft, Database, Award } from "lucide-react"

const DIFFS = [
  {
    icon: Zap,
    title: "Score automatico",
    description: "5 eixos de avaliacao (0-5 cada) somados automaticamente. Score total de 0 a 25 sem intervencao manual.",
  },
  {
    icon: RefreshCw,
    title: "Tier recalculado em tempo real",
    description: "Tier A (>= 20), B (12-19) ou C (<= 11). Recalculo instantaneo ao alterar qualquer eixo do score.",
  },
  {
    icon: Clock,
    title: "Aging inteligente",
    description: "Contagem automatica de dias em cada estagio do pipeline com alertas visuais para deals estagnados.",
  },
  {
    icon: ShieldCheck,
    title: "Uma oportunidade ativa por conta",
    description: "Regra de negocio que garante foco: apenas 1 deal ativo por conta, evitando duplicidade e perda de controle.",
  },
  {
    icon: ArrowRightLeft,
    title: "Transicao linear de pipeline",
    description: "Estagios seguem ordem obrigatoria. Nao e possivel pular etapas, garantindo processo comercial padronizado.",
  },
  {
    icon: Database,
    title: "Dados em nuvem com seguranca",
    description: "Dados armazenados no Supabase com RLS por usuario. Acesso seguro de qualquer dispositivo, sem risco de perda.",
  },
]

export function DiferenciaisSection() {
  return (
    <section id="diferenciais" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent">
              <Award className="w-5 h-5 text-[#0077b6]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0099a0]">Diferenciais</h2>
          </div>
          <div className="h-px bg-border mb-3" />
          <p className="text-muted-foreground max-w-2xl">
            Funcionalidades inteligentes que automatizam processos e garantem governanca na operacao comercial.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DIFFS.map((d) => (
            <div
              key={d.title}
              className="flex gap-4 bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md hover:border-[#0077b6]/30 transition-all duration-300"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0077b6]/10 text-[#0077b6] shrink-0">
                <d.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{d.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{d.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
