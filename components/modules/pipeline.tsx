"use client"

import { useState, useMemo } from "react"
import { useStore } from "@/lib/store"
import {
  type OppStage,
  OPP_STAGE_LABELS,
  OPP_STAGE_ORDER,
  calcAgingDias,
} from "@/lib/models"
import { SectionHeader } from "@/components/fluig/section-header"
import { TierBadge } from "@/components/fluig/tier-badge"
import {
  KanbanSquare,
  Plus,
  ChevronRight,
  X,
  Clock,
  DollarSign,
  AlertTriangle,
} from "lucide-react"

export function PipelineModule() {
  const accounts = useStore((s) => s.accounts)
  const opportunities = useStore((s) => s.opportunities)
  const addOpportunity = useStore((s) => s.addOpportunity)
  const moveOpportunityStage = useStore((s) => s.moveOpportunityStage)
  const deleteOpportunity = useStore((s) => s.deleteOpportunity)
  const updateOpportunity = useStore((s) => s.updateOpportunity)

  const [createOpen, setCreateOpen] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    account_id: "",
    valor_estimado: 0,
    probabilidade: 30,
    notas: "",
  })

  // Active pipeline stages (excluding closed)
  const pipelineStages: OppStage[] = [
    "prospeccao",
    "qualificacao",
    "proposta",
    "negociacao",
  ]

  const closedStages: OppStage[] = ["fechado_ganho", "fechado_perdido"]

  const getAccountName = (accountId: string) =>
    accounts.find((a) => a.id === accountId)?.nome ?? "—"

  const getAccountTier = (accountId: string) =>
    accounts.find((a) => a.id === accountId)?.tier ?? "C"

  const tierBorderColor = (accountId: string) => {
    const tier = getAccountTier(accountId)
    if (tier === "A") return "border-l-[var(--fluig-primary)]"
    if (tier === "B") return "border-l-[var(--fluig-secondary)]"
    return "border-l-gray-400"
  }

  // Available accounts (ones without active opportunities)
  const availableAccounts = useMemo(() => {
    const activeAccountIds = new Set(
      opportunities
        .filter(
          (o) => o.stage !== "fechado_ganho" && o.stage !== "fechado_perdido"
        )
        .map((o) => o.account_id)
    )
    return accounts.filter((a) => !activeAccountIds.has(a.id))
  }, [accounts, opportunities])

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const result = addOpportunity({
      ...form,
      stage: "prospeccao",
    })
    if (result === null) {
      setError("Esta conta já possui uma oportunidade ativa.")
      return
    }
    setCreateOpen(false)
    setForm({ account_id: "", valor_estimado: 0, probabilidade: 30, notas: "" })
  }

  function handleAdvance(oppId: string, currentStage: OppStage) {
    const idx = OPP_STAGE_ORDER.indexOf(currentStage)
    if (idx < OPP_STAGE_ORDER.length - 2) {
      // not at last active stage
      moveOpportunityStage(oppId, OPP_STAGE_ORDER[idx + 1])
    }
  }

  function handleClose(oppId: string, won: boolean) {
    moveOpportunityStage(oppId, won ? "fechado_ganho" : "fechado_perdido")
  }

  // pipeline total
  const pipelineTotal = useMemo(
    () =>
      opportunities
        .filter(
          (o) =>
            o.stage !== "fechado_ganho" && o.stage !== "fechado_perdido"
        )
        .reduce((sum, o) => sum + o.valor_estimado, 0),
    [opportunities]
  )

  return (
    <div>
      <SectionHeader
        icon={<KanbanSquare className="w-5 h-5" />}
        title="Pipeline de Vendas"
        description="Acompanhe suas oportunidades de venda em cada etapa do funil."
      />

      {/* Pipeline summary */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card">
          <DollarSign className="w-4 h-4 text-fluig-primary" />
          <span className="text-sm text-muted-foreground">Pipeline Total:</span>
          <span className="text-sm font-bold text-foreground">
            R$ {pipelineTotal.toLocaleString("pt-BR")}
          </span>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-fluig-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nova Oportunidade
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {pipelineStages.map((stage) => {
          const stageOpps = opportunities.filter((o) => o.stage === stage)
          return (
            <div
              key={stage}
              className="rounded-xl border border-border bg-card flex flex-col"
            >
              {/* Column Header */}
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-fluig-title">
                    {OPP_STAGE_LABELS[stage]}
                  </h3>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                    {stageOpps.length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="p-3 flex flex-col gap-3 min-h-[120px] flex-1">
                {stageOpps.map((opp) => {
                  const aging = calcAgingDias(opp.created_at)
                  const isAged = aging > 7
                  return (
                    <div
                      key={opp.id}
                      className={`rounded-lg border-l-4 border border-border bg-background p-3 ${
                        isAged
                          ? "border-l-[var(--fluig-danger)]"
                          : tierBorderColor(opp.account_id)
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium text-foreground leading-tight">
                          {getAccountName(opp.account_id)}
                        </p>
                        <TierBadge tier={getAccountTier(opp.account_id)} />
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {opp.notas}
                      </p>
                      <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          R$ {opp.valor_estimado.toLocaleString("pt-BR")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {aging}d
                        </span>
                        {isAged && (
                          <span className="flex items-center gap-1 text-fluig-danger">
                            <AlertTriangle className="w-3 h-3" />
                            Aging
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {stage !== "negociacao" && (
                          <button
                            onClick={() => handleAdvance(opp.id, stage)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-fluig-primary text-primary-foreground hover:opacity-90 transition-opacity"
                          >
                            Avançar
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                        {stage === "negociacao" && (
                          <>
                            <button
                              onClick={() => handleClose(opp.id, true)}
                              className="px-2 py-1 rounded text-xs bg-fluig-success text-primary-foreground hover:opacity-90 transition-opacity"
                            >
                              Ganhou
                            </button>
                            <button
                              onClick={() => handleClose(opp.id, false)}
                              className="px-2 py-1 rounded text-xs bg-fluig-danger text-primary-foreground hover:opacity-90 transition-opacity"
                            >
                              Perdeu
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteOpportunity(opp.id)}
                          className="ml-auto p-1 rounded text-muted-foreground hover:text-fluig-danger transition-colors"
                          aria-label="Excluir oportunidade"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
                {stageOpps.length === 0 && (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">Sem oportunidades</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Closed section */}
      <div className="rounded-xl border border-border bg-card">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-fluig-title">Oportunidades Encerradas</h3>
        </div>
        <div className="p-4">
          {opportunities.filter((o) => closedStages.includes(o.stage)).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma oportunidade encerrada.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {opportunities
                .filter((o) => closedStages.includes(o.stage))
                .map((opp) => (
                  <div
                    key={opp.id}
                    className={`rounded-lg border p-3 ${
                      opp.stage === "fechado_ganho"
                        ? "border-[var(--fluig-success)] bg-[var(--fluig-success)]/5"
                        : "border-[var(--fluig-danger)] bg-[var(--fluig-danger)]/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {getAccountName(opp.account_id)}
                      </p>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          opp.stage === "fechado_ganho"
                            ? "bg-fluig-success text-primary-foreground"
                            : "bg-fluig-danger text-primary-foreground"
                        }`}
                      >
                        {opp.stage === "fechado_ganho" ? "Ganho" : "Perdido"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      R$ {opp.valor_estimado.toLocaleString("pt-BR")}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setCreateOpen(false)} />
          <div className="relative w-full max-w-md mx-4 rounded-xl bg-card border border-border overflow-hidden">
            <div
              className="px-6 py-4 text-primary-foreground"
              style={{
                background: "linear-gradient(135deg, var(--fluig-primary) 0%, var(--fluig-secondary) 100%)",
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Nova Oportunidade</h3>
                <button onClick={() => setCreateOpen(false)} aria-label="Fechar">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleCreate} className="p-6 flex flex-col gap-4">
              {error && (
                <p className="text-sm text-fluig-danger bg-fluig-danger/10 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Conta</label>
                <select
                  required
                  value={form.account_id}
                  onChange={(e) => setForm({ ...form, account_id: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Selecione...</option>
                  {availableAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome} (Tier {a.tier})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Valor Estimado (R$)</label>
                <input
                  required
                  type="number"
                  min={0}
                  value={form.valor_estimado}
                  onChange={(e) => setForm({ ...form, valor_estimado: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Probabilidade: {form.probabilidade}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={form.probabilidade}
                  onChange={(e) => setForm({ ...form, probabilidade: Number(e.target.value) })}
                  className="w-full accent-[var(--fluig-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Notas</label>
                <textarea
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2.5 rounded-lg bg-fluig-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Criar Oportunidade
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
