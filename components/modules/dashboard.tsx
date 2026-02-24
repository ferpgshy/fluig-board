"use client"

import { useMemo } from "react"
import { useStore } from "@/lib/store"
import { OPP_STAGE_LABELS, type OppStage, calcAgingDias } from "@/lib/models"
import { SectionHeader } from "@/components/fluig/section-header"
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  FileText,
  Users,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

export function DashboardModule() {
  const accounts = useStore((s) => s.accounts)
  const opportunities = useStore((s) => s.opportunities)
  const visits = useStore((s) => s.visits)
  const reports = useStore((s) => s.reports)

  const stats = useMemo(() => {
    const activeOpps = opportunities.filter(
      (o) => o.stage !== "fechado_ganho" && o.stage !== "fechado_perdido"
    )
    const wonOpps = opportunities.filter((o) => o.stage === "fechado_ganho")
    const lostOpps = opportunities.filter((o) => o.stage === "fechado_perdido")
    const pipelineTotal = activeOpps.reduce((sum, o) => sum + o.valor_estimado, 0)
    const wonTotal = wonOpps.reduce((sum, o) => sum + o.valor_estimado, 0)
    const agingOpps = activeOpps.filter((o) => calcAgingDias(o.created_at) > 7)
    const winRate =
      wonOpps.length + lostOpps.length > 0
        ? Math.round(
            (wonOpps.length / (wonOpps.length + lostOpps.length)) * 100
          )
        : 0

    return {
      totalAccounts: accounts.length,
      activeOpps: activeOpps.length,
      pipelineTotal,
      wonTotal,
      agingCount: agingOpps.length,
      reportsCount: reports.length,
      visitsCount: visits.length,
      winRate,
      tierA: accounts.filter((a) => a.tier === "A").length,
      tierB: accounts.filter((a) => a.tier === "B").length,
      tierC: accounts.filter((a) => a.tier === "C").length,
    }
  }, [accounts, opportunities, visits, reports])

  // Chart data: opportunities by stage
  const stageData = useMemo(() => {
    const stages: OppStage[] = [
      "prospeccao",
      "qualificacao",
      "proposta",
      "negociacao",
    ]
    return stages.map((stage) => ({
      name: OPP_STAGE_LABELS[stage],
      count: opportunities.filter((o) => o.stage === stage).length,
      valor: opportunities
        .filter((o) => o.stage === stage)
        .reduce((sum, o) => sum + o.valor_estimado, 0),
    }))
  }, [opportunities])

  // Tier distribution pie
  const tierData = useMemo(
    () => [
      { name: "Tier A", value: stats.tierA, color: "var(--fluig-primary)" },
      { name: "Tier B", value: stats.tierB, color: "var(--fluig-secondary)" },
      { name: "Tier C", value: stats.tierC, color: "#9ca3af" },
    ],
    [stats]
  )

  const kpiCards = [
    {
      label: "Total de Contas",
      value: stats.totalAccounts,
      icon: <Building2 className="w-5 h-5" />,
      color: "fluig-primary" as const,
    },
    {
      label: "Oportunidades Ativas",
      value: stats.activeOpps,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "fluig-secondary" as const,
    },
    {
      label: "Pipeline Total",
      value: `R$ ${stats.pipelineTotal.toLocaleString("pt-BR")}`,
      icon: <DollarSign className="w-5 h-5" />,
      color: "fluig-primary" as const,
    },
    {
      label: "Receita Ganha",
      value: `R$ ${stats.wonTotal.toLocaleString("pt-BR")}`,
      icon: <DollarSign className="w-5 h-5" />,
      color: "fluig-success" as const,
    },
    {
      label: "Win Rate",
      value: `${stats.winRate}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      color:
        stats.winRate >= 50
          ? ("fluig-success" as const)
          : stats.winRate >= 30
          ? ("fluig-secondary" as const)
          : ("fluig-danger" as const),
    },
    {
      label: "Opp. com Aging > 7d",
      value: stats.agingCount,
      icon: <AlertTriangle className="w-5 h-5" />,
      color:
        stats.agingCount === 0
          ? ("fluig-success" as const)
          : ("fluig-danger" as const),
    },
    {
      label: "Visitas Registradas",
      value: stats.visitsCount,
      icon: <Users className="w-5 h-5" />,
      color: "fluig-info" as const,
    },
    {
      label: "Relatórios",
      value: stats.reportsCount,
      icon: <FileText className="w-5 h-5" />,
      color: "fluig-secondary" as const,
    },
  ]

  return (
    <div>
      <SectionHeader
        icon={<LayoutDashboard className="w-5 h-5" />}
        title="Dashboard"
        description="Visão geral de indicadores comerciais e desempenho do pipeline."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-border bg-card p-4 flex items-start gap-3"
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-${kpi.color}/10 text-${kpi.color}`}
              style={{
                backgroundColor: `color-mix(in srgb, var(--${kpi.color}) 10%, transparent)`,
                color: `var(--${kpi.color})`,
              }}
            >
              {kpi.icon}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-lg font-bold text-foreground">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline by Stage */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-fluig-title">Pipeline por Etapa</h3>
          </div>
          <div className="h-px bg-border mb-4" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "valor") return [`R$ ${value.toLocaleString("pt-BR")}`, "Valor"]
                    return [value, "Quantidade"]
                  }}
                />
                <Bar dataKey="count" name="count" fill="var(--fluig-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="valor" name="valor" fill="var(--fluig-secondary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tier Distribution */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-fluig-title">Distribuição por Tier</h3>
          </div>
          <div className="h-px bg-border mb-4" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tierData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {tierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-fluig-title">Atividade Recente</h3>
        </div>
        <div className="h-px bg-border mb-4" />
        {visits.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma visita registrada.
          </p>
        ) : (
          <div className="space-y-3">
            {[...visits]
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )
              .slice(0, 5)
              .map((visit) => {
                const account = accounts.find(
                  (a) => a.id === visit.account_id
                )
                return (
                  <div
                    key={visit.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-primary-foreground ${
                        visit.tipo === "presencial"
                          ? "bg-fluig-primary"
                          : "bg-fluig-secondary"
                      }`}
                    >
                      {visit.tipo === "presencial" ? "P" : "R"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {account?.nome ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {visit.resumo}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {visit.participantes}
                    </span>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
