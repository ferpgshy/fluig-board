import Link from "next/link"
import { Orbit, ArrowLeft, Shield } from "lucide-react"

export const metadata = {
  title: "Politica de Privacidade | Fluig | Ação Comercial",
  description: "Saiba como o Fluig | Ação Comercial coleta, usa e protege seus dados pessoais.",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-foreground mb-4">{title}</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">{children}</div>
    </section>
  )
}

export default function PrivacidadePage() {
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
          <div className="mb-12">
            <div className="flex items-center gap-2 text-[#0077b6] text-sm font-semibold uppercase tracking-wider mb-4">
              <Shield className="w-4 h-4" />
              Privacidade e Dados
            </div>
            <h1 className="text-4xl font-bold text-foreground text-balance mb-4">
              Politica de Privacidade
            </h1>
            <p className="text-muted-foreground text-sm">
              Ultima atualizacao: <strong className="text-foreground">24 de fevereiro de 2025</strong>
            </p>
          </div>

          <div className="prose-none">
            <Section title="1. Quem somos">
              <p>
                O <strong className="text-foreground">Fluig | Ação Comercial</strong> e uma plataforma de gestao comercial desenvolvida para equipes de vendas e consultoria Fluig. Neste documento, "nos", "nosso" ou "Fluig | Ação Comercial" referem-se ao responsavel pelo tratamento dos seus dados pessoais.
              </p>
              <p>
                Em caso de duvidas, entre em contato: <a href="mailto:privacidade@fluigboard.com.br" className="text-[#0077b6] hover:underline">privacidade@fluigboard.com.br</a>
              </p>
            </Section>

            <Section title="2. Dados que coletamos">
              <p>Coletamos apenas os dados necessarios para o funcionamento da plataforma:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong className="text-foreground">Dados de conta:</strong> nome, e-mail, empresa e cargo, fornecidos no cadastro.</li>
                <li><strong className="text-foreground">Dados de uso:</strong> registros de contas, oportunidades, visitas e relatorios criados dentro da plataforma.</li>
                <li><strong className="text-foreground">Dados tecnnicos:</strong> endere IP, tipo de navegador e logs de acesso para fins de seguranca.</li>
                <li><strong className="text-foreground">Cookies de sessao:</strong> necessarios para manter voce autenticado na plataforma.</li>
              </ul>
            </Section>

            <Section title="3. Como usamos seus dados">
              <p>Seus dados sao utilizados exclusivamente para:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Fornecer e operar os servicos da plataforma Fluig Board.</li>
                <li>Autenticar seu acesso com seguranca.</li>
                <li>Armazenar suas informacoes comerciais (contas, pipeline, visitas).</li>
                <li>Enviar comunicacoes relacionadas ao servico, como notificacoes de acesso.</li>
                <li>Melhorar a plataforma com base em dados de uso anonimizados.</li>
              </ul>
              <p>Nao vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins comerciais.</p>
            </Section>

            <Section title="4. Compartilhamento de dados">
              <p>Seus dados podem ser compartilhados apenas com:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong className="text-foreground">Supabase:</strong> nosso provedor de banco de dados e autenticacao, localizado nos EUA, com conformidade SOC 2 Tipo II.</li>
                <li><strong className="text-foreground">Vercel:</strong> nosso provedor de hospedagem e infraestrutura.</li>
                <li><strong className="text-foreground">Autoridades legais:</strong> quando exigido por lei ou ordem judicial.</li>
              </ul>
            </Section>

            <Section title="5. Retencao de dados">
              <p>
                Mantemos seus dados pelo periodo em que sua conta estiver ativa. Apos o encerramento da conta, os dados sao excluidos em ate <strong className="text-foreground">30 dias</strong>, salvo obrigacao legal de retencao.
              </p>
            </Section>

            <Section title="6. Seus direitos (LGPD)">
              <p>De acordo com a Lei Geral de Protecao de Dados (Lei 13.709/2018), voce tem direito a:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Acessar os dados pessoais que armazenamos sobre voce.</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
                <li>Solicitar a anonimizacao, bloqueio ou eliminacao de dados desnecessarios.</li>
                <li>Solicitar a portabilidade dos seus dados.</li>
                <li>Revogar o consentimento para tratamento de dados a qualquer momento.</li>
                <li>Solicitar a exclusao completa da sua conta e dados.</li>
              </ul>
              <p>
                Para exercer seus direitos, envie um e-mail para{" "}
                <a href="mailto:privacidade@fluigboard.com.br" className="text-[#0077b6] hover:underline">
                  privacidade@fluigboard.com.br
                </a>
                . Respondemos em ate 15 dias uteis.
              </p>
            </Section>

            <Section title="7. Seguranca">
              <p>
                Adotamos medidas tecnicas e administrativas para proteger seus dados, incluindo criptografia em transito (TLS), criptografia em repouso, autenticacao segura com Supabase Auth e controle de acesso por Row Level Security (RLS) no banco de dados.
              </p>
            </Section>

            <Section title="8. Cookies">
              <p>
                Utilizamos apenas cookies essenciais para autenticacao e manutencao da sessao. Nao utilizamos cookies de rastreamento ou publicidade.
              </p>
            </Section>

            <Section title="9. Alteracoes nesta politica">
              <p>
                Podemos atualizar esta politica periodicamente. Em caso de mudancas relevantes, notificaremos os usuarios por e-mail com pelo menos 15 dias de antecedencia. O uso continuado da plataforma apos a notificacao implica aceitacao das alteracoes.
              </p>
            </Section>

            <Section title="10. Contato">
              <p>
                Para questoes sobre privacidade e protecao de dados:{" "}
                <a href="mailto:privacidade@fluigboard.com.br" className="text-[#0077b6] hover:underline">
                  privacidade@fluigboard.com.br
                </a>
              </p>
            </Section>
          </div>

          {/* Footer da pagina */}
          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Fluig | Ação Comercial — CNPJ: 00.000.000/0001-00
            </p>
            <div className="flex items-center gap-4">
              <Link href="/contato" className="text-xs text-[#0077b6] hover:underline">
                Falar com a equipe
              </Link>
              <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Pagina inicial
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
