"use client"

import { useState } from "react"
import Link from "next/link"
import { UserPlus, Loader2, CheckCircle, ArrowLeft } from "lucide-react"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function SolicitarAcessoPage() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    empresa: "",
    cargo: "",
    telefone: "",
    mensagem: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/access-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao enviar solicitacao.")
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar solicitacao.")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout
        title="Solicitacao enviada!"
        subtitle="Em breve um administrador avaliara seu pedido."
      >
        <div className="text-center py-6 space-y-4">
          <div
            className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,168,168,0.1)" }}
          >
            <CheckCircle className="w-8 h-8" style={{ color: "var(--fluig-secondary)" }} />
          </div>
          <p className="text-sm text-muted-foreground">
            Sua solicitacao foi recebida para <strong className="text-foreground">{form.email}</strong>.
            Voce recebera as instrucoes de acesso por e-mail assim que aprovada.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: "var(--fluig-primary)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o login
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Solicitar acesso"
      subtitle="Preencha o formulario e aguarde a aprovacao do administrador."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Nome completo <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => update("nome", e.target.value)}
              placeholder="Seu nome"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              E-mail corporativo <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="nome@empresa.com"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Empresa <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={form.empresa}
              onChange={(e) => update("empresa", e.target.value)}
              placeholder="Nome da empresa"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Cargo</label>
            <input
              type="text"
              value={form.cargo}
              onChange={(e) => update("cargo", e.target.value)}
              placeholder="Ex: Gerente Comercial"
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">Telefone / WhatsApp</label>
          <input
            type="tel"
            value={form.telefone}
            onChange={(e) => update("telefone", e.target.value)}
            placeholder="(11) 99999-9999"
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Por que deseja acesso?{" "}
            <span className="text-muted-foreground font-normal">(opcional)</span>
          </label>
          <textarea
            value={form.mensagem}
            onChange={(e) => update("mensagem", e.target.value)}
            placeholder="Descreva brevemente o motivo..."
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ backgroundColor: "var(--fluig-primary)" }}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
          ) : (
            <><UserPlus className="w-4 h-4" /> Enviar Solicitacao</>
          )}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Ja tem acesso?{" "}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: "var(--fluig-primary)" }}>
            Fazer login
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
