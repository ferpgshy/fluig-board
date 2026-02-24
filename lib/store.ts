import { create } from "zustand"
import { persist } from "zustand/middleware"
import { v4 as uuid } from "uuid"
import {
  type Account,
  type Opportunity,
  type Visit,
  type ReportDraft,
  type OppStage,
  type ReportStatus,
  calcScoreTotal,
  calcTier,
  calcOnda,
  canAdvanceStage,
  canRegressStage,
  isOppActive,
  OPP_STAGE_ORDER,
} from "./models"

type AccountInput = Omit<Account, "id" | "score_total" | "tier" | "onda" | "criado_em" | "atualizado_em">
type OpportunityInput = Omit<Opportunity, "id" | "criado_em" | "atualizado_em">
type VisitInput = Omit<Visit, "id" | "criado_em">

interface AppState {
  accounts: Account[]
  opportunities: Opportunity[]
  visits: Visit[]
  reports: ReportDraft[]

  // Account
  addAccount: (data: AccountInput) => void
  updateAccount: (id: string, data: Partial<AccountInput>) => void
  deleteAccount: (id: string) => void

  // Opportunity
  addOpportunity: (data: OpportunityInput) => string | null
  updateOpportunity: (id: string, data: Partial<Omit<Opportunity, "id" | "criado_em">>) => void
  moveOpportunityStage: (id: string, newStage: OppStage, extra?: { mrr_fechado?: number; motivo_perda?: string }) => boolean
  deleteOpportunity: (id: string) => void

  // Visit
  addVisit: (data: VisitInput) => string
  updateVisit: (id: string, data: Partial<Omit<Visit, "id" | "criado_em">>) => void

  // Report
  addReport: (data: Omit<ReportDraft, "id" | "criado_em" | "atualizado_em" | "status">) => string | null
  updateReport: (id: string, data: Partial<Omit<ReportDraft, "id" | "criado_em">>) => void
  advanceReportStatus: (id: string) => void

  // Seed
  seedDemoData: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      accounts: [],
      opportunities: [],
      visits: [],
      reports: [],

      // === ACCOUNT ===
      addAccount: (data) => {
        const now = new Date().toISOString()
        const score_total = calcScoreTotal(data)
        const tier = calcTier(score_total)
        const onda = calcOnda(tier)
        const account: Account = {
          ...data,
          id: uuid(),
          score_total,
          tier,
          onda,
          criado_em: now,
          atualizado_em: now,
        }
        set((s) => ({ accounts: [...s.accounts, account] }))
      },

      updateAccount: (id, data) => {
        set((s) => ({
          accounts: s.accounts.map((a) => {
            if (a.id !== id) return a
            const updated = { ...a, ...data, atualizado_em: new Date().toISOString() }
            // Recalculate scores if any score field changed
            const scoreFields = ["score_potencial", "score_maturidade", "score_dor", "score_risco_churn", "score_acesso"] as const
            if (scoreFields.some((f) => f in data)) {
              updated.score_total = calcScoreTotal(updated)
              updated.tier = calcTier(updated.score_total)
              updated.onda = calcOnda(updated.tier)
            }
            return updated
          }),
        }))
      },

      deleteAccount: (id) => {
        set((s) => ({
          accounts: s.accounts.filter((a) => a.id !== id),
          opportunities: s.opportunities.filter((o) => o.account_id !== id),
          visits: s.visits.filter((v) => v.account_id !== id),
          reports: s.reports.filter((r) => r.account_id !== id),
        }))
      },

      // === OPPORTUNITY ===
      addOpportunity: (data) => {
        const state = get()
        const hasActive = state.opportunities.some(
          (o) => o.account_id === data.account_id && isOppActive(o.estagio)
        )
        if (hasActive) return null

        const now = new Date().toISOString()
        const opp: Opportunity = {
          ...data,
          id: uuid(),
          criado_em: now,
          atualizado_em: now,
        }
        set((s) => ({ opportunities: [...s.opportunities, opp] }))
        return opp.id
      },

