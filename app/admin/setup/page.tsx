"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function AdminSetupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ nome: "", telefone: "", empresa: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!form.nome.trim()) {
      setError("Nome e obrigatorio.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao ativar conta.")
      }

      setSuccess(true)
      setTimeout(() => router.push("/admin"), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao ativar conta.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div
            className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "var(--fluig-success)" }}
          >
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Conta ativada com sucesso</h1>
          <p className="text-muted-foreground">
            Redirecionando para o painel administrativo...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div
            className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--fluig-primary) 0%, var(--fluig-secondary) 100%)" }}
          >
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Ativar Conta Administrador</h1>
          <p className="text-sm text-muted-foreground">
            Bem-vindo ao Fluig | Ação Comercial. Complete seus dados para ativar sua conta de administrador.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="px-4 py-3 rounded-lg text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="nome" className="block text-sm font-medium text-foreground">
              Nome completo *
            </label>
            <input
              id="nome"
              type="text"
              required
              placeholder="Seu nome completo"
              value={form.nome}
              onChange={(e) => update("nome", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="empresa" className="block text-sm font-medium text-foreground">
              Empresa
            </label>
            <input
              id="empresa"
              type="text"
              placeholder="Nome da empresa"
              value={form.empresa}
              onChange={(e) => update("empresa", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="telefone" className="block text-sm font-medium text-foreground">
              Telefone
            </label>
            <input
              id="telefone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={form.telefone}
              onChange={(e) => update("telefone", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: "var(--fluig-primary)" }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#005f8f")}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = "var(--fluig-primary)")}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {loading ? "Ativando..." : "Ativar Conta"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:underline" style={{ color: "var(--fluig-primary)" }}>
            Voltar ao site
          </Link>
        </p>
      </div>
    </div>
  )
}
