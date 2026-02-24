"use client"

import { useState, useMemo } from "react"
import { useStore } from "@/lib/store"
import {
  type OppStage,
  type Opportunity,
  type PacoteWorks,
  type Responsavel,
  OPP_STAGE_LABELS,
  OPP_STAGE_ORDER,
  calcAgingDias,
  isOppActive,
  canAdvanceStage,
} from "@/lib/models"
import { SectionHeader } from "@/components/fluig/section-header"
import { TierBadge } from "@/components/fluig/tier-badge"
import {
  KanbanSquare,
  Plus,
  X,
  Clock,
  DollarSign,
  AlertTriangle,
  List,
  LayoutGrid,
  ChevronRight,
  User,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const PACOTES: PacoteWorks[] = ["Essencial", "Avançado", "Premium", "Personalizado"]
const RESPONSAVEIS: Responsavel[] = ["Camila", "Niésio", "Dupla"]

export function PipelineModule() {
  const accounts = useStore((s) => s.accounts)
  const opportunities = useStore((s) => s.opportunities)
  const addOpportunity = useStore((s) => s.addOpportunity)
  const moveOpportunityStage = useStore((s) => s.moveOpportunityStage)
  const updateOpportunity = useStore((s) => s.updateOpportunity)
  const deleteOpportunity = useStore((s) => s.deleteOpportunity)

  const [viewMode, setViewMode] = useState<"kanban" | "lista">("kanban")
  const [createOpen, setCreateOpen] = useState(false)
  const [error, setError] = useState("")
  const [closingOpp, setClosingOpp] = useState<{ id: string; type: "won" | "lost" } | null>(null)
  const [closingMrr, setClosingMrr] = useState(0)
  const [closingMotivo, setClosingMotivo] = useState("")
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const [form, setForm] = useState({
    account_id: "",
    mrr_estimado: 0,
    pacote_works: "Essencial" as PacoteWorks,
    responsavel: "Camila" as Responsavel,
    proximo_passo: "",
    data_proximo_passo: "",
  })

  const activeStages = OPP_STAGE_ORDER // selecionado -> works_fechado

  const getAccountName = (id: string) => accounts.find((a) => a.id === id)?.nome ?? "--"
  const getAccountTier = (id: string) => accounts.find((a) => a.id === id)?.tier ?? "C"

  const availableAccounts = useMemo(() => {
    const activeAccountIds = new Set(
      opportunities.filter((o) => isOppActive(o.estagio)).map((o) => o.account_id)
    )
    return accounts.filter((a) => !activeAccountIds.has(a.id))
  }, [accounts, opportunities])

  const pipelineTotal = useMemo(
    () => opportunities.filter((o) => isOppActive(o.estagio)).reduce((sum, o) => sum + o.mrr_estimado, 0),
    [opportunities]
  )

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const result = addOpportunity({
      ...form,
      estagio: "selecionado",
      mrr_fechado: 0,
      data_contato: "",
      data_visita: "",
      data_proposta: "",
      data_fechamento: "",
      motivo_perda: "",
    })
    if (result === null) {
      setError("Esta conta ja possui uma oportunidade ativa.")
      return
    }
    setCreateOpen(false)
    setForm({ account_id: "", mrr_estimado: 0, pacote_works: "Essencial", responsavel: "Camila", proximo_passo: "", data_proximo_passo: "" })
  }

  function handleAdvance(opp: Opportunity) {
    const idx = OPP_STAGE_ORDER.indexOf(opp.estagio)
    if (idx < OPP_STAGE_ORDER.length - 1) {
      const next = OPP_STAGE_ORDER[idx + 1]
      if (next === "works_fechado") {
        setClosingOpp({ id: opp.id, type: "won" })
        setClosingMrr(opp.mrr_estimado)
        return
      }
      moveOpportunityStage(opp.id, next)
    }
  }

  function handleLose(oppId: string) {
    setClosingOpp({ id: oppId, type: "lost" })
    setClosingMotivo("")
  }

  function confirmClose() {
    if (!closingOpp) return
    if (closingOpp.type === "won") {
      moveOpportunityStage(closingOpp.id, "works_fechado", { mrr_fechado: closingMrr })
    } else {
      moveOpportunityStage(closingOpp.id, "perdido", { motivo_perda: closingMotivo })
    }
    setClosingOpp(null)
  }

  // Drag-and-drop handlers (native HTML5)
  function onDragStart(oppId: string) {
    setDraggedId(oppId)
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  function onDrop(targetStage: OppStage) {
    if (!draggedId) return
    const opp = opportunities.find((o) => o.id === draggedId)
    if (!opp) return

    if (!canAdvanceStage(opp.estagio, targetStage)) {
      setDraggedId(null)
      return
    }

    if (targetStage === "works_fechado") {
      setClosingOpp({ id: draggedId, type: "won" })
      setClosingMrr(opp.mrr_estimado)
    } else if (targetStage === "perdido") {
      // perdido not in kanban columns, handled by button
    } else {
      moveOpportunityStage(draggedId, targetStage)
    }
    setDraggedId(null)
  }

  const OppCard = ({ opp }: { opp: Opportunity }) => {
    const aging = calcAgingDias(opp.atualizado_em)
    const isAged = aging > 7
    const ppVencido = opp.data_proximo_passo && new Date(opp.data_proximo_passo) < new Date() && isOppActive(opp.estagio)
    const tier = getAccountTier(opp.account_id)

    return (
      <div
        draggable
        onDragStart={() => onDragStart(opp.id)}
        className={`rounded-lg border-l-4 border border-border bg-background p-3 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${
          isAged ? "border-l-fluig-danger" : tier === "A" ? "border-l-fluig-primary" : tier === "B" ? "border-l-fluig-secondary" : "border-l-muted-foreground"
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-medium text-foreground leading-tight">{getAccountName(opp.account_id)}</p>
          <TierBadge tier={tier} />
        </div>
        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />R$ {opp.mrr_estimado.toLocaleString("pt-BR")}</span>
          <span className="flex items-center gap-1"><User className="w-3 h-3" />{opp.responsavel}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{aging}d</span>
          {isAged && <span className="flex items-center gap-1 text-fluig-danger"><AlertTriangle className="w-3 h-3" />Aging</span>}
          {ppVencido && <span className="flex items-center gap-1 text-fluig-danger"><AlertTriangle className="w-3 h-3" />Vencido</span>}
        </div>
        {opp.data_proximo_passo && (
          <p className={`text-xs mb-2 ${ppVencido ? "text-fluig-danger font-medium" : "text-muted-foreground"}`}>
            Prox: {opp.proximo_passo ? opp.proximo_passo.slice(0, 40) : "--"} ({format(new Date(opp.data_proximo_passo), "dd/MM", { locale: ptBR })})
          </p>
        )}
        <div className="flex items-center gap-1 mt-1">
          {isOppActive(opp.estagio) && opp.estagio !== "works_fechado" && (
            <button onClick={() => handleAdvance(opp)} className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-fluig-primary text-primary-foreground hover:opacity-90 transition-opacity">
              Avancar <ChevronRight className="w-3 h-3" />
            </button>
          )}
          {isOppActive(opp.estagio) && (
            <button onClick={() => handleLose(opp.id)} className="px-2 py-1 rounded text-xs bg-fluig-danger text-primary-foreground hover:opacity-90 transition-opacity">Perdido</button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <SectionHeader
        icon={<KanbanSquare className="w-5 h-5" />}
        title="Pipeline de Oportunidades"
        description="Funil por estagios com atualizacao de status e valor MRR."
      />

      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card">
          <DollarSign className="w-4 h-4 text-fluig-primary" />
          <span className="text-sm text-muted-foreground">MRR Pipeline:</span>
          <span className="text-sm font-bold text-foreground">R$ {pipelineTotal.toLocaleString("pt-BR")}/mes</span>
        </div>
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <button onClick={() => setViewMode("kanban")} className={`flex items-center gap-1 px-3 py-2 text-sm ${viewMode === "kanban" ? "bg-fluig-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted"} transition-colors`}>
            <LayoutGrid className="w-4 h-4" /> Kanban
          </button>
          <button onClick={() => setViewMode("lista")} className={`flex items-center gap-1 px-3 py-2 text-sm ${viewMode === "lista" ? "bg-fluig-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted"} transition-colors`}>
            <List className="w-4 h-4" /> Lista
          </button>
        </div>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-fluig-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity ml-auto">
          <Plus className="w-4 h-4" /> Nova Oportunidade
        </button>
      </div>

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {activeStages.map((stage) => {
            const stageOpps = opportunities.filter((o) => o.estagio === stage)
            return (
              <div
                key={stage}
                onDragOver={onDragOver}
                onDrop={() => onDrop(stage)}
                className="min-w-[240px] w-[240px] flex-shrink-0 rounded-xl border border-border bg-card flex flex-col"
              >
                <div className="px-3 py-2.5 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-fluig-title">{OPP_STAGE_LABELS[stage]}</h3>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{stageOpps.length}</span>
                  </div>
                </div>
                <div className="p-2 flex flex-col gap-2 min-h-[100px] flex-1">
                  {stageOpps.map((opp) => <OppCard key={opp.id} opp={opp} />)}
                  {stageOpps.length === 0 && (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">Vazio</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Perdidos section in Kanban */}
      {viewMode === "kanban" && opportunities.some((o) => o.estagio === "perdido") && (
        <div className="mt-6 rounded-xl border border-border bg-card">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-fluig-title">Perdidos</h3>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {opportunities.filter((o) => o.estagio === "perdido").map((opp) => (
              <div key={opp.id} className="rounded-lg border border-fluig-danger/30 p-3 bg-fluig-danger/5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">{getAccountName(opp.account_id)}</p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-fluig-danger text-primary-foreground">Perdido</span>
                </div>
                <p className="text-xs text-muted-foreground">MRR: R$ {opp.mrr_estimado.toLocaleString("pt-BR")}</p>
                {opp.motivo_perda && <p className="text-xs text-muted-foreground mt-1">Motivo: {opp.motivo_perda}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === "lista" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Conta</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estagio</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Tier</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">MRR Est.</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Pacote</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Responsavel</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Prox. Passo</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Aging</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opp) => {
                  const aging = calcAgingDias(opp.atualizado_em)
                  const isAged = aging > 7
                  return (
                    <tr key={opp.id} className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{getAccountName(opp.account_id)}</td>
                      <td className="px-4 py-3 text-xs">{OPP_STAGE_LABELS[opp.estagio]}</td>
                      <td className="px-4 py-3 text-center"><TierBadge tier={getAccountTier(opp.account_id)} /></td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">R$ {opp.mrr_estimado.toLocaleString("pt-BR")}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">{opp.pacote_works}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">{opp.responsavel}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell max-w-[150px] truncate">{opp.proximo_passo || "--"}</td>
                      <td className={`px-4 py-3 text-center text-xs font-medium ${isAged ? "text-fluig-danger" : "text-muted-foreground"}`}>{aging}d</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {isOppActive(opp.estagio) && (
                            <>
                              <button onClick={() => handleAdvance(opp)} className="px-2 py-1 rounded text-xs bg-fluig-primary text-primary-foreground hover:opacity-90">Avancar</button>
                              <button onClick={() => handleLose(opp.id)} className="px-2 py-1 rounded text-xs bg-fluig-danger text-primary-foreground hover:opacity-90">Perdido</button>
                            </>
                          )}
                          <button onClick={() => deleteOpportunity(opp.id)} className="p-1 rounded text-muted-foreground hover:text-fluig-danger"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {opportunities.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">Nenhuma oportunidade registrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setCreateOpen(false)} />
          <div className="relative w-full max-w-md mx-4 rounded-xl bg-card border border-border overflow-hidden">
            <div className="px-6 py-4 text-primary-foreground" style={{ background: "linear-gradient(135deg, var(--fluig-primary) 0%, var(--fluig-secondary) 100%)" }}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Iniciar Oportunidade Works</h3>
                <button onClick={() => setCreateOpen(false)} aria-label="Fechar"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <form onSubmit={handleCreate} className="p-6 flex flex-col gap-4">
              {error && <p className="text-sm text-fluig-danger bg-fluig-danger/10 px-3 py-2 rounded-lg">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Conta <span className="text-fluig-danger">*</span></label>
                <select required value={form.account_id} onChange={(e) => setForm({ ...form, account_id: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Selecione...</option>
                  {availableAccounts.map((a) => <option key={a.id} value={a.id}>{a.nome} (Tier {a.tier})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">MRR Estimado (R$) <span className="text-fluig-danger">*</span></label>
                <input required type="number" min={0} step={100} value={form.mrr_estimado} onChange={(e) => setForm({ ...form, mrr_estimado: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Pacote Works</label>
                  <select value={form.pacote_works} onChange={(e) => setForm({ ...form, pacote_works: e.target.value as PacoteWorks })} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {PACOTES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Responsavel</label>
                  <select value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value as Responsavel })} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {RESPONSAVEIS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Proximo Passo</label>
                <input type="text" value={form.proximo_passo} onChange={(e) => setForm({ ...form, proximo_passo: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Data Proximo Passo</label>
                <input type="date" value={form.data_proximo_passo} onChange={(e) => setForm({ ...form, data_proximo_passo: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <button type="submit" className="w-full px-4 py-2.5 rounded-lg bg-fluig-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">Criar Oportunidade</button>
            </form>
          </div>
        </div>
      )}

      {/* Closing Modal (Won or Lost) */}
      {closingOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setClosingOpp(null)} />
          <div className="relative w-full max-w-sm mx-4 rounded-xl bg-card border border-border p-6">
            <h3 className="text-base font-semibold text-foreground mb-3">
              {closingOpp.type === "won" ? "Fechar como Works Fechado" : "Registrar Perda"}
            </h3>
            {closingOpp.type === "won" ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1">MRR Fechado (R$) <span className="text-fluig-danger">*</span></label>
                <input type="number" min={0} step={100} value={closingMrr} onChange={(e) => setClosingMrr(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1">Motivo da Perda <span className="text-fluig-danger">*</span></label>
                <textarea value={closingMotivo} onChange={(e) => setClosingMotivo(e.target.value)} rows={3} placeholder="Descreva o motivo..." className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
            )}
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setClosingOpp(null)} className="px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm hover:bg-muted transition-colors">Cancelar</button>
              <button
                onClick={confirmClose}
                disabled={closingOpp.type === "lost" && !closingMotivo.trim()}
                className={`px-4 py-2 rounded-lg text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 ${closingOpp.type === "won" ? "bg-fluig-success" : "bg-fluig-danger"}`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