      updateOpportunity: (id, data) => {
        set((s) => ({
          opportunities: s.opportunities.map((o) =>
            o.id === id ? { ...o, ...data, atualizado_em: new Date().toISOString() } : o
          ),
        }))
      },

      moveOpportunityStage: (id, newStage, extra) => {
        const state = get()
        const opp = state.opportunities.find((o) => o.id === id)
        if (!opp) return false

        // Allow advance OR regress by exactly 1 step
        const isRegressing = canRegressStage(opp.estagio) === newStage
        if (!isRegressing && !canAdvanceStage(opp.estagio, newStage)) return false

        const now = new Date().toISOString()
        const updates: Partial<Opportunity> = {
          estagio: newStage,
          atualizado_em: now,
        }

        if (newStage === "works_fechado") {
          updates.mrr_fechado = extra?.mrr_fechado ?? opp.mrr_estimado
          updates.data_fechamento = now
        }
        if (newStage === "perdido") {
          updates.motivo_perda = extra?.motivo_perda ?? ""
          updates.data_fechamento = now
        }

        set((s) => ({
          opportunities: s.opportunities.map((o) =>
            o.id === id ? { ...o, ...updates } : o
          ),
        }))
        return true
      },

      deleteOpportunity: (id) => {
        set((s) => ({
          opportunities: s.opportunities.filter((o) => o.id !== id),
        }))
      },

      // === VISIT ===
      addVisit: (data) => {
        const visit: Visit = {
          ...data,
          id: uuid(),
          criado_em: new Date().toISOString(),
        }
        set((s) => ({ visits: [...s.visits, visit] }))
        return visit.id
      },

      updateVisit: (id, data) => {
        set((s) => ({
          visits: s.visits.map((v) => (v.id === id ? { ...v, ...data } : v)),
        }))
      },

      // === REPORT ===
      addReport: (data) => {
        const state = get()
        const existing = state.reports.find(
          (r) => r.visit_id === data.visit_id && r.status !== "Enviado"
        )
        if (existing) return null

        const now = new Date().toISOString()
        const report: ReportDraft = {
          ...data,
          id: uuid(),
          status: "Rascunho",
          criado_em: now,
          atualizado_em: now,
        }
        set((s) => ({ reports: [...s.reports, report] }))
        return report.id
      },

      updateReport: (id, data) => {
        set((s) => ({
          reports: s.reports.map((r) =>
            r.id === id ? { ...r, ...data, atualizado_em: new Date().toISOString() } : r
          ),
        }))
      },

      advanceReportStatus: (id) => {
        const flow: Record<ReportStatus, ReportStatus | null> = {
          Rascunho: "Revisão",
          "Revisão": "Enviado",
          Enviado: null,
        }
        set((s) => ({
          reports: s.reports.map((r) => {
            if (r.id !== id) return r
            const next = flow[r.status]
            if (!next) return r
            return { ...r, status: next, atualizado_em: new Date().toISOString() }
          }),
        }))
      },

      // === SEED ===
      seedDemoData: () => {
        const state = get()
        if (state.accounts.length > 0) return

        const now = new Date().toISOString()
        const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString()
        const pastDate = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10)
        const futureDate = (daysAhead: number) => new Date(Date.now() + daysAhead * 86400000).toISOString().slice(0, 10)

