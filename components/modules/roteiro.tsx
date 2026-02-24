"use client"

import { useState, useMemo } from "react"
import { useStore } from "@/lib/store"
import {
  type AssessmentAxis,
  type AxisScore,
  AXIS_LABELS,
} from "@/lib/models"
import { SectionHeader } from "@/components/fluig/section-header"
import {
  ClipboardList,
  Cog,
  Zap,
  Link2,
  Shield,
  ChevronLeft,
  ChevronRight,
  FileText,
  Check,
} from "lucide-react"
import type { ReactNode } from "react"

const AXIS_ICONS: Record<AssessmentAxis, ReactNode> = {
  processos: <Cog className="w-5 h-5" />,
  automacao: <Zap className="w-5 h-5" />,
  integracao: <Link2 className="w-5 h-5" />,
  governanca: <Shield className="w-5 h-5" />,
}

const AXIS_DESCRIPTIONS: Record<AssessmentAxis, string> = {
  processos: "Avalie a maturidade dos processos de negócio da conta.",
  automacao: "Avalie o nível de automação e digitalização das operações.",
  integracao: "Avalie o grau de integração entre sistemas e plataformas.",
  governanca: "Avalie as práticas de governança de TI e conformidade.",
}

const AXES: AssessmentAxis[] = ["processos", "automacao", "integracao", "governanca"]

