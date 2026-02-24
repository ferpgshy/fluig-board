export type Tier = "A" | "B" | "C"

export type OppStage =
  | "prospeccao"
  | "qualificacao"
  | "proposta"
  | "negociacao"
  | "fechado_ganho"
  | "fechado_perdido"

export const OPP_STAGE_LABELS: Record<OppStage, string> = {
  prospeccao: "Prospecção",
  qualificacao: "Qualificação",
  proposta: "Proposta",
  negociacao: "Negociação",
  fechado_ganho: "Fechado Ganho",
  fechado_perdido: "Fechado Perdido",
}

export const OPP_STAGE_ORDER: OppStage[] = [
  "prospeccao",
  "qualificacao",
  "proposta",
  "negociacao",
  "fechado_ganho",
  "fechado_perdido",
]

export type Onda = 1 | 2 | 3

export interface Account {
  id: string
  nome: string
  segmento: string
  cnpj: string
  responsavel: string
  score_total: number
  tier: Tier
  onda: Onda
  created_at: string
  updated_at: string
}

export interface Opportunity {
  id: string
  account_id: string
  stage: OppStage
  valor_estimado: number
  probabilidade: number
  notas: string
  created_at: string
  updated_at: string
}

export interface Visit {
  id: string
  account_id: string
  opportunity_id: string
  data: string
  tipo: "presencial" | "remoto"
  participantes: string
  resumo: string
  created_at: string
}

export type AssessmentAxis = "processos" | "automacao" | "integracao" | "governanca"

export const AXIS_LABELS: Record<AssessmentAxis, string> = {
  processos: "Processos",
  automacao: "Automação",
  integracao: "Integração",
  governanca: "Governança",
}

export interface AxisScore {
  axis: AssessmentAxis
  score: number // 1-5
  observacoes: string
}

export interface ReportDraft {
  id: string
  account_id: string
  opportunity_id: string
  scores: AxisScore[]
  recomendacoes: string
  created_at: string
  status: "rascunho" | "finalizado"
}

export function calcTier(score: number): Tier {
  if (score >= 80) return "A"
  if (score >= 50) return "B"
  return "C"
}

export function calcOnda(tier: Tier): Onda {
  if (tier === "A") return 1
  if (tier === "B") return 2
  return 3
}

export function calcAgingDias(createdAt: string): number {
  const diff = Date.now() - new Date(createdAt).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}
