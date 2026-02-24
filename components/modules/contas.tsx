"use client"

import { useState, useMemo, useCallback } from "react"
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

const SEGMENTOS: Segmento[] = ["Indústria", "Serviços", "Varejo", "Saúde", "Outro"]
const PORTES: Porte[] = ["PME", "Mid-Market", "Enterprise"]

const emptyForm = (): Omit<Account, "id" | "score_total" | "tier" | "onda" | "criado_em" | "atualizado_em"> & { estagio_inicial?: OppStage } => ({
  nome: "",
  segmento: "Serviços" as Segmento,
  porte: "PME" as Porte,
  contato_nome: "",
  contato_cargo: "",
  contato_email: "",
  contato_whatsapp: "",
  fluig_versao: "",
  fluig_modulos: [],
  score_potencial: 3,
  score_maturidade: 3,
  score_dor: 3,
  score_risco_churn: 3,
  score_acesso: 3,
  observacoes: "",
  estagio_inicial: "selecionado" as OppStage,
})

export function ContasModule() {
  const accounts = useStore((s) => s.accounts)
  const opportunities = useStore((s) => s.opportunities)
  const addAccount = useStore((s) => s.addAccount)
  const updateAccount = useStore((s) => s.updateAccount)
  const deleteAccount = useStore((s) => s.deleteAccount)
  const addOpportunity = useStore((s) => s.addOpportunity)

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
      fluig_versao: account.fluig_versao,
      fluig_modulos: [...account.fluig_modulos],
      score_potencial: account.score_potencial,
      score_maturidade: account.score_maturidade,
      score_dor: account.score_dor,
      score_risco_churn: account.score_risco_churn,
      score_acesso: account.score_acesso,
      observacoes: account.observacoes,
    })
    setDrawerOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
                <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Onda</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Proximo Passo</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden xl:table-cell">Data</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((account) => {
                const opp = getOppForAccount(account.id)
                const ppVencido = opp && opp.data_proximo_passo && new Date(opp.data_proximo_passo) < new Date() && isOppActive(opp.estagio)
                return (
                  <tr key={account.id} className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{account.nome}</td>
                    <td className="px-4 py-3 text-center"><TierBadge tier={account.tier} /></td>
                    <td className="px-4 py-3 text-center font-semibold text-foreground">{account.score_total}/25</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-xs">
                      {opp ? OPP_STAGE_LABELS[opp.estagio] : <span className="text-muted-foreground/50">--</span>}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground hidden lg:table-cell">{account.onda}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell text-xs max-w-[200px] truncate">
                      {opp?.proximo_passo || "--"}
                    </td>
                    <td className={`px-4 py-3 hidden xl:table-cell text-xs ${ppVencido ? "text-fluig-danger font-semibold" : "text-muted-foreground"}`}>
                      {opp?.data_proximo_passo ? format(new Date(opp.data_proximo_passo), "dd/MM/yyyy", { locale: ptBR }) : "--"}
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
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">Nenhuma conta encontrada.</td></tr>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Segmento", value: detailAccount.segmento },
              { label: "Porte", value: detailAccount.porte },
              { label: "Contato", value: `${detailAccount.contato_nome} (${detailAccount.contato_cargo})` },
              { label: "Email", value: detailAccount.contato_email },
              { label: "WhatsApp", value: detailAccount.contato_whatsapp },
              { label: "Fluig Versao", value: detailAccount.fluig_versao },
              { label: "Modulos", value: detailAccount.fluig_modulos.join(", ") || "--" },
              { label: "Score / Tier / Onda", value: `${detailAccount.score_total}/25 | Tier ${detailAccount.tier} | Onda ${detailAccount.onda}` },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-lg" style={{ background: "var(--fluig-readonly)" }}>
                <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                <p className="font-medium text-foreground text-sm">{item.value}</p>
              </div>
            ))}
          </div>
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
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-card border border-border rounded-xl overflow-y-auto">
            <div className="px-6 py-5 text-primary-foreground" style={{ background: "linear-gradient(135deg, var(--fluig-primary) 0%, var(--fluig-secondary) 100%)" }}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{editingAccount ? "Editar Conta" : "Nova Conta"}</h3>
                <button onClick={() => { setDrawerOpen(false); resetForm() }} aria-label="Fechar"><X className="w-5 h-5" /></button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              {/* Basic info */}
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-fluig-title mb-2">Dados da Empresa</legend>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Nome da Empresa <span className="text-fluig-danger">*</span></label>
                  <input required type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Segmento <span className="text-fluig-danger">*</span></label>
                    <select required value={form.segmento} onChange={(e) => setForm({ ...form, segmento: e.target.value as Segmento })} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      {SEGMENTOS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Porte <span className="text-fluig-danger">*</span></label>
                    <select required value={form.porte} onChange={(e) => setForm({ ...form, porte: e.target.value as Porte })} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      {PORTES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
              </fieldset>

              {/* Estagio inicial (apenas na criacao) */}
              {!editingAccount && (
                <fieldset className="space-y-3">
                  <legend className="text-sm font-semibold text-fluig-title mb-2">Pipeline Inicial</legend>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Estagio Inicial da Oportunidade</label>
                    <select value={form.estagio_inicial || "selecionado"} onChange={(e) => setForm({ ...form, estagio_inicial: e.target.value as OppStage })} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      {OPP_STAGE_ORDER.map((stage) => (
                        <option key={stage} value={stage}>{OPP_STAGE_LABELS[stage]}</option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">Ao criar esta conta, uma oportunidade sera criada automaticamente neste estagio.</p>
                  </div>
                </fieldset>
              )}

              {/* Contact */}
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-fluig-title mb-2">Contato / Sponsor</legend>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Nome</label>
                    <input type="text" value={form.contato_nome} onChange={(e) => setForm({ ...form, contato_nome: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Cargo</label>
                    <input type="text" value={form.contato_cargo} onChange={(e) => setForm({ ...form, contato_cargo: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                    <input type="email" value={form.contato_email} onChange={(e) => setForm({ ...form, contato_email: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">WhatsApp</label>
                    <input type="text" value={form.contato_whatsapp} onChange={(e) => setForm({ ...form, contato_whatsapp: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
              </fieldset>

              {/* Fluig info */}
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-fluig-title mb-2">Ambiente Fluig</legend>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Versao Instalada</label>
                  <input type="text" value={form.fluig_versao} onChange={(e) => setForm({ ...form, fluig_versao: e.target.value })} placeholder="Ex: 1.8.2" className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Modulos Contratados</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={moduloInput} onChange={(e) => setModuloInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addModulo() } }} placeholder="Ex: ECM, BPM..." className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    <button type="button" onClick={addModulo} className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm hover:bg-accent transition-colors">Adicionar</button>
                  </div>
                  {form.fluig_modulos.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {form.fluig_modulos.map((m) => (
                        <span key={m} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-accent text-accent-foreground text-xs">
                          {m}
                          <button type="button" onClick={() => removeModulo(m)} className="hover:text-fluig-danger"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </fieldset>

              {/* Estagio Opp - only in edit mode */}
              {editingAccount && (() => {
                const opp = opportunities.find((o) => o.account_id === editingAccount.id && isOppActive(o.estagio))
                if (!opp) return (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm text-muted-foreground">Nenhuma oportunidade ativa vinculada a esta conta.</p>
                  </div>
                )
                const currentIdx = OPP_STAGE_ORDER.indexOf(opp.estagio)
                return (
                  <fieldset className="space-y-3">
                    <legend className="text-sm font-semibold mb-2" style={{ color: "var(--fluig-title)" }}>Estagio da Oportunidade</legend>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Estagio Atual</label>
                      <select
                        value={opp.estagio}
                        onChange={(e) => {
                          const newStage = e.target.value as OppStage
                          moveOpportunityStage(opp.id, newStage)
                        }}
                        className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {OPP_STAGE_ORDER.map((stage, idx) => {
                          const diff = idx - currentIdx
                          return (
                            <option key={stage} value={stage}>
                              {OPP_STAGE_LABELS[stage]}{diff === 0 ? " (atual)" : ""}
                            </option>
                          )
                        })}
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">Selecione o estagio desejado para a oportunidade.</p>
                    </div>
                  </fieldset>
                )
              })()}

              {/* Scoring - 5 sliders */}
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-fluig-title mb-2">
                  Scoring — Total: {calcFormTotal}/25 | Tier {formTier} | Onda {formOnda}
                </legend>
                <div className="flex items-center gap-2 mb-1">
                  <TierBadge tier={formTier} />
                  <span className="text-xs text-muted-foreground">Onda {formOnda}</span>
                </div>
                {SCORE_DIMENSIONS.map((dim) => {
                  const val = form[dim.key]
                  return (
                    <div key={dim.key}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium text-foreground">{dim.label}</label>
                        <span className="text-sm font-bold text-foreground">{val}/5 <span className="text-xs text-muted-foreground font-normal">({SCORE_LABELS[dim.key][val]})</span></span>
                      </div>
                      <input
                        type="range" min={0} max={5} value={val}
                        onChange={(e) => setForm({ ...form, [dim.key]: Number(e.target.value) })}
                        className="w-full accent-[var(--fluig-primary)]"
                      />
                    </div>
                  )
                })}
              </fieldset>

              {/* Observations */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Observacoes</label>
                <textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} rows={3} className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>

              <button type="submit" disabled={creatingOpp} className="w-full mt-2 px-4 py-2.5 rounded-lg bg-fluig-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                {editingAccount ? "Salvar Alteracoes" : creatingOpp ? "Criando Conta e Oportunidade..." : "Criar Conta + Oportunidade"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
