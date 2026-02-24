"use client"

import { useState, useMemo } from "react"
import { useStore } from "@/lib/store"
import { type ReportDraft, type ReportTipo, type ReportStatus, OPP_STAGE_LABELS } from "@/lib/models"
import { SectionHeader } from "@/components/fluig/section-header"
import { TierBadge } from "@/components/fluig/tier-badge"
import {
  FileText,
  Download,
  Clock,
  Send,
  Pencil,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const STATUS_CONFIG: Record<ReportStatus, { label: string; Icon: LucideIcon; className: string }> = {
  Rascunho: { label: "Rascunho", Icon: Clock, className: "bg-muted text-muted-foreground" },
  "Revis\u00e3o": { label: "Revis\u00e3o", Icon: Pencil, className: "bg-fluig-secondary text-secondary-foreground" },
  Enviado: { label: "Enviado", Icon: Send, className: "bg-fluig-success text-primary-foreground" },
}

export function RelatorioModule() {
  const accounts = useStore((s) => s.accounts)
  const opportunities = useStore((s) => s.opportunities)
  const visits = useStore((s) => s.visits)
  const reports = useStore((s) => s.reports)
  const updateReport = useStore((s) => s.updateReport)
  const advanceReportStatus = useStore((s) => s.advanceReportStatus)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<ReportDraft>>({})

  const getAccount = (id: string) => accounts.find((a) => a.id === id)
  const getVisit = (id: string) => visits.find((v) => v.id === id)
  const getOpportunity = (accountId: string) => opportunities.find((o) => o.account_id === accountId)

  // === CSV Export Helpers ===
  function escapeCsv(value: string | number | undefined | null): string {
    if (value === undefined || value === null) return ""
    const str = String(value)
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return '"' + str.replace(/"/g, '""') + '"'
    }
    return str
  }

  function downloadCsv(filename: string, csvContent: string) {
    const BOM = "\uFEFF"
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleExportCsvSingle(reportId: string) {
    const report = reports.find((r) => r.id === reportId)
    if (!report) return
    exportReportsToCsv([report])
  }

  function handleExportCsvAll() {
    if (reports.length === 0) return
    exportReportsToCsv(reports)
  }

  function exportReportsToCsv(reportsToExport: ReportDraft[]) {
    const headers = [
      // Relatório
      "Relatorio ID", "Tipo", "Titulo", "Status", "Contexto Cliente", "Dores Priorizadas",
      "Impacto Estimado", "Solucao Proposta", "Entregaveis", "Investimento MRR (R$)",
      "Prazo Implantacao", "Relatorio Criado Em", "Relatorio Atualizado Em",
      // Conta
      "Conta", "Segmento", "Porte", "Tier", "Onda",
      "Contato Nome", "Contato Cargo", "Contato Email", "Contato WhatsApp",
      "Fluig Versao", "Fluig Modulos",
      "Score Potencial", "Score Maturidade", "Score Dor", "Score Risco Churn", "Score Acesso", "Score Total",
      "Observacoes Conta", "Conta Criada Em",
      // Oportunidade
      "Estagio Pipeline", "MRR Estimado (R$)", "MRR Fechado (R$)", "Pacote Works",
      "Responsavel", "Proximo Passo", "Data Proximo Passo", "Motivo Perda",
      "Data Contato", "Data Visita Opp", "Data Proposta", "Data Fechamento",
      // Roteiro / Visita
      "Data Visita Roteiro", "Modalidade", "Participantes Cliente",
      "Processos Descritos", "Processos Dores", "Processos Impacto",
      "Automacao Nivel", "Automacao Gaps",
      "Integracao Sistemas", "Integracao Status",
      "Governanca Problemas", "Sponsor Engajamento",
      "Hipotese Works", "Escopo Preliminar",
      "Objecoes Levantadas", "Proximo Passo Acordado", "Data Proximo Passo Roteiro",
    ]

    const rows = reportsToExport.map((report) => {
      const account = getAccount(report.account_id)
      const opp = getOpportunity(report.account_id)
      const visit = report.visit_id ? getVisit(report.visit_id) : undefined

      return [
        // Relatório
        report.id, report.tipo, report.titulo, report.status,
        report.contexto_cliente, report.dores_priorizadas, report.impacto_estimado,
        report.solucao_proposta, report.entregaveis, report.investimento_mrr,
        report.prazo_implantacao,
        report.criado_em ? format(new Date(report.criado_em), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "",
        report.atualizado_em ? format(new Date(report.atualizado_em), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "",
        // Conta
        account?.nome ?? "", account?.segmento ?? "", account?.porte ?? "",
        account?.tier ?? "", account?.onda ?? "",
        account?.contato_nome ?? "", account?.contato_cargo ?? "",
        account?.contato_email ?? "", account?.contato_whatsapp ?? "",
        account?.fluig_versao ?? "", account?.fluig_modulos?.join("; ") ?? "",
        account?.score_potencial ?? "", account?.score_maturidade ?? "",
        account?.score_dor ?? "", account?.score_risco_churn ?? "",
        account?.score_acesso ?? "", account?.score_total ?? "",
        account?.observacoes ?? "",
        account?.criado_em ? format(new Date(account.criado_em), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "",
        // Oportunidade
        opp ? OPP_STAGE_LABELS[opp.estagio] : "", opp?.mrr_estimado ?? "",
        opp?.mrr_fechado ?? "", opp?.pacote_works ?? "", opp?.responsavel ?? "",
        opp?.proximo_passo ?? "", opp?.data_proximo_passo ?? "", opp?.motivo_perda ?? "",
        opp?.data_contato ?? "", opp?.data_visita ?? "",
        opp?.data_proposta ?? "", opp?.data_fechamento ?? "",
        // Roteiro / Visita
        visit?.data_visita ?? "", visit?.modalidade ?? "", visit?.participantes_cliente ?? "",
        visit?.dx_processos_descritos ?? "", visit?.dx_processos_dores ?? "",
        visit?.dx_processos_impacto ?? "",
        visit?.dx_automacao_nivel ?? "", visit?.dx_automacao_gaps ?? "",
        visit?.dx_integracao_sistemas ?? "", visit?.dx_integracao_status ?? "",
        visit?.dx_governanca_problemas ?? "", visit?.dx_sponsor_engajamento ?? "",
        visit?.hipotese_works ?? "", visit?.escopo_preliminar ?? "",
        visit?.objeccoes_levantadas ?? "", visit?.proximo_passo_acordado ?? "",
        visit?.data_proximo_passo ?? "",
      ].map(escapeCsv)
    })

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const filename = reportsToExport.length === 1
      ? `relatorio-${getAccount(reportsToExport[0].account_id)?.nome?.replace(/\s+/g, "-").toLowerCase() ?? "doc"}.csv`
      : `relatorios-completo-${format(new Date(), "yyyy-MM-dd")}.csv`
    downloadCsv(filename, csv)
  }

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

  function cancelEdit() {
    setEditingId(null)
    setEditForm({})
  }

  async function handleExport(reportId: string) {
    const report = reports.find((r) => r.id === reportId)
    if (!report) return
    const account = getAccount(report.account_id)

    const { default: jsPDF } = await import("jspdf")
    const doc = new jsPDF()

    // Header
    doc.setFillColor(0, 119, 182)
    doc.rect(0, 0, 210, 40, "F")
    doc.setFillColor(0, 168, 168)
    doc.rect(140, 0, 70, 40, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.text(report.tipo === "Relatorio_Executivo" ? "Relatorio Executivo" : "Proposta Works", 15, 18)
    doc.setFontSize(10)
    doc.text(report.titulo || "", 15, 26)
    doc.text("Gerado em " + format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR }), 15, 34)

    let y = 52

    const sections = [
      { title: "Contexto do Cliente", text: report.contexto_cliente },
      { title: "Dores Priorizadas", text: report.dores_priorizadas },
      { title: "Impacto Estimado", text: report.impacto_estimado },
      { title: "Solucao Proposta", text: report.solucao_proposta },
      { title: "Entregaveis", text: report.entregaveis },
    ]

    for (const section of sections) {
      if (y > 260) { doc.addPage(); y = 20 }
      doc.setTextColor(0, 153, 160)
      doc.setFontSize(13)
      doc.text(section.title, 15, y)
      y += 8
      doc.setTextColor(50, 50, 50)
      doc.setFontSize(10)
      const lines = doc.splitTextToSize(section.text || "--", 175)
      doc.text(lines, 15, y)
      y += lines.length * 5 + 8
    }

    // Investimento
    if (y > 260) { doc.addPage(); y = 20 }
    doc.setTextColor(0, 153, 160)
    doc.setFontSize(13)
    doc.text("Investimento", 15, y)
    y += 8
    doc.setTextColor(50, 50, 50)
    doc.setFontSize(10)
    doc.text("MRR: R$ " + report.investimento_mrr.toLocaleString("pt-BR") + "/mes", 15, y)
    y += 6
    doc.text("Prazo de implantacao: " + (report.prazo_implantacao || "--"), 15, y)

    const fileName = (report.tipo === "Relatorio_Executivo" ? "relatorio" : "proposta") + "-" + (account?.nome?.replace(/\s+/g, "-").toLowerCase() ?? "doc") + ".pdf"
    doc.save(fileName)
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

      {sortedReports.length > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handleExportCsvAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-fluig-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <FileSpreadsheet className="w-4 h-4" /> Exportar Todos (CSV Completo)
          </button>
        </div>
      )}

      {sortedReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-xl border border-border bg-card">
          <FileText className="w-12 h-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Nenhum relatorio encontrado. Use o modulo Roteiro para gerar um rascunho a partir de uma visita consultiva.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sortedReports.map((report) => {
            const account = getAccount(report.account_id)
            const statusCfg = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.Rascunho
            const StatusIcon = statusCfg.Icon
            const isEditing = editingId === report.id

            return (
              <div key={report.id} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Card header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-base font-semibold text-fluig-title">{account?.nome ?? "Conta removida"}</h3>
                    {account && <TierBadge tier={account.tier} />}
                    <span className={"inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full " + statusCfg.className}>
                      <StatusIcon className="w-3 h-3" /> {statusCfg.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                      {report.tipo === "Relatorio_Executivo" ? "Relatorio Executivo" : "Proposta Works"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {format(new Date(report.criado_em), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>

                {/* Card body */}
                <div className="px-6 py-4">
                  {isEditing ? (
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Tipo</label>
                          <select
                            value={editForm.tipo ?? "Relatorio_Executivo"}
                            onChange={(e) => setEditForm({ ...editForm, tipo: e.target.value as ReportTipo })}
                            className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="Relatorio_Executivo">Relatorio Executivo</option>
                            <option value="Proposta_Works">Proposta Works</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Titulo</label>
                          <input
                            type="text"
                            value={editForm.titulo ?? ""}
                            onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
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
                          <input
                            type="number"
                            min={0}
                            step={100}
                            value={editForm.investimento_mrr ?? 0}
                            onChange={(e) => setEditForm({ ...editForm, investimento_mrr: Number(e.target.value) })}
                            className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Prazo Implantacao</label>
                          <input
                            type="text"
                            value={editForm.prazo_implantacao ?? ""}
                            onChange={(e) => setEditForm({ ...editForm, prazo_implantacao: e.target.value })}
                            placeholder="Ex: 30 dias"
                            className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={saveEdit}
                          className="px-4 py-2 rounded-lg bg-fluig-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm hover:bg-muted transition-colors"
                        >
                          Cancelar
                        </button>
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
                          { label: "Investimento / Prazo", value: "R$ " + report.investimento_mrr.toLocaleString("pt-BR") + "/mes | " + (report.prazo_implantacao || "--") },
                        ].map((item) => (
                          <div key={item.label} className="p-3 rounded-lg bg-fluig-readonly">
                            <p className="text-xs text-muted-foreground mb-1 font-medium">{item.label}</p>
                            <p className="text-sm text-foreground whitespace-pre-wrap">{item.value || "--"}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {report.status !== "Enviado" && (
                          <button
                            onClick={() => startEdit(report)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm hover:bg-muted transition-colors"
                          >
                            <Pencil className="w-4 h-4" /> Editar
                          </button>
                        )}
                        {report.status !== "Enviado" && (
                          <button
                            onClick={() => advanceReportStatus(report.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-fluig-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                          >
                            <ChevronRight className="w-4 h-4" />
                            {report.status === "Rascunho" ? "Enviar para Revisao" : "Marcar como Enviado"}
                          </button>
                        )}
                        <button
                          onClick={() => handleExport(report.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-fluig-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                          <Download className="w-4 h-4" /> Exportar PDF
                        </button>
                        <button
                          onClick={() => handleExportCsvSingle(report.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-fluig-secondary text-fluig-secondary text-sm font-medium hover:bg-fluig-secondary/10 transition-colors"
                        >
                          <FileSpreadsheet className="w-4 h-4" /> Exportar CSV
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