export function RoteiroModule() {
  const accounts = useStore((s) => s.accounts)
  const opportunities = useStore((s) => s.opportunities)
  const reports = useStore((s) => s.reports)
  const addReport = useStore((s) => s.addReport)

  const [step, setStep] = useState(0) // 0=select, 1-4=axes, 5=summary
  const [selectedAccountId, setSelectedAccountId] = useState("")
  const [selectedOppId, setSelectedOppId] = useState("")
  const [scores, setScores] = useState<AxisScore[]>(
    AXES.map((axis) => ({ axis, score: 3, observacoes: "" }))
  )
  const [recomendacoes, setRecomendacoes] = useState("")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // Accounts with active opportunities
  const eligibleAccounts = useMemo(() => {
    const activeOpps = opportunities.filter(
      (o) => o.stage !== "fechado_ganho" && o.stage !== "fechado_perdido"
    )
    const accountIds = new Set(activeOpps.map((o) => o.account_id))
    return accounts.filter((a) => accountIds.has(a.id))
  }, [accounts, opportunities])

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId)
  const activeOpp = opportunities.find(
    (o) =>
      o.account_id === selectedAccountId &&
      o.stage !== "fechado_ganho" &&
      o.stage !== "fechado_perdido"
  )

  function handleSelectAccount(accountId: string) {
    setSelectedAccountId(accountId)
    const opp = opportunities.find(
      (o) =>
        o.account_id === accountId &&
        o.stage !== "fechado_ganho" &&
        o.stage !== "fechado_perdido"
    )
    if (opp) setSelectedOppId(opp.id)
  }

  function updateScore(axisIdx: number, field: "score" | "observacoes", value: number | string) {
    setScores((prev) =>
      prev.map((s, i) =>
        i === axisIdx ? { ...s, [field]: value } : s
      )
    )
  }

  function handleGenerate() {
    setError("")
    const result = addReport({
      account_id: selectedAccountId,
      opportunity_id: selectedOppId,
      scores,
      recomendacoes,
    })
    if (result === null) {
      setError("Já existe um rascunho de relatório para esta conta/oportunidade.")
      return
    }
    setSuccess(true)
  }

  function handleReset() {
    setStep(0)
    setSelectedAccountId("")
    setSelectedOppId("")
    setScores(AXES.map((axis) => ({ axis, score: 3, observacoes: "" })))
    setRecomendacoes("")
    setSuccess(false)
    setError("")
  }

  if (success) {
    return (
      <div>
        <SectionHeader
          icon={<ClipboardList className="w-5 h-5" />}
          title="Roteiro de Assessment"
          description="Avalie a maturidade digital das contas para gerar relatórios personalizados."
        />
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-16 h-16 rounded-full bg-fluig-success flex items-center justify-center">
            <Check className="w-8 h-8 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Rascunho Gerado com Sucesso!</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            O relatório para <strong>{selectedAccount?.nome}</strong> foi criado.
            Acesse o módulo de Relatórios para visualizar e exportar.
          </p>
          <button
            onClick={handleReset}
            className="px-6 py-2.5 rounded-lg bg-fluig-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Novo Assessment
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <SectionHeader
        icon={<ClipboardList className="w-5 h-5" />}
        title="Roteiro de Assessment"
        description="Avalie a maturidade digital das contas para gerar relatórios personalizados."
      />

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          {["Conta", ...AXES.map((a) => AXIS_LABELS[a]), "Resumo"].map(
            (label, idx) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    idx < step
                      ? "bg-fluig-success text-primary-foreground"
                      : idx === step
                      ? "bg-fluig-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {idx < step ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className="text-xs text-muted-foreground hidden lg:block truncate">
                  {label}
                </span>
                {idx < 5 && (
                  <div
                    className={`h-0.5 flex-1 rounded ${
                      idx < step ? "bg-fluig-success" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* Step 0: Select account */}
      {step === 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-fluig-primary">
              <ClipboardList className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-fluig-title">Selecionar Conta</h3>
          </div>
          <div className="h-px bg-border mb-2" />
          <p className="text-sm text-muted-foreground mb-4">
            Escolha a conta com oportunidade ativa para iniciar o assessment.
          </p>

          {eligibleAccounts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nenhuma conta com oportunidade ativa disponível.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {eligibleAccounts.map((account) => {
                const hasReport = reports.some(
                  (r) =>
                    r.account_id === account.id &&
                    r.status === "rascunho"
                )
                return (
                  <button
                    key={account.id}
                    disabled={hasReport}
                    onClick={() => {
                      handleSelectAccount(account.id)
                      setStep(1)
                    }}
                    className={`text-left p-4 rounded-lg border transition-colors ${
                      hasReport
                        ? "border-border opacity-50 cursor-not-allowed"
                        : selectedAccountId === account.id
                        ? "border-[var(--fluig-primary)] bg-accent"
                        : "border-border bg-card hover:border-[var(--fluig-primary)] hover:bg-accent/50"
                    }`}
                  >
                    <p className="font-medium text-foreground text-sm">{account.nome}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {account.segmento} | Tier {account.tier}
                    </p>
                    {hasReport && (
                      <p className="text-xs mt-1" style={{ color: "var(--fluig-info)" }}>
                        Rascunho existente
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Steps 1-4: Axes */}
      {step >= 1 && step <= 4 && (
        <div className="rounded-xl border border-border bg-card p-6">
          {(() => {
            const axisIdx = step - 1
            const axis = AXES[axisIdx]
            return (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-fluig-primary">
                    {AXIS_ICONS[axis]}
                  </div>
                  <h3 className="text-base font-semibold text-fluig-title">
                    {AXIS_LABELS[axis]}
                  </h3>
                </div>
                <div className="h-px bg-border mb-2" />
                <p className="text-sm text-muted-foreground mb-6">
                  {AXIS_DESCRIPTIONS[axis]}
                </p>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Nota: {scores[axisIdx].score}/5
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => updateScore(axisIdx, "score", val)}
                        className={`w-12 h-12 rounded-lg text-sm font-bold transition-colors ${
                          scores[axisIdx].score === val
                            ? "bg-fluig-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Observações
                  </label>
                  <textarea
                    value={scores[axisIdx].observacoes}
                    onChange={(e) =>
                      updateScore(axisIdx, "observacoes", e.target.value)
                    }
                    rows={4}
                    placeholder="Detalhe os pontos observados neste eixo..."
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
              </>
            )
          })()}
        </div>
      )}

      {/* Step 5: Summary */}
      {step === 5 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-fluig-primary">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-fluig-title">Resumo do Assessment</h3>
          </div>
          <div className="h-px bg-border mb-4" />

          <div className="mb-4 p-3 rounded-lg" style={{ background: "var(--fluig-readonly)" }}>
            <p className="text-sm text-muted-foreground">Conta</p>
            <p className="font-medium text-foreground">{selectedAccount?.nome}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {scores.map((s) => (
              <div key={s.axis} className="p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {AXIS_LABELS[s.axis]}
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      s.score >= 4
                        ? "text-fluig-success"
                        : s.score >= 3
                        ? "text-fluig-secondary"
                        : "text-fluig-danger"
                    }`}
                  >
                    {s.score}/5
                  </span>
                </div>
                {s.observacoes && (
                  <p className="text-xs text-muted-foreground">{s.observacoes}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1">
              Recomendações Gerais
            </label>
            <textarea
              value={recomendacoes}
              onChange={(e) => setRecomendacoes(e.target.value)}
              rows={4}
              placeholder="Escreva suas recomendações finais..."
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-fluig-danger bg-fluig-danger/10 px-3 py-2 rounded-lg mb-4">
              {error}
            </p>
          )}
        </div>
      )}

      {/* Navigation */}
      {step > 0 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </button>
          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-fluig-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-fluig-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <FileText className="w-4 h-4" />
              Gerar Rascunho
            </button>
          )}
        </div>
      )}
    </div>
  )
}
