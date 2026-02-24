import { create } from "zustand"
import { persist } from "zustand/middleware"
import { v4 as uuid } from "uuid"
import {
  type Account,
  type Opportunity,
  type Visit,
  type ReportDraft,
  type OppStage,
  type AxisScore,
  calcTier,
  calcOnda,
  OPP_STAGE_ORDER,
} from "./models"

interface AppState {
  accounts: Account[]
  opportunities: Opportunity[]
  visits: Visit[]
  reports: ReportDraft[]

  // Account actions
  addAccount: (data: Omit<Account, "id" | "tier" | "onda" | "created_at" | "updated_at">) => void
  updateAccount: (id: string, data: Partial<Omit<Account, "id" | "tier" | "onda">>) => void
  deleteAccount: (id: string) => void

  // Opportunity actions
  addOpportunity: (data: Omit<Opportunity, "id" | "created_at" | "updated_at">) => string | null
  updateOpportunity: (id: string, data: Partial<Omit<Opportunity, "id">>) => void
  moveOpportunityStage: (id: string, newStage: OppStage) => boolean
  deleteOpportunity: (id: string) => void

  // Visit actions
  addVisit: (data: Omit<Visit, "id" | "created_at">) => void

  // Report actions
  addReport: (data: Omit<ReportDraft, "id" | "created_at" | "status">) => string | null
  updateReport: (id: string, data: Partial<Omit<ReportDraft, "id">>) => void
  finalizeReport: (id: string) => void

  // Seed demo data
  seedDemoData: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      accounts: [],
      opportunities: [],
      visits: [],
      reports: [],

      addAccount: (data) => {
        const now = new Date().toISOString()
        const tier = calcTier(data.score_total)
        const onda = calcOnda(tier)
        const account: Account = {
          ...data,
          id: uuid(),
          tier,
          onda,
          created_at: now,
          updated_at: now,
        }
        set((s) => ({ accounts: [...s.accounts, account] }))
      },

