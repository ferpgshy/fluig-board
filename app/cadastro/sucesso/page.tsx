"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { CheckCircle, Mail, ArrowLeft } from "lucide-react"
import { AuthLayout } from "@/components/auth/auth-layout"

function SucessoContent() {
  const params = useSearchParams()
  const email = params.get("email") || ""

  return (
    <AuthLayout
      title="Conta criada com sucesso"
      subtitle="Enviamos um e-mail de confirmacao para voce."
    >
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4 py-4">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-full"
            style={{ backgroundColor: "rgba(0, 168, 168, 0.12)" }}
          >
            <CheckCircle className="w-7 h-7" style={{ color: "var(--fluig-success)" }} />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-foreground font-medium">
              Enviamos um link de confirmacao para:
            </p>
            {email && (
              <p className="text-sm font-semibold" style={{ color: "var(--fluig-primary)" }}>
                {email}
              </p>
            )}
            <p className="text-xs text-muted-foreground leading-relaxed">
              Clique no link enviado por e-mail para ativar sua conta.
              Caso nao encontre, verifique a pasta de spam.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
            <Mail className="w-5 h-5 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">
              O link de confirmacao expira em 24 horas. Apos confirmar, voce sera redirecionado para a plataforma.
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: "var(--fluig-primary)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Ir para o login
        </Link>
      </div>
    </AuthLayout>
  )
}

export default function CadastroSucessoPage() {
  return (
    <Suspense>
      <SucessoContent />
    </Suspense>
  )
}