        const accs: Account[] = [
          {
            id: uuid(), nome: "Metalúrgica Recife S/A", segmento: "Indústria", porte: "Mid-Market",
            contato_nome: "Ricardo Mendes", contato_cargo: "Diretor de TI", contato_email: "ricardo@metalrecife.com.br", contato_whatsapp: "81999001234",
            fluig_versao: "1.8.2", fluig_modulos: ["ECM", "BPM", "WCM"],
            score_potencial: 5, score_maturidade: 4, score_dor: 4, score_risco_churn: 3, score_acesso: 5,
            score_total: 21, tier: "A", onda: 1, observacoes: "Forte candidato a Works Premium. Sponsor muito engajado.",
            criado_em: d(30), atualizado_em: d(2),
          },
          {
            id: uuid(), nome: "Hospital São Lucas", segmento: "Saúde", porte: "Enterprise",
            contato_nome: "Dra. Fernanda Lopes", contato_cargo: "CIO", contato_email: "fernanda@hsl.com.br", contato_whatsapp: "81998007654",
            fluig_versao: "1.7.4", fluig_modulos: ["ECM", "BPM"],
            score_potencial: 5, score_maturidade: 3, score_dor: 5, score_risco_churn: 2, score_acesso: 5,
            score_total: 20, tier: "A", onda: 1, observacoes: "Dores críticas em processos de auditoria e compliance.",
            criado_em: d(25), atualizado_em: d(1),
          },
          {
            id: uuid(), nome: "Varejo Nordeste Ltda", segmento: "Varejo", porte: "PME",
            contato_nome: "Paulo Henrique", contato_cargo: "Gerente de Operações", contato_email: "paulo@varejone.com.br", contato_whatsapp: "81997005432",
            fluig_versao: "1.8.0", fluig_modulos: ["ECM"],
            score_potencial: 4, score_maturidade: 3, score_dor: 3, score_risco_churn: 2, score_acesso: 3,
            score_total: 15, tier: "B", onda: 2, observacoes: "Interesse moderado em automação de estoque.",
            criado_em: d(20), atualizado_em: d(5),
          },
          {
            id: uuid(), nome: "ConsultPE Serviços", segmento: "Serviços", porte: "PME",
            contato_nome: "Amanda Reis", contato_cargo: "Coordenadora de Projetos", contato_email: "amanda@consultpe.com.br", contato_whatsapp: "81996004321",
            fluig_versao: "1.6.5", fluig_modulos: ["ECM", "BPM", "WCM", "Social"],
            score_potencial: 3, score_maturidade: 4, score_dor: 2, score_risco_churn: 1, score_acesso: 4,
            score_total: 14, tier: "B", onda: 2, observacoes: "Base madura, poucas dores. Oportunidade em integrações.",
            criado_em: d(15), atualizado_em: d(3),
          },
          {
            id: uuid(), nome: "Logística Express NE", segmento: "Serviços", porte: "PME",
            contato_nome: "Marcos Vieira", contato_cargo: "Analista de Sistemas", contato_email: "marcos@logisticane.com.br", contato_whatsapp: "81995003210",
            fluig_versao: "1.5.0", fluig_modulos: ["ECM"],
            score_potencial: 2, score_maturidade: 1, score_dor: 2, score_risco_churn: 4, score_acesso: 2,
            score_total: 11, tier: "C", onda: 3, observacoes: "Risco de churn elevado. Sponsor com pouca autonomia.",
            criado_em: d(10), atualizado_em: d(8),
          },
          {
            id: uuid(), nome: "EduTech Recife", segmento: "Outro", porte: "PME",
            contato_nome: "Juliana Castro", contato_cargo: "Diretora Administrativa", contato_email: "juliana@edutechrecife.com.br", contato_whatsapp: "81994002109",
            fluig_versao: "1.7.0", fluig_modulos: ["ECM", "BPM"],
            score_potencial: 1, score_maturidade: 2, score_dor: 1, score_risco_churn: 3, score_acesso: 1,
            score_total: 8, tier: "C", onda: 3, observacoes: "Baixo potencial imediato. Manter relacionamento.",
            criado_em: d(5), atualizado_em: d(5),
          },
        ]

