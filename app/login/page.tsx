"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react"
import { AuthLayout } from "@/components/auth/auth-layout"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          throw new Error("E-mail ou senha incorretos.")
        }
        if (authError.message.includes("Email not confirmed")) {
          throw new Error("Confirme seu e-mail antes de fazer login.")
        }
        throw new Error(authError.message)
      }

      // Verificar profile para redirecionar corretamente
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, ativado")
          .eq("id", user.id)
          .single()

        if (profile?.role === "admin" && !profile.ativado) {
          router.push("/admin/setup")
          router.refresh()
          return
        }

        if (profile?.role === "admin") {
          router.push("/admin")
          router.refresh()
          return
        }

        if (!profile?.ativado) {
          await supabase.auth.signOut()
          throw new Error("Sua conta ainda nao foi ativada. Entre em contato com o administrador.")
        }
      }

      router.push("/app")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Entrar na plataforma"
      subtitle="Insira suas credenciais para acessar o Fluig Board."
    >
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

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Senha
            </label>
            <Link
              href="/esqueci-senha"
              className="text-xs font-medium hover:underline"
              style={{ color: "var(--fluig-primary)" }}
            >
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="Digite sua senha"
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
            <LogIn className="w-4 h-4" />
          )}
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-xs text-muted-foreground">ou</span>
          </div>
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-muted-foreground">
          {"Ainda nao tem conta? "}
          <Link
            href="/cadastro"
            className="font-semibold hover:underline"
            style={{ color: "var(--fluig-primary)" }}
          >
            Criar conta
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
