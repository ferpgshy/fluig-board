"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Loader2, Save, User } from "lucide-react"
import Link from "next/link"

interface Profile {
  id: string
  nome: string
  email: string
  empresa: string
  cargo: string
  telefone: string
  role: string
}

export default function PerfilPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ nome: "", empresa: "", cargo: "", telefone: "" })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/profile")
        if (!res.ok) {
          router.push("/login")
          return
        }
        const data = await res.json()
        setProfile(data.profile)
        setForm({
          nome: data.profile.nome || "",
          empresa: data.profile.empresa || "",
          cargo: data.profile.cargo || "",
          telefone: data.profile.telefone || "",
        })
      } catch {
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setSaving(true)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          nome: form.nome.trim(),
          empresa: form.empresa.trim(),
          cargo: form.cargo.trim(),
          telefone: form.telefone.trim(),
        })
        .eq("id", profile!.id)

      if (updateError) throw new Error(updateError.message)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar perfil.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
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
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Meu Perfil</h1>
              <p className="text-sm text-white/70">Gerencie suas informacoes pessoais</p>
            </div>
          </div>
          <Link
            href="/app"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSave} className="bg-card border border-border rounded-xl p-6 space-y-5">
          {error && (
            <div className="px-4 py-3 rounded-lg text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20">
              {error}
            </div>
          )}
          {success && (
            <div className="px-4 py-3 rounded-lg text-sm font-medium border" style={{ backgroundColor: "rgba(76,175,80,0.1)", color: "var(--fluig-success)", borderColor: "rgba(76,175,80,0.2)" }}>
              Perfil atualizado com sucesso.
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">E-mail</label>
            <input
              type="email"
              disabled
              value={profile?.email || ""}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-muted text-muted-foreground text-sm cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">O e-mail nao pode ser alterado.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="nome" className="block text-sm font-medium text-foreground">Nome completo</label>
            <input
              id="nome"
              type="text"
              required
              value={form.nome}
              onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="empresa" className="block text-sm font-medium text-foreground">Empresa</label>
            <input
              id="empresa"
              type="text"
              value={form.empresa}
              onChange={(e) => setForm((p) => ({ ...p, empresa: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="cargo" className="block text-sm font-medium text-foreground">Cargo</label>
            <input
              id="cargo"
              type="text"
              value={form.cargo}
              onChange={(e) => setForm((p) => ({ ...p, cargo: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="telefone" className="block text-sm font-medium text-foreground">Telefone</label>
            <input
              id="telefone"
              type="tel"
              value={form.telefone}
              onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))}
              placeholder="(00) 00000-0000"
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: "var(--fluig-primary)" }}
            onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = "#005f8f")}
            onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = "var(--fluig-primary)")}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Salvando..." : "Salvar Alteracoes"}
          </button>
        </form>
      </main>
    </div>
  )
}
