"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Loader2, CheckCircle } from "lucide-react"
import { AuthLayout } from "@/components/auth/auth-layout"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function RedefinirSenhaPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("A nova senha deve ter no minimo 6 caracteres.")
      return
    }
    if (password !== confirmPassword) {
      setError("As senhas nao coincidem.")
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        throw new Error(updateError.message)
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/app")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao redefinir senha")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout
        title="Senha redefinida"
        subtitle="Sua senha foi alterada com sucesso."
      >
        <div className="flex flex-col items-center gap-4 py-6">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-full"
            style={{ backgroundColor: "rgba(0, 168, 168, 0.12)" }}
          >
            <CheckCircle className="w-7 h-7" style={{ color: "var(--fluig-success)" }} />
          </div>
          <p className="text-sm text-muted-foreground">Redirecionando para a plataforma...</p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Redefinir senha"
      subtitle="Escolha uma nova senha para sua conta."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="px-4 py-3 rounded-lg text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            Nova senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="Minimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 pr-11 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
            Confirmar nova senha
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="Repita a nova senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <p className="text-xs" style={{ color: "var(--fluig-danger)" }}>As senhas nao coincidem.</p>
          )}
        </div>

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
            <Lock className="w-4 h-4" />
          )}
          {loading ? "Salvando..." : "Salvar nova senha"}
        </button>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm font-semibold hover:underline pt-1"
          style={{ color: "var(--fluig-primary)" }}
        >
          Voltar para o login
        </Link>
      </form>
    </AuthLayout>
  )
}
