"use client"

import { useState, useMemo } from "react"
import { useStore } from "@/lib/store"
import { type ReportDraft, type ReportTipo } from "@/lib/models"
import { SectionHeader } from "@/components/fluig/section-header"
import { TierBadge } from "@/components/fluig/tier-badge"
import {
  FileText,
  Download,
  CheckCircle,
  Clock,
  Send,
  Pencil,
  ChevronRight,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const STATUS_FLOW: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  Rascunho: { label: "Rascunho", icon: Clock, color: "bg-muted text-muted-foreground" },
  "Revisão": { label: "Revisao", icon: Pencil, color: "bg-fluig-secondary text-primary-foreground" },
  Enviado: { label: "Enviado", icon: Send, color: "bg-fluig-success text-primary-foreground" },
}

export function RelatorioModule() {
  const accounts = useStore((s) => s.accounts)
  const reports = useStore((s) => s.reports)
  const updateReport = useStore((s) => s.updateReport)
  const advanceReportStatus = useStore((s) => s.advanceReportStatus)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<ReportDraft>>({})

  const getAccount = (id: string) => accounts.find((a) => a.id === id)

  function startEdit(report: ReportDraft) {
    setEditingId(report.id)
    setEditForm({
      tipo: report.tipo,
      titulo: report.titulo,
      contexto_cliente: report.contexto_cliente,
      dores_priorizadas: report.dores_priorizadas,
      impacto_estimado: report.impacto_estimado,
      solucao_proposta: report.solucao_proposta,
      entregaveis: report.entregaveis,
      investimento_mrr: report.investimento_mrr,
      prazo_implantacao: report.prazo_implantacao,
    })
  }

  function saveEdit() {
    if (!editingId) return
    updateReport(editingId, editForm)
    setEditingId(null)
    setEditForm({})
  }

  async function handleExport(reportId: string) {
    const report = reports.find((r) => r.id === reportId)
    if (!report) return
    const account = getAccount(report.account_id)

    const { default: jsPDF } = await import("jspdf")
    const doc = new jsPDF()

    // Header with gradient simulation
    doc.setFillColor(0, 119, 182)
    doc.rect(0, 0, 210, 40, "F")
    doc.setFillColor(0, 168, 168)
    doc.rect(140, 0, 70, 40, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.text(report.tipo === "Relatorio_Executivo" ? "Relatorio Executivo" : "Proposta Works", 15, 18)
    doc.setFontSize(10)
    doc.text(report.titulo, 15, 26)
    doc.text(`Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, 15, 34)

    let y = 52

    // Contexto
    doc.setTextColor(0, 153, 160)
    doc.setFontSize(13)
    doc.text("Contexto do Cliente", 15, y)
    y += 8
    doc.setTextColor(50, 50, 50)
    doc.setFontSize(10)
    const ctxLines = doc.splitTextToSize(report.contexto_cliente || "--", 175)
    doc.text(ctxLines, 15, y)
    y += ctxLines.length * 5 + 8

    // Dores
    doc.setTextColor(0, 153, 160)
    doc.setFontSize(13)
    doc.text("Dores Priorizadas", 15, y)
    y += 8
    doc.setTextColor(50, 50, 50)
    doc.setFontSize(10)
    const doresLines = doc.splitTextToSize(report.dores_priorizadas || "--", 175)
    doc.text(doresLines, 15, y)
    y += doresLines.length * 5 + 8

    // Impacto
    doc.setTextColor(0, 153, 160)
    doc.setFontSize(13)
    doc.text("Impacto Estimado", 15, y)
    y += 8
    doc.setTextColor(50, 50, 50)
    doc.setFontSize(10)
    const impLines = doc.splitTextToSize(report.impacto_estimado || "--", 175)
    doc.text(impLines, 15, y)
    y += impLines.length * 5 + 8

    // Solucao
    doc.setTextColor(0, 153, 160)
    doc.setFontSize(13)
    doc.text("Solucao Proposta", 15, y)
    y += 8
    doc.setTextColor(50, 50, 50)
    doc.setFontSize(10)
    const solLines = doc.splitTextToSize(report.solucao_proposta || "--", 175)
    doc.text(solLines, 15, y)
    y += solLines.length * 5 + 8

    // Entregaveis
    if (y > 240) { doc.addPage(); y = 20 }
    doc.setTextColor(0, 153, 160)
    doc.setFontSize(13)
    doc.text("Entregaveis", 15, y)
    y += 8
    doc.setTextColor(50, 50, 50)
    doc.setFontSize(10)
    const entLines = doc.splitTextToSize(report.entregaveis || "--", 175)
    doc.text(entLines, 15, y)
    y += entLines.length * 5 + 8

    // Investimento
    doc.setTextColor(0, 153, 160)
    doc.setFontSize(13)
    doc.text("Investimento", 15, y)
    y += 8
    doc.setTextColor(50, 50, 50)
    doc.setFontSize(10)
    doc.text(`MRR: R$ ${report.investimento_mrr.toLocaleString("pt-BR")}/mes`, 15, y)
    y += 6
    doc.text(`Prazo de implantacao: ${report.prazo_implantacao}`, 15, y)

    doc.save(`${report.tipo === "Relatorio_Executivo" ? "relatorio" : "proposta"}-${account?.nome?.replace(/\s+/g, "-").toLowerCase() ?? "doc"}.pdf`)
  }

  const sortedReports = useMemo(
    () => [...reports].sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()),
    [reports]
  )

  return (
    <div>
      <SectionHeader
        icon={<FileText className="w-5 h-5" />}
        title="Relatorio Executivo e Proposta Works"
        description="Gerencie e exporte relatorios pre-preenchidos a partir do diagnostico de visita."
      />

      {sortedReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-xl border border-border bg-card">
          <FileText className="w-12 h-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">Nenhum relatorio encontrado. Use o modulo Roteiro para gerar um rascunho.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReports.map((report) => {
            const account = getAccount(report.account_id)
            const statusConfig = STATUS_FLOW[report.status]
            const StatusIcon = statusConfig.icon
            const isEditing = editingId === report.id

            return (
              <div key={report.id} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-base font-semibold text-fluig-title">{account?.nome ?? "Conta removida"}</h3>
                    {account && <TierBadge tier={account.tier} />}
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig.color}`}>
                      <StatusIcon className="w-3 h-3" /> {statusConfig.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                      {report.tipo === "Relatorio_Executivo" ? "Relatorio Executivo" : "Proposta Works"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {format(new Date(report.criado_em), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>

                {/* Body */}
                <div className="px-6 py-4">
                  {isEditing ? (
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Tipo</label>
                          <select value={editForm.tipo} onChange={(e) => setEditForm({ ...editForm, tipo: e.target.value as ReportTipo })} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                            <option value="Relatorio_Executivo">Relatorio Executivo</option>
                            <option value="Proposta_Works">Proposta Works</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Titulo</label>
                          <input type="text" value={editForm.titulo ?? ""} onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                      </div>
                      {(["contexto_cliente", "dores_priorizadas", "impacto_estimado", "solucao_proposta", "entregaveis"] as const).map((field) => (
                        <div key={field}>
                          <label className="block text-sm font-medium text-foreground mb-1 capitalize">{field.replace(/_/g, " ")}</label>
                          <textarea
                            value={(editForm[field] as string) ?? ""}
                            onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                          />
                        </div>
                      ))}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Investimento MRR (R$)</label>
                          <input type="number" min={0} step={100} value={editForm.investimento_mrr ?? 0} onChange={(e) => setEditForm({ ...editForm, investimento_mrr: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Prazo Implantacao</label>
                          <input type="text" value={editForm.prazo_implantacao ?? ""} onChange={(e) => setEditForm({ ...editForm, prazo_implantacao: e.target.value })} placeholder="Ex: 30 dias" className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={saveEdit} className="px-4 py-2 rounded-lg bg-fluig-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">Salvar</button>
                        <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm hover:bg-muted transition-colors">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                        {[
                          { label: "Contexto do Cliente", value: report.contexto_cliente },
                          { label: "Dores Priorizadas", value: report.dores_priorizadas },
                          { label: "Impacto Estimado", value: report.impacto_estimado },
                          { label: "Solucao Proposta", value: report.solucao_proposta },
                          { label: "Entregaveis", value: report.entregaveis },
                        ].map((item) => (
                          <div key={item.label} className="p-3 rounded-lg" style={{ background: "var(--fluig-readonly)" }}>
                            <p className="text-xs text-muted-foreground mb-1 font-medium">{item.label}</p>
                            <p className="text-sm text-foreground whitespace-pre-wrap">{item.value || "--"}</p>
                          </div>
                        ))}
                        <div className="p-3 rounded-lg" style={{ background: "var(--fluig-readonly)" }}>
                          <p className="text-xs text-muted-foreground mb-1 font-medium">Investimento / Prazo</p>
                          <p className="text-sm text-foreground">R$ {report.investimento_mrr.toLocaleString("pt-BR")}/mes | {report.prazo_implantacao}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {report.status !== "Enviado" && (
                          <button onClick={() => startEdit(report)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm hover:bg-muted transition-colors">
                            <Pencil className="w-4 h-4" /> Editar
                          </button>
                        )}
                        {report.status !== "Enviado" && (
                          <button onClick={() => advanceReportStatus(report.id)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-fluig-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                            <ChevronRight className="w-4 h-4" />
                            {report.status === "Rascunho" ? "Enviar para Revisao" : "Marcar como Enviado"}
                          </button>
                        )}
                        <button onClick={() => handleExport(report.id)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-fluig-secondary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                          <Download className="w-4 h-4" /> Exportar PDF
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
