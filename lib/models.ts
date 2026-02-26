// === Enums ===

export type Segmento = "Agroindústria" | "Construção e Projetos" | "Distribuição" | "Educação" | "Logística" | "Manufatura" | "Saúde" | "Serviços" | "Setor Público" | "Varejo"
export type Porte = "PME" | "Mid-Market" | "Enterprise"
export type Tier = "A" | "B" | "C"
export type Onda = 1 | 2 | 3

export type OppStage =
  | "selecionado"
  | "contato"
  | "visita_agendada"
  | "visita_realizada"
  | "diagnostico"
  | "proposta"
  | "negociacao"
  | "works_fechado"
  | "perdido"

export const OPP_STAGE_LABELS: Record<OppStage, string> = {
  selecionado: "Selecionado",
  contato: "Contato",
  visita_agendada: "Visita Agendada",
  visita_realizada: "Visita Realizada",
  diagnostico: "Diagnóstico",
  proposta: "Proposta",
  negociacao: "Negociação",
  works_fechado: "Works Fechado",
  perdido: "Perdido",
}

export const OPP_STAGE_ORDER: OppStage[] = [
  "selecionado",
  "contato",
  "visita_agendada",
  "visita_realizada",
  "diagnostico",
  "proposta",
  "negociacao",
  "works_fechado",
]

export type PacoteWorks = "Essencial" | "Avançado" | "Premium" | "Personalizado"
export type Responsavel = "Camila" | "Niésio" | "Dupla"
export type Modalidade = "Presencial" | "Remota"
export type AutomacaoNivel = "Nenhuma" | "Básica" | "Intermediária" | "Avançada"
export type SponsorEngajamento = "Alto" | "Médio" | "Baixo"
export type ReportTipo = "Relatorio_Executivo" | "Proposta_Works"
export type ReportStatus = "Rascunho" | "Revisão" | "Enviado"

// === Entities ===

export interface Account {
  id: string
  nome: string
  segmento: Segmento
  porte: Porte
  contato_nome: string
  contato_cargo: string
  contato_email: string
  contato_whatsapp: string
  esn_nome: string
  esn_email: string
  endereco_cep: string
  endereco_rua: string
  endereco_numero: string
  endereco_bairro: string
  endereco_cidade: string
  endereco_uf: string
  fluig_versao: string
  fluig_modulos: string[]
  score_potencial: number // 0-5
  score_maturidade: number // 0-5
  score_dor: number // 0-5
  score_risco_churn: number // 0-5
  score_acesso: number // 0-5
  score_total: number // 0-25 (calculado)
  tier: Tier
  onda: Onda
  observacoes: string
  data_registro: string
  data_proxima_visita: string
  data_ultimo_contato: string
  criado_em: string
  atualizado_em: string
}

export interface Opportunity {
  id: string
  account_id: string
  estagio: OppStage
  mrr_estimado: number
  mrr_fechado: number
  pacote_works: PacoteWorks
  data_contato: string
  data_visita: string
  data_proposta: string
  data_fechamento: string
  motivo_perda: string
  proximo_passo: string
  data_proximo_passo: string
  responsavel: Responsavel
  criado_em: string
  atualizado_em: string
}

export interface Visit {
  id: string
  opportunity_id: string
  account_id: string
  data_visita: string
  modalidade: Modalidade
  participantes_cliente: string
  dx_processos_descritos: string
  dx_processos_dores: string
  dx_processos_impacto: string
  dx_automacao_nivel: AutomacaoNivel
  dx_automacao_gaps: string
  dx_integracao_sistemas: string
  dx_integracao_status: string
  dx_governanca_problemas: string
  dx_sponsor_engajamento: SponsorEngajamento
  hipotese_works: string
  escopo_preliminar: string
  objeccoes_levantadas: string
  proximo_passo_acordado: string
  data_proximo_passo: string
  fotos_evidencias: string[]
  criado_em: string
}

export interface ReportDraft {
  id: string
  visit_id: string
  account_id: string
  tipo: ReportTipo
  titulo: string
  contexto_cliente: string
  dores_priorizadas: string
  impacto_estimado: string
  solucao_proposta: string
  entregaveis: string
  investimento_mrr: number
  prazo_implantacao: string
  status: ReportStatus
  criado_em: string
  atualizado_em: string
}

// === Calculated Fields ===

export function calcScoreTotal(a: Pick<Account, "score_potencial" | "score_maturidade" | "score_dor" | "score_risco_churn" | "score_acesso">): number {
  return a.score_potencial + a.score_maturidade + a.score_dor + a.score_risco_churn + a.score_acesso
}

export function calcTier(scoreTotal: number): Tier {
  if (scoreTotal >= 20) return "A"
  if (scoreTotal >= 12) return "B"
  return "C"
}

export function calcOnda(tier: Tier): Onda {
  if (tier === "A") return 1
  if (tier === "B") return 2
  return 3
}

export function calcAgingDias(updatedAt: string): number {
  const diff = Date.now() - new Date(updatedAt).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function isOppActive(estagio: OppStage): boolean {
  return estagio !== "works_fechado" && estagio !== "perdido"
}

export function canAdvanceStage(from: OppStage, to: OppStage): boolean {
  if (to === "perdido") return true // pode ir para perdido de qualquer estágio
  const fromIdx = OPP_STAGE_ORDER.indexOf(from)
  const toIdx = OPP_STAGE_ORDER.indexOf(to)
  if (fromIdx === -1 || toIdx === -1) return false
  return toIdx > fromIdx // só avançar
}

export function canRegressStage(from: OppStage): OppStage | null {
  if (from === "perdido" || from === "works_fechado") return null
  const fromIdx = OPP_STAGE_ORDER.indexOf(from)
  if (fromIdx <= 0) return null // já está no primeiro estágio
  return OPP_STAGE_ORDER[fromIdx - 1]
}

// Score label descriptions per dimension
export const SCORE_LABELS: Record<string, string[]> = {
  score_potencial: ["Nenhum", "Muito baixo", "Baixo", "Médio", "Alto", "Muito alto"],
  score_maturidade: ["Inexistente", "Inicial", "Básico", "Intermediário", "Avançado", "Referência"],
  score_dor: ["Nenhuma", "Mínima", "Leve", "Moderada", "Significativa", "Crítica"],
  score_risco_churn: ["Nenhum", "Muito baixo", "Baixo", "Moderado", "Alto", "Crítico"],
  score_acesso: ["Bloqueado", "Muito difícil", "Difícil", "Razoável", "Fácil", "Direto"],
}

export const SCORE_DIMENSIONS = [
  { key: "score_potencial" as const, label: "Potencial de Expansão" },
  { key: "score_maturidade" as const, label: "Maturidade de Uso" },
  { key: "score_dor" as const, label: "Intensidade de Dores" },
  { key: "score_risco_churn" as const, label: "Risco de Churn" },
  { key: "score_acesso" as const, label: "Acesso ao Sponsor" },
]
