"use client"

import { useMemo, useState } from "react"
import { useStore } from "@/lib/store"
import { OPP_STAGE_LABELS, OPP_STAGE_ORDER, type OppStage, calcAgingDias, isOppActive } from "@/lib/models"
import { SectionHeader } from "@/components/fluig/section-header"
import { TierBadge } from "@/components/fluig/tier-badge"
import {
  LayoutDashboard,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

type Period = "7d" | "30d" | "all"

export function DashboardModule() {
  const accounts = useStore((s) => s.accounts)
  const opportunities = useStore((s) => s.opportunities)
  const visits = useStore((s) => s.visits)

  const [period, setPeriod] = useState<Period>("all")

  // Filter opportunities by period
  const filteredOpps = useMemo(() => {
    if (period === "all") return opportunities
    const daysAgo = period === "7d" ? 7 : 30
    const cutoff = new Date(Date.now() - daysAgo * 86400000).toISOString()
    return opportunities.filter((o) => o.criado_em >= cutoff)
  }, [opportunities, period])

  const filteredVisits = useMemo(() => {
    if (period === "all") return visits
    const daysAgo = period === "7d" ? 7 : 30
    const cutoff = new Date(Date.now() - daysAgo * 86400000).toISOString()
    return visits.filter((v) => v.criado_em >= cutoff)
  }, [visits, period])

  const stats = useMemo(() => {
    const activeOpps = filteredOpps.filter((o) => isOppActive(o.estagio))
    const wonOpps = filteredOpps.filter((o) => o.estagio === "works_fechado")
    const visitasRealizadas = filteredVisits.filter((v) => v.data_visita && new Date(v.data_visita) <= new Date())

    const mrrPipelineTotal = activeOpps.reduce((sum, o) => sum + o.mrr_estimado, 0)
    const mrrFechado = wonOpps.reduce((sum, o) => sum + o.mrr_fechado, 0)

    // Taxa Visita -> Proposta
    const visitaRealizadaCount = filteredOpps.filter((o) => {
      const idx = OPP_STAGE_ORDER.indexOf(o.estagio)
      return idx >= OPP_STAGE_ORDER.indexOf("visita_realizada") || o.estagio === "works_fechado" || o.estagio === "perdido"
    }).length
    const propostaPlusCount = filteredOpps.filter((o) => {
      const idx = OPP_STAGE_ORDER.indexOf(o.estagio)
      return idx >= OPP_STAGE_ORDER.indexOf("proposta") || o.estagio === "works_fechado"
    }).length
    const taxaVisitaProposta = visitaRealizadaCount > 0 ? Math.round((propostaPlusCount / visitaRealizadaCount) * 100) : 0

    // Taxa Proposta -> Fechamento
    const propostaCount = filteredOpps.filter((o) => {
      const idx = OPP_STAGE_ORDER.indexOf(o.estagio)
      return idx >= OPP_STAGE_ORDER.indexOf("proposta") || o.estagio === "works_fechado" || o.estagio === "perdido"
    }).length
    const taxaPropostaFechamento = propostaCount > 0 ? Math.round((wonOpps.length / propostaCount) * 100) : 0

    // Aging medio
    const agingValues = activeOpps.map((o) => calcAgingDias(o.atualizado_em))
    const agingMedio = agingValues.length > 0 ? Math.round(agingValues.reduce((a, b) => a + b, 0) / agingValues.length) : 0

    // Contas sem proximo passo
    const contasSemPP = activeOpps.filter((o) => !o.proximo_passo || (o.data_proximo_passo && new Date(o.data_proximo_passo) < new Date())).length

    return {
      mrrPipelineTotal,
      mrrFechado,
      visitasRealizadas: visitasRealizadas.length,
      taxaVisitaProposta,
      taxaPropostaFechamento,
      agingMedio,
      contasSemPP,
      activeOpps,
      wonOpps,
    }
  }, [filteredOpps, filteredVisits])

  // Alerts
  const alerts = useMemo(() => {
    const items: { label: string; type: "danger" | "warning" | "info"; accountId?: string }[] = []

    if (stats.mrrPipelineTotal < 45000) {
      items.push({
        label: `MRR Pipeline (R$ ${stats.mrrPipelineTotal.toLocaleString("pt-BR")}) abaixo da cobertura 1.5x (R$ 45k)`,
        type: stats.mrrPipelineTotal < 30000 ? "danger" : "warning",
      })
    }
    if (stats.mrrFechado < 30000) {
      items.push({
        label: `MRR Fechado (R$ ${stats.mrrFechado.toLocaleString("pt-BR")}) abaixo da meta de R$ 30k`,
        type: "danger",
      })
    }
    if (stats.taxaVisitaProposta < 50) {
      items.push({ label: `Taxa Visita->Proposta (${stats.taxaVisitaProposta}%) abaixo de 50%`, type: "warning" })
    }
    if (stats.taxaPropostaFechamento < 33) {
      items.push({ label: `Taxa Proposta->Fechamento (${stats.taxaPropostaFechamento}%) abaixo de 33%`, type: "warning" })
    }
    if (stats.agingMedio > 7) {
      items.push({ label: `Aging medio (${stats.agingMedio}d) acima de 7 dias`, type: "danger" })
    }
    if (stats.contasSemPP > 5) {
      items.push({ label: `${stats.contasSemPP} contas sem proximo passo definido ou vencido`, type: "danger" })
    }

    // Per-account aging alerts
    stats.activeOpps.filter((o) => calcAgingDias(o.atualizado_em) > 7).forEach((o) => {
      const name = accounts.find((a) => a.id === o.account_id)?.nome ?? "--"
      items.push({ label: `${name}: ${calcAgingDias(o.atualizado_em)}d sem movimentacao`, type: "warning", accountId: o.account_id })
    })

    return items
  }, [stats, accounts])

  // Funnel chart data
  const funnelData = useMemo(() => {
    return OPP_STAGE_ORDER.map((stage) => ({
      name: OPP_STAGE_LABELS[stage],
      count: filteredOpps.filter((o) => o.estagio === stage).length,
    }))
  }, [filteredOpps])

  // MRR by Tier
  const mrrByTier = useMemo(() => {
    const tiers = ["A", "B", "C"] as const
    return tiers.map((tier) => {
      const acctIds = new Set(accounts.filter((a) => a.tier === tier).map((a) => a.id))
      const mrr = filteredOpps
        .filter((o) => acctIds.has(o.account_id) && isOppActive(o.estagio))
        .reduce((sum, o) => sum + o.mrr_estimado, 0)
      return { name: `Tier ${tier}`, mrr, color: tier === "A" ? "var(--fluig-primary)" : tier === "B" ? "var(--fluig-secondary)" : "#9ca3af" }
    })
  }, [accounts, filteredOpps])

  // Cobertura de meta semaforo
  const coberturaColor = stats.mrrPipelineTotal >= 45000 ? "text-fluig-success" : stats.mrrPipelineTotal >= 30000 ? "text-fluig-secondary" : "text-fluig-danger"

  const kpis = [
    { label: "MRR Pipeline Total", value: `R$ ${stats.mrrPipelineTotal.toLocaleString("pt-BR")}`, icon: <DollarSign className="w-5 h-5" />, alert: stats.mrrPipelineTotal < 45000, alertColor: coberturaColor },
    { label: "MRR Fechado", value: `R$ ${stats.mrrFechado.toLocaleString("pt-BR")}`, icon: <DollarSign className="w-5 h-5" />, alert: stats.mrrFechado < 30000, alertColor: stats.mrrFechado < 30000 ? "text-fluig-danger" : "text-fluig-success" },
    { label: "Visitas Realizadas", value: stats.visitasRealizadas, icon: <Users className="w-5 h-5" />, alert: false, alertColor: "" },
    { label: "Taxa Visita -> Proposta", value: `${stats.taxaVisitaProposta}%`, icon: <TrendingUp className="w-5 h-5" />, alert: stats.taxaVisitaProposta < 50, alertColor: stats.taxaVisitaProposta < 50 ? "text-fluig-danger" : "text-fluig-success" },
    { label: "Taxa Proposta -> Fechamento", value: `${stats.taxaPropostaFechamento}%`, icon: <TrendingUp className="w-5 h-5" />, alert: stats.taxaPropostaFechamento < 33, alertColor: stats.taxaPropostaFechamento < 33 ? "text-fluig-danger" : "text-fluig-success" },
    { label: "Aging Medio por Estagio", value: `${stats.agingMedio}d`, icon: <Clock className="w-5 h-5" />, alert: stats.agingMedio > 7, alertColor: stats.agingMedio > 7 ? "text-fluig-danger" : "text-fluig-success" },
    { label: "Contas sem Prox. Passo", value: stats.contasSemPP, icon: <AlertTriangle className="w-5 h-5" />, alert: stats.contasSemPP > 5, alertColor: stats.contasSemPP > 5 ? "text-fluig-danger" : "text-fluig-success" },
  ]

  return (
    <div>
      <SectionHeader
        icon={<LayoutDashboard className="w-5 h-5" />}
        title="Painel de Governanca"
        description="KPIs, alertas visuais e cobertura de meta em tempo real."
      />

      {/* Period filter */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-muted-foreground">Periodo:</span>
        {([["7d", "7 dias"], ["30d", "30 dias"], ["all", "Toda campanha"]] as [Period, string][]).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setPeriod(val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${period === val ? "bg-fluig-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts.slice(0, 8).map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm ${
                alert.type === "danger" ? "border-fluig-danger/30 bg-fluig-danger/5 text-fluig-danger" :
                alert.type === "warning" ? "border-fluig-secondary/30 bg-fluig-secondary/5 text-fluig-secondary" :
                "border-fluig-info/30 bg-fluig-info/5 text-fluig-info"
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="flex-1">{alert.label}</span>
              {alert.accountId && <ArrowRight className="w-4 h-4 shrink-0" />}
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "color-mix(in srgb, var(--fluig-primary) 10%, transparent)", color: "var(--fluig-primary)" }}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className={`text-lg font-bold ${kpi.alert ? kpi.alertColor : "text-foreground"}`}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Funnel chart */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-fluig-title mb-1">Funil de Oportunidades</h3>
          <div className="h-px bg-border mb-4" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={80} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="count" fill="var(--fluig-primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MRR by Tier */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-fluig-title mb-1">MRR Estimado por Tier</h3>
          <div className="h-px bg-border mb-4" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mrrByTier}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, "MRR Estimado"]} />
                <Bar dataKey="mrr" radius={[4, 4, 0, 0]}>
                  {mrrByTier.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
