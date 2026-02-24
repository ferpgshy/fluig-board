"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, UserPlus, Loader2 } from "lucide-react"
import { AuthLayout } from "@/components/auth/auth-layout"
import { createClient } from "@/lib/supabase/client"

export default function CadastroPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    nome: "",
    email: "",
    empresa: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (form.password.length < 6) {
      setError("A senha deve ter no minimo 6 caracteres.")
      return
    }
    if (form.password !== form.confirmPassword) {
      setError("As senhas nao coincidem.")
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/app`,
          data: {
            nome: form.nome,
            empresa: form.empresa,
          },
        },
      })

      if (authError) {
        if (authError.message.includes("already registered")) {
          throw new Error("Este e-mail ja esta cadastrado.")
        }
        throw new Error(authError.message)
      }

      router.push("/cadastro/sucesso?email=" + encodeURIComponent(form.email))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Criar sua conta"
      subtitle="Preencha os dados abaixo para comecar a usar o Fluig Board."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="px-4 py-3 rounded-lg text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {/* Nome */}
        <div className="space-y-1.5">
          <label htmlFor="nome" className="block text-sm font-medium text-foreground">
            Nome completo
          </label>
          <input
            id="nome"
            type="text"
            required
            autoComplete="name"
            placeholder="Seu nome"
            value={form.nome}
            onChange={(e) => update("nome", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            E-mail corporativo
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="voce@empresa.com.br"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
        </div>

        {/* Empresa */}
        <div className="space-y-1.5">
          <label htmlFor="empresa" className="block text-sm font-medium text-foreground">
            Empresa
          </label>
          <input
            id="empresa"
            type="text"
            required
            placeholder="Nome da sua empresa"
            value={form.empresa}
            onChange={(e) => update("empresa", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="Minimo 6 caracteres"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
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
          {/* Strength indicator */}
          {form.password.length > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 flex gap-1">
                {[1, 2, 3, 4].map((level) => {
                  const strength =
                    form.password.length >= 12 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) && /[^a-zA-Z0-9]/.test(form.password) ? 4
                    : form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) ? 3
                    : form.password.length >= 6 ? 2 : 1
                  const colors = ["var(--fluig-danger)", "var(--fluig-danger)", "#f59e0b", "var(--fluig-success)"]
                  return (
                    <div
                      key={level}
                      className="h-1 flex-1 rounded-full transition-colors"
                      style={{
                        backgroundColor: level <= strength ? colors[strength - 1] : "var(--border)",
                      }}
                    />
                  )
                })}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {form.password.length < 6 ? "Fraca" : form.password.length < 8 ? "Razoavel" : form.password.length < 12 ? "Boa" : "Forte"}
              </span>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
            Confirmar senha
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="Repita a senha"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
          {form.confirmPassword.length > 0 && form.password !== form.confirmPassword && (
            <p className="text-xs" style={{ color: "var(--fluig-danger)" }}>As senhas nao coincidem.</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 mt-2"
          style={{ backgroundColor: "var(--fluig-primary)" }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#005f8f")}
          onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = "var(--fluig-primary)")}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          {loading ? "Criando conta..." : "Criar conta"}
        </button>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground pt-1">
          {"Ja tem uma conta? "}
          <Link
            href="/login"
            className="font-semibold hover:underline"
            style={{ color: "var(--fluig-primary)" }}
          >
            Fazer login
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
