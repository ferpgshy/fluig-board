"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { useStore } from "@/lib/store"
import {
  type Account,
  type Tier,
  type Onda,
  type Segmento,
  type Porte,
  type Responsavel,
  calcTier,
  calcOnda,
  OPP_STAGE_LABELS,
  OPP_STAGE_ORDER,
  isOppActive,
  canRegressStage,
  SCORE_DIMENSIONS,
  SCORE_LABELS,
  type OppStage,
} from "@/lib/models"
import { SectionHeader } from "@/components/fluig/section-header"
import { TierBadge } from "@/components/fluig/tier-badge"
import { Building2, Plus, Search, X, Pencil, Trash2, Eye, Download, ArrowUpDown } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

/* ── Debounced number input (avoids keystroke loss on fast typing) ── */
function DebouncedNumberInput({
  value: externalValue,
  onCommit,
  delay = 500,
  ...props
}: {
  value: number
  onCommit: (v: number) => void
  delay?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">) {
  const [local, setLocal] = useState<string>(externalValue ? String(externalValue) : '')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const committedRef = useRef(externalValue)

  // Sync from outside only when the external value changes from a source other than our own commit
  useEffect(() => {
    if (externalValue !== committedRef.current) {
      setLocal(externalValue ? String(externalValue) : '')
      committedRef.current = externalValue
    }
  }, [externalValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setLocal(raw)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const num = Number(raw) || 0
      committedRef.current = num
      onCommit(num)
    }, delay)
  }

  // Flush on blur so the value is saved even if user clicks away quickly
  const handleBlur = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    const num = Number(local) || 0
    committedRef.current = num
    onCommit(num)
  }

  return <input type="number" value={local} onChange={handleChange} onBlur={handleBlur} {...props} />
}

