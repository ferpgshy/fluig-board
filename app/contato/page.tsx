import Link from "next/link"
import { Orbit, Mail, MessageSquare, Clock, ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Contato | Fluig | Ação Comercial",
  description: "Entre em contato com a equipe Fluig | Ação Comercial. Estamos prontos para ajudar.",
}

export default function ContatoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header simples */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0077b6]">
              <Orbit className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">Fluig | Ação Comercial</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-[#0077b6] text-sm font-semibold uppercase tracking-wider mb-4">
              <MessageSquare className="w-4 h-4" />
              Fale Conosco
            </span>
            <h1 className="text-4xl font-bold text-foreground text-balance mb-4">
              Como podemos ajudar?
            </h1>
            <p className="text-lg text-muted-foreground text-pretty max-w-xl mx-auto">
              Nossa equipe esta disponivel para responder suas duvidas, suporte tecnico e solicitacoes comerciais.
            </p>
          </div>

          {/* Cards de contato */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
            <a
              href="mailto:contato@fluigboard.com.br"
              className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border hover:border-[#0077b6]/40 hover:bg-[#0077b6]/5 transition-all group"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#0077b6]/10 group-hover:bg-[#0077b6]/20 transition-colors">
                <Mail className="w-6 h-6 text-[#0077b6]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground mb-1">E-mail Geral</p>
                <p className="text-xs text-muted-foreground">contato@fluigboard.com.br</p>
              </div>
            </a>

            <a
              href="mailto:suporte@fluigboard.com.br"
              className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border hover:border-[#0077b6]/40 hover:bg-[#0077b6]/5 transition-all group"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#0077b6]/10 group-hover:bg-[#0077b6]/20 transition-colors">
                <MessageSquare className="w-6 h-6 text-[#0077b6]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground mb-1">Suporte Tecnico</p>
                <p className="text-xs text-muted-foreground">suporte@fluigboard.com.br</p>
              </div>
            </a>

            <div className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#0077b6]/10">
                <Clock className="w-6 h-6 text-[#0077b6]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground mb-1">Horario de Atendimento</p>
                <p className="text-xs text-muted-foreground">Seg–Sex, 9h–18h (BRT)</p>
              </div>
            </div>
          </div>

          {/* Formulario de contato */}
          <div className="rounded-2xl border border-border p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Enviar mensagem</h2>
            <form
              action="mailto:contato@fluigboard.com.br"
              method="GET"
              encType="text/plain"
              className="space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground" htmlFor="nome">
                    Nome completo
                  </label>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    required
                    placeholder="Seu nome"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0077b6]/30 focus:border-[#0077b6]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground" htmlFor="email">
                    E-mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="seu@email.com"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0077b6]/30 focus:border-[#0077b6]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="assunto">
                  Assunto
                </label>
                <select
                  id="assunto"
                  name="assunto"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#0077b6]/30 focus:border-[#0077b6]"
                >
                  <option value="Duvida comercial">Duvida comercial</option>
                  <option value="Suporte tecnico">Suporte tecnico</option>
                  <option value="Solicitar demonstracao">Solicitar demonstracao</option>
                  <option value="Parceria">Parceria</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="mensagem">
                  Mensagem
                </label>
                <textarea
                  id="mensagem"
                  name="body"
                  required
                  rows={5}
                  placeholder="Descreva sua duvida ou solicitacao..."
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0077b6]/30 focus:border-[#0077b6] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold bg-[#0077b6] text-white hover:bg-[#0077b6]/90 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Enviar mensagem
              </button>

              <p className="text-xs text-muted-foreground text-center">
                Respondemos em ate 1 dia util. Para urgencias, use o e-mail diretamente.
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
