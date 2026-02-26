"use client"

/* ─── Documentação Técnica — JSX puro (sem markdown) ─── */

const S = {
  h1: "text-2xl font-bold mt-8 mb-4 pb-2 border-b-2 border-[#0077b6] text-[#0099a0]",
  h2: "text-xl font-bold mt-8 mb-3 pb-1.5 border-b border-border text-[#0099a0]",
  h3: "text-base font-semibold mt-6 mb-2",
  h4: "text-sm font-semibold mt-4 mb-1",
  p: "my-2 text-sm leading-relaxed",
  ul: "my-2 pl-6 list-disc text-sm space-y-1",
  ol: "my-2 pl-6 list-decimal text-sm space-y-1",
  bq: "my-4 px-4 py-3 border-l-4 border-[#0077b6] bg-muted rounded-r-lg text-sm",
  table: "w-full text-xs border-collapse my-4",
  th: "px-3 py-2 text-left font-semibold border-b-2 border-border bg-muted",
  td: "px-3 py-2 border-b border-border align-top",
  code: "text-xs font-mono px-1 py-0.5 rounded bg-muted text-[#0077b6]",
  pre: "my-4 p-4 rounded-lg bg-muted border border-border overflow-x-auto text-xs font-mono whitespace-pre leading-relaxed",
  hr: "my-8 border-t border-border",
} as const

