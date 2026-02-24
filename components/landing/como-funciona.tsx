import { UserPlus, Gauge, GitBranch, FileOutput, Workflow } from "lucide-react"

const STEPS = [
  {
    num: 1,
    icon: UserPlus,
    title: "Cadastro da Conta",
    description: "Registre a empresa com dados completos: porte, contato, versao Fluig e modulos contratados.",
  },
  {
    num: 2,
    icon: Gauge,
    title: "Avaliacao de Score",
    description: "Preencha os 5 eixos de score (0-5 cada). O sistema calcula o total e classifica o Tier automaticamente.",
  },
  {
    num: 3,
    icon: GitBranch,
    title: "Evolucao no Pipeline",
    description: "Crie a oportunidade e acompanhe a evolucao linear pelos 9 estagios ate o fechamento Works.",
  },
  {
    num: 4,
    icon: FileOutput,
    title: "Geracao de Relatorio",
    description: "Apos a visita, o relatorio executivo e gerado automaticamente. Revise, aprove e exporte em PDF.",
  },
]

export function ComoFuncionaSection() {
  return (
    <section id="como-funciona" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent">
              <Workflow className="w-5 h-5 text-[#0077b6]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0099a0]">Como Funciona</h2>
          </div>
          <div className="h-px bg-border mb-3" />
          <p className="text-muted-foreground max-w-2xl">
            Quatro etapas simples para transformar a gestao comercial da sua empresa.
          </p>
        </div>

        {/* Steps - Horizontal on desktop */}
        <div className="relative">
          {/* Progress line - desktop */}
          <div className="hidden lg:block absolute top-12 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-0.5 bg-border">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0077b6] to-[#00a8a8] rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {STEPS.map((step) => (
              <div key={step.num} className="relative flex flex-col items-center text-center">
                {/* Number circle */}
                <div className="relative z-10 flex items-center justify-center w-24 h-24 rounded-full bg-card border-2 border-[#0077b6] shadow-lg mb-6">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-[#0077b6]">{step.num}</span>
                    <step.icon className="w-5 h-5 text-[#00a8a8] mt-0.5" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{step.description}</p>

                {/* Mobile connector */}
                {step.num < 4 && (
                  <div className="lg:hidden w-0.5 h-8 bg-gradient-to-b from-[#0077b6] to-[#00a8a8] mt-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
