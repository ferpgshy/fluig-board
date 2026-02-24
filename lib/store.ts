import { create } from "zustand"
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
} from "./models"

type AccountInput = Omit<Account, "id" | "score_total" | "tier" | "onda" | "criado_em" | "atualizado_em">
type OpportunityInput = Omit<Opportunity, "id" | "criado_em" | "atualizado_em">
type VisitInput = Omit<Visit, "id" | "criado_em">

interface AppState {
  accounts: Account[]
  opportunities: Opportunity[]
  visits: Visit[]
  reports: ReportDraft[]
  loading: boolean
  initialized: boolean

  // Hydrate from DB
  hydrate: (data: {
    accounts?: Account[]
    opportunities?: Opportunity[]
    visits?: Visit[]
    reports?: ReportDraft[]
  }) => void

  // Account
  addAccount: (data: AccountInput) => Promise<Account | null>
  updateAccount: (id: string, data: Partial<AccountInput>) => Promise<void>
  deleteAccount: (id: string) => Promise<void>

  // Opportunity
  addOpportunity: (data: OpportunityInput) => Promise<string | null>
  updateOpportunity: (id: string, data: Partial<Omit<Opportunity, "id" | "criado_em">>) => Promise<void>
  moveOpportunityStage: (id: string, newStage: OppStage, extra?: { mrr_fechado?: number; motivo_perda?: string }) => Promise<boolean>
  deleteOpportunity: (id: string) => Promise<void>

  // Visit
  addVisit: (data: VisitInput) => Promise<string>
  updateVisit: (id: string, data: Partial<Omit<Visit, "id" | "criado_em">>) => Promise<void>

  // Report
  addReport: (data: Omit<ReportDraft, "id" | "criado_em" | "atualizado_em" | "status">) => Promise<string | null>
  updateReport: (id: string, data: Partial<Omit<ReportDraft, "id" | "criado_em">>) => Promise<void>
  advanceReportStatus: (id: string) => Promise<void>
}

