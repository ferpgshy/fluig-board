"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import { AuthLayout } from "@/components/auth/auth-layout"
import { createClient } from "@/lib/supabase/client"

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      })

      if (resetError) {
        throw new Error(resetError.message)
      }

      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar e-mail de recuperacao")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title={sent ? "E-mail enviado" : "Recuperar senha"}
      subtitle={
        sent
          ? "Verifique sua caixa de entrada para redefinir sua senha."
          : "Informe seu e-mail e enviaremos um link para redefinir sua senha."
      }
    >
      {sent ? (
        <div className="space-y-6">
          {/* Success state */}
          <div className="flex flex-col items-center gap-4 py-4">
            <div
              className="flex items-center justify-center w-14 h-14 rounded-full"
              style={{ backgroundColor: "var(--fluig-success)", opacity: 0.15 }}
            >
              <CheckCircle className="w-7 h-7" style={{ color: "var(--fluig-success)" }} />
            </div>
            <div className="text-center space-y-1.5">
              <p className="text-sm text-foreground font-medium">
                Enviamos as instrucoes para <strong>{email}</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Caso nao encontre o e-mail, verifique a pasta de spam.
              </p>
            </div>
          </div>

          {/* Resend */}
          <button
            type="button"
            onClick={() => {
              setSent(false)
              setEmail("")
            }}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-foreground border border-border bg-card hover:bg-muted transition-colors"
          >
            <Mail className="w-4 h-4" />
            Enviar novamente
          </button>

          {/* Back to login */}
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: "var(--fluig-primary)" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para o login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="px-4 py-3 rounded-lg text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="voce@empresa.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: "var(--fluig-primary)" }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#005f8f")}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = "var(--fluig-primary)")}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            {loading ? "Enviando..." : "Enviar link de recuperacao"}
          </button>

          {/* Back to login */}
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm font-semibold hover:underline pt-1"
            style={{ color: "var(--fluig-primary)" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para o login
          </Link>
        </form>
      )}
    </AuthLayout>
  )
}
