"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { useStore } from "@/lib/store"
import {
  type Visit,
  type AutomacaoNivel,
  type SponsorEngajamento,
  type Modalidade,
  isOppActive,
  SCORE_DIMENSIONS,
  SCORE_LABELS,
} from "@/lib/models"
import { SectionHeader } from "@/components/fluig/section-header"
import { TierBadge } from "@/components/fluig/tier-badge"
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
  Save,
  Info,
} from "lucide-react"

const AUTOMACAO_NIVEIS: AutomacaoNivel[] = ["Nenhuma", "Básica", "Intermediária", "Avançada"]
const ENGAJAMENTO: SponsorEngajamento[] = ["Alto", "Médio", "Baixo"]
const MODALIDADES: Modalidade[] = ["Presencial", "Remota"]

type VisitForm = Omit<Visit, "id" | "criado_em">

const emptyVisitForm = (accountId: string, oppId: string): VisitForm => ({
  opportunity_id: oppId,
  account_id: accountId,
  data_visita: new Date().toISOString().slice(0, 10),
  modalidade: "Presencial",
  participantes_cliente: "",
  dx_processos_descritos: "",
  dx_processos_dores: "",
  dx_processos_impacto: "",
  dx_automacao_nivel: "Nenhuma",
  dx_automacao_gaps: "",
  dx_integracao_sistemas: "",
  dx_integracao_status: "",
  dx_governanca_problemas: "",
  dx_sponsor_engajamento: "Médio",
  hipotese_works: "",
  escopo_preliminar: "",
  objeccoes_levantadas: "",
  proximo_passo_acordado: "",
  data_proximo_passo: "",
  fotos_evidencias: [],
})

const TABS = ["Pre-Visita", "Processos", "Automacao", "Integracoes", "Governanca", "Sintese"]