        const opps: Opportunity[] = [
          {
            id: uuid(), account_id: accs[0].id, estagio: "negociacao",
            mrr_estimado: 8500, mrr_fechado: 0, pacote_works: "Premium",
            data_contato: pastDate(28), data_visita: pastDate(20), data_proposta: pastDate(10), data_fechamento: "",
            motivo_perda: "", proximo_passo: "Reunião de alinhamento final com diretoria", data_proximo_passo: futureDate(3),
            responsavel: "Dupla", criado_em: d(28), atualizado_em: d(2),
          },
          {
            id: uuid(), account_id: accs[1].id, estagio: "diagnostico",
            mrr_estimado: 12000, mrr_fechado: 0, pacote_works: "Avançado",
            data_contato: pastDate(22), data_visita: pastDate(15), data_proposta: "", data_fechamento: "",
            motivo_perda: "", proximo_passo: "Consolidar diagnóstico para proposta", data_proximo_passo: futureDate(5),
            responsavel: "Camila", criado_em: d(22), atualizado_em: d(1),
          },
          {
            id: uuid(), account_id: accs[2].id, estagio: "visita_agendada",
            mrr_estimado: 3500, mrr_fechado: 0, pacote_works: "Essencial",
            data_contato: pastDate(18), data_visita: "", data_proposta: "", data_fechamento: "",
            motivo_perda: "", proximo_passo: "Confirmar visita presencial", data_proximo_passo: pastDate(2),
            responsavel: "Niésio", criado_em: d(18), atualizado_em: d(10),
          },
          {
            id: uuid(), account_id: accs[3].id, estagio: "contato",
            mrr_estimado: 4000, mrr_fechado: 0, pacote_works: "Essencial",
            data_contato: pastDate(12), data_visita: "", data_proposta: "", data_fechamento: "",
            motivo_perda: "", proximo_passo: "Agendar call de apresentação", data_proximo_passo: futureDate(7),
            responsavel: "Camila", criado_em: d(12), atualizado_em: d(3),
          },
          {
            id: uuid(), account_id: accs[4].id, estagio: "selecionado",
            mrr_estimado: 2000, mrr_fechado: 0, pacote_works: "Essencial",
            data_contato: "", data_visita: "", data_proposta: "", data_fechamento: "",
            motivo_perda: "", proximo_passo: "", data_proximo_passo: "",
            responsavel: "Niésio", criado_em: d(8), atualizado_em: d(8),
          },
        ]

        const visits: Visit[] = [
          {
            id: uuid(), opportunity_id: opps[0].id, account_id: accs[0].id,
            data_visita: pastDate(20), modalidade: "Presencial", participantes_cliente: "Ricardo Mendes, Ana TI",
            dx_processos_descritos: "Processos de aprovação de compras e RH com múltiplas etapas manuais.",
            dx_processos_dores: "Perda de documentos, retrabalho em aprovações, falta de rastreabilidade.",
            dx_processos_impacto: "Estimados 2 dias de atraso médio por aprovação, custo indireto de R$ 15k/mês.",
            dx_automacao_nivel: "Básica", dx_automacao_gaps: "Fluxos de aprovação e notificações ainda manuais.",
            dx_integracao_sistemas: "SAP, RH Senior", dx_integracao_status: "Integração via CSV manual, sem API.",
            dx_governanca_problemas: "Sem SLA definido, sem dashboards de acompanhamento.",
            dx_sponsor_engajamento: "Alto",
            hipotese_works: "Works Premium para automação completa de fluxos com integração SAP.",
            escopo_preliminar: "Automação de 5 processos core + integração SAP via API + dashboard governança.",
            objeccoes_levantadas: "Prazo de implantação e necessidade de treinamento da equipe.",
            proximo_passo_acordado: "Elaborar proposta comercial", data_proximo_passo: futureDate(3),
            fotos_evidencias: [], criado_em: d(20),
          },
        ]

        set({ accounts: accs, opportunities: opps, visits, reports: [] })
      },
    }),
    {
      name: "fluig-crm-storage",
    }
  )
)
