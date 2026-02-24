"use client"

import { useState, useMemo } from "react"
import { useStore } from "@/lib/store"
import { type Account, type Tier, calcTier, calcOnda } from "@/lib/models"
import { SectionHeader } from "@/components/fluig/section-header"
import { TierBadge } from "@/components/fluig/tier-badge"
import { Building2, Plus, Search, X, Pencil, Trash2, Eye } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function ContasModule() {
  const accounts = useStore((s) => s.accounts)
  const opportunities = useStore((s) => s.opportunities)
  const addAccount = useStore((s) => s.addAccount)
  const updateAccount = useStore((s) => s.updateAccount)
  const deleteAccount = useStore((s) => s.deleteAccount)

  const [search, setSearch] = useState("")
  const [filterTier, setFilterTier] = useState<Tier | "todos">("todos")
  const [filterSegmento, setFilterSegmento] = useState<string>("todos")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [detailAccount, setDetailAccount] = useState<Account | null>(null)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)

  const segmentos = useMemo(
    () => [...new Set(accounts.map((a) => a.segmento))],
    [accounts]
  )

  const filtered = useMemo(() => {
    return accounts.filter((a) => {
      if (search && !a.nome.toLowerCase().includes(search.toLowerCase()) && !a.cnpj.includes(search)) return false
      if (filterTier !== "todos" && a.tier !== filterTier) return false
      if (filterSegmento !== "todos" && a.segmento !== filterSegmento) return false
      return true
    })
  }, [accounts, search, filterTier, filterSegmento])

  const [form, setForm] = useState({
    nome: "",
    segmento: "",
    cnpj: "",
    responsavel: "",
    score_total: 50,
  })

  function resetForm() {
    setForm({ nome: "", segmento: "", cnpj: "", responsavel: "", score_total: 50 })
    setEditingAccount(null)
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
      cnpj: account.cnpj,
      responsavel: account.responsavel,
      score_total: account.score_total,
    })
    setDrawerOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingAccount) {
      updateAccount(editingAccount.id, form)
    } else {
      addAccount(form)
    }
    setDrawerOpen(false)
    resetForm()
  }

  function handleDelete(id: string) {
    deleteAccount(id)
    if (detailAccount?.id === id) setDetailAccount(null)
  }

  return (
    <div>
      <SectionHeader
        icon={<Building2 className="w-5 h-5" />}
        title="Gestão de Contas"
        description="Gerencie suas contas comerciais, classificações e informações de contato."
      />

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value as Tier | "todos")}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="todos">Todos os Tiers</option>
          <option value="A">Tier A</option>
          <option value="B">Tier B</option>
          <option value="C">Tier C</option>
        </select>
        <select
          value={filterSegmento}
          onChange={(e) => setFilterSegmento(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="todos">Todos os Segmentos</option>
          {segmentos.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-fluig-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nova Conta
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Segmento</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Responsável</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Score</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Tier</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Onda</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((account) => (
                <tr
                  key={account.id}
                  className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{account.nome}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{account.segmento}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{account.responsavel}</td>
                  <td className="px-4 py-3 text-center font-semibold text-foreground">{account.score_total}</td>
                  <td className="px-4 py-3 text-center"><TierBadge tier={account.tier} /></td>
                  <td className="px-4 py-3 text-center text-muted-foreground hidden lg:table-cell">{account.onda}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setDetailAccount(account)} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" aria-label="Ver detalhes">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEdit(account)} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" aria-label="Editar">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(account.id)} className="p-1.5 rounded-md hover:bg-muted transition-colors text-fluig-danger" aria-label="Excluir">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    Nenhuma conta encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {detailAccount && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-fluig-title">{detailAccount.nome}</h3>
            <button onClick={() => setDetailAccount(null)} className="text-muted-foreground hover:text-foreground" aria-label="Fechar detalhes">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg" style={{ background: "var(--fluig-readonly)" }}>
              <p className="text-xs text-muted-foreground mb-1">CNPJ</p>
              <p className="font-medium text-foreground text-sm">{detailAccount.cnpj}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: "var(--fluig-readonly)" }}>
              <p className="text-xs text-muted-foreground mb-1">Segmento</p>
              <p className="font-medium text-foreground text-sm">{detailAccount.segmento}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: "var(--fluig-readonly)" }}>
              <p className="text-xs text-muted-foreground mb-1">Responsável</p>
              <p className="font-medium text-foreground text-sm">{detailAccount.responsavel}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: "var(--fluig-readonly)" }}>
              <p className="text-xs text-muted-foreground mb-1">Score / Tier / Onda</p>
              <p className="font-medium text-foreground text-sm">{detailAccount.score_total} / {detailAccount.tier} / {detailAccount.onda}</p>
            </div>
          </div>

          {/* Opportunities for this account */}
          <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Oportunidades</p>
            {opportunities.filter((o) => o.account_id === detailAccount.id).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma oportunidade registrada.</p>
            ) : (
              <div className="space-y-2">
                {opportunities
                  .filter((o) => o.account_id === detailAccount.id)
                  .map((opp) => (
                    <div key={opp.id} className="p-3 rounded-lg border border-border text-sm flex items-center justify-between">
                      <div>
                        <span className="font-medium text-foreground capitalize">{opp.stage.replace("_", " ")}</span>
                        <span className="mx-2 text-muted-foreground">|</span>
                        <span className="text-muted-foreground">R$ {opp.valor_estimado.toLocaleString("pt-BR")}</span>
                      </div>
                      <span className="text-muted-foreground">{opp.probabilidade}%</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Criado em {format(new Date(detailAccount.created_at), "dd/MM/yyyy", { locale: ptBR })}
          </p>
        </div>
      )}

      {/* Drawer / Modal */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => { setDrawerOpen(false); resetForm() }} />
          <div className="relative w-full max-w-md h-full bg-card border-l border-border overflow-y-auto">
            {/* Drawer header */}
            <div
              className="px-6 py-5 text-primary-foreground"
              style={{
                background: "linear-gradient(135deg, var(--fluig-primary) 0%, var(--fluig-secondary) 100%)",
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editingAccount ? "Editar Conta" : "Nova Conta"}
                </h3>
                <button onClick={() => { setDrawerOpen(false); resetForm() }} aria-label="Fechar">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nome da Empresa</label>
                <input
                  required
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Segmento</label>
                <input
                  required
                  type="text"
                  value={form.segmento}
                  onChange={(e) => setForm({ ...form, segmento: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">CNPJ</label>
                <input
                  required
                  type="text"
                  value={form.cnpj}
                  onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Responsável</label>
                <input
                  required
                  type="text"
                  value={form.responsavel}
                  onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Score Total: {form.score_total}
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Tier {calcTier(form.score_total)} / Onda {calcOnda(calcTier(form.score_total))})
                  </span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={form.score_total}
                  onChange={(e) => setForm({ ...form, score_total: Number(e.target.value) })}
                  className="w-full accent-[var(--fluig-primary)]"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 px-4 py-2.5 rounded-lg bg-fluig-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
              >
                {editingAccount ? "Salvar Alterações" : "Criar Conta"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