export function RoteiroModule() {
  const accounts = useStore((s) => s.accounts)
  const opportunities = useStore((s) => s.opportunities)
  const visits = useStore((s) => s.visits)
  const reports = useStore((s) => s.reports)
  const addVisit = useStore((s) => s.addVisit)
  const updateVisit = useStore((s) => s.updateVisit)
  const addReport = useStore((s) => s.addReport)

  const [step, setStep] = useState(-1) // -1 = select
  const [selectedAccountId, setSelectedAccountId] = useState("")
  const [selectedOppId, setSelectedOppId] = useState("")
  const [visitId, setVisitId] = useState<string | null>(null)
  const [form, setForm] = useState<VisitForm>(emptyVisitForm("", ""))
  const [autoSaved, setAutoSaved] = useState(false)
  const [success, setSuccess] = useState(false)
  const [reportError, setReportError] = useState("")
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const eligibleAccounts = useMemo(() => {
    const activeOpps = opportunities.filter((o) => isOppActive(o.estagio))
    const accountIds = new Set(activeOpps.map((o) => o.account_id))
    return accounts.filter((a) => accountIds.has(a.id))
  }, [accounts, opportunities])

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId)
  const selectedOpp = opportunities.find((o) => o.id === selectedOppId)

  function handleSelectAccount(accountId: string) {
    setSelectedAccountId(accountId)
    const opp = opportunities.find(
      (o) => o.account_id === accountId && isOppActive(o.estagio)
    )
    if (opp) {
      setSelectedOppId(opp.id)
      setForm(emptyVisitForm(accountId, opp.id))
      setStep(0)
    }
  }

  // Auto-save every 30 seconds
  const doAutoSave = useCallback(async (): Promise<string | null> => {
    if (!visitId && selectedAccountId && selectedOppId) {
      try {
        const id = await addVisit(form)
        setVisitId(id)
        setAutoSaved(true)
        setTimeout(() => setAutoSaved(false), 2000)
        return id
      } catch (e) {
        console.error("Erro ao salvar visita:", e)
        return null
      }
    } else if (visitId) {
      const { ...data } = form
      await updateVisit(visitId, data)
      setAutoSaved(true)
      setTimeout(() => setAutoSaved(false), 2000)
      return visitId
    }
    return null
  }, [visitId, form, selectedAccountId, selectedOppId, addVisit, updateVisit])

  useEffect(() => {
    if (step < 0) return
    if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setInterval(doAutoSave, 30000)
    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current)
    }
  }, [step, doAutoSave])

  // Save on field blur
  function handleBlur() {
    if (step >= 0) doAutoSave()
  }

  async function handleGenerate() {
    setReportError("")
    // Save visit first
    const savedId = await doAutoSave()

    const vId = savedId || visitId
    if (!vId) {
      setReportError("Salve a visita antes de gerar o rascunho.")
      return
    }

    // Mapping Visit -> ReportDraft per PRD
    const result = await addReport({
      visit_id: vId,
      account_id: selectedAccountId,
      tipo: "Relatorio_Executivo",
      titulo: `Relatorio - ${selectedAccount?.nome ?? ""}`,
      contexto_cliente: `${selectedAccount?.nome} - ${selectedAccount?.segmento} (${selectedAccount?.porte}). Fluig ${selectedAccount?.fluig_versao}. Modulos: ${selectedAccount?.fluig_modulos.join(", ")}`,
      dores_priorizadas: [form.dx_processos_dores, form.dx_automacao_gaps, form.dx_governanca_problemas].filter(Boolean).join("\n\n"),
      impacto_estimado: form.dx_processos_impacto,
      solucao_proposta: form.hipotese_works,
      entregaveis: form.escopo_preliminar,
      investimento_mrr: selectedOpp?.mrr_estimado ?? 0,
      prazo_implantacao: "30 dias",
    })

    if (result === null) {
      setReportError("Ja existe um rascunho para esta visita. Acesse o modulo Relatorios para editar.")
      return
    }
    setSuccess(true)
  }

  function handleReset() {
    setStep(-1)
    setSelectedAccountId("")
    setSelectedOppId("")
    setVisitId(null)
    setForm(emptyVisitForm("", ""))
    setSuccess(false)
    setReportError("")
  }

  const updateField = (field: keyof VisitForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  if (success) {
    return (
      <div>
        <SectionHeader icon={<ClipboardList className="w-5 h-5" />} title="Roteiro de Visita" description="Checklist consultivo pre/durante/pos com campos de diagnostico." />
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-16 h-16 rounded-full bg-fluig-success flex items-center justify-center">
            <Check className="w-8 h-8 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground text-balance text-center">Rascunho de Relatorio Gerado!</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            O relatorio para <strong>{selectedAccount?.nome}</strong> foi criado com os dados do diagnostico. Acesse o modulo Relatorios para revisar e exportar.
          </p>
          <button onClick={handleReset} className="px-6 py-2.5 rounded-lg bg-fluig-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
            Nova Visita
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <SectionHeader icon={<ClipboardList className="w-5 h-5" />} title="Roteiro de Visita" description="Checklist consultivo pre/durante/pos com campos de diagnostico." />

      {/* Auto-save indicator */}
      {step >= 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {TABS.map((label, idx) => (
              <button
                key={label}
                onClick={() => setStep(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  idx === step ? "bg-fluig-primary text-primary-foreground" : idx < step ? "bg-fluig-success/20 text-fluig-success" : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className={`flex items-center gap-1 text-xs transition-opacity ${autoSaved ? "opacity-100" : "opacity-0"}`}>
            <Save className="w-3 h-3 text-fluig-success" />
            <span className="text-fluig-success">Salvo</span>
          </div>
        </div>
      )}

      {/* Step -1: Select account */}
      {step === -1 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-base font-semibold text-fluig-title mb-1">Selecionar Conta</h3>
          <div className="h-px bg-border mb-2" />
          <p className="text-sm text-muted-foreground mb-4">Escolha a conta com oportunidade ativa para iniciar o roteiro de visita.</p>
          {eligibleAccounts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma conta com oportunidade ativa disponivel.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {eligibleAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleSelectAccount(account.id)}
                  className="text-left p-4 rounded-lg border border-border bg-card hover:border-fluig-primary hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-foreground text-sm">{account.nome}</p>
                    <TierBadge tier={account.tier} />
                  </div>
                  <p className="text-xs text-muted-foreground">{account.segmento} | {account.porte} | Score {account.score_total}/25</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 0: Pre-Visita */}
      {step === 0 && selectedAccount && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-base font-semibold text-fluig-title mb-1">Pre-Visita — Contexto da Conta</h3>
          <div className="h-px bg-border mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Empresa", value: selectedAccount.nome },
              { label: "Fluig Versao", value: selectedAccount.fluig_versao },
              { label: "Modulos", value: selectedAccount.fluig_modulos.join(", ") || "--" },
              { label: "Score / Tier", value: `${selectedAccount.score_total}/25 | Tier ${selectedAccount.tier}` },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-lg" style={{ background: "var(--fluig-readonly)" }}>
                <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                <p className="font-medium text-foreground text-sm">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-4">
            {SCORE_DIMENSIONS.map((dim) => (
              <div key={dim.key} className="p-2 rounded-lg border border-border text-center">
                <p className="text-xs text-muted-foreground">{dim.label}</p>
                <p className="text-base font-bold text-foreground">{selectedAccount[dim.key]}/5</p>
                <p className="text-xs text-muted-foreground">{SCORE_LABELS[dim.key][selectedAccount[dim.key]]}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Participantes (cliente)</label>
              <input type="text" value={form.participantes_cliente} onChange={(e) => updateField("participantes_cliente", e.target.value)} onBlur={handleBlur} placeholder="Quem participara pelo lado do cliente" className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Data da Visita</label>
              <input type="date" value={form.data_visita} onChange={(e) => updateField("data_visita", e.target.value)} onBlur={handleBlur} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Modalidade</label>
              <select value={form.modalidade} onChange={(e) => updateField("modalidade", e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {MODALIDADES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Eixo 1 - Processos */}
      {step === 1 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-fluig-primary"><Cog className="w-4 h-4" /></div>
            <h3 className="text-base font-semibold text-fluig-title">Eixo 1 — Processos</h3>
          </div>
          <div className="h-px bg-border mb-4" />
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Processos Descritos</label>
              <p className="text-xs text-muted-foreground mb-2 flex items-start gap-1"><Info className="w-3 h-3 mt-0.5 shrink-0 text-fluig-info" /> Quais processos mais consomem tempo? Ha aprovacoes manuais? Onde a informacao se perde?</p>
              <textarea value={form.dx_processos_descritos} onChange={(e) => updateField("dx_processos_descritos", e.target.value)} onBlur={handleBlur} rows={4} placeholder="Descreva os processos mapeados..." className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Dores Relatadas</label>
              <textarea value={form.dx_processos_dores} onChange={(e) => updateField("dx_processos_dores", e.target.value)} onBlur={handleBlur} rows={3} placeholder="Quais dores o cliente relata nos processos..." className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Impacto de Negocio</label>
              <textarea value={form.dx_processos_impacto} onChange={(e) => updateField("dx_processos_impacto", e.target.value)} onBlur={handleBlur} rows={3} placeholder="Estimativa de impacto financeiro ou operacional..." className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Eixo 2 - Automacao */}
      {step === 2 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-fluig-primary"><Zap className="w-4 h-4" /></div>
            <h3 className="text-base font-semibold text-fluig-title">Eixo 2 — Automacao</h3>
          </div>
          <div className="h-px bg-border mb-4" />
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nivel de Automacao</label>
              <select value={form.dx_automacao_nivel} onChange={(e) => updateField("dx_automacao_nivel", e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {AUTOMACAO_NIVEIS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Gaps de Automacao</label>
              <p className="text-xs text-muted-foreground mb-2 flex items-start gap-1"><Info className="w-3 h-3 mt-0.5 shrink-0 text-fluig-info" /> O que ainda e feito manualmente e poderia ser automatizado no Fluig?</p>
              <textarea value={form.dx_automacao_gaps} onChange={(e) => updateField("dx_automacao_gaps", e.target.value)} onBlur={handleBlur} rows={4} placeholder="Descreva os gaps identificados..." className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Eixo 3 - Integracoes */}
      {step === 3 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-fluig-primary"><Link2 className="w-4 h-4" /></div>
            <h3 className="text-base font-semibold text-fluig-title">Eixo 3 — Integracoes</h3>
          </div>
          <div className="h-px bg-border mb-4" />
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Sistemas que devem integrar</label>
              <p className="text-xs text-muted-foreground mb-2 flex items-start gap-1"><Info className="w-3 h-3 mt-0.5 shrink-0 text-fluig-info" /> Quais sistemas precisam conversar com o Fluig hoje? Como esta esse fluxo?</p>
              <textarea value={form.dx_integracao_sistemas} onChange={(e) => updateField("dx_integracao_sistemas", e.target.value)} onBlur={handleBlur} rows={3} placeholder="Ex: SAP, RH Senior, Protheus..." className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status Atual das Integracoes</label>
              <textarea value={form.dx_integracao_status} onChange={(e) => updateField("dx_integracao_status", e.target.value)} onBlur={handleBlur} rows={3} placeholder="Como as integracoes funcionam hoje..." className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Eixo 4 - Governanca */}
      {step === 4 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-fluig-primary"><Shield className="w-4 h-4" /></div>
            <h3 className="text-base font-semibold text-fluig-title">Eixo 4 — Governanca</h3>
          </div>
          <div className="h-px bg-border mb-4" />
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Problemas de Governanca</label>
              <p className="text-xs text-muted-foreground mb-2 flex items-start gap-1"><Info className="w-3 h-3 mt-0.5 shrink-0 text-fluig-info" /> Conseguem rastrear status de processos? Ha visibilidade de SLA?</p>
              <textarea value={form.dx_governanca_problemas} onChange={(e) => updateField("dx_governanca_problemas", e.target.value)} onBlur={handleBlur} rows={4} placeholder="Descreva os problemas de governanca..." className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Engajamento do Sponsor</label>
              <select value={form.dx_sponsor_engajamento} onChange={(e) => updateField("dx_sponsor_engajamento", e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {ENGAJAMENTO.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Sintese */}
      {step === 5 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-fluig-primary"><FileText className="w-4 h-4" /></div>
            <h3 className="text-base font-semibold text-fluig-title">Sintese</h3>
          </div>
          <div className="h-px bg-border mb-4" />
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Hipotese Works</label>
              <textarea value={form.hipotese_works} onChange={(e) => updateField("hipotese_works", e.target.value)} onBlur={handleBlur} rows={3} placeholder="Qual a hipotese de solucao via Works?" className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Escopo Preliminar</label>
              <textarea value={form.escopo_preliminar} onChange={(e) => updateField("escopo_preliminar", e.target.value)} onBlur={handleBlur} rows={3} placeholder="Escopo sugerido para a proposta..." className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Objecoes Levantadas</label>
              <textarea value={form.objeccoes_levantadas} onChange={(e) => updateField("objeccoes_levantadas", e.target.value)} onBlur={handleBlur} rows={2} placeholder="Objecoes ou preocupacoes do cliente..." className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Proximo Passo Acordado</label>
                <input type="text" value={form.proximo_passo_acordado} onChange={(e) => updateField("proximo_passo_acordado", e.target.value)} onBlur={handleBlur} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Data Proximo Passo</label>
                <input type="date" value={form.data_proximo_passo} onChange={(e) => updateField("data_proximo_passo", e.target.value)} onBlur={handleBlur} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            {reportError && <p className="text-sm text-fluig-danger bg-fluig-danger/10 px-3 py-2 rounded-lg">{reportError}</p>}
          </div>
        </div>
      )}

      {/* Navigation */}
      {step >= 0 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => step === 0 ? setStep(-1) : setStep(step - 1)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>
          {step < 5 ? (
            <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-fluig-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              Proximo <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleGenerate} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-fluig-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              <FileText className="w-4 h-4" /> Gerar Rascunho
            </button>
          )}
        </div>
      )}
    </div>
  )
}