      updateAccount: (id, data) => {
        set((s) => ({
          accounts: s.accounts.map((a) => {
            if (a.id !== id) return a
            const updated = { ...a, ...data, updated_at: new Date().toISOString() }
            if (data.score_total !== undefined) {
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

      addOpportunity: (data) => {
        const state = get()
        const activeOpp = state.opportunities.find(
          (o) =>
            o.account_id === data.account_id &&
            o.stage !== "fechado_ganho" &&
            o.stage !== "fechado_perdido"
        )
        if (activeOpp) return null // 1 oportunidade ativa por conta

        const now = new Date().toISOString()
        const opp: Opportunity = {
          ...data,
          id: uuid(),
          created_at: now,
          updated_at: now,
        }
        set((s) => ({ opportunities: [...s.opportunities, opp] }))
        return opp.id
      },

      updateOpportunity: (id, data) => {
        set((s) => ({
          opportunities: s.opportunities.map((o) =>
            o.id === id ? { ...o, ...data, updated_at: new Date().toISOString() } : o
          ),
        }))
      },

      moveOpportunityStage: (id, newStage) => {
        const state = get()
        const opp = state.opportunities.find((o) => o.id === id)
        if (!opp) return false

        const currentIdx = OPP_STAGE_ORDER.indexOf(opp.stage)
        const newIdx = OPP_STAGE_ORDER.indexOf(newStage)

        // Transição linear: só avança ou fecha
        if (newIdx < currentIdx && newStage !== "fechado_perdido") return false

        set((s) => ({
          opportunities: s.opportunities.map((o) =>
            o.id === id
              ? { ...o, stage: newStage, updated_at: new Date().toISOString() }
              : o
          ),
        }))
        return true
      },

      deleteOpportunity: (id) => {
        set((s) => ({
          opportunities: s.opportunities.filter((o) => o.id !== id),
        }))
      },

      addVisit: (data) => {
        const visit: Visit = {
          ...data,
          id: uuid(),
          created_at: new Date().toISOString(),
        }
        set((s) => ({ visits: [...s.visits, visit] }))
      },

      addReport: (data) => {
        const state = get()
        const existing = state.reports.find(
          (r) =>
            r.account_id === data.account_id &&
            r.opportunity_id === data.opportunity_id &&
            r.status === "rascunho"
        )
        if (existing) return null // Não sobrescreve existente

        const report: ReportDraft = {
          ...data,
          id: uuid(),
          created_at: new Date().toISOString(),
          status: "rascunho",
        }
        set((s) => ({ reports: [...s.reports, report] }))
        return report.id
      },

      updateReport: (id, data) => {
        set((s) => ({
          reports: s.reports.map((r) => (r.id === id ? { ...r, ...data } : r)),
        }))
      },

      finalizeReport: (id) => {
        set((s) => ({
          reports: s.reports.map((r) =>
            r.id === id ? { ...r, status: "finalizado" as const } : r
          ),
        }))
      },

      seedDemoData: () => {
        const state = get()
        if (state.accounts.length > 0) return

        const now = new Date().toISOString()
        const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString()
        const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString()
        const twentyDaysAgo = new Date(Date.now() - 20 * 86400000).toISOString()

        const accounts: Account[] = [
          { id: uuid(), nome: "TechCorp Brasil", segmento: "Tecnologia", cnpj: "12.345.678/0001-90", responsavel: "Ana Silva", score_total: 92, tier: "A", onda: 1, created_at: twentyDaysAgo, updated_at: now },
          { id: uuid(), nome: "Indústria Novo Horizonte", segmento: "Indústria", cnpj: "23.456.789/0001-01", responsavel: "Carlos Souza", score_total: 75, tier: "B", onda: 2, created_at: tenDaysAgo, updated_at: now },
          { id: uuid(), nome: "Varejo Express", segmento: "Varejo", cnpj: "34.567.890/0001-12", responsavel: "Maria Oliveira", score_total: 60, tier: "B", onda: 2, created_at: twoDaysAgo, updated_at: now },
          { id: uuid(), nome: "Logística Ágil", segmento: "Logística", cnpj: "45.678.901/0001-23", responsavel: "Pedro Lima", score_total: 40, tier: "C", onda: 3, created_at: twentyDaysAgo, updated_at: now },
          { id: uuid(), nome: "Saúde Mais", segmento: "Saúde", cnpj: "56.789.012/0001-34", responsavel: "Juliana Costa", score_total: 85, tier: "A", onda: 1, created_at: tenDaysAgo, updated_at: now },
          { id: uuid(), nome: "EduTech Solutions", segmento: "Educação", cnpj: "67.890.123/0001-45", responsavel: "Roberto Almeida", score_total: 30, tier: "C", onda: 3, created_at: twoDaysAgo, updated_at: now },
        ]

        const opportunities: Opportunity[] = [
          { id: uuid(), account_id: accounts[0].id, stage: "negociacao", valor_estimado: 250000, probabilidade: 80, notas: "Grande projeto de transformação digital", created_at: tenDaysAgo, updated_at: now },
          { id: uuid(), account_id: accounts[1].id, stage: "proposta", valor_estimado: 120000, probabilidade: 60, notas: "Automação de processos industriais", created_at: twoDaysAgo, updated_at: now },
          { id: uuid(), account_id: accounts[2].id, stage: "qualificacao", valor_estimado: 80000, probabilidade: 40, notas: "Sistema de gestão de estoque", created_at: twoDaysAgo, updated_at: now },
          { id: uuid(), account_id: accounts[3].id, stage: "prospeccao", valor_estimado: 45000, probabilidade: 20, notas: "Consultoria de processos logísticos", created_at: twentyDaysAgo, updated_at: now },
          { id: uuid(), account_id: accounts[4].id, stage: "fechado_ganho", valor_estimado: 300000, probabilidade: 100, notas: "Plataforma de telemedicina", created_at: twentyDaysAgo, updated_at: now },
        ]

        const visits: Visit[] = [
          { id: uuid(), account_id: accounts[0].id, opportunity_id: opportunities[0].id, data: twoDaysAgo, tipo: "presencial", participantes: "Ana Silva, João Mendes", resumo: "Apresentação da proposta técnica e roadmap de implementação.", created_at: twoDaysAgo },
          { id: uuid(), account_id: accounts[1].id, opportunity_id: opportunities[1].id, data: now, tipo: "remoto", participantes: "Carlos Souza", resumo: "Follow-up sobre requisitos de integração com ERP.", created_at: now },
          { id: uuid(), account_id: accounts[4].id, opportunity_id: opportunities[4].id, data: tenDaysAgo, tipo: "presencial", participantes: "Juliana Costa, Equipe TI", resumo: "Kickoff do projeto de telemedicina.", created_at: tenDaysAgo },
        ]

        const reports: ReportDraft[] = [
          {
            id: uuid(),
            account_id: accounts[4].id,
            opportunity_id: opportunities[4].id,
            scores: [
              { axis: "processos", score: 4, observacoes: "Processos bem definidos com margem para automação" },
              { axis: "automacao", score: 3, observacoes: "Automação parcial em alguns departamentos" },
              { axis: "integracao", score: 2, observacoes: "Sistemas ainda isolados" },
              { axis: "governanca", score: 4, observacoes: "Boa governança de TI" },
            ],
            recomendacoes: "Foco em integração de sistemas e expansão da automação para áreas administrativas.",
            created_at: tenDaysAgo,
            status: "finalizado",
          },
        ]

        set({ accounts, opportunities, visits, reports })
      },
    }),
    {
      name: "fluig-crm-storage",
    }
  )
)
