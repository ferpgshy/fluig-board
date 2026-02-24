"use client"

import { useMemo } from "react"
import { useStore } from "@/lib/store"
import { AXIS_LABELS } from "@/lib/models"
import { SectionHeader } from "@/components/fluig/section-header"
import { TierBadge } from "@/components/fluig/tier-badge"
import { FileText, Download, CheckCircle, Clock } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function RelatorioModule() {
  const accounts = useStore((s) => s.accounts)
  const reports = useStore((s) => s.reports)
  const finalizeReport = useStore((s) => s.finalizeReport)

  const getAccount = (id: string) => accounts.find((a) => a.id === id)

  async function handleExport(reportId: string) {
    const report = reports.find((r) => r.id === reportId)
    if (!report) return
    const account = getAccount(report.account_id)

    // Dynamic import jsPDF
    const { default: jsPDF } = await import("jspdf")
    const doc = new jsPDF()

    // Header
    doc.setFillColor(0, 119, 182)
    doc.rect(0, 0, 210, 35, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.text("Fluig CRM - Relatório de Assessment", 15, 20)
    doc.setFontSize(10)
    doc.text(
      `Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`,
      15,
      30
    )

    // Account info
    doc.setTextColor(0, 153, 160)
    doc.setFontSize(14)
    doc.text("Informações da Conta", 15, 50)
    doc.setTextColor(50, 50, 50)
    doc.setFontSize(10)
    doc.text(`Empresa: ${account?.nome ?? "—"}`, 15, 60)
    doc.text(`Segmento: ${account?.segmento ?? "—"}`, 15, 67)
    doc.text(`Tier: ${account?.tier ?? "—"} | Score: ${account?.score_total ?? "—"}`, 15, 74)

    // Scores
    doc.setTextColor(0, 153, 160)
    doc.setFontSize(14)
    doc.text("Pontuação por Eixo", 15, 92)

    let y = 102
    report.scores.forEach((s) => {
      doc.setTextColor(50, 50, 50)
      doc.setFontSize(11)
      doc.text(`${AXIS_LABELS[s.axis]}: ${s.score}/5`, 15, y)
      if (s.observacoes) {
        doc.setFontSize(9)
        doc.setTextColor(100, 100, 100)
        const lines = doc.splitTextToSize(s.observacoes, 175)
        doc.text(lines, 20, y + 6)
        y += 6 + lines.length * 4
      }
      y += 10
    })

    // Recommendations
    if (report.recomendacoes) {
      doc.setTextColor(0, 153, 160)
      doc.setFontSize(14)
      doc.text("Recomendações", 15, y + 5)
      doc.setTextColor(50, 50, 50)
      doc.setFontSize(10)
      const recLines = doc.splitTextToSize(report.recomendacoes, 175)
      doc.text(recLines, 15, y + 15)
    }

    doc.save(`relatorio-${account?.nome?.replace(/\s+/g, "-").toLowerCase() ?? "assessment"}.pdf`)
  }

  const sortedReports = useMemo(
    () =>
      [...reports].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [reports]
  )

  return (
    <div>
      <SectionHeader
        icon={<FileText className="w-5 h-5" />}
        title="Relatórios"
        description="Visualize e exporte os relatórios de assessment gerados pelo módulo de Roteiro."
      />

      {sortedReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-xl border border-border bg-card">
          <FileText className="w-12 h-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            Nenhum relatório encontrado. Use o módulo Roteiro para criar um assessment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReports.map((report) => {
            const account = getAccount(report.account_id)
            const avgScore =
              report.scores.reduce((sum, s) => sum + s.score, 0) /
              report.scores.length

            return (
              <div
                key={report.id}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                {/* Report header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-fluig-title">
                      {account?.nome ?? "Conta removida"}
                    </h3>
                    {account && <TierBadge tier={account.tier} />}
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        report.status === "finalizado"
                          ? "bg-fluig-success text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {report.status === "finalizado" ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {report.status === "finalizado" ? "Finalizado" : "Rascunho"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(report.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>

                {/* Scores */}
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    {report.scores.map((s) => (
                      <div
                        key={s.axis}
                        className="p-3 rounded-lg border border-border"
                      >
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
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {s.observacoes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Average + Progress bar */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-muted-foreground">Média:</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(avgScore / 5) * 100}%`,
                          background:
                            avgScore >= 4
                              ? "var(--fluig-success)"
                              : avgScore >= 3
                              ? "var(--fluig-secondary)"
                              : "var(--fluig-danger)",
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {avgScore.toFixed(1)}/5
                    </span>
                  </div>

                  {report.recomendacoes && (
                    <div className="p-3 rounded-lg mb-4" style={{ background: "var(--fluig-readonly)" }}>
                      <p className="text-xs text-muted-foreground mb-1 font-medium">Recomendações</p>
                      <p className="text-sm text-foreground">{report.recomendacoes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {report.status === "rascunho" && (
                      <button
                        onClick={() => finalizeReport(report.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-fluig-success text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Finalizar
                      </button>
                    )}
                    <button
                      onClick={() => handleExport(report.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-fluig-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      <Download className="w-4 h-4" />
                      Exportar PDF
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
