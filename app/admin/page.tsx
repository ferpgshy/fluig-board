"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Shield,
  Users,
  Loader2,
  UserCheck,
  UserX,
  Crown,
  User,
  ArrowLeft,
  RefreshCw,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Profile {
  id: string
  nome: string
  email: string
  empresa: string
  cargo: string
  telefone: string
  role: string
  ativado: boolean
  created_at: string
  updated_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string>("")

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUsers(data.users || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar usuarios.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Get current user id
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id)
    })
    fetchUsers()
  }, [fetchUsers])

  async function toggleAtivado(userId: string, currentAtivado: boolean) {
    setActionLoading(userId + "_ativado")
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ativado: !currentAtivado }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar usuario.")
    } finally {
      setActionLoading(null)
    }
  }

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "user" : "admin"
    setActionLoading(userId + "_role")
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar papel.")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="px-6 py-5 rounded-b-[20px]"
        style={{
          background: "linear-gradient(135deg, var(--fluig-primary) 0%, var(--fluig-secondary) 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Painel Administrativo</h1>
              <p className="text-sm text-white/70">Gestao de usuarios do Fluig Board</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Ir para o App
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 lg:px-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--fluig-primary)", opacity: 0.1 }}>
                <Users className="w-5 h-5" style={{ color: "var(--fluig-primary)" }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
                <p className="text-xs text-muted-foreground">Total de usuarios</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--fluig-success)", opacity: 0.1 }}>
                <UserCheck className="w-5 h-5" style={{ color: "var(--fluig-success)" }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{users.filter((u) => u.ativado).length}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--fluig-danger)", opacity: 0.1 }}>
                <Crown className="w-5 h-5" style={{ color: "var(--fluig-danger)" }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{users.filter((u) => u.role === "admin").length}</p>
                <p className="text-xs text-muted-foreground">Administradores</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {/* Users table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" style={{ color: "var(--fluig-title)" }} />
              <h2 className="text-base font-semibold" style={{ color: "var(--fluig-title)" }}>
                Usuarios Cadastrados
              </h2>
            </div>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Users className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">Nenhum usuario encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Usuario</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">E-mail</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Empresa</th>
                    <th className="text-center px-5 py-3 font-medium text-muted-foreground">Papel</th>
                    <th className="text-center px-5 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-center px-5 py-3 font-medium text-muted-foreground">Cadastro</th>
                    <th className="text-right px-5 py-3 font-medium text-muted-foreground">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = u.id === currentUserId
                    return (
                      <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                              style={{ backgroundColor: u.role === "admin" ? "var(--fluig-primary)" : "var(--fluig-secondary)" }}
                            >
                              {u.nome ? u.nome.charAt(0).toUpperCase() : "?"}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {u.nome || "Sem nome"}
                                {isSelf && <span className="ml-1.5 text-xs text-muted-foreground">(voce)</span>}
                              </p>
                              {u.cargo && <p className="text-xs text-muted-foreground">{u.cargo}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">{u.email}</td>
                        <td className="px-5 py-3.5 text-muted-foreground">{u.empresa || "-"}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: u.role === "admin" ? "rgba(0,119,182,0.1)" : "rgba(0,168,168,0.1)",
                              color: u.role === "admin" ? "var(--fluig-primary)" : "var(--fluig-secondary)",
                            }}
                          >
                            {u.role === "admin" ? <Crown className="w-3 h-3" /> : <User className="w-3 h-3" />}
                            {u.role === "admin" ? "Admin" : "Usuario"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: u.ativado ? "rgba(76,175,80,0.1)" : "rgba(244,67,54,0.1)",
                              color: u.ativado ? "var(--fluig-success)" : "var(--fluig-danger)",
                            }}
                          >
                            {u.ativado ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                            {u.ativado ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center text-muted-foreground text-xs">
                          {new Date(u.created_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Toggle role */}
                            <button
                              onClick={() => toggleRole(u.id, u.role)}
                              disabled={isSelf || actionLoading === u.id + "_role"}
                              className="px-2.5 py-1 rounded-md text-xs font-medium border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              title={isSelf ? "Nao e possivel alterar o proprio papel" : u.role === "admin" ? "Rebaixar para usuario" : "Promover a admin"}
                            >
                              {actionLoading === u.id + "_role" ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : u.role === "admin" ? (
                                "Rebaixar"
                              ) : (
                                "Promover"
                              )}
                            </button>
                            {/* Toggle ativado */}
                            <button
                              onClick={() => toggleAtivado(u.id, u.ativado)}
                              disabled={isSelf || actionLoading === u.id + "_ativado"}
                              className="px-2.5 py-1 rounded-md text-xs font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              style={{
                                borderColor: u.ativado ? "var(--fluig-danger)" : "var(--fluig-success)",
                                color: u.ativado ? "var(--fluig-danger)" : "var(--fluig-success)",
                              }}
                              title={isSelf ? "Nao e possivel desativar a si mesmo" : u.ativado ? "Desativar usuario" : "Ativar usuario"}
                            >
                              {actionLoading === u.id + "_ativado" ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : u.ativado ? (
                                "Desativar"
                              ) : (
                                "Ativar"
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