/* ── Inline section title ── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wider text-fluig-title pb-2 border-b border-border mb-3">{children}</p>
}

const SEGMENTOS: Segmento[] = ["Agroindústria", "Construção e Projetos", "Distribuição", "Educação", "Logística", "Manufatura", "Saúde", "Serviços", "Setor Público", "Varejo"]
const PORTES: Porte[] = ["PME", "Mid-Market", "Enterprise"]

const UF_OPTIONS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
] as const

const emptyForm = (): Omit<Account, "id" | "score_total" | "tier" | "onda" | "criado_em" | "atualizado_em"> & { estagio_inicial?: OppStage } => ({
  nome: "",
  segmento: "Serviços" as Segmento,
  porte: "PME" as Porte,
  contato_nome: "",
  contato_cargo: "",
  contato_email: "",
  contato_whatsapp: "",
  esn_nome: "",
  esn_email: "",
  endereco_cep: "",
  endereco_rua: "",
  endereco_numero: "",
  endereco_bairro: "",
  endereco_cidade: "",
  endereco_uf: "",
  fluig_versao: "",
  fluig_modulos: [],
  score_potencial: 3,
  score_maturidade: 3,
  score_dor: 3,
  score_risco_churn: 3,
  score_acesso: 3,
  observacoes: "",
  data_registro: new Date().toISOString().slice(0, 10),
  data_proxima_visita: "",
  data_ultimo_contato: "",
  estagio_inicial: "selecionado" as OppStage,
})

export function ContasModule() {
  const accounts = useStore((s) => s.accounts)
  const opportunities = useStore((s) => s.opportunities)
  const addAccount = useStore((s) => s.addAccount)
  const updateAccount = useStore((s) => s.updateAccount)
  const deleteAccount = useStore((s) => s.deleteAccount)
  const addOpportunity = useStore((s) => s.addOpportunity)
  const updateOpportunity = useStore((s) => s.updateOpportunity)
  const moveOpportunityStage = useStore((s) => s.moveOpportunityStage)

  const [search, setSearch] = useState("")
  const [filterTier, setFilterTier] = useState<Tier | "todos">("todos")
  const [filterOnda, setFilterOnda] = useState<Onda | 0>(0)
  const [filterResponsavel, setFilterResponsavel] = useState<Responsavel | "todos">("todos")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [detailAccount, setDetailAccount] = useState<Account | null>(null)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [moduloInput, setModuloInput] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const [form, setForm] = useState(emptyForm())
  const [creatingOpp, setCreatingOpp] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [cepLoading, setCepLoading] = useState(false)

  const buscarCep = useCallback(async (cep: string) => {
    const clean = cep.replace(/\D/g, "")
    if (clean.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setForm((prev) => ({
          ...prev,
          endereco_rua: data.logradouro || prev.endereco_rua,
          endereco_bairro: data.bairro || prev.endereco_bairro,
          endereco_cidade: data.localidade || prev.endereco_cidade,
          endereco_uf: data.uf || prev.endereco_uf,
        }))
      }
    } catch { /* silently ignore */ }
    setCepLoading(false)
  }, [])



  function validateForm(): Record<string, string> {
    const errors: Record<string, string> = {}
    if (!form.nome.trim()) errors.nome = "Nome da empresa é obrigatório"
    if (!form.segmento) errors.segmento = "Selecione um segmento"
    if (!form.porte) errors.porte = "Selecione um porte"
    if (!form.contato_nome.trim()) errors.contato_nome = "Nome do contato é obrigatório"
    if (!form.contato_email.trim() && !form.contato_whatsapp.trim()) {
      errors.contato_email = "Informe pelo menos email ou WhatsApp"
      errors.contato_whatsapp = "Informe pelo menos email ou WhatsApp"
    }
    if (!form.data_registro) errors.data_registro = "Data de registro é obrigatória"
    if (!editingAccount && !form.estagio_inicial) errors.estagio_inicial = "Selecione o estágio inicial"
    return errors
  }

  const errCls = (field: string) => formErrors[field] ? "border-fluig-danger ring-1 ring-fluig-danger" : ""

  // Sorted by score_total DESC as default
  const filtered = useMemo(() => {
    return accounts
      .filter((a) => {
        if (search && !a.nome.toLowerCase().includes(search.toLowerCase())) return false
        if (filterTier !== "todos" && a.tier !== filterTier) return false
        if (filterOnda !== 0 && a.onda !== filterOnda) return false
        if (filterResponsavel !== "todos") {
          const acctOpps = opportunities.filter((o) => o.account_id === a.id && isOppActive(o.estagio))
          if (!acctOpps.some((o) => o.responsavel === filterResponsavel)) return false
        }
        return true
      })
      .sort((a, b) => b.score_total - a.score_total)
  }, [accounts, opportunities, search, filterTier, filterOnda, filterResponsavel])

  function resetForm() {
    setForm(emptyForm())
    setEditingAccount(null)
    setModuloInput("")
    setFormErrors({})
  }

  function openCreate() {
    resetForm()
    setDrawerOpen(true)
  }

  function openEdit(account: Account) {
    setEditingAccount(account)
    setForm({
      nome: account.nome,
      segmento: account.segmento,
      porte: account.porte,
      contato_nome: account.contato_nome,
      contato_cargo: account.contato_cargo,
      contato_email: account.contato_email,
      contato_whatsapp: account.contato_whatsapp,
      esn_nome: account.esn_nome || "",
      esn_email: account.esn_email || "",
      endereco_cep: account.endereco_cep || "",
      endereco_rua: account.endereco_rua || "",
      endereco_numero: account.endereco_numero || "",
      endereco_bairro: account.endereco_bairro || "",
      endereco_cidade: account.endereco_cidade || "",
      endereco_uf: account.endereco_uf || "",
      fluig_versao: account.fluig_versao,
      fluig_modulos: [...account.fluig_modulos],
      score_potencial: account.score_potencial,
      score_maturidade: account.score_maturidade,
      score_dor: account.score_dor,
      score_risco_churn: account.score_risco_churn,
      score_acesso: account.score_acesso,
      observacoes: account.observacoes,
      data_registro: account.data_registro || "",
      data_proxima_visita: account.data_proxima_visita || "",
      data_ultimo_contato: account.data_ultimo_contato || "",
    })
    setDrawerOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    setFormErrors({})
    if (editingAccount) {
      updateAccount(editingAccount.id, form)
      setDrawerOpen(false)
      resetForm()
    } else {
      // Criar conta + oportunidade
      setCreatingOpp(true)
      const { estagio_inicial, ...accountData } = form
      addAccount(accountData).then((newAccount) => {
        if (newAccount) {
          // Criar oportunidade automaticamente
          addOpportunity({
            account_id: newAccount.id,
            estagio: estagio_inicial || "selecionado",
            mrr_estimado: 0,
            mrr_fechado: 0,
            pacote_works: "Essencial",
            data_contato: "",
            data_visita: "",
            data_proposta: "",
            data_fechamento: "",
            motivo_perda: "",
            proximo_passo: "",
            data_proximo_passo: "",
            responsavel: "Camila",
          })
        }
        setDrawerOpen(false)
        resetForm()
        setCreatingOpp(false)
      })
    }
  }

  function handleDelete(id: string) {
    deleteAccount(id)
    if (detailAccount?.id === id) setDetailAccount(null)
    setConfirmDelete(null)
  }

  function addModulo() {
    const m = moduloInput.trim()
    if (m && !form.fluig_modulos.includes(m)) {
      setForm({ ...form, fluig_modulos: [...form.fluig_modulos, m] })
    }
    setModuloInput("")
  }

  function removeModulo(m: string) {
    setForm({ ...form, fluig_modulos: form.fluig_modulos.filter((x) => x !== m) })
  }

  const calcFormTotal = form.score_potencial + form.score_maturidade + form.score_dor + form.score_risco_churn + form.score_acesso
  const formTier = calcTier(calcFormTotal)
  const formOnda = calcOnda(formTier)

  // CSV export
  const exportCSV = useCallback(() => {
    const headers = ["Nome", "Segmento", "Porte", "Contato", "Score Total", "Tier", "Onda", "Fluig Versão"]
    const rows = filtered.map((a) => [
      a.nome, a.segmento, a.porte, a.contato_nome, a.score_total, a.tier, a.onda, a.fluig_versao,
    ])
    const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `contas-fluig-${format(new Date(), "yyyy-MM-dd")}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [filtered])

  const getOppForAccount = (accountId: string) => {
    return opportunities.find((o) => o.account_id === accountId && isOppActive(o.estagio))
  }

  const getAnyOppForAccount = (accountId: string) => {
    // Retorna opp ativa ou a mais recente (fechada/perdida)
    const active = opportunities.find((o) => o.account_id === accountId && isOppActive(o.estagio))
    if (active) return active
    return opportunities
      .filter((o) => o.account_id === accountId)
      .sort((a, b) => new Date(b.atualizado_em).getTime() - new Date(a.atualizado_em).getTime())[0] ?? null
  }

  function getStageDisplay(opp: typeof opportunities[0] | null | undefined): string {
    if (!opp) return ""
    if (opp.estagio === "works_fechado") return "Finalizado"
    if (opp.estagio === "perdido") return "Finalizado (Perdido)"
    return OPP_STAGE_LABELS[opp.estagio]
  }

  function getNextStageName(opp: typeof opportunities[0] | null | undefined): string {
    if (!opp || !isOppActive(opp.estagio)) return ""
    const idx = OPP_STAGE_ORDER.indexOf(opp.estagio)
    if (idx < 0 || idx >= OPP_STAGE_ORDER.length - 1) return ""
    return OPP_STAGE_LABELS[OPP_STAGE_ORDER[idx + 1]]
  }

  return (
    <div>
      <SectionHeader
        icon={<Building2 className="w-5 h-5" />}
        title="Gestao de Contas"
        description="Cadastro, scoring e segmentacao dos 50 clientes Fluig. Ordenado por Score Total decrescente."
      />

      {/* Filters */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        <div className="relative col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select value={filterTier} onChange={(e) => setFilterTier(e.target.value as Tier | "todos")} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="todos">Tier: Todos</option>
          <option value="A">Tier A</option>
          <option value="B">Tier B</option>
          <option value="C">Tier C</option>
        </select>
        <select value={filterOnda} onChange={(e) => setFilterOnda(Number(e.target.value) as Onda | 0)} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value={0}>Onda: Todas</option>
          <option value={1}>Onda 1</option>
          <option value={2}>Onda 2</option>
          <option value={3}>Onda 3</option>
        </select>
        <select value={filterResponsavel} onChange={(e) => setFilterResponsavel(e.target.value as Responsavel | "todos")} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="todos">Responsavel: Todos</option>
          <option value="Camila">Camila</option>
          <option value="Niésio">Niesio</option>
          <option value="Dupla">Dupla</option>
        </select>
        <div className="flex gap-2">
          <button onClick={openCreate} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-fluig-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova</span>
          </button>
          <button onClick={exportCSV} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm hover:bg-muted transition-colors" title="Exportar CSV">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                  <span className="flex items-center justify-center gap-1">Tier</span>
                </th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                  <span className="flex items-center justify-center gap-1">Score <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Estagio Opp.</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">MRR</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Onda</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Proximo Passo</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden xl:table-cell">Data</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((account) => {
                const opp = getAnyOppForAccount(account.id)
                const activeOpp = getOppForAccount(account.id)
                const ppVencido = activeOpp && activeOpp.data_proximo_passo && new Date(activeOpp.data_proximo_passo) < new Date() && isOppActive(activeOpp.estagio)
                const stageText = getStageDisplay(opp)
                const mrrValue = opp ? (opp.estagio === "works_fechado" ? opp.mrr_fechado : opp.mrr_estimado) : 0
                const isFinalizado = opp && (opp.estagio === "works_fechado" || opp.estagio === "perdido")
                const nextStageName = getNextStageName(activeOpp)
                const proximoPasso = activeOpp?.proximo_passo
                  ? activeOpp.proximo_passo
                  : nextStageName
                    ? `→ ${nextStageName}`
                    : "--"
                return (
                  <tr key={account.id} className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{account.nome}</td>
                    <td className="px-4 py-3 text-center"><TierBadge tier={account.tier} /></td>
                    <td className="px-4 py-3 text-center font-semibold text-foreground">{account.score_total}/25</td>
                    <td className={`px-4 py-3 hidden md:table-cell text-xs font-medium ${isFinalizado ? (opp?.estagio === "works_fechado" ? "text-fluig-success" : "text-fluig-danger") : "text-muted-foreground"}`}>
                      {stageText || <span className="text-muted-foreground/50">--</span>}
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell text-xs font-semibold text-foreground">
                      {mrrValue > 0 ? `R$ ${mrrValue.toLocaleString("pt-BR")}` : <span className="text-muted-foreground/50">--</span>}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground hidden lg:table-cell">{account.onda}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell text-xs max-w-[200px] truncate">
                      {proximoPasso}
                    </td>
                    <td className={`px-4 py-3 hidden xl:table-cell text-xs ${ppVencido ? "text-fluig-danger font-semibold" : "text-muted-foreground"}`}>
                      {activeOpp?.data_proximo_passo ? format(new Date(activeOpp.data_proximo_passo), "dd/MM/yyyy", { locale: ptBR }) : "--"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setDetailAccount(account)} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" aria-label="Ver detalhes">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(account)} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" aria-label="Editar">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmDelete(account.id)} className="p-1.5 rounded-md hover:bg-muted transition-colors text-fluig-danger" aria-label="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">Nenhuma conta encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {detailAccount && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-fluig-title">{detailAccount.nome}</h3>
              <TierBadge tier={detailAccount.tier} />
            </div>
            <button onClick={() => setDetailAccount(null)} className="text-muted-foreground hover:text-foreground" aria-label="Fechar detalhes">
              <X className="w-5 h-5" />
            </button>
          </div>
          {(() => {
            const detailOpp = getAnyOppForAccount(detailAccount.id)
            const detailFields = [
              { label: "Segmento", value: detailAccount.segmento },
              { label: "Porte", value: detailAccount.porte },
              detailAccount.contato_nome ? { label: "Contato", value: `${detailAccount.contato_nome}${detailAccount.contato_cargo ? ` (${detailAccount.contato_cargo})` : ""}` } : null,
              detailAccount.contato_email ? { label: "Email", value: detailAccount.contato_email } : null,
              detailAccount.contato_whatsapp ? { label: "WhatsApp", value: detailAccount.contato_whatsapp } : null,
              detailAccount.endereco_cep ? { label: "Endereço", value: [detailAccount.endereco_rua, detailAccount.endereco_numero, detailAccount.endereco_bairro, detailAccount.endereco_cidade, detailAccount.endereco_uf].filter(Boolean).join(", ") + ` — CEP ${detailAccount.endereco_cep}` } : null,
              detailAccount.fluig_versao ? { label: "Fluig Versao", value: detailAccount.fluig_versao } : null,
              detailAccount.fluig_modulos.length > 0 ? { label: "Modulos", value: detailAccount.fluig_modulos.join(", ") } : null,
              { label: "Score / Tier / Onda", value: `${detailAccount.score_total}/25 | Tier ${detailAccount.tier} | Onda ${detailAccount.onda}` },
              detailOpp ? { label: "Estagio Pipeline", value: getStageDisplay(detailOpp) } : null,
              detailOpp ? { label: "MRR Estimado", value: `R$ ${detailOpp.mrr_estimado.toLocaleString("pt-BR")}/mes` } : null,
              detailOpp && detailOpp.mrr_fechado > 0 ? { label: "MRR Fechado", value: `R$ ${detailOpp.mrr_fechado.toLocaleString("pt-BR")}/mes` } : null,
              detailOpp?.pacote_works ? { label: "Pacote Works", value: detailOpp.pacote_works } : null,
              detailOpp?.responsavel ? { label: "Responsavel", value: detailOpp.responsavel } : null,
              detailOpp?.proximo_passo ? { label: "Proximo Passo", value: detailOpp.proximo_passo } : null,
              detailOpp?.data_proximo_passo ? { label: "Data Prox. Passo", value: format(new Date(detailOpp.data_proximo_passo), "dd/MM/yyyy", { locale: ptBR }) } : null,
              detailOpp?.data_contato ? { label: "Data Contato", value: format(new Date(detailOpp.data_contato), "dd/MM/yyyy", { locale: ptBR }) } : null,
              detailOpp?.data_visita ? { label: "Data Visita Opp", value: format(new Date(detailOpp.data_visita), "dd/MM/yyyy", { locale: ptBR }) } : null,
              detailOpp?.data_proposta ? { label: "Data Proposta", value: format(new Date(detailOpp.data_proposta), "dd/MM/yyyy", { locale: ptBR }) } : null,
              detailOpp?.data_fechamento ? { label: "Data Fechamento", value: format(new Date(detailOpp.data_fechamento), "dd/MM/yyyy", { locale: ptBR }) } : null,
              detailAccount.data_registro ? { label: "Registro", value: format(new Date(detailAccount.data_registro), "dd/MM/yyyy", { locale: ptBR }) } : null,
              detailAccount.data_ultimo_contato ? { label: "Ultimo Contato", value: format(new Date(detailAccount.data_ultimo_contato), "dd/MM/yyyy", { locale: ptBR }) } : null,
              detailAccount.data_proxima_visita ? { label: "Proxima Visita", value: format(new Date(detailAccount.data_proxima_visita), "dd/MM/yyyy", { locale: ptBR }) } : null,
              detailOpp?.motivo_perda ? { label: "Motivo Perda", value: detailOpp.motivo_perda } : null,
            ].filter(Boolean) as { label: string; value: string }[]

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {detailFields.map((item) => (
                  <div key={item.label} className="p-3 rounded-lg" style={{ background: "var(--fluig-readonly)" }}>
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="font-medium text-foreground text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            )
          })()}
          {/* Individual scores */}
          <div className="mb-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Scoring por Dimensao</p>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {SCORE_DIMENSIONS.map((dim) => {
                const val = detailAccount[dim.key]
                return (
                  <div key={dim.key} className="p-2 rounded-lg border border-border text-center">
                    <p className="text-xs text-muted-foreground">{dim.label}</p>
                    <p className="text-lg font-bold text-foreground">{val}<span className="text-xs text-muted-foreground">/5</span></p>
                    <p className="text-xs text-muted-foreground">{SCORE_LABELS[dim.key][val]}</p>
                  </div>
                )
              })}
            </div>
          </div>
          {detailAccount.observacoes && (
            <div className="p-3 rounded-lg border border-border mb-4">
              <p className="text-xs text-muted-foreground mb-1">Observacoes</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{detailAccount.observacoes}</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Criado em {format(new Date(detailAccount.criado_em), "dd/MM/yyyy", { locale: ptBR })} |
            Atualizado em {format(new Date(detailAccount.atualizado_em), "dd/MM/yyyy", { locale: ptBR })}
          </p>
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setConfirmDelete(null)} />
          <div className="relative w-full max-w-sm mx-4 rounded-xl bg-card border border-border p-6">
            <h3 className="text-base font-semibold text-foreground mb-2">Confirmar Exclusao</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Esta acao ira remover a conta e todas as oportunidades, visitas e relatorios associados. Deseja continuar?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm hover:bg-muted transition-colors">Cancelar</button>
              <button onClick={() => handleDelete(confirmDelete)} className="px-4 py-2 rounded-lg bg-fluig-danger text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => { setDrawerOpen(false); resetForm() }} />
          <div className="relative w-full max-w-[1080px] max-h-[94vh] bg-card border border-border rounded-xl overflow-y-auto shadow-xl">
            {/* Header */}
            <div className="px-6 py-4 text-primary-foreground sticky top-0 z-10" style={{ background: "linear-gradient(135deg, var(--fluig-primary) 0%, var(--fluig-secondary) 100%)" }}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{editingAccount ? "Editar Conta" : "Nova Conta"}</h3>
                <button onClick={() => { setDrawerOpen(false); resetForm() }} aria-label="Fechar"><X className="w-5 h-5" /></button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Error banner */}
              {Object.keys(formErrors).length > 0 && (
                <div className="px-4 py-2.5 rounded-lg bg-fluig-danger/10 border border-fluig-danger/30 mb-5">
                  <p className="text-sm font-medium text-fluig-danger">Preencha os campos obrigatorios antes de continuar.</p>
                </div>
              )}

              {/* ═══ Two-column layout ═══ */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">

                {/* ── COL LEFT: Empresa ── */}
                <div className="space-y-3 rounded-lg border border-border p-4">
                  <SectionTitle>Dados do Cliente</SectionTitle>
                  <div className="grid grid-cols-[1fr_110px] gap-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Nome <span className="text-fluig-danger">*</span></label>
                      <input required type="text" value={form.nome} onChange={(e) => { setForm({ ...form, nome: e.target.value }); setFormErrors((p) => { const { nome, ...rest } = p; return rest }) }} className={`w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errCls("nome")}`} />
                      {formErrors.nome && <p className="text-[11px] text-fluig-danger mt-0.5">{formErrors.nome}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Porte <span className="text-fluig-danger">*</span></label>
                      <select required value={form.porte} onChange={(e) => { setForm({ ...form, porte: e.target.value as Porte }); setFormErrors((p) => { const { porte, ...rest } = p; return rest }) }} className={`w-full px-2.5 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errCls("porte")}`}>
                        {PORTES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Segmento <span className="text-fluig-danger">*</span></label>
                    <select required value={form.segmento} onChange={(e) => { setForm({ ...form, segmento: e.target.value as Segmento }); setFormErrors((p) => { const { segmento, ...rest } = p; return rest }) }} className={`w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errCls("segmento")}`}>
                      {SEGMENTOS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Nome do ESN</label>
                      <input type="text" value={form.esn_nome} onChange={(e) => setForm({ ...form, esn_nome: e.target.value })} placeholder="Nome do ESN" className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">E-mail do ESN</label>
                      <input type="email" value={form.esn_email} onChange={(e) => setForm({ ...form, esn_email: e.target.value })} placeholder="esn@empresa.com" className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>
                </div>

                {/* ── COL RIGHT: Contato ── */}
                <div className="space-y-3 rounded-lg border border-border p-4">
                  <SectionTitle>Contato do Cliente / Sponsor</SectionTitle>
                  <div className="grid grid-cols-[1fr_100px] gap-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Nome <span className="text-fluig-danger">*</span></label>
                      <input type="text" value={form.contato_nome} onChange={(e) => { setForm({ ...form, contato_nome: e.target.value }); setFormErrors((p) => { const { contato_nome, ...rest } = p; return rest }) }} className={`w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errCls("contato_nome")}`} />
                      {formErrors.contato_nome && <p className="text-[11px] text-fluig-danger mt-0.5">{formErrors.contato_nome}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Cargo</label>
                      <input type="text" value={form.contato_cargo} onChange={(e) => setForm({ ...form, contato_cargo: e.target.value })} placeholder="CTO" className="w-full px-2.5 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Email <span className="text-fluig-danger text-[10px]">(ao menos 1)</span></label>
                      <input type="email" value={form.contato_email} onChange={(e) => { setForm({ ...form, contato_email: e.target.value }); setFormErrors((p) => { const { contato_email, contato_whatsapp, ...rest } = p; return rest }) }} className={`w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errCls("contato_email")}`} />
                      {formErrors.contato_email && <p className="text-[11px] text-fluig-danger mt-0.5">{formErrors.contato_email}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">WhatsApp</label>
                      <input type="text" value={form.contato_whatsapp} onChange={(e) => { setForm({ ...form, contato_whatsapp: e.target.value }); setFormErrors((p) => { const { contato_email, contato_whatsapp, ...rest } = p; return rest }) }} placeholder="(11) 99999-0000" className={`w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errCls("contato_whatsapp")}`} />
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="grid grid-cols-[120px_1fr_80px] gap-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">CEP</label>
                      <input
                        type="text"
                        value={form.endereco_cep}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, "").slice(0, 8)
                          if (v.length > 5) v = v.slice(0, 5) + "-" + v.slice(5)
                          setForm({ ...form, endereco_cep: v })
                        }}
                        onBlur={() => buscarCep(form.endereco_cep)}
                        placeholder="00000-000"
                        maxLength={9}
                        className="w-full px-2.5 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {cepLoading && <p className="text-[10px] text-muted-foreground mt-0.5">Buscando...</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Rua</label>
                      <input type="text" value={form.endereco_rua} onChange={(e) => setForm({ ...form, endereco_rua: e.target.value })} placeholder="Rua / Av." className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Nº</label>
                      <input type="text" value={form.endereco_numero} onChange={(e) => setForm({ ...form, endereco_numero: e.target.value })} placeholder="123" className="w-full px-2.5 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>
                  <div className="grid grid-cols-[1fr_1fr_80px] gap-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Bairro</label>
                      <input type="text" value={form.endereco_bairro} onChange={(e) => setForm({ ...form, endereco_bairro: e.target.value })} placeholder="Centro" className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Cidade</label>
                      <input type="text" value={form.endereco_cidade} onChange={(e) => setForm({ ...form, endereco_cidade: e.target.value })} placeholder="São Paulo" className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">UF</label>
                      <select value={form.endereco_uf} onChange={(e) => setForm({ ...form, endereco_uf: e.target.value })} className="w-full px-2 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="">—</option>
                        {UF_OPTIONS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* ── COL LEFT: Pipeline / Fluig / Datas ── */}
                <div className="space-y-4">
                  {/* Pipeline Inicial (create only) */}
                  {!editingAccount && (
                    <div className="space-y-3 rounded-lg border border-border p-4">
                      <SectionTitle>Pipeline Inicial</SectionTitle>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Estagio <span className="text-fluig-danger">*</span></label>
                        <select required value={form.estagio_inicial || "selecionado"} onChange={(e) => { setForm({ ...form, estagio_inicial: e.target.value as OppStage }); setFormErrors((p) => { const { estagio_inicial, ...rest } = p; return rest }) }} className={`w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errCls("estagio_inicial")}`}>
                          {OPP_STAGE_ORDER.map((stage) => (
                            <option key={stage} value={stage}>{OPP_STAGE_LABELS[stage]}</option>
                          ))}
                        </select>
                        {formErrors.estagio_inicial && <p className="text-[11px] text-fluig-danger mt-0.5">{formErrors.estagio_inicial}</p>}
                      </div>
                    </div>
                  )}

                  {/* Ambiente Fluig */}
                  <div className="space-y-3 rounded-lg border border-border p-4">
                    <SectionTitle>Ambiente Fluig</SectionTitle>
                    <div className="grid grid-cols-[80px_1fr] gap-3 items-end">
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Versao</label>
                        <input type="text" value={form.fluig_versao} onChange={(e) => setForm({ ...form, fluig_versao: e.target.value })} placeholder="1.8.2" className="w-full px-2.5 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Modulos</label>
                        <div className="flex gap-2">
                          <input type="text" value={moduloInput} onChange={(e) => setModuloInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addModulo() } }} placeholder="ECM, BPM..." className="flex-1 px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                          <button type="button" onClick={addModulo} className="px-3 py-2 rounded-md bg-muted text-foreground text-xs font-medium hover:bg-accent transition-colors">+</button>
                        </div>
                      </div>
                    </div>
                    {form.fluig_modulos.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {form.fluig_modulos.map((m) => (
                          <span key={m} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-accent text-accent-foreground text-xs">
                            {m}<button type="button" onClick={() => removeModulo(m)} className="hover:text-fluig-danger"><X className="w-3 h-3" /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Datas */}
                  <div className="space-y-3 rounded-lg border border-border p-4">
                    <SectionTitle>Datas</SectionTitle>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Registro <span className="text-fluig-danger">*</span></label>
                        <input type="date" value={form.data_registro || ""} onChange={(e) => { setForm({ ...form, data_registro: e.target.value }); setFormErrors((p) => { const { data_registro, ...rest } = p; return rest }) }} className={`w-full px-2 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errCls("data_registro")}`} />
                        {formErrors.data_registro && <p className="text-[11px] text-fluig-danger mt-0.5">{formErrors.data_registro}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Ult. Contato</label>
                        <input type="date" value={form.data_ultimo_contato || ""} onChange={(e) => setForm({ ...form, data_ultimo_contato: e.target.value })} className="w-full px-2 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Prox. Visita</label>
                        <input type="date" value={form.data_proxima_visita || ""} onChange={(e) => setForm({ ...form, data_proxima_visita: e.target.value })} className="w-full px-2 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── COL RIGHT: Scoring + Oportunidade (edit) ── */}
                <div className="space-y-4">
                  {/* Oportunidade (edit only) */}
                  {editingAccount && (() => {
                    const opp = opportunities.find((o) => o.account_id === editingAccount.id && isOppActive(o.estagio))
                    if (!opp) return (
                      <div className="px-4 py-3 rounded-lg bg-muted/50 border border-border">
                        <p className="text-xs text-muted-foreground">Nenhuma oportunidade ativa.</p>
                      </div>
                    )
                    const currentIdx = OPP_STAGE_ORDER.indexOf(opp.estagio)
                    return (
                      <div className="space-y-3 rounded-lg border border-border p-4">
                        <SectionTitle>Oportunidade</SectionTitle>
                        <div className="grid grid-cols-[1fr_110px_110px] gap-3">
                          <div>
                            <label className="block text-xs font-medium text-foreground mb-1">Estagio</label>
                            <select value={opp.estagio} onChange={(e) => moveOpportunityStage(opp.id, e.target.value as OppStage)} className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                              {OPP_STAGE_ORDER.map((stage, idx) => (
                                <option key={stage} value={stage}>{OPP_STAGE_LABELS[stage]}{idx === currentIdx ? " ●" : ""}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-foreground mb-1">MRR Est.</label>
                            <DebouncedNumberInput value={opp.mrr_estimado} onCommit={(v) => updateOpportunity(opp.id, { mrr_estimado: v })} min={0} step={100} className="w-full px-2.5 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="0" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-foreground mb-1">MRR Fech.</label>
                            <DebouncedNumberInput value={opp.mrr_fechado} onCommit={(v) => updateOpportunity(opp.id, { mrr_fechado: v })} min={0} step={100} className="w-full px-2.5 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="0" />
                          </div>
                        </div>
                        <div className="grid grid-cols-[1fr_130px] gap-3">
                          <div>
                            <label className="block text-xs font-medium text-foreground mb-1">Prox. Passo</label>
                            <input type="text" value={opp.proximo_passo} onChange={(e) => updateOpportunity(opp.id, { proximo_passo: e.target.value })} placeholder={getNextStageName(opp) || "Agendar reuniao"} className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-foreground mb-1">Data</label>
                            <input type="date" value={opp.data_proximo_passo} onChange={(e) => updateOpportunity(opp.id, { data_proximo_passo: e.target.value })} className="w-full px-2 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {([["Contato", "data_contato"], ["Visita", "data_visita"], ["Proposta", "data_proposta"], ["Fecham.", "data_fechamento"]] as const).map(([lbl, key]) => (
                            <div key={key}>
                              <label className="block text-[11px] font-medium text-muted-foreground mb-0.5">{lbl}</label>
                              <input type="date" value={(opp as any)[key]} onChange={(e) => updateOpportunity(opp.id, { [key]: e.target.value })} className="w-full px-1.5 py-1.5 rounded border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}

                  {/* Scoring */}
                  <div className="space-y-3 rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between pb-2 border-b border-border mb-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-fluig-title">Scoring</p>
                      <div className="flex items-center gap-2"><TierBadge tier={formTier} /><span className="text-xs text-muted-foreground font-medium">{calcFormTotal}/25 · Onda {formOnda}</span></div>
                    </div>
                    {SCORE_DIMENSIONS.map((dim) => {
                      const val = form[dim.key]
                      return (
                        <div key={dim.key} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-foreground">{dim.label}</label>
                            <span className="text-xs font-bold text-foreground">{val}/5</span>
                          </div>
                          <input type="range" min={0} max={5} value={val} onChange={(e) => setForm({ ...form, [dim.key]: Number(e.target.value) })} className="w-full accent-[var(--fluig-primary)] h-2" />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* ── FULL WIDTH: Observacoes ── */}
                <div className="col-span-2 space-y-3 rounded-lg border border-border p-4">
                  <SectionTitle>Observacoes</SectionTitle>
                  <textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} rows={2} placeholder="Anotacoes gerais sobre a conta..." className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
              </div>

              <button type="submit" disabled={creatingOpp} className="w-full mt-5 px-4 py-3 rounded-lg bg-fluig-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                {editingAccount ? "Salvar Alteracoes" : creatingOpp ? "Criando..." : "Criar Conta + Oportunidade"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
