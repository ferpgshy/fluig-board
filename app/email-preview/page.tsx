"use client"

import { useState } from "react"
import { resetPasswordEmailTemplate, welcomeEmailTemplate } from "@/lib/email-templates"

const TEMPLATES = {
  reset: {
    label: "Recuperacao de Senha",
    html: resetPasswordEmailTemplate({
      nome: "Fernando Garcia",
      resetLink: "https://fluigboard.com.br/redefinir-senha?token=exemplo123",
      expiry: "1 hora",
    }),
  },
  welcome: {
    label: "Boas-vindas (Aprovacao)",
    html: welcomeEmailTemplate({
      nome: "Joao Silva",
      email: "joao.silva@empresa.com.br",
      senhaTemp: "Fluig@ABC123!",
      loginLink: "https://fluigboard.com.br/login",
    }),
  },
}

export default function EmailPreviewPage() {
  const [active, setActive] = useState<keyof typeof TEMPLATES>("reset")

  return (
    <div className="min-h-screen bg-muted">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Preview de E-mails</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">DEV</span>
        </div>
        <div className="flex items-center gap-2">
          {(Object.keys(TEMPLATES) as Array<keyof typeof TEMPLATES>).map((key) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                active === key
                  ? "bg-[#0077b6] text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {TEMPLATES[key].label}
            </button>
          ))}
        </div>
      </div>

      {/* Email preview */}
      <div className="max-w-2xl mx-auto py-10 px-4">
        {/* Mock email client header */}
        <div className="bg-white rounded-t-xl border border-border border-b-0 px-6 py-4 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground w-10">De:</span>
            <span className="text-sm text-foreground">Fluig Board &lt;noreply@fluigboard.com.br&gt;</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground w-10">Para:</span>
            <span className="text-sm text-foreground">fernando.garcia2505@hotmail.com</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-border mt-1">
            <span className="text-xs font-semibold text-muted-foreground w-10">Assunto:</span>
            <span className="text-sm font-semibold text-foreground">
              {active === "reset"
                ? "Redefinir sua senha — Fluig Board"
                : "Bem-vindo ao Fluig Board — Suas credenciais de acesso"}
            </span>
          </div>
        </div>

        {/* Email body */}
        <div
          className="bg-white border border-border rounded-b-xl overflow-hidden"
          dangerouslySetInnerHTML={{ __html: TEMPLATES[active].html }}
        />
      </div>
    </div>
  )
}