export function ManualTecnica() {
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      <h1 className={S.h1}>Fluig Board — Documentação Técnica</h1>
      <p className={S.p}><strong>Guia de Desenvolvimento e Manutenção</strong><br />Versão 1.0 — Fevereiro 2026</p>

      <hr className={S.hr} />

      {/* ── 1. Visão Geral da Arquitetura ── */}
      <h2 className={S.h2} id="arquitetura">1. Visão Geral da Arquitetura</h2>
      <pre className={S.pre}>{`┌──────────────────────────────────────────────────────────────────┐
│  Browser (Client)                                                │
│  ┌───────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Landing Page  │  │  Auth Pages      │  │  /app (SPA)      │  │
│  │  (SSR + CSR)   │  │  (SSR + CSR)     │  │  (100% CSR)      │  │
│  └───────────────┘  └──────────────────┘  └────────┬─────────┘  │
│                                                     │            │
│                                        ┌────────────▼──────────┐ │
│                                        │  Zustand Store        │ │
│                                        │  (optimistic updates) │ │
│                                        └────────────┬──────────┘ │
│                                                     │            │
│                           ┌─────────────────────────┤            │
│                           │  Supabase Realtime       │            │
│                           │  (postgres_changes)      │            │
│                           └──────────────────────────┘            │
└───────────────────────────────┬──────────────────────────────────┘
                                │ fetch() / REST
┌───────────────────────────────▼──────────────────────────────────┐
│  Server (Vercel Serverless Functions)                             │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  Next.js API Routes (app/api/**)                         │     │
│  └────────────────────────────┬────────────────────────────┘     │
│  ┌────────────────────────────▼────────────────────────────┐     │
│  │  Supabase Clients (Server + Admin)                       │     │
│  └─────────────────────────────────────────────────────────┘     │
└───────────────────────────────┬──────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────┐
│  Supabase: Auth (GoTrue) + PostgreSQL (6 tabelas RLS) + Realtime │
└──────────────────────────────────────────────────────────────────┘`}</pre>

      <h3 className={S.h3}>Padrões Arquiteturais</h3>
      <table className={S.table}>
        <thead><tr><th className={S.th}>Padrão</th><th className={S.th}>Onde</th><th className={S.th}>Descrição</th></tr></thead>
        <tbody>
          <tr><td className={S.td}><strong>Optimistic Updates</strong></td><td className={S.td}>Zustand Store</td><td className={S.td}>Aplica mudanças locais imediatamente, chama API, faz rollback se falhar</td></tr>
          <tr><td className={S.td}><strong>Atomic Dedup</strong></td><td className={S.td}>Realtime Sync</td><td className={S.td}>Verifica existência dentro do setState callback (atômico)</td></tr>
          <tr><td className={S.td}><strong>Hidratação via API</strong></td><td className={S.td}>useInitStore</td><td className={S.td}>4 fetches paralelos ao montar o AppShell</td></tr>
          <tr><td className={S.td}><strong>Server-side Auth</strong></td><td className={S.td}>Middleware + API</td><td className={S.td}>Sessão via cookies HttpOnly renovada automaticamente</td></tr>
        </tbody>
      </table>

      <hr className={S.hr} />

      {/* ── 2. Stack ── */}
      <h2 className={S.h2} id="stack">2. Stack Tecnológica</h2>

      <h3 className={S.h3}>Core</h3>
      <table className={S.table}>
        <thead><tr><th className={S.th}>Tecnologia</th><th className={S.th}>Versão</th><th className={S.th}>Propósito</th></tr></thead>
        <tbody>
          <tr><td className={S.td}><strong>Next.js</strong> (App Router)</td><td className={S.td}>16.1.6</td><td className={S.td}>Framework full-stack (SSR + API Routes)</td></tr>
          <tr><td className={S.td}><strong>React</strong></td><td className={S.td}>19.2</td><td className={S.td}>UI runtime</td></tr>
          <tr><td className={S.td}><strong>TypeScript</strong></td><td className={S.td}>5.7</td><td className={S.td}>Tipagem estática</td></tr>
          <tr><td className={S.td}><strong>Zustand</strong></td><td className={S.td}>5.0</td><td className={S.td}>Estado global client-side</td></tr>
          <tr><td className={S.td}><strong>Supabase</strong></td><td className={S.td}>2.49</td><td className={S.td}>Auth + PostgreSQL + Realtime</td></tr>
        </tbody>
      </table>

      <h3 className={S.h3}>UI / Estilização</h3>
      <table className={S.table}>
        <thead><tr><th className={S.th}>Tecnologia</th><th className={S.th}>Propósito</th></tr></thead>
        <tbody>
          <tr><td className={S.td}>Tailwind CSS 4.2</td><td className={S.td}>Utility-first CSS</td></tr>
          <tr><td className={S.td}>shadcn/ui (57 componentes, new-york)</td><td className={S.td}>Componentes acessíveis (Radix UI)</td></tr>
          <tr><td className={S.td}>Lucide React 0.564</td><td className={S.td}>Ícones SVG</td></tr>
          <tr><td className={S.td}>Recharts 2.15</td><td className={S.td}>Gráficos (BarChart, Funnel)</td></tr>
        </tbody>
      </table>

      <h3 className={S.h3}>Funcionalidades</h3>
      <table className={S.table}>
        <thead><tr><th className={S.th}>Tecnologia</th><th className={S.th}>Propósito</th></tr></thead>
        <tbody>
          <tr><td className={S.td}>jsPDF 2.5</td><td className={S.td}>Geração de PDF client-side</td></tr>
          <tr><td className={S.td}>@dnd-kit 6.3</td><td className={S.td}>Drag & drop (pipeline kanban)</td></tr>
          <tr><td className={S.td}>React Hook Form 7.54</td><td className={S.td}>Formulários performáticos</td></tr>
          <tr><td className={S.td}>Zod 3.24</td><td className={S.td}>Validação de schemas</td></tr>
          <tr><td className={S.td}>date-fns 4.1</td><td className={S.td}>Manipulação de datas</td></tr>
          <tr><td className={S.td}>Sonner 1.7</td><td className={S.td}>Notificações toast</td></tr>
        </tbody>
      </table>

      <hr className={S.hr} />

      {/* ── 3. Configuração do Ambiente ── */}
      <h2 className={S.h2} id="setup">3. Configuração do Ambiente</h2>

      <h3 className={S.h3}>Pré-requisitos</h3>
      <ul className={S.ul}>
        <li>Node.js ≥ 18.x</li>
        <li>pnpm (<code className={S.code}>npm install -g pnpm</code>)</li>
        <li>Conta Supabase</li>
      </ul>

      <h3 className={S.h3}>Setup</h3>
      <pre className={S.pre}>{`# 1. Clonar
git clone https://github.com/ferpgshy/fluig-board.git
cd fluig-board

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local`}</pre>

      <h3 className={S.h3}>Variáveis de Ambiente</h3>
      <table className={S.table}>
        <thead><tr><th className={S.th}>Variável</th><th className={S.th}>Tipo</th><th className={S.th}>Descrição</th></tr></thead>
        <tbody>
          <tr><td className={S.td}><code className={S.code}>NEXT_PUBLIC_SUPABASE_URL</code></td><td className={S.td}>Pública</td><td className={S.td}>URL do projeto Supabase</td></tr>
          <tr><td className={S.td}><code className={S.code}>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></td><td className={S.td}>Pública</td><td className={S.td}>Chave anon (respeita RLS)</td></tr>
          <tr><td className={S.td}><code className={S.code}>SUPABASE_SERVICE_ROLE_KEY</code></td><td className={S.td}><strong>Secreta</strong></td><td className={S.td}>Chave service role (bypassa RLS)</td></tr>
        </tbody>
      </table>
      <div className={S.bq}>⚠️ <strong>NUNCA</strong> exponha SUPABASE_SERVICE_ROLE_KEY no client-side.</div>

      <h3 className={S.h3}>Scripts</h3>
      <pre className={S.pre}>{`pnpm dev        # Dev server (http://localhost:3000)
pnpm build      # Build de produção
pnpm start      # Servidor de produção
pnpm lint       # ESLint`}</pre>

      <hr className={S.hr} />

      {/* ── 4. Estrutura de Diretórios ── */}
      <h2 className={S.h2} id="diretorios">4. Estrutura de Diretórios</h2>
      <pre className={S.pre}>{`fluig-board/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (metadata, fonts, providers)
│   ├── page.tsx                  # Landing page (/)
│   ├── globals.css               # CSS global + design tokens Fluig
│   ├── login/page.tsx            # Autenticação
│   ├── cadastro/page.tsx         # Solicitação de acesso
│   ├── app/page.tsx              # ★ Aplicação principal (protegida)
│   ├── admin/page.tsx            # ★ Painel admin (protegido)
│   └── api/                      # ★ API Routes (15 endpoints)
│
├── components/
│   ├── fluig/                    # Componentes do app (shell, header, manual)
│   ├── landing/                  # 9 seções da landing page
│   ├── modules/                  # ★ 5 módulos (dashboard, contas, pipeline, roteiro, relatorio)
│   └── ui/                       # 57 componentes shadcn/ui
│
├── hooks/
│   ├── use-init-store.ts         # Hidratação Zustand (4 fetches paralelos)
│   ├── use-realtime-sync.ts      # Subscribe postgres_changes
│   ├── use-mobile.ts             # Detecção mobile
│   └── use-toast.ts              # Notificações toast
│
├── lib/
│   ├── models.ts                 # ★ Tipos, enums, funções de negócio
│   ├── store.ts                  # ★ Zustand store (optimistic CRUD)
│   ├── utils.ts                  # cn() - class merge
│   └── supabase/                 # 4 clientes Supabase
│
├── scripts/                      # SQL migrations + seed
├── docs/                         # Documentação
└── middleware.ts                  # Auth + proteção de rotas`}</pre>

      <hr className={S.hr} />

      {/* ── 5. Banco de Dados ── */}
      <h2 className={S.h2} id="banco">5. Banco de Dados (Supabase)</h2>

      <h3 className={S.h3}>5.1 Tabelas (6 total)</h3>

      <h4 className={S.h4}>profiles</h4>
      <p className={S.p}>Gerenciada automaticamente por trigger ao criar user no Auth.</p>
      <pre className={S.pre}>{`id uuid PK → auth.users | nome text | email text | empresa text
cargo text | avatar_url text | role text ('admin'|'user')
ativado boolean | telefone text | created_at | updated_at`}</pre>

      <h4 className={S.h4}>accounts</h4>
      <pre className={S.pre}>{`id uuid PK | user_id uuid FK→auth.users | nome text | segmento text | porte text
contato_nome | contato_cargo | contato_email | contato_whatsapp
esn_nome | esn_email | fluig_versao | fluig_modulos text[]
score_potencial (0-5) | score_maturidade (0-5) | score_dor (0-5)
score_risco_churn (0-5) | score_acesso (0-5) | score_total (0-25)
tier (A|B|C) | onda (1|2|3) | observacoes text
data_registro date | data_proxima_visita date | data_ultimo_contato date`}</pre>

      <h4 className={S.h4}>opportunities</h4>
      <pre className={S.pre}>{`id uuid PK | account_id FK→accounts | user_id FK→auth.users
estagio text | mrr_estimado numeric | mrr_fechado numeric | pacote_works text
data_contato | data_visita | data_proposta | data_fechamento
motivo_perda | proximo_passo | data_proximo_passo | responsavel`}</pre>

      <h4 className={S.h4}>visits</h4>
      <pre className={S.pre}>{`id uuid PK | opportunity_id FK | account_id FK | user_id FK
data_visita | modalidade | participantes_cliente
dx_processos_descritos | dx_processos_dores | dx_processos_impacto
dx_automacao_nivel | dx_automacao_gaps
dx_integracao_sistemas | dx_integracao_status
dx_governanca_problemas | dx_sponsor_engajamento
hipotese_works | escopo_preliminar | objeccoes_levantadas
proximo_passo_acordado | data_proximo_passo`}</pre>

      <h4 className={S.h4}>reports</h4>
      <pre className={S.pre}>{`id uuid PK | visit_id FK (nullable) | account_id FK | user_id FK
tipo ('Relatorio_Executivo'|'Proposta_Works') | titulo | contexto_cliente
dores_priorizadas | impacto_estimado | solucao_proposta | entregaveis
investimento_mrr numeric | prazo_implantacao
status ('Rascunho'|'Revisão'|'Enviado')`}</pre>

      <h4 className={S.h4}>access_requests</h4>
      <pre className={S.pre}>{`id uuid PK | nome | email | empresa | cargo | telefone | mensagem
status ('pendente'|'aprovado'|'recusado') | motivo_recusa
reviewed_by FK→profiles | reviewed_at`}</pre>

      <h3 className={S.h3}>5.2 Diagrama ER</h3>
      <pre className={S.pre}>{`auth.users
  ├──1:1──► profiles (role, ativado)
  └──1:N──► accounts
               ├──1:N──► opportunities (1 ativa por conta)
               │              └──1:N──► visits → 1:1 → reports
               └──1:N──► reports (direto, sem visita)

access_requests ── reviewed_by ──► profiles`}</pre>

      <h3 className={S.h3}>5.3 Realtime</h3>
      <p className={S.p}>Habilitado nas 4 tabelas: <code className={S.code}>accounts</code>, <code className={S.code}>opportunities</code>, <code className={S.code}>visits</code>, <code className={S.code}>reports</code>.</p>

      <hr className={S.hr} />

      {/* ── 6. Autenticação ── */}
      <h2 className={S.h2} id="auth">6. Autenticação e Autorização</h2>

      <h3 className={S.h3}>6.1 Fluxo</h3>
      <pre className={S.pre}>{`/login → signInWithPassword() → Supabase Auth → session cookie
  → GET /api/auth/check → verifica profile
    → /admin (admin) | /app (user) | /admin/setup (primeiro acesso)`}</pre>

      <h3 className={S.h3}>6.2 Supabase Clients</h3>
      <table className={S.table}>
        <thead><tr><th className={S.th}>Arquivo</th><th className={S.th}>Contexto</th><th className={S.th}>RLS</th><th className={S.th}>Uso</th></tr></thead>
        <tbody>
          <tr><td className={S.td}><code className={S.code}>lib/supabase/client.ts</code></td><td className={S.td}>Browser</td><td className={S.td}>✅</td><td className={S.td}>Login, realtime, sign out</td></tr>
          <tr><td className={S.td}><code className={S.code}>lib/supabase/server.ts</code></td><td className={S.td}>API Route</td><td className={S.td}>✅</td><td className={S.td}>CRUD com cookies de sessão</td></tr>
          <tr><td className={S.td}><code className={S.code}>lib/supabase/admin.ts</code></td><td className={S.td}>API Route</td><td className={S.td}>❌ Bypass</td><td className={S.td}>Admin routes, auth check</td></tr>
          <tr><td className={S.td}><code className={S.code}>lib/supabase/middleware.ts</code></td><td className={S.td}>Middleware</td><td className={S.td}>✅</td><td className={S.td}>Renovação automática de sessão</td></tr>
        </tbody>
      </table>

      <h3 className={S.h3}>6.3 Roles e Permissões</h3>
      <table className={S.table}>
        <thead><tr><th className={S.th}>Role</th><th className={S.th}>/app</th><th className={S.th}>/admin</th><th className={S.th}>Criar users</th><th className={S.th}>Aprovar solicitações</th></tr></thead>
        <tbody>
          <tr><td className={S.td}><code className={S.code}>user</code></td><td className={S.td}>✅</td><td className={S.td}>❌</td><td className={S.td}>❌</td><td className={S.td}>❌</td></tr>
          <tr><td className={S.td}><code className={S.code}>admin</code></td><td className={S.td}>✅</td><td className={S.td}>✅</td><td className={S.td}>✅</td><td className={S.td}>✅</td></tr>
        </tbody>
      </table>

      <h3 className={S.h3}>6.4 Fluxo de Cadastro</h3>
      <pre className={S.pre}>{`Visitante → POST /api/access-requests → status: pendente
  → Admin revisa
    → Aprovado: cria user Auth + profile + envia senha temporária
    → Recusado: motivo salvo`}</pre>

      <hr className={S.hr} />

      {/* ── 7. Zustand Store ── */}
      <h2 className={S.h2} id="zustand">7. Estado Global (Zustand Store)</h2>

      <h3 className={S.h3}>7.1 Estrutura do Estado</h3>
      <pre className={S.pre}>{`interface AppState {
  accounts: Account[]
  opportunities: Opportunity[]
  visits: Visit[]
  reports: ReportDraft[]
  loading: boolean
  initialized: boolean

  // Hidratação
  hydrate: (data) => void

  // CRUD Account / Opportunity / Visit / Report
  add___: (data) => Promise<Entity | null>
  update___: (id, data) => Promise<void>
  delete___: (id) => Promise<void>

  // Pipeline
  moveOpportunityStage: (id, newStage, extra?) => Promise<boolean>
  advanceReportStatus: (id) => Promise<void>
}`}</pre>

      <h3 className={S.h3}>7.2 Padrão de Optimistic Update</h3>
      <pre className={S.pre}>{`updateAccount: async (id, data) => {
  const existing = get().accounts.find(a => a.id === id)

  // 1. OPTIMISTIC: aplica mudança imediatamente
  set(s => ({ accounts: s.accounts.map(a => a.id === id ? { ...a, ...data } : a) }))

  // 2. PERSIST: chama API
  const res = await fetch(\`/api/accounts/\${id}\`, { method: "PATCH", body: JSON.stringify(data) })

  // 3. ROLLBACK se falhar
  if (!res.ok) set(s => ({ accounts: s.accounts.map(a => a.id === id ? existing : a) }))
  // 4. SYNC: substitui com dados do servidor
  else { const { account } = await res.json(); set(s => ({ accounts: s.accounts.map(a => a.id === id ? account : a) })) }
}`}</pre>

      <h3 className={S.h3}>7.3 Hidratação</h3>
      <pre className={S.pre}>{`// hooks/use-init-store.ts — 4 fetches paralelos ao montar
const [accountsRes, oppsRes, visitsRes, reportsRes] = await Promise.all([
  fetch("/api/accounts"), fetch("/api/opportunities"),
  fetch("/api/visits"), fetch("/api/reports"),
])
hydrate({ accounts, opportunities, visits, reports })`}</pre>

      <hr className={S.hr} />

      {/* ── 8. API Routes ── */}
      <h2 className={S.h2} id="api">8. API Routes</h2>

      <h3 className={S.h3}>Convenções</h3>
      <ul className={S.ul}>
        <li>Todas verificam autenticação via <code className={S.code}>supabase.auth.getUser()</code></li>
        <li>Rotas admin verificam <code className={S.code}>profile.role === &apos;admin&apos;</code></li>
        <li>Resposta: <code className={S.code}>{`{ entityName: data }`}</code> ou <code className={S.code}>{`{ error: "msg" }`}</code></li>
        <li>Status: 200 OK, 201 Created, 401 Unauthorized, 409 Conflict, 500 Error</li>
      </ul>

      <h3 className={S.h3}>Endpoints</h3>
      <table className={S.table}>
        <thead><tr><th className={S.th}>Método</th><th className={S.th}>Rota</th><th className={S.th}>Auth</th><th className={S.th}>Descrição</th></tr></thead>
        <tbody>
          <tr><td className={S.td}>GET</td><td className={S.td}><code className={S.code}>/api/auth/check</code></td><td className={S.td}>✅</td><td className={S.td}>Verifica profile, retorna rota redirect</td></tr>
          <tr><td className={S.td}>GET</td><td className={S.td}><code className={S.code}>/api/profile</code></td><td className={S.td}>✅</td><td className={S.td}>Retorna profile do user logado</td></tr>
          <tr><td className={S.td}>GET/POST</td><td className={S.td}><code className={S.code}>/api/accounts</code></td><td className={S.td}>✅</td><td className={S.td}>Lista / Cria (calcula score/tier/onda)</td></tr>
          <tr><td className={S.td}>PATCH/DEL</td><td className={S.td}><code className={S.code}>/api/accounts/:id</code></td><td className={S.td}>✅</td><td className={S.td}>Atualiza / Exclui</td></tr>
          <tr><td className={S.td}>GET/POST</td><td className={S.td}><code className={S.code}>/api/opportunities</code></td><td className={S.td}>✅</td><td className={S.td}>Lista / Cria (409 se já existe ativa)</td></tr>
          <tr><td className={S.td}>PATCH/DEL</td><td className={S.td}><code className={S.code}>/api/opportunities/:id</code></td><td className={S.td}>✅</td><td className={S.td}>Atualiza / Exclui</td></tr>
          <tr><td className={S.td}>GET/POST</td><td className={S.td}><code className={S.code}>/api/visits</code></td><td className={S.td}>✅</td><td className={S.td}>Lista / Cria</td></tr>
          <tr><td className={S.td}>PATCH/DEL</td><td className={S.td}><code className={S.code}>/api/visits/:id</code></td><td className={S.td}>✅</td><td className={S.td}>Atualiza / Exclui (+ reports associados)</td></tr>
          <tr><td className={S.td}>GET/POST</td><td className={S.td}><code className={S.code}>/api/reports</code></td><td className={S.td}>✅</td><td className={S.td}>Lista / Cria (409 se rascunho existe)</td></tr>
          <tr><td className={S.td}>PATCH/DEL</td><td className={S.td}><code className={S.code}>/api/reports/:id</code></td><td className={S.td}>✅</td><td className={S.td}>Atualiza/avança status / Exclui</td></tr>
          <tr><td className={S.td}>POST</td><td className={S.td}><code className={S.code}>/api/access-requests</code></td><td className={S.td}>❌</td><td className={S.td}>Cria solicitação (público)</td></tr>
          <tr><td className={S.td}>GET</td><td className={S.td}><code className={S.code}>/api/access-requests</code></td><td className={S.td}>🔐</td><td className={S.td}>Lista todas (admin)</td></tr>
          <tr><td className={S.td}>PATCH</td><td className={S.td}><code className={S.code}>/api/access-requests/:id</code></td><td className={S.td}>🔐</td><td className={S.td}>Aprova/recusa (admin)</td></tr>
          <tr><td className={S.td}>GET/POST/PATCH</td><td className={S.td}><code className={S.code}>/api/admin/users</code></td><td className={S.td}>🔐</td><td className={S.td}>Lista / Cria / Ativa-desativa (admin)</td></tr>
          <tr><td className={S.td}>POST</td><td className={S.td}><code className={S.code}>/api/admin/setup</code></td><td className={S.td}>✅</td><td className={S.td}>Ativa admin no primeiro acesso</td></tr>
        </tbody>
      </table>

      <hr className={S.hr} />

      {/* ── 9. Realtime ── */}
      <h2 className={S.h2} id="realtime">9. Realtime Sync</h2>

      <h3 className={S.h3}>9.1 Funcionamento</h3>
      <p className={S.p}>O hook <code className={S.code}>use-realtime-sync.ts</code> se inscreve em <code className={S.code}>postgres_changes</code> para as 4 tabelas (INSERT/UPDATE/DELETE).</p>

      <h3 className={S.h3}>9.2 Deduplicação Atômica</h3>
      <pre className={S.pre}>{`// ❌ ERRADO (race condition)
const exists = store().accounts.some(a => a.id === newAccount.id)
if (!exists) setState(s => ({ accounts: [newAccount, ...s.accounts] }))

// ✅ CORRETO (check atômico dentro do setState)
setState((s) => {
  if (s.accounts.some(a => a.id === newAccount.id)) return s
  return { accounts: [newAccount, ...s.accounts] }
})`}</pre>
      <p className={S.p}>O <code className={S.code}>setState</code> do Zustand é síncrono. Ao colocar o check dentro do callback, garantimos atomicidade.</p>

      <h3 className={S.h3}>9.3 Eventos</h3>
      <table className={S.table}>
        <thead><tr><th className={S.th}>Evento</th><th className={S.th}>Ação</th></tr></thead>
        <tbody>
          <tr><td className={S.td}><strong>INSERT</strong></td><td className={S.td}>Adiciona ao state se não existir (dedup atômico)</td></tr>
          <tr><td className={S.td}><strong>UPDATE</strong></td><td className={S.td}>Substitui o item pelo payload atualizado</td></tr>
          <tr><td className={S.td}><strong>DELETE</strong></td><td className={S.td}>Remove do state pelo id do payload.old</td></tr>
        </tbody>
      </table>

      <hr className={S.hr} />

      {/* ── 10. Modelos ── */}
      <h2 className={S.h2} id="modelos">10. Modelos de Dados</h2>

      <h3 className={S.h3}>10.1 Tipos e Enums</h3>
      <pre className={S.pre}>{`type Segmento = "Agroindústria" | "Construção e Projetos" | "Distribuição" | "Educação"
              | "Logística" | "Manufatura" | "Saúde" | "Serviços" | "Setor Público" | "Varejo"
type Porte = "PME" | "Mid-Market" | "Enterprise"
type Tier = "A" | "B" | "C"
type Onda = 1 | 2 | 3
type OppStage = "selecionado" | "contato" | "visita_agendada" | "visita_realizada"
              | "diagnostico" | "proposta" | "negociacao" | "works_fechado" | "perdido"
type ReportStatus = "Rascunho" | "Revisão" | "Enviado"`}</pre>

      <h3 className={S.h3}>10.2 Funções de Negócio</h3>
      <table className={S.table}>
        <thead><tr><th className={S.th}>Função</th><th className={S.th}>Descrição</th></tr></thead>
        <tbody>
          <tr><td className={S.td}><code className={S.code}>calcScoreTotal(a)</code></td><td className={S.td}>Soma das 5 dimensões (0-25)</td></tr>
          <tr><td className={S.td}><code className={S.code}>calcTier(score)</code></td><td className={S.td}>≥20=A, ≥12=B, {"<12"}=C</td></tr>
          <tr><td className={S.td}><code className={S.code}>calcOnda(tier)</code></td><td className={S.td}>A→1, B→2, C→3</td></tr>
          <tr><td className={S.td}><code className={S.code}>calcAgingDias(updatedAt)</code></td><td className={S.td}>Dias desde última atualização</td></tr>
          <tr><td className={S.td}><code className={S.code}>isOppActive(estagio)</code></td><td className={S.td}>Estágio ≠ works_fechado e ≠ perdido</td></tr>
          <tr><td className={S.td}><code className={S.code}>canAdvanceStage(from, to)</code></td><td className={S.td}>Próximo estágio válido</td></tr>
        </tbody>
      </table>

      <h3 className={S.h3}>10.3 Score Dimensions</h3>
      <table className={S.table}>
        <thead><tr><th className={S.th}>Key</th><th className={S.th}>Label</th><th className={S.th}>0</th><th className={S.th}>5</th></tr></thead>
        <tbody>
          <tr><td className={S.td}><code className={S.code}>score_potencial</code></td><td className={S.td}>Potencial de Expansão</td><td className={S.td}>Nenhum</td><td className={S.td}>Muito alto</td></tr>
          <tr><td className={S.td}><code className={S.code}>score_maturidade</code></td><td className={S.td}>Maturidade de Uso</td><td className={S.td}>Inexistente</td><td className={S.td}>Referência</td></tr>
          <tr><td className={S.td}><code className={S.code}>score_dor</code></td><td className={S.td}>Intensidade de Dores</td><td className={S.td}>Nenhuma</td><td className={S.td}>Crítica</td></tr>
          <tr><td className={S.td}><code className={S.code}>score_risco_churn</code></td><td className={S.td}>Risco de Churn</td><td className={S.td}>Nenhum</td><td className={S.td}>Crítico</td></tr>
          <tr><td className={S.td}><code className={S.code}>score_acesso</code></td><td className={S.td}>Acesso ao Sponsor</td><td className={S.td}>Bloqueado</td><td className={S.td}>Direto</td></tr>
        </tbody>
      </table>

      <hr className={S.hr} />

      {/* ── 11. Componentes ── */}
      <h2 className={S.h2} id="componentes">11. Componentes e Módulos</h2>

      <h3 className={S.h3}>Hierarquia</h3>
      <pre className={S.pre}>{`app/app/page.tsx
  └── AppShell
        ├── Header (logo, tabs de módulos, menu user)
        ├── useInitStore()     ← hidratação
        ├── useRealtimeSync()  ← realtime
        └── <main>
            ├── DashboardModule   (tab: "dashboard")
            ├── ContasModule      (tab: "contas")
            ├── PipelineModule    (tab: "pipeline")
            ├── RoteiroModule     (tab: "roteiro")
            └── RelatorioModule   (tab: "relatorio")`}</pre>

      <h3 className={S.h3}>Módulos</h3>
      <table className={S.table}>
        <thead><tr><th className={S.th}>Módulo</th><th className={S.th}>Arquivo</th><th className={S.th}>Features</th></tr></thead>
        <tbody>
          <tr><td className={S.td}>Dashboard</td><td className={S.td}><code className={S.code}>dashboard.tsx</code></td><td className={S.td}>7 KPIs semáforo, filtro temporal, 2 gráficos Recharts</td></tr>
          <tr><td className={S.td}>Contas</td><td className={S.td}><code className={S.code}>contas.tsx</code></td><td className={S.td}>CRUD, scoring 5D sliders, modal drawer, CSV export</td></tr>
          <tr><td className={S.td}>Pipeline</td><td className={S.td}><code className={S.code}>pipeline.tsx</code></td><td className={S.td}>Kanban DnD, vista lista, modais won/lost, PDF/CSV</td></tr>
          <tr><td className={S.td}>Roteiro</td><td className={S.td}><code className={S.code}>roteiro.tsx</code></td><td className={S.td}>Wizard 6 etapas, auto-save 30s, geração relatório</td></tr>
          <tr><td className={S.td}>Relatório</td><td className={S.td}><code className={S.code}>relatorio.tsx</code></td><td className={S.td}>Edição inline, fluxo aprovação, PDF/CSV export</td></tr>
        </tbody>
      </table>

      <hr className={S.hr} />

      {/* ── 12. Design System ── */}
      <h2 className={S.h2} id="design">12. Design System e Tokens</h2>

      <h3 className={S.h3}>Tokens Fluig</h3>
      <pre className={S.pre}>{`:root {
  --fluig-primary: #0077b6;     /* Azul principal */
  --fluig-secondary: #00a8a8;   /* Teal secundário */
  --fluig-title: #0099a0;       /* Títulos de seção */
  --fluig-success: #4caf50;     /* Verde */
  --fluig-danger: #f44336;      /* Vermelho */
  --fluig-info: #2196f3;        /* Azul informativo */
  --fluig-readonly: #f0f0f0;    /* Background readonly */
}`}</pre>

      <hr className={S.hr} />

      {/* ── 13. Fluxos ── */}
      <h2 className={S.h2} id="fluxos">13. Fluxos de Negócio</h2>

      <h3 className={S.h3}>13.1 Ciclo de Vida</h3>
      <pre className={S.pre}>{`1. Criar Conta → Score 5D → Tier/Onda → Oportunidade automática
2. Pipeline → Mover estágios (drag & drop) → Registrar MRR
3. Roteiro → Wizard 6 etapas → Auto-save → Gera rascunho relatório
4. Relatório → Editar → Rascunho → Revisão → Enviado → PDF
5. Fechar/Perder → Won (MRR fechado) | Lost (motivo)`}</pre>

      <h3 className={S.h3}>13.2 Regras de Scoring</h3>
      <pre className={S.pre}>{`Score Total = sum(potencial, maturidade, dor, risco_churn, acesso) = 0-25
  Tier A = ≥ 20 → Onda 1 (ação imediata)
  Tier B = ≥ 12 → Onda 2 (próximo ciclo)
  Tier C = < 12 → Onda 3 (nurturing)`}</pre>

      <h3 className={S.h3}>13.3 Regras de Pipeline</h3>
      <ul className={S.ul}>
        <li>1 oportunidade ativa por conta (API retorna 409)</li>
        <li>Avanço: só para estágios posteriores na ordem</li>
        <li>Retrocesso: só para o imediatamente anterior</li>
        <li>Perdido: pode ir de qualquer estágio ativo</li>
        <li>Works Fechado / Perdido: estágios finais (imutáveis)</li>
      </ul>

      <h3 className={S.h3}>13.4 KPIs e Alertas</h3>
      <table className={S.table}>
        <thead><tr><th className={S.th}>KPI</th><th className={S.th}>Verde</th><th className={S.th}>Vermelho</th></tr></thead>
        <tbody>
          <tr><td className={S.td}>MRR Pipeline</td><td className={S.td}>≥ R$ 45k</td><td className={S.td}>{"< R$ 45k"}</td></tr>
          <tr><td className={S.td}>MRR Fechado</td><td className={S.td}>≥ R$ 30k</td><td className={S.td}>{"< R$ 30k"}</td></tr>
          <tr><td className={S.td}>Taxa Visita→Proposta</td><td className={S.td}>≥ 50%</td><td className={S.td}>{"< 50%"}</td></tr>
          <tr><td className={S.td}>Taxa Proposta→Fech.</td><td className={S.td}>≥ 33%</td><td className={S.td}>{"< 33%"}</td></tr>
          <tr><td className={S.td}>Aging Médio</td><td className={S.td}>≤ 7d</td><td className={S.td}>{"> 7d"}</td></tr>
          <tr><td className={S.td}>Sem Próximo Passo</td><td className={S.td}>≤ 5</td><td className={S.td}>{"> 5"}</td></tr>
        </tbody>
      </table>

      <hr className={S.hr} />

      {/* ── 14. Deploy ── */}
      <h2 className={S.h2} id="deploy">14. Deploy</h2>
      <ol className={S.ol}>
        <li>Importe o repositório no Vercel</li>
        <li>Configure as 3 variáveis de ambiente (<code className={S.code}>SUPABASE_URL</code>, <code className={S.code}>ANON_KEY</code>, <code className={S.code}>SERVICE_ROLE_KEY</code>)</li>
        <li>Deploy automático a cada push na branch <code className={S.code}>main</code></li>
      </ol>

      <hr className={S.hr} />

      {/* ── 15. Troubleshooting ── */}
      <h2 className={S.h2} id="troubleshooting">15. Troubleshooting</h2>
      <table className={S.table}>
        <thead><tr><th className={S.th}>Problema</th><th className={S.th}>Causa</th><th className={S.th}>Solução</th></tr></thead>
        <tbody>
          <tr><td className={S.td}>Itens duplicados</td><td className={S.td}>Race condition fetch vs realtime</td><td className={S.td}>Corrigido com dedup atômico. F5 se persistir.</td></tr>
          <tr><td className={S.td}>Erro 401</td><td className={S.td}>Sessão expirada</td><td className={S.td}>Logout + login novamente</td></tr>
          <tr><td className={S.td}>Erro 409</td><td className={S.td}>Opp ativa já existe</td><td className={S.td}>Feche ou perca a opp existente</td></tr>
          <tr><td className={S.td}>Campos novos não aparecem</td><td className={S.td}>Coluna não existe no Supabase</td><td className={S.td}>Execute ALTER TABLE no SQL Editor</td></tr>
          <tr><td className={S.td}>Realtime não funciona</td><td className={S.td}>Tabela não está na publication</td><td className={S.td}><code className={S.code}>ALTER PUBLICATION supabase_realtime ADD TABLE ...</code></td></tr>
        </tbody>
      </table>

      <hr className={S.hr} />

      {/* ── 16. Convenções ── */}
      <h2 className={S.h2} id="convencoes">16. Convenções de Código</h2>
      <table className={S.table}>
        <thead><tr><th className={S.th}>Tipo</th><th className={S.th}>Padrão</th><th className={S.th}>Exemplo</th></tr></thead>
        <tbody>
          <tr><td className={S.td}>Commits</td><td className={S.td}>Conventional Commits</td><td className={S.td}><code className={S.code}>feat: nova funcionalidade</code></td></tr>
          <tr><td className={S.td}>Componentes</td><td className={S.td}>kebab-case.tsx</td><td className={S.td}><code className={S.code}>app-shell.tsx</code></td></tr>
          <tr><td className={S.td}>Hooks</td><td className={S.td}>use-kebab-case.ts</td><td className={S.td}><code className={S.code}>use-init-store.ts</code></td></tr>
          <tr><td className={S.td}>Interfaces</td><td className={S.td}>PascalCase</td><td className={S.td}><code className={S.code}>Account</code>, <code className={S.code}>Opportunity</code></td></tr>
          <tr><td className={S.td}>Funções</td><td className={S.td}>camelCase</td><td className={S.td}><code className={S.code}>calcScoreTotal</code></td></tr>
          <tr><td className={S.td}>Constantes</td><td className={S.td}>UPPER_SNAKE_CASE</td><td className={S.td}><code className={S.code}>OPP_STAGE_ORDER</code></td></tr>
          <tr><td className={S.td}>CSS</td><td className={S.td}>Tailwind utility-first</td><td className={S.td}>Mobile-first com <code className={S.code}>sm:</code>, <code className={S.code}>md:</code>, <code className={S.code}>lg:</code></td></tr>
        </tbody>
      </table>

      <hr className={S.hr} />

      <p className="text-center text-xs text-muted-foreground mt-8">
        <strong>Fluig Board</strong> — Documentação Técnica v1.0<br />
        Última atualização: Fevereiro 2026
      </p>
    </div>
  )
}
