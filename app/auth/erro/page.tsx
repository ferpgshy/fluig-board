import Link from "next/link"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function AuthErroPage() {
  return (
    <AuthLayout
      title="Erro de autenticacao"
      subtitle="Ocorreu um problema ao processar sua solicitacao."
    >
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4 py-4">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-full"
            style={{ backgroundColor: "rgba(220, 38, 38, 0.1)" }}
          >
            <AlertTriangle className="w-7 h-7" style={{ color: "var(--fluig-danger)" }} />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-foreground font-medium">
              Nao foi possivel completar a autenticacao.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O link pode ter expirado ou ja ter sido utilizado. Tente fazer login novamente ou solicite um novo link.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: "var(--fluig-primary)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o login
          </Link>
          <Link
            href="/esqueci-senha"
            className="flex items-center justify-center gap-2 w-full rounded-lg px-4 py-2.5 text-sm font-medium text-foreground border border-border bg-card hover:bg-muted transition-colors"
          >
            Solicitar novo link
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
