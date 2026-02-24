"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Shield, Users, Clock, CheckCircle, XCircle, LogOut,
  UserPlus, RefreshCw, ChevronDown, ChevronUp,
  Building2, Phone, Briefcase, MessageSquare, Orbit
} from "lucide-react"

type RequestStatus = "pendente" | "aprovado" | "recusado"
type FilterStatus = "pendente" | "aprovado" | "recusado" | "todos"
type Tab = "solicitacoes" | "usuarios"

interface AccessRequest {
  id: string
  nome: string
  email: string
  empresa: string
  cargo: string
  telefone: string
  mensagem: string
  status: RequestStatus
  motivo_recusa: string
  created_at: string
  reviewed_at: string | null
}

interface Profile {
  id: string
  nome: string
  email: string
  empresa: string
  cargo: string
  role: string
  ativado: boolean
  created_at: string
}

const STATUS_LABEL: Record<RequestStatus, string> = {
  pendente: "Pendente", aprovado: "Aprovado", recusado: "Recusado"
}
const STATUS_CLASS: Record<RequestStatus, string> = {
  pendente: "bg-amber-50 text-amber-700 border-amber-200",
  aprovado: "bg-green-50 text-green-700 border-green-200",
  recusado: "bg-red-50 text-red-700 border-red-200",
}

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("solicitacoes")
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [filter, setFilter] = useState<FilterStatus>("pendente")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [recusaModal, setRecusaModal] = useState<{ id: string; nome: string } | null>(null)
  const [motivoRecusa, setMotivoRecusa] = useState("")
  const [approvedInfo, setApprovedInfo] = useState<{ email: string; senha: string } | null>(null)
  const [createModal, setCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ nome: "", email: "", empresa: "", cargo: "" })
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState("")
  const [createResult, setCreateResult] = useState<{ email: string; senha: string } | null>(null)

  const fetchRequests = useCallback(async () => {
    const res = await fetch("/api/access-requests")
    const data = await res.json()
    if (data.data) setRequests(data.data)
  }, [])

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users")
    const data = await res.json()
    if (data.data || data.users) setUsers(data.data || data.users || [])
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      await Promise.all([fetchRequests(), fetchUsers()])
      setLoading(false)
    }
    load()
  }, [fetchRequests, fetchUsers])

  async function handleApprove(id: string) {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/access-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "aprovar" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setApprovedInfo({ email: data.email, senha: data.senha_temp })
      await Promise.all([fetchRequests(), fetchUsers()])
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao aprovar.")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject() {
    if (!recusaModal) return
    setActionLoading(recusaModal.id)
    try {
      const res = await fetch(`/api/access-requests/${recusaModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "recusar", motivo_recusa: motivoRecusa }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRecusaModal(null)
      setMotivoRecusa("")
      await fetchRequests()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao recusar.")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleToggleUser(userId: string, ativado: boolean) {
    setActionLoading(userId)
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, userId, ativado: !ativado }),
      })
      if (!res.ok) throw new Error("Erro ao atualizar usuario.")
      await fetchUsers()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro.")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setCreateError("")
    setCreateLoading(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCreateResult({ email: data.email, senha: data.senha_temp })
      await fetchUsers()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Erro ao criar usuario.")
    } finally {
      setCreateLoading(false)
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  const filteredRequests = requests.filter(r =>
    filter === "todos" ? true : r.status === filter
  )
  const pendingCount = requests.filter(r => r.status === "pendente").length
  const approvedCount = requests.filter(r => r.status === "aprovado").length
  const rejectedCount = requests.filter(r => r.status === "recusado").length

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0077b6]">
              <Orbit className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">Fluig Board</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
              style={{ backgroundColor: "rgba(0,119,182,0.08)", color: "var(--fluig-primary)", borderColor: "rgba(0,119,182,0.2)" }}>
              <Shield className="w-3 h-3" /> Painel Admin
            </span>
            <Link href="/app" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted">
              Ir para o App
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-lg hover:bg-destructive/5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 pt-24 pb-16 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Pendentes", value: pendingCount, icon: Clock, color: "#f59e0b" },
            { label: "Aprovadas", value: approvedCount, icon: CheckCircle, color: "#22c55e" },
            { label: "Recusadas", value: rejectedCount, icon: XCircle, color: "var(--fluig-danger)" },
            { label: "Usuarios Ativos", value: users.filter(u => u.ativado).length, icon: Users, color: "var(--fluig-primary)" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `color-mix(in srgb, ${kpi.color} 12%, transparent)` }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1 w-fit">
          {(["solicitacoes", "usuarios"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {t === "solicitacoes" ? (
                <span className="flex items-center gap-2">
                  Solicitacoes
                  {pendingCount > 0 && (
                    <span className="w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center bg-amber-500">
                      {pendingCount}
                    </span>
                  )}
                </span>
              ) : "Usuarios"}
            </button>
          ))}
        </div>

        {/* SOLICITACOES */}
        {tab === "solicitacoes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
                {(["pendente", "aprovado", "recusado", "todos"] as FilterStatus[]).map((s) => {
                  const count = s === "pendente" ? pendingCount : s === "aprovado" ? approvedCount : s === "recusado" ? rejectedCount : null
                  return (
                    <button key={s} onClick={() => setFilter(s)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === s ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
                      style={filter === s ? { backgroundColor: "var(--fluig-primary)" } : {}}>
                      {s === "todos" ? "Todos" : STATUS_LABEL[s as RequestStatus]}
                      {count !== null && <span className="ml-1 opacity-60">({count})</span>}
                    </button>
                  )
                })}
              </div>
              <button onClick={fetchRequests} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <RefreshCw className="w-4 h-4" /> Atualizar
              </button>
            </div>

            {loading ? (
              <div className="text-center py-16 text-sm text-muted-foreground">Carregando...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-xl">
                <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nenhuma solicitacao encontrada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map((req) => (
                  <div key={req.id} className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white"
                          style={{ background: "var(--fluig-primary)" }}>
                          {req.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">{req.nome}</p>
                          <p className="text-xs text-muted-foreground truncate">{req.email}</p>
                        </div>
                        <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
                          <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate max-w-[140px]">{req.empresa}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border ${STATUS_CLASS[req.status]}`}>
                          {STATUS_LABEL[req.status]}
                        </span>
                        {req.status === "pendente" && (
                          <>
                            <button onClick={() => handleApprove(req.id)} disabled={!!actionLoading}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50 transition-opacity"
                              style={{ backgroundColor: "#22c55e" }}>
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Aprovar</span>
                            </button>
                            <button onClick={() => setRecusaModal({ id: req.id, nome: req.nome })} disabled={!!actionLoading}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-destructive border border-destructive/30 hover:bg-destructive/5 transition-colors disabled:opacity-50">
                              <XCircle className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Recusar</span>
                            </button>
                          </>
                        )}
                        <button onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                          {expandedId === req.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    {expandedId === req.id && (
                      <div className="border-t border-border px-5 py-4 bg-muted/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        {req.cargo && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Briefcase className="w-4 h-4 flex-shrink-0" />
                            <span>{req.cargo}</span>
                          </div>
                        )}
                        {req.telefone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <span>{req.telefone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span>{new Date(req.created_at).toLocaleDateString("pt-BR")}</span>
                        </div>
                        {req.mensagem && (
                          <div className="col-span-full flex items-start gap-2 text-muted-foreground">
                            <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span className="italic">"{req.mensagem}"</span>
                          </div>
                        )}
                        {req.status === "recusado" && req.motivo_recusa && (
                          <div className="col-span-full p-3 rounded-lg bg-destructive/5 border border-destructive/10 text-destructive text-xs">
                            Motivo: {req.motivo_recusa}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USUARIOS */}
        {tab === "usuarios" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{users.length} usuario(s) cadastrado(s)</p>
              <button
                onClick={() => { setCreateModal(true); setCreateResult(null); setCreateError(""); setCreateForm({ nome: "", email: "", empresa: "", cargo: "" }) }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--fluig-primary)" }}>
                <UserPlus className="w-4 h-4" /> Novo Usuario
              </button>
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/40">
                    <tr>
                      {["Usuario", "Empresa", "Cargo", "Role", "Status", "Acoes"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                              style={{ background: "var(--fluig-primary)" }}>
                              {u.nome?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">{u.nome || "—"}</p>
                              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell">{u.empresa || "—"}</td>
                        <td className="px-5 py-3.5 text-muted-foreground hidden lg:table-cell">{u.cargo || "—"}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${u.role === "admin" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-muted text-muted-foreground border-border"}`}>
                            {u.role === "admin" && <Shield className="w-3 h-3" />}
                            {u.role === "admin" ? "Admin" : "Usuario"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border ${u.ativado ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                            {u.ativado ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {u.role !== "admin" && (
                            <button onClick={() => handleToggleUser(u.id, u.ativado)} disabled={actionLoading === u.id}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50">
                              {actionLoading === u.id ? "..." : u.ativado ? "Desativar" : "Ativar"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Recusar */}
      {recusaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setRecusaModal(null)} />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-semibold text-foreground">Recusar solicitacao de <span className="text-destructive">{recusaModal.nome}</span></h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Motivo <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <textarea value={motivoRecusa} onChange={(e) => setMotivoRecusa(e.target.value)}
                placeholder="Descreva o motivo da recusa..." rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRecusaModal(null)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancelar</button>
              <button onClick={handleReject} disabled={!!actionLoading}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-destructive hover:bg-destructive/90 transition-colors disabled:opacity-50">
                Confirmar Recusa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Aprovado - senha temp */}
      {approvedInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setApprovedInfo(null)} />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-foreground">Usuario aprovado!</h3>
            </div>
            <p className="text-sm text-muted-foreground">Compartilhe as credenciais abaixo. A senha deve ser trocada no primeiro acesso.</p>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-muted border border-border">
                <p className="text-xs text-muted-foreground mb-0.5">E-mail</p>
                <p className="text-sm font-mono font-medium text-foreground">{approvedInfo.email}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted border border-border">
                <p className="text-xs text-muted-foreground mb-0.5">Senha temporaria</p>
                <p className="text-sm font-mono font-medium text-foreground">{approvedInfo.senha}</p>
              </div>
            </div>
            <button onClick={() => setApprovedInfo(null)} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--fluig-primary)" }}>Fechar</button>
          </div>
        </div>
      )}

      {/* Modal: Criar usuario */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !createLoading && setCreateModal(false)} />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-semibold text-foreground">Criar usuario diretamente</h3>
            {createResult ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Usuario criado. Compartilhe as credenciais abaixo.</p>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-muted border border-border">
                    <p className="text-xs text-muted-foreground mb-0.5">E-mail</p>
                    <p className="text-sm font-mono font-medium text-foreground">{createResult.email}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted border border-border">
                    <p className="text-xs text-muted-foreground mb-0.5">Senha temporaria</p>
                    <p className="text-sm font-mono font-medium text-foreground">{createResult.senha}</p>
                  </div>
                </div>
                <button onClick={() => setCreateModal(false)} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: "var(--fluig-primary)" }}>
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-3">
                {[
                  { field: "nome", label: "Nome completo", req: true, placeholder: "Nome do usuario" },
                  { field: "email", label: "E-mail", req: true, placeholder: "email@empresa.com" },
                  { field: "empresa", label: "Empresa", req: true, placeholder: "Nome da empresa" },
                  { field: "cargo", label: "Cargo", req: false, placeholder: "Ex: Consultor" },
                ].map(({ field, label, req, placeholder }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-foreground mb-1">{label}{req && <span className="text-destructive ml-1">*</span>}</label>
                    <input type={field === "email" ? "email" : "text"} required={req} placeholder={placeholder}
                      value={createForm[field as keyof typeof createForm]}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, [field]: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                ))}
                {createError && <p className="text-sm text-destructive">{createError}</p>}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setCreateModal(false)} className="flex-1 py-2.5 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancelar</button>
                  <button type="submit" disabled={createLoading} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                    style={{ backgroundColor: "var(--fluig-primary)" }}>
                    {createLoading ? "Criando..." : "Criar Usuario"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
