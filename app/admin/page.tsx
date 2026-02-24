"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Shield, Users, Clock, CheckCircle, XCircle, LogOut,
  UserPlus, RefreshCw, ChevronDown, ChevronUp,
  Building2, Phone, Briefcase, MessageSquare, Orbit,
  AlertCircle, Copy, Check
} from "lucide-react"

type RequestStatus = "pendente" | "aprovado" | "recusado"
type FilterStatus = RequestStatus | "todos"
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
  pendente: "Pendente",
  aprovado: "Aprovado",
  recusado: "Recusado",
}

const STATUS_CLASS: Record<RequestStatus, string> = {
  pendente: "bg-amber-50 text-amber-700 border-amber-200",
  aprovado: "bg-green-50 text-green-700 border-green-200",
  recusado: "bg-red-50 text-red-700 border-red-200",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="ml-auto p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

function CredentialsModal({
  title, email, senha, onClose
}: { title: string; email: string; senha: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">Compartilhe as credenciais abaixo com o usuario.</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border border-border">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">E-mail</p>
              <p className="text-sm font-mono text-foreground truncate">{email}</p>
            </div>
            <CopyButton text={email} />
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border border-border">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Senha temporaria</p>
              <p className="text-sm font-mono text-foreground">{senha}</p>
            </div>
            <CopyButton text={senha} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground bg-amber-50 border border-amber-100 rounded-lg p-3">
          A senha deve ser alterada no primeiro acesso. Guarde essas informacoes com seguranca.
        </p>
        <button onClick={onClose} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--fluig-primary)" }}>
          Entendido
        </button>
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="bg-card border border-border rounded-xl px-5 py-4 flex items-center gap-4 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-muted flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-muted rounded w-32" />
        <div className="h-3 bg-muted rounded w-48" />
      </div>
      <div className="h-6 bg-muted rounded w-20" />
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("solicitacoes")
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [filter, setFilter] = useState<FilterStatus>("pendente")
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [recusaModal, setRecusaModal] = useState<{ id: string; nome: string } | null>(null)
  const [motivoRecusa, setMotivoRecusa] = useState("")
  const [credentialsModal, setCredentialsModal] = useState<{ title: string; email: string; senha: string } | null>(null)
  const [createModal, setCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ nome: "", email: "", empresa: "", cargo: "" })
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState("")

  const fetchRequests = useCallback(async () => {
    const res = await fetch("/api/access-requests")
    if (!res.ok) throw new Error("Erro ao carregar solicitacoes")
    const data = await res.json()
    setRequests(data.data ?? [])
  }, [])

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users")
    if (!res.ok) throw new Error("Erro ao carregar usuarios")
    const data = await res.json()
    setUsers(data.users ?? [])
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    setLoadError("")
    try {
      await Promise.all([fetchRequests(), fetchUsers()])
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Erro ao carregar dados.")
    } finally {
      setLoading(false)
    }
  }, [fetchRequests, fetchUsers])

  useEffect(() => { loadAll() }, [loadAll])

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
      setCredentialsModal({ title: "Usuario aprovado!", email: data.email, senha: data.senha_temp })
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
        body: JSON.stringify({ id: userId, ativado: !ativado }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await fetchUsers()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao atualizar usuario.")
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
      setCreateModal(false)
      setCreateForm({ nome: "", email: "", empresa: "", cargo: "" })
      setCredentialsModal({ title: "Usuario criado!", email: data.email, senha: data.senha_temp })
      await fetchUsers()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Erro ao criar usuario.")
    } finally {
      setCreateLoading(false)
    }
  }

  async function handleLogout() {
    const supabase = (await import("@/lib/supabase/client")).createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  const pendingCount = requests.filter(r => r.status === "pendente").length
  const approvedCount = requests.filter(r => r.status === "aprovado").length
  const rejectedCount = requests.filter(r => r.status === "recusado").length
  const activeUsers = users.filter(u => u.ativado).length

  const filteredRequests = filter === "todos"
    ? requests
    : requests.filter(r => r.status === filter)

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
            <Link href="/app"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted">
              Ir para o App
            </Link>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-lg hover:bg-destructive/5">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 pt-24 pb-16 space-y-6">

        {/* Erro global */}
        {loadError && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{loadError}</span>
            <button onClick={loadAll} className="ml-auto text-xs underline underline-offset-2">Tentar novamente</button>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Pendentes", value: pendingCount, icon: Clock, color: "#f59e0b" },
            { label: "Aprovadas", value: approvedCount, icon: CheckCircle, color: "#22c55e" },
            { label: "Recusadas", value: rejectedCount, icon: XCircle, color: "var(--fluig-danger)" },
            { label: "Usuarios Ativos", value: activeUsers, icon: Users, color: "var(--fluig-primary)" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `color-mix(in srgb, ${kpi.color} 12%, transparent)` }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              <div>
                {loading
                  ? <div className="h-6 w-8 bg-muted rounded animate-pulse mb-1" />
                  : <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                }
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
                  {pendingCount > 0 && !loading && (
                    <span className="w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center bg-amber-500">
                      {pendingCount > 9 ? "9+" : pendingCount}
                    </span>
                  )}
                </span>
              ) : "Usuarios"}
            </button>
          ))}
        </div>

        {/* ── SOLICITACOES ── */}
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
                      {count !== null && !loading && (
                        <span className="ml-1 opacity-60">({count})</span>
                      )}
                    </button>
                  )
                })}
              </div>
              <button onClick={fetchRequests} disabled={loading}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Atualizar
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-20 bg-card border border-border rounded-xl">
                <Clock className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">
                  {filter === "pendente" ? "Nenhuma solicitacao pendente" :
                   filter === "aprovado" ? "Nenhuma solicitacao aprovada" :
                   filter === "recusado" ? "Nenhuma solicitacao recusada" :
                   "Nenhuma solicitacao encontrada"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  As solicitacoes apareceram aqui quando usuarios solicitarem acesso.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredRequests.map((req) => (
                  <div key={req.id} className="bg-card border border-border rounded-xl overflow-hidden transition-shadow hover:shadow-sm">
                    <div className="flex items-center justify-between px-5 py-4 gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white"
                          style={{ background: "var(--fluig-primary)" }}>
                          {req.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">{req.nome}</p>
                          <p className="text-xs text-muted-foreground truncate">{req.email}</p>
                        </div>
                        <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground ml-2 flex-shrink-0">
                          <Building2 className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[140px]">{req.empresa}</span>
                        </div>
                        <span className={`hidden sm:inline-flex ml-2 px-2.5 py-1 rounded-full text-[11px] font-semibold border flex-shrink-0 ${STATUS_CLASS[req.status]}`}>
                          {STATUS_LABEL[req.status]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {req.status === "pendente" && (
                          <>
                            <button onClick={() => handleApprove(req.id)}
                              disabled={!!actionLoading}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50 transition-opacity"
                              style={{ backgroundColor: "#22c55e" }}>
                              {actionLoading === req.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5" />
                              )}
                              <span className="hidden sm:inline">Aprovar</span>
                            </button>
                            <button onClick={() => setRecusaModal({ id: req.id, nome: req.nome })}
                              disabled={!!actionLoading}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-destructive border border-destructive/30 hover:bg-destructive/5 transition-colors disabled:opacity-50">
                              <XCircle className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Recusar</span>
                            </button>
                          </>
                        )}
                        <button onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                          {expandedId === req.id
                            ? <ChevronUp className="w-4 h-4" />
                            : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {expandedId === req.id && (
                      <div className="border-t border-border px-5 py-4 bg-muted/20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
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
                            <span>Solicitado em {new Date(req.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</span>
                          </div>
                          {req.mensagem && (
                            <div className="col-span-full flex items-start gap-2 text-muted-foreground">
                              <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span className="italic">"{req.mensagem}"</span>
                            </div>
                          )}
                          {req.status === "recusado" && req.motivo_recusa && (
                            <div className="col-span-full p-3 rounded-lg bg-destructive/5 border border-destructive/10 text-destructive text-xs">
                              Motivo da recusa: {req.motivo_recusa}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── USUARIOS ── */}
        {tab === "usuarios" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {loading ? "Carregando..." : `${users.length} usuario${users.length !== 1 ? "s" : ""} cadastrado${users.length !== 1 ? "s" : ""}`}
              </p>
              <button
                onClick={() => { setCreateModal(true); setCreateError(""); setCreateForm({ nome: "", email: "", empresa: "", cargo: "" }) }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--fluig-primary)" }}>
                <UserPlus className="w-4 h-4" />
                Novo Usuario
              </button>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {loading ? (
                <div className="divide-y divide-border">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-muted rounded w-36" />
                        <div className="h-3 bg-muted rounded w-52" />
                      </div>
                      <div className="h-6 bg-muted rounded w-16" />
                      <div className="h-6 bg-muted rounded w-14" />
                    </div>
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-20">
                  <Users className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">Nenhum usuario cadastrado</p>
                  <p className="text-xs text-muted-foreground mt-1">Crie usuarios diretamente ou aprove solicitacoes de acesso.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border bg-muted/40">
                      <tr>
                        {["Usuario", "Empresa", "Cargo", "Role", "Status", "Desde", "Acoes"].map((h) => (
                          <th key={h} className={`text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide ${["Cargo", "Desde"].includes(h) ? "hidden lg:table-cell" : h === "Empresa" ? "hidden md:table-cell" : ""}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                style={{ background: u.role === "admin" ? "var(--fluig-secondary)" : "var(--fluig-primary)" }}>
                                {u.nome?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-foreground truncate max-w-[160px]">{u.nome || "—"}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[160px]">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell">
                            <span className="truncate max-w-[120px] block">{u.empresa || "—"}</span>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground hidden lg:table-cell">
                            {u.cargo || "—"}
                          </td>
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
                          <td className="px-5 py-3.5 text-muted-foreground text-xs hidden lg:table-cell">
                            {new Date(u.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-5 py-3.5">
                            {u.role !== "admin" && (
                              <button onClick={() => handleToggleUser(u.id, u.ativado)}
                                disabled={actionLoading === u.id}
                                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 min-w-[72px]">
                                {actionLoading === u.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin mx-auto" />
                                ) : u.ativado ? "Desativar" : "Ativar"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Recusar */}
      {recusaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setRecusaModal(null)} />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-semibold text-foreground">
              Recusar solicitacao de <span className="text-destructive">{recusaModal.nome}</span>
            </h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Motivo <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <textarea value={motivoRecusa} onChange={(e) => setMotivoRecusa(e.target.value)}
                placeholder="Descreva o motivo da recusa..." rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRecusaModal(null)}
                className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">
                Cancelar
              </button>
              <button onClick={handleReject} disabled={!!actionLoading}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-destructive hover:bg-destructive/90 transition-colors disabled:opacity-50">
                {actionLoading ? "Recusando..." : "Confirmar Recusa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Credenciais */}
      {credentialsModal && (
        <CredentialsModal
          title={credentialsModal.title}
          email={credentialsModal.email}
          senha={credentialsModal.senha}
          onClose={() => setCredentialsModal(null)}
        />
      )}

      {/* Modal: Criar usuario */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => !createLoading && setCreateModal(false)} />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-foreground mb-4">Criar usuario diretamente</h3>
            <form onSubmit={handleCreateUser} className="space-y-3">
              {[
                { field: "nome", label: "Nome completo", type: "text", req: true, placeholder: "Ex: Joao Silva" },
                { field: "email", label: "E-mail", type: "email", req: true, placeholder: "email@empresa.com" },
                { field: "empresa", label: "Empresa", type: "text", req: true, placeholder: "Nome da empresa" },
                { field: "cargo", label: "Cargo", type: "text", req: false, placeholder: "Ex: Consultor" },
              ].map(({ field, label, type, req, placeholder }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {label}{req && <span className="text-destructive ml-1">*</span>}
                  </label>
                  <input type={type} required={req} placeholder={placeholder}
                    value={createForm[field as keyof typeof createForm]}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, [field]: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              ))}
              {createError && (
                <p className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {createError}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setCreateModal(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm border border-border hover:bg-muted transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={createLoading}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
                  style={{ backgroundColor: "var(--fluig-primary)" }}>
                  {createLoading ? "Criando..." : "Criar Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