export const useStore = create<AppState>()((set, get) => ({
  accounts: [],
  opportunities: [],
  visits: [],
  reports: [],
  loading: false,
  initialized: false,

  hydrate: (data) => {
    set({
      ...(data.accounts !== undefined && { accounts: data.accounts }),
      ...(data.opportunities !== undefined && { opportunities: data.opportunities }),
      ...(data.visits !== undefined && { visits: data.visits }),
      ...(data.reports !== undefined && { reports: data.reports }),
      initialized: true,
    })
  },

  // === ACCOUNT ===
  addAccount: async (data) => {
    const score_total = calcScoreTotal(data)
    const tier = calcTier(score_total)
    const onda = calcOnda(tier)
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, score_total, tier, onda }),
    })
    if (!res.ok) return null
    const { account } = await res.json()
    set((s) => ({ accounts: [...s.accounts, account].sort((a, b) => b.score_total - a.score_total) }))
    return account
  },

  updateAccount: async (id, data) => {
    const state = get()
    const existing = state.accounts.find((a) => a.id === id)
    if (!existing) return
    const merged = { ...existing, ...data }
    const score_total = calcScoreTotal(merged)
    const tier = calcTier(score_total)
    const onda = calcOnda(tier)
    const updates = { ...data, score_total, tier, onda }
    // Optimistic
    set((s) => ({
      accounts: s.accounts
        .map((a) => (a.id === id ? { ...a, ...updates } : a))
        .sort((a, b) => b.score_total - a.score_total),
    }))
    const res = await fetch(`/api/accounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    if (!res.ok) {
      // Rollback
      set((s) => ({
        accounts: s.accounts.map((a) => (a.id === id ? existing : a)),
      }))
    } else {
      const { account } = await res.json()
      set((s) => ({
        accounts: s.accounts
          .map((a) => (a.id === id ? account : a))
          .sort((a, b) => b.score_total - a.score_total),
      }))
    }
  },

  deleteAccount: async (id) => {
    const state = get()
    const backup = {
      accounts: state.accounts,
      opportunities: state.opportunities,
      visits: state.visits,
      reports: state.reports,
    }
    // Optimistic
    set((s) => ({
      accounts: s.accounts.filter((a) => a.id !== id),
      opportunities: s.opportunities.filter((o) => o.account_id !== id),
      visits: s.visits.filter((v) => v.account_id !== id),
      reports: s.reports.filter((r) => r.account_id !== id),
    }))
    const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" })
    if (!res.ok) set(backup)
  },

  // === OPPORTUNITY ===
  addOpportunity: async (data) => {
    const state = get()
    const hasActive = state.opportunities.some(
      (o) => o.account_id === data.account_id && isOppActive(o.estagio)
    )
    if (hasActive) return null

    const res = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      if (res.status === 409) return null
      return null
    }
    const { opportunity } = await res.json()
    set((s) => ({ opportunities: [opportunity, ...s.opportunities] }))
    return opportunity.id
  },

  updateOpportunity: async (id, data) => {
    const state = get()
    const existing = state.opportunities.find((o) => o.id === id)
    if (!existing) return
    // Optimistic
    set((s) => ({
      opportunities: s.opportunities.map((o) => (o.id === id ? { ...o, ...data } : o)),
    }))
    const res = await fetch(`/api/opportunities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      set((s) => ({ opportunities: s.opportunities.map((o) => (o.id === id ? existing : o)) }))
    } else {
      const { opportunity } = await res.json()
      set((s) => ({ opportunities: s.opportunities.map((o) => (o.id === id ? opportunity : o)) }))
    }
  },

  moveOpportunityStage: async (id, newStage, extra) => {
    const state = get()
    const opp = state.opportunities.find((o) => o.id === id)
    if (!opp) return false

    const isRegressing = canRegressStage(opp.estagio) === newStage
    if (!isRegressing && !canAdvanceStage(opp.estagio, newStage)) return false

    const now = new Date().toISOString()
    const updates: Partial<Opportunity> = { estagio: newStage, atualizado_em: now }
    if (newStage === "works_fechado") {
      updates.mrr_fechado = extra?.mrr_fechado ?? opp.mrr_estimado
      updates.data_fechamento = now
    }
    if (newStage === "perdido") {
      updates.motivo_perda = extra?.motivo_perda ?? ""
      updates.data_fechamento = now
    }

    // Optimistic
    set((s) => ({
      opportunities: s.opportunities.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    }))

    const res = await fetch(`/api/opportunities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    if (!res.ok) {
      set((s) => ({ opportunities: s.opportunities.map((o) => (o.id === id ? opp : o)) }))
      return false
    }
    const { opportunity } = await res.json()
    set((s) => ({ opportunities: s.opportunities.map((o) => (o.id === id ? opportunity : o)) }))
    return true
  },

  deleteOpportunity: async (id) => {
    const backup = get().opportunities
    set((s) => ({ opportunities: s.opportunities.filter((o) => o.id !== id) }))
    const res = await fetch(`/api/opportunities/${id}`, { method: "DELETE" })
    if (!res.ok) set({ opportunities: backup })
  },

  // === VISIT ===
  addVisit: async (data) => {
    const res = await fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Erro ao criar visita")
    const { visit } = await res.json()
    set((s) => ({ visits: [visit, ...s.visits] }))
    return visit.id
  },

  updateVisit: async (id, data) => {
    const existing = get().visits.find((v) => v.id === id)
    // Optimistic
    set((s) => ({ visits: s.visits.map((v) => (v.id === id ? { ...v, ...data } : v)) }))
    const res = await fetch(`/api/visits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok && existing) {
      set((s) => ({ visits: s.visits.map((v) => (v.id === id ? existing : v)) }))
    } else if (res.ok) {
      const { visit } = await res.json()
      set((s) => ({ visits: s.visits.map((v) => (v.id === id ? visit : v)) }))
    }
  },

  // === REPORT ===
  addReport: async (data) => {
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.status === 409) return null
    if (!res.ok) return null
    const { report } = await res.json()
    set((s) => ({ reports: [report, ...s.reports] }))
    return report.id
  },

  updateReport: async (id, data) => {
    const existing = get().reports.find((r) => r.id === id)
    // Optimistic
    set((s) => ({ reports: s.reports.map((r) => (r.id === id ? { ...r, ...data } : r)) }))
    const res = await fetch(`/api/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok && existing) {
      set((s) => ({ reports: s.reports.map((r) => (r.id === id ? existing : r)) }))
    } else if (res.ok) {
      const { report } = await res.json()
      set((s) => ({ reports: s.reports.map((r) => (r.id === id ? report : r)) }))
    }
  },

  advanceReportStatus: async (id) => {
    const existing = get().reports.find((r) => r.id === id)
    const flow: Record<ReportStatus, ReportStatus | null> = {
      Rascunho: "Revisão",
      "Revisão": "Enviado",
      Enviado: null,
    }
    if (!existing) return
    const next = flow[existing.status]
    if (!next) return
    // Optimistic
    set((s) => ({
      reports: s.reports.map((r) => (r.id === id ? { ...r, status: next } : r)),
    }))
    const res = await fetch(`/api/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ advance: true }),
    })
    if (!res.ok) {
      set((s) => ({ reports: s.reports.map((r) => (r.id === id ? existing : r)) }))
    } else {
      const { report } = await res.json()
      set((s) => ({ reports: s.reports.map((r) => (r.id === id ? report : r)) }))
    }
  },
}))
