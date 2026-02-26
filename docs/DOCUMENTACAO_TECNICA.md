<p align="center">
  <img src="../public/icon-index.png" alt="Fluig Board" width="60" />
</p>

<h1 align="center">Fluig Board — Documentação Técnica</h1>

<p align="center">
  <strong>Guia de Desenvolvimento e Manutenção</strong><br />
  Versão 1.0 — Fevereiro 2026
</p>

---

## Sumário

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Configuração do Ambiente](#3-configuração-do-ambiente)
4. [Estrutura de Diretórios](#4-estrutura-de-diretórios)
5. [Banco de Dados (Supabase)](#5-banco-de-dados-supabase)
6. [Autenticação e Autorização](#6-autenticação-e-autorização)
7. [Estado Global (Zustand Store)](#7-estado-global-zustand-store)
8. [API Routes](#8-api-routes)
9. [Realtime Sync](#9-realtime-sync)
10. [Modelos de Dados](#10-modelos-de-dados)
11. [Componentes e Módulos](#11-componentes-e-módulos)
12. [Design System e Tokens](#12-design-system-e-tokens)
13. [Fluxos de Negócio](#13-fluxos-de-negócio)
14. [Deploy e CI/CD](#14-deploy-e-cicd)
15. [Troubleshooting](#15-troubleshooting)
16. [Convenções de Código](#16-convenções-de-código)

---

## 1. Visão Geral da Arquitetura

```
┌──────────────────────────────────────────────────────────────────┐
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
│  │  - Auth check, CRUD accounts/opps/visits/reports         │     │
│  │  - Admin routes (users, access-requests, setup, seed)    │     │
│  └────────────────────────────┬────────────────────────────┘     │
│                               │                                   │
│  ┌────────────────────────────▼────────────────────────────┐     │
│  │  Supabase Clients                                        │     │
│  │  ├── Server Client (cookies, respeita RLS)               │     │
│  │  └── Admin Client (service_role, bypassa RLS)            │     │
│  └─────────────────────────────────────────────────────────┘     │
└───────────────────────────────┬──────────────────────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────┐
│  Supabase                                                        │
│  ├── Auth (GoTrue) — email/password, session management          │
│  ├── PostgreSQL — 6 tabelas com RLS                              │
│  ├── Realtime — postgres_changes (INSERT/UPDATE/DELETE)           │
│  └── Storage (não utilizado atualmente)                          │
└──────────────────────────────────────────────────────────────────┘
```

### Padrões Arquiteturais

| Padrão | Onde é usado | Descrição |
|--------|-------------|-----------|
| **Optimistic Updates** | Zustand Store | Aplica mudanças locais imediatamente, chama API, faz rollback se falhar |
| **Atomic Deduplication** | Realtime Sync | Verifica existência dentro do `setState` callback (atômico) para evitar race conditions |
| **Hidratação via API** | `useInitStore` | 4 fetches paralelos ao montar o AppShell |
| **Server-side Auth** | Middleware + API Routes | Sessão via cookies HttpOnly renovada automaticamente |
| **Split-screen Auth** | Auth Layout | Layout com branding à esquerda e formulário à direita |

---

## 2. Stack Tecnológica

### Core

| Tecnologia | Versão | Propósito |
|-----------|--------|-----------|
| **Next.js** (App Router) | 16.1.6 | Framework full-stack (SSR + API Routes) |
| **React** | 19.2 | UI runtime |
| **TypeScript** | 5.7 | Tipagem estática |
| **Zustand** | 5.0 | Estado global client-side |
| **Supabase** | 2.49 | Auth + PostgreSQL + Realtime |

### UI / Estilização

| Tecnologia | Versão | Propósito |
|-----------|--------|-----------|
| **Tailwind CSS** | 4.2 | Utility-first CSS |
| **shadcn/ui** | — | 57 componentes (estilo `new-york`) |
| **Radix UI** | — | Primitivos acessíveis (base do shadcn) |
| **Lucide React** | 0.564 | Ícones SVG |
| **Recharts** | 2.15 | Gráficos (BarChart, Funnel) |
| **next-themes** | — | Light/dark mode |

### Funcionalidades

| Tecnologia | Versão | Propósito |
|-----------|--------|-----------|
| **jsPDF** | 2.5 | Geração de PDF client-side |
| **@dnd-kit** | 6.3 | Drag & drop (pipeline kanban) |
| **React Hook Form** | 7.54 | Formulários performáticos |
| **Zod** | 3.24 | Validação de schemas |
| **date-fns** | 4.1 | Manipulação de datas |
| **Sonner** | 1.7 | Notificações toast |

### Build / Infra

| Tecnologia | Propósito |
|-----------|-----------|
| **pnpm** | Package manager |
| **Vercel** | Deploy (serverless) |
| **Vercel Analytics** | Analytics de uso |
| **PostCSS** | Processamento CSS |

---

## 3. Configuração do Ambiente

### Pré-requisitos

- Node.js ≥ 18.x
- pnpm (`npm install -g pnpm`)
- Conta Supabase (https://supabase.com)

### Setup

```bash
# 1. Clonar
git clone https://github.com/ferpgshy/fluig-board.git
cd fluig-board

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
```

### Variáveis de Ambiente

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

| Variável | Tipo | Onde é usada | Descrição |
|----------|------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | Client + Server | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública | Client + Server | Chave anon (respeita RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secreta** | Somente Server | Chave service role (**bypassa RLS**) |

> ⚠️ **NUNCA** exponha `SUPABASE_SERVICE_ROLE_KEY` no client-side.

### Scripts

```bash
pnpm dev        # Dev server (http://localhost:3000)
pnpm build      # Build de produção
pnpm start      # Servidor de produção
pnpm lint       # ESLint
```

---

## 4. Estrutura de Diretórios

```
fluig-board/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (metadata, fonts, providers)
│   ├── page.tsx                  # Landing page (/)
│   ├── globals.css               # CSS global + design tokens Fluig
│   │
│   ├── login/page.tsx            # Autenticação
│   ├── cadastro/page.tsx         # Solicitação de acesso
│   │   └── sucesso/page.tsx
│   ├── esqueci-senha/page.tsx
│   ├── redefinir-senha/page.tsx
│   ├── auth/
│   │   ├── callback/route.ts     # OAuth callback
│   │   └── erro/page.tsx
│   │
│   ├── app/page.tsx              # ★ Aplicação principal (protegida)
│   ├── admin/page.tsx            # ★ Painel admin (protegido)
│   │   └── setup/page.tsx
│   ├── perfil/page.tsx
│   ├── contato/page.tsx
│   ├── privacidade/page.tsx
│   ├── seed/page.tsx
│   │
│   └── api/                      # ★ API Routes (15 endpoints)
│       ├── auth/check/route.ts
│       ├── profile/route.ts
│       ├── accounts/
│       │   ├── route.ts          # GET, POST
│       │   └── [id]/route.ts     # PATCH, DELETE
│       ├── opportunities/
│       │   ├── route.ts          # GET, POST
│       │   └── [id]/route.ts     # PATCH, DELETE
│       ├── visits/
│       │   ├── route.ts          # GET, POST
│       │   └── [id]/route.ts     # PATCH, DELETE
│       ├── reports/
│       │   ├── route.ts          # GET, POST
│       │   └── [id]/route.ts     # PATCH, DELETE
│       ├── access-requests/
│       │   ├── route.ts          # GET, POST
│       │   └── [id]/route.ts     # PATCH
│       └── admin/
│           ├── users/route.ts    # GET, POST, PATCH
│           ├── setup/route.ts    # POST
│           └── seed/route.ts     # POST
│
├── components/
│   ├── auth/
│   │   └── auth-layout.tsx       # Layout split-screen de auth
│   ├── fluig/
│   │   ├── app-shell.tsx         # Shell principal (nav, header, menu user)
│   │   ├── section-header.tsx    # Header reutilizável de seção
│   │   └── tier-badge.tsx        # Badge Tier A/B/C
│   ├── landing/                  # 9 seções da landing page
│   │   ├── navbar.tsx
│   │   ├── hero.tsx
│   │   ├── problema.tsx
│   │   ├── solucao.tsx
│   │   ├── diferenciais.tsx
│   │   ├── produto.tsx
│   │   ├── como-funciona.tsx
│   │   ├── cta.tsx
│   │   └── footer.tsx
│   ├── modules/                  # ★ 5 módulos da aplicação
│   │   ├── dashboard.tsx         # KPIs + gráficos Recharts
│   │   ├── contas.tsx            # CRM com scoring 5D
│   │   ├── pipeline.tsx          # Kanban + lista + PDF
│   │   ├── roteiro.tsx           # Wizard 6 etapas + auto-save
│   │   └── relatorio.tsx         # Edição inline + fluxo aprovação
│   ├── ui/                       # 57 componentes shadcn/ui
│   └── theme-provider.tsx
│
├── hooks/
│   ├── use-init-store.ts         # Hidratação do Zustand (4 fetches paralelos)
│   ├── use-realtime-sync.ts      # Subscribe postgres_changes (INSERT/UPDATE/DELETE)
│   ├── use-mobile.ts             # Detecção mobile (breakpoint 768px)
│   └── use-toast.ts              # Notificações toast
│
├── lib/
│   ├── models.ts                 # ★ Tipos, enums, funções de negócio
│   ├── store.ts                  # ★ Zustand store (optimistic CRUD)
│   ├── utils.ts                  # cn() - class merge utility
│   └── supabase/
│       ├── client.ts             # createBrowserClient()
│       ├── server.ts             # createServerClient() (cookies)
│       ├── admin.ts              # createClient() (service_role)
│       └── middleware.ts         # updateSession() (renova cookies)
│
├── scripts/
│   ├── all_database.sql          # Schema completo (referência)
│   ├── 001_create_profiles.sql   # Tabela profiles + RLS
│   ├── 002_profile_trigger.sql   # Trigger auto-create profile
│   ├── 003_enable_realtime.sql   # Habilita realtime
│   ├── 004_add_account_dates.sql # Colunas de data
│   └── seed-admin.mjs            # Script seed admin
│
├── docs/                         # Documentação
│   ├── GUIA_DO_USUARIO.md        # Manual do usuário (cliente)
│   └── DOCUMENTACAO_TECNICA.md   # Este arquivo
│
├── middleware.ts                  # Middleware global (auth + proteção)
├── next.config.mjs               # Config Next.js
├── tsconfig.json                 # Config TypeScript
├── components.json               # Config shadcn/ui
├── postcss.config.mjs            # PostCSS
├── package.json                  # Dependências
└── pnpm-lock.yaml                # Lock file
```

---

## 5. Banco de Dados (Supabase)

### 5.1 Tabelas

O projeto usa **6 tabelas** no Supabase PostgreSQL:

#### `profiles` (gerenciada automaticamente)
```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL,                              -- PK, FK → auth.users
  nome text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  empresa text NOT NULL DEFAULT '',
  cargo text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  role text NOT NULL DEFAULT 'user',             -- 'admin' | 'user'
  ativado boolean NOT NULL DEFAULT true,
  telefone text DEFAULT '',
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
```

#### `accounts`
```sql
CREATE TABLE public.accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,                         -- FK → auth.users
  nome text NOT NULL,
  segmento text NOT NULL DEFAULT 'Outro',
  porte text NOT NULL DEFAULT 'PME',
  contato_nome text NOT NULL DEFAULT '',
  contato_cargo text NOT NULL DEFAULT '',
  contato_email text NOT NULL DEFAULT '',
  contato_whatsapp text NOT NULL DEFAULT '',
  esn_nome text NOT NULL DEFAULT '',              -- Nome do ESN (parceiro)
  esn_email text NOT NULL DEFAULT '',             -- Email do ESN
  fluig_versao text NOT NULL DEFAULT '',
  fluig_modulos text[] NOT NULL DEFAULT '{}',
  score_potencial integer NOT NULL DEFAULT 0,     -- 0-5
  score_maturidade integer NOT NULL DEFAULT 0,    -- 0-5
  score_dor integer NOT NULL DEFAULT 0,           -- 0-5
  score_risco_churn integer NOT NULL DEFAULT 0,   -- 0-5
  score_acesso integer NOT NULL DEFAULT 0,        -- 0-5
  score_total integer NOT NULL DEFAULT 0,         -- 0-25 (calculado)
  tier text NOT NULL DEFAULT 'C',                 -- A | B | C
  onda integer NOT NULL DEFAULT 3,                -- 1 | 2 | 3
  observacoes text NOT NULL DEFAULT '',
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  data_registro date,
  data_proxima_visita date,
  data_ultimo_contato date,
  CONSTRAINT accounts_pkey PRIMARY KEY (id),
  CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

#### `opportunities`
```sql
CREATE TABLE public.opportunities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,                       -- FK → accounts
  user_id uuid NOT NULL,                          -- FK → auth.users
  estagio text NOT NULL DEFAULT 'selecionado',
  mrr_estimado numeric NOT NULL DEFAULT 0,
  mrr_fechado numeric NOT NULL DEFAULT 0,
  pacote_works text NOT NULL DEFAULT 'Essencial',
  data_contato text NOT NULL DEFAULT '',
  data_visita text NOT NULL DEFAULT '',
  data_proposta text NOT NULL DEFAULT '',
  data_fechamento text NOT NULL DEFAULT '',
  motivo_perda text NOT NULL DEFAULT '',
  proximo_passo text NOT NULL DEFAULT '',
  data_proximo_passo text NOT NULL DEFAULT '',
  responsavel text NOT NULL DEFAULT 'Camila',
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT opportunities_pkey PRIMARY KEY (id),
  CONSTRAINT opportunities_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id),
  CONSTRAINT opportunities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

#### `visits`
```sql
CREATE TABLE public.visits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL,                   -- FK → opportunities
  account_id uuid NOT NULL,                       -- FK → accounts
  user_id uuid NOT NULL,                          -- FK → auth.users
  data_visita text NOT NULL DEFAULT '',
  modalidade text NOT NULL DEFAULT 'Presencial',
  participantes_cliente text NOT NULL DEFAULT '',
  dx_processos_descritos text NOT NULL DEFAULT '',
  dx_processos_dores text NOT NULL DEFAULT '',
  dx_processos_impacto text NOT NULL DEFAULT '',
  dx_automacao_nivel text NOT NULL DEFAULT 'Nenhuma',
  dx_automacao_gaps text NOT NULL DEFAULT '',
  dx_integracao_sistemas text NOT NULL DEFAULT '',
  dx_integracao_status text NOT NULL DEFAULT '',
  dx_governanca_problemas text NOT NULL DEFAULT '',
  dx_sponsor_engajamento text NOT NULL DEFAULT 'Médio',
  hipotese_works text NOT NULL DEFAULT '',
  escopo_preliminar text NOT NULL DEFAULT '',
  objeccoes_levantadas text NOT NULL DEFAULT '',
  proximo_passo_acordado text NOT NULL DEFAULT '',
  data_proximo_passo text NOT NULL DEFAULT '',
  fotos_evidencias text[] NOT NULL DEFAULT '{}',
  criado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT visits_pkey PRIMARY KEY (id),
  CONSTRAINT visits_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(id),
  CONSTRAINT visits_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id),
  CONSTRAINT visits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

#### `reports`
```sql
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  visit_id uuid,                                  -- FK → visits (nullable)
  account_id uuid NOT NULL,                       -- FK → accounts
  user_id uuid NOT NULL,                          -- FK → auth.users
  tipo text NOT NULL DEFAULT 'Relatorio_Executivo',
  titulo text NOT NULL DEFAULT '',
  contexto_cliente text NOT NULL DEFAULT '',
  dores_priorizadas text NOT NULL DEFAULT '',
  impacto_estimado text NOT NULL DEFAULT '',
  solucao_proposta text NOT NULL DEFAULT '',
  entregaveis text NOT NULL DEFAULT '',
  investimento_mrr numeric NOT NULL DEFAULT 0,
  prazo_implantacao text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Rascunho',        -- Rascunho | Revisão | Enviado
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_visit_id_fkey FOREIGN KEY (visit_id) REFERENCES public.visits(id),
  CONSTRAINT reports_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id),
  CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

#### `access_requests`
```sql
CREATE TABLE public.access_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL,
  empresa text NOT NULL,
  cargo text DEFAULT '',
  telefone text DEFAULT '',
  mensagem text DEFAULT '',
  status text NOT NULL DEFAULT 'pendente',        -- pendente | aprovado | recusado
  motivo_recusa text DEFAULT '',
  reviewed_by uuid,                               -- FK → profiles
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT access_requests_pkey PRIMARY KEY (id),
  CONSTRAINT access_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id)
);
```

### 5.2 Diagrama ER

```
auth.users (Supabase Auth)
    │
    ├──1:1──► profiles (role, ativado)
    │
    └──1:N──► accounts
                 │
                 ├──1:N──► opportunities (1 ativa por conta)
                 │              │
                 │              └──1:N──► visits
                 │                           │
                 │                           └──1:1──► reports
                 │
                 └──1:N──► reports (direto, sem visita)

access_requests ──reviewed_by──► profiles
```

### 5.3 Triggers

```sql
-- Auto-update updated_at em profiles
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Auto-criar profile quando usuário se registra no Auth
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, empresa)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'empresa', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 5.4 Realtime

Habilitado nas 4 tabelas principais:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE opportunities;
ALTER PUBLICATION supabase_realtime ADD TABLE visits;
ALTER PUBLICATION supabase_realtime ADD TABLE reports;
```

### 5.5 Adicionando Novos Campos

Para adicionar um campo a uma tabela existente:

1. **SQL no Supabase** (SQL Editor):
```sql
ALTER TABLE public.nome_tabela
  ADD COLUMN IF NOT EXISTS novo_campo text NOT NULL DEFAULT '';
```

2. **Interface TypeScript** (`lib/models.ts`):
```typescript
export interface Account {
  // ... campos existentes
  novo_campo: string  // adicionar aqui
}
```

3. **Formulário** (componente do módulo):
   - Adicionar campo no `emptyForm()`
   - Adicionar no `openEdit()`
   - Adicionar input no JSX do formulário

4. **A API** não precisa de alteração — ela usa `...body` spread, então passará qualquer campo automaticamente.

---

## 6. Autenticação e Autorização

### 6.1 Fluxo Completo

```
┌──────────┐    signInWithPassword()    ┌───────────────┐
│  /login  │ ──────────────────────────►│ Supabase Auth │
│  (CSR)   │                            │               │
└──────────┘                            └───────┬───────┘
                                                │ session cookie
                                                ▼
┌──────────────────┐    GET /api/auth/check    ┌──────────────┐
│  Client redirect │ ◄────────────────────────│  Auth Check  │
│                  │                           │  (verifica   │
│  /admin (admin)  │                           │   profile)   │
│  /app   (user)   │                           └──────────────┘
│  /admin/setup    │
│  /login (erro)   │
└──────────────────┘
```

### 6.2 Supabase Clients

O projeto usa **4 clientes Supabase** diferentes conforme o contexto:

| Arquivo | Função Factory | Contexto | RLS | Uso |
|---------|---------------|----------|-----|-----|
| `lib/supabase/client.ts` | `createClient()` | Browser | ✅ Sim | Login, realtime, sign out |
| `lib/supabase/server.ts` | `createClient()` | API Route | ✅ Sim | CRUD com cookies de sessão |
| `lib/supabase/admin.ts` | `createClient()` | API Route | ❌ Bypass | Admin routes, auth check, criação de usuários |
| `lib/supabase/middleware.ts` | `updateSession()` | Middleware | ✅ Sim | Renovação automática de sessão |

### 6.3 Middleware

**Arquivo:** `middleware.ts`

```typescript
// Executa em toda request (exceto assets estáticos)
export async function middleware(request: NextRequest) {
  // 1. Renova cookie de sessão do Supabase Auth
  const response = await updateSession(request)

  // 2. Protege rotas /app e /admin
  if (pathname.startsWith("/app") || pathname.startsWith("/admin")) {
    // Redireciona para /login se não autenticado
  }

  return response
}
```

### 6.4 Roles e Permissões

| Role | Acesso a `/app` | Acesso a `/admin` | Pode criar usuários | Pode aprovar solicitações |
|------|:---------------:|:-----------------:|:------------------:|:------------------------:|
| `user` | ✅ | ❌ | ❌ | ❌ |
| `admin` | ✅ | ✅ | ✅ | ✅ |

### 6.5 Fluxo de Cadastro (Não é auto-registro)

```
Visitante → POST /api/access-requests → access_requests (status: pendente)
                                                │
                                        Admin revisa
                                                │
                                    ┌───────────┴───────────┐
                                    ▼                       ▼
                              Aprovado                  Recusado
                                    │                  (motivo salvo)
                                    ▼
                        1. Cria user no Supabase Auth
                           (senha temporária gerada)
                        2. Cria/atualiza profile
                           (role: 'user', ativado: true)
                        3. Senha enviada ao solicitante
```

---

## 7. Estado Global (Zustand Store)

**Arquivo:** `lib/store.ts`

### 7.1 Estrutura do Estado

```typescript
interface AppState {
  // Dados
  accounts: Account[]
  opportunities: Opportunity[]
  visits: Visit[]
  reports: ReportDraft[]

  // Flags
  loading: boolean
  initialized: boolean

  // Hidratação
  hydrate: (data) => void

  // CRUD Account
  addAccount: (data) => Promise<Account | null>
  updateAccount: (id, data) => Promise<void>
  deleteAccount: (id) => Promise<void>

  // CRUD Opportunity
  addOpportunity: (data) => Promise<string | null>
  updateOpportunity: (id, data) => Promise<void>
  moveOpportunityStage: (id, newStage, extra?) => Promise<boolean>
  deleteOpportunity: (id) => Promise<void>

  // CRUD Visit
  addVisit: (data) => Promise<string>
  updateVisit: (id, data) => Promise<void>
  deleteVisit: (id) => Promise<void>

  // CRUD Report
  addReport: (data) => Promise<string | null>
  updateReport: (id, data) => Promise<void>
  advanceReportStatus: (id) => Promise<void>
  deleteReport: (id) => Promise<void>
}
```

### 7.2 Padrão de Optimistic Update

Todas as operações de escrita seguem este padrão:

```typescript
updateAccount: async (id, data) => {
  const existing = get().accounts.find(a => a.id === id)

  // 1. OPTIMISTIC: aplica mudança imediatamente
  set(s => ({
    accounts: s.accounts.map(a => a.id === id ? { ...a, ...updates } : a)
  }))

  // 2. PERSIST: chama API
  const res = await fetch(`/api/accounts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates)
  })

  // 3. ROLLBACK se falhar
  if (!res.ok) {
    set(s => ({
      accounts: s.accounts.map(a => a.id === id ? existing : a)
    }))
  } else {
    // 4. SYNC: substitui com dados do servidor
    const { account } = await res.json()
    set(s => ({
      accounts: s.accounts.map(a => a.id === id ? account : a)
    }))
  }
}
```

### 7.3 Hidratação

**Arquivo:** `hooks/use-init-store.ts`

```typescript
// 4 fetches paralelos ao montar o AppShell
const [accountsRes, oppsRes, visitsRes, reportsRes] = await Promise.all([
  fetch("/api/accounts"),
  fetch("/api/opportunities"),
  fetch("/api/visits"),
  fetch("/api/reports"),
])

hydrate({
  accounts: accountsData.accounts ?? [],
  opportunities: oppsData.opportunities ?? [],
  visits: visitsData.visits ?? [],
  reports: reportsData.reports ?? [],
})
```

---

## 8. API Routes

### 8.1 Convenções

- Todas as rotas verificam autenticação: `supabase.auth.getUser()`
- Rotas admin verificam adicionalmente: `profile.role === 'admin'`
- Formato de resposta: `{ entityName: data }` ou `{ error: "message" }`
- Status codes: `200` (OK), `201` (Created), `401` (Unauthorized), `409` (Conflict), `500` (Error)

### 8.2 Endpoints Completos

#### Auth & Profile
| Método | Rota | Auth | Descrição |
|--------|------|:----:|-----------|
| GET | `/api/auth/check` | ✅ | Verifica profile e retorna rota de redirect |
| GET | `/api/profile` | ✅ | Retorna profile do user logado |

#### Accounts
| Método | Rota | Auth | Body | Descrição |
|--------|------|:----:|------|-----------|
| GET | `/api/accounts` | ✅ | — | Lista todas (order by score_total DESC) |
| POST | `/api/accounts` | ✅ | Account fields | Cria (calcula score/tier/onda) |
| PATCH | `/api/accounts/:id` | ✅ | Partial fields | Atualiza (recalcula se score mudou) |
| DELETE | `/api/accounts/:id` | ✅ | — | Exclui |

#### Opportunities
| Método | Rota | Auth | Body | Descrição |
|--------|------|:----:|------|-----------|
| GET | `/api/opportunities` | ✅ | — | Lista todas |
| POST | `/api/opportunities` | ✅ | Opp fields | Cria (409 se já existe ativa para conta) |
| PATCH | `/api/opportunities/:id` | ✅ | Partial fields | Atualiza |
| DELETE | `/api/opportunities/:id` | ✅ | — | Exclui |

#### Visits
| Método | Rota | Auth | Body | Descrição |
|--------|------|:----:|------|-----------|
| GET | `/api/visits` | ✅ | — | Lista todas |
| POST | `/api/visits` | ✅ | Visit fields | Cria |
| PATCH | `/api/visits/:id` | ✅ | Partial fields | Atualiza |
| DELETE | `/api/visits/:id` | ✅ | — | Exclui visita + reports associados |

#### Reports
| Método | Rota | Auth | Body | Descrição |
|--------|------|:----:|------|-----------|
| GET | `/api/reports` | ✅ | — | Lista todos |
| POST | `/api/reports` | ✅ | Report fields | Cria (409 se já existe rascunho para visita) |
| PATCH | `/api/reports/:id` | ✅ | Partial fields ou `{advance: true}` | Atualiza ou avança status |
| DELETE | `/api/reports/:id` | ✅ | — | Exclui |

#### Access Requests
| Método | Rota | Auth | Body | Descrição |
|--------|------|:----:|------|-----------|
| POST | `/api/access-requests` | ❌ | nome, email, empresa, etc. | Cria solicitação (público) |
| GET | `/api/access-requests` | 🔐 Admin | — | Lista todas |
| PATCH | `/api/access-requests/:id` | 🔐 Admin | `{action: 'approve'/'reject'}` | Aprova (cria user) ou recusa |

#### Admin
| Método | Rota | Auth | Body | Descrição |
|--------|------|:----:|------|-----------|
| GET | `/api/admin/users` | 🔐 Admin | — | Lista todos os profiles |
| POST | `/api/admin/users` | 🔐 Admin | nome, email, empresa | Cria user diretamente |
| PATCH | `/api/admin/users` | 🔐 Admin | `{userId, ativado}` | Ativa/desativa |
| POST | `/api/admin/setup` | ✅ | nome, empresa, telefone | Ativa admin no primeiro acesso |
| POST | `/api/admin/seed` | — | — | Seed do admin |

---

## 9. Realtime Sync

**Arquivo:** `hooks/use-realtime-sync.ts`

### 9.1 Funcionamento

O hook subscribe em `postgres_changes` para as 4 tabelas principais:

```typescript
const channel = supabase
  .channel("realtime-sync")
  .on("postgres_changes", { event: "INSERT", schema: "public", table: "accounts" }, handler)
  .on("postgres_changes", { event: "UPDATE", schema: "public", table: "accounts" }, handler)
  .on("postgres_changes", { event: "DELETE", schema: "public", table: "accounts" }, handler)
  // ... mesmo para opportunities, visits, reports
  .subscribe()
```

### 9.2 Deduplicação Atômica

Para evitar race conditions entre a resposta do fetch e o evento realtime INSERT:

```typescript
// ❌ ERRADO (race condition)
const exists = store().accounts.some(a => a.id === newAccount.id)
if (!exists) {
  setState(s => ({ accounts: [newAccount, ...s.accounts] }))
}

// ✅ CORRETO (check atômico dentro do setState)
setState((s) => {
  if (s.accounts.some(a => a.id === newAccount.id)) return s
  return { accounts: [newAccount, ...s.accounts] }
})
```

**Por que:** O `setState` do Zustand é síncrono. Ao colocar o check dentro do callback, garantimos que nenhuma outra operação modifica o state entre a verificação e a inserção.

### 9.3 Eventos Tratados

| Evento | Ação |
|--------|------|
| **INSERT** | Adiciona ao state se não existir (dedup atômico) |
| **UPDATE** | Substitui o item no state pelo payload atualizado |
| **DELETE** | Remove do state pelo `id` do `payload.old` |

---

## 10. Modelos de Dados

**Arquivo:** `lib/models.ts`

### 10.1 Tipos e Enums

```typescript
type Segmento = "Agroindústria" | "Construção e Projetos" | "Distribuição" | "Educação"
              | "Logística" | "Manufatura" | "Saúde" | "Serviços" | "Setor Público" | "Varejo"

type Porte = "PME" | "Mid-Market" | "Enterprise"
type Tier = "A" | "B" | "C"
type Onda = 1 | 2 | 3

type OppStage = "selecionado" | "contato" | "visita_agendada" | "visita_realizada"
              | "diagnostico" | "proposta" | "negociacao" | "works_fechado" | "perdido"

type PacoteWorks = "Essencial" | "Avançado" | "Premium" | "Personalizado"
type Responsavel = "Camila" | "Niésio" | "Dupla"
type Modalidade = "Presencial" | "Remota"
type AutomacaoNivel = "Nenhuma" | "Básica" | "Intermediária" | "Avançada"
type SponsorEngajamento = "Alto" | "Médio" | "Baixo"
type ReportTipo = "Relatorio_Executivo" | "Proposta_Works"
type ReportStatus = "Rascunho" | "Revisão" | "Enviado"
```

### 10.2 Funções de Negócio

```typescript
// Score total = soma das 5 dimensões (0-25)
calcScoreTotal(a) → number

// Tier: ≥20=A, ≥12=B, <12=C
calcTier(scoreTotal) → Tier

// Onda: A→1, B→2, C→3
calcOnda(tier) → Onda

// Dias desde última atualização
calcAgingDias(updatedAt) → number

// Opp ativa: estágio ≠ works_fechado e ≠ perdido
isOppActive(estagio) → boolean

// Pode avançar: próximo estágio na ordem (ou perdido de qualquer)
canAdvanceStage(from, to) → boolean

// Pode voltar: estágio anterior (não de perdido/fechado)
canRegressStage(from) → OppStage | null
```

### 10.3 Score Dimensions

| Key | Label | Níveis (0-5) |
|-----|-------|-------------|
| `score_potencial` | Potencial de Expansão | Nenhum → Muito baixo → Baixo → Médio → Alto → Muito alto |
| `score_maturidade` | Maturidade de Uso | Inexistente → Inicial → Básico → Intermediário → Avançado → Referência |
| `score_dor` | Intensidade de Dores | Nenhuma → Mínima → Leve → Moderada → Significativa → Crítica |
| `score_risco_churn` | Risco de Churn | Nenhum → Muito baixo → Baixo → Moderado → Alto → Crítico |
| `score_acesso` | Acesso ao Sponsor | Bloqueado → Muito difícil → Difícil → Razoável → Fácil → Direto |

---

## 11. Componentes e Módulos

### 11.1 Hierarquia de Componentes

```
app/app/page.tsx
  └── AppShell (components/fluig/app-shell.tsx)
        ├── Header (logo, tabs de módulos, menu user)
        ├── useInitStore()     ← hidratação
        ├── useRealtimeSync()  ← realtime
        └── <main>
            ├── DashboardModule   (tab: "dashboard")
            ├── ContasModule      (tab: "contas")
            ├── PipelineModule    (tab: "pipeline")
            ├── RoteiroModule     (tab: "roteiro")
            └── RelatorioModule   (tab: "relatorio")
```

### 11.2 Módulos

| Módulo | Arquivo | LOC | Features Principais |
|--------|---------|-----|---------------------|
| Dashboard | `dashboard.tsx` | ~350 | 7 KPIs semáforo, filtro temporal, 2 gráficos Recharts |
| Contas | `contas.tsx` | ~770 | CRUD, scoring 5D sliders, modal drawer, CSV export |
| Pipeline | `pipeline.tsx` | ~900+ | Kanban DnD, vista lista, modais won/lost, PDF/CSV export |
| Roteiro | `roteiro.tsx` | ~800+ | Wizard 6 etapas, auto-save 30s, geração relatório |
| Relatório | `relatorio.tsx` | ~600+ | Edição inline, fluxo aprovação, PDF/CSV export |

### 11.3 Componentes shadcn/ui

57 componentes pré-configurados em `components/ui/`. Para adicionar novos:

```bash
pnpm dlx shadcn@latest add nome-do-componente
```

Configuração em `components.json`:
- Estilo: `new-york`
- CSS vars: habilitado
- Alias de import: `@/components/ui`

---

## 12. Design System e Tokens

**Arquivo:** `app/globals.css`

### 12.1 Tokens Fluig

```css
:root {
  --fluig-primary: #0077b6;     /* Azul principal */
  --fluig-secondary: #00a8a8;   /* Teal secundário */
  --fluig-title: #0099a0;       /* Títulos de seção */
  --fluig-success: #4caf50;     /* Verde: sucesso/won */
  --fluig-danger: #f44336;      /* Vermelho: erro/perdido */
  --fluig-info: #2196f3;        /* Azul informativo */
  --fluig-readonly: #f0f0f0;    /* Background readonly */
}
```

### 12.2 Uso nos Componentes

```tsx
// Como variável CSS
<div style={{ background: "var(--fluig-primary)" }}>

// Como classe Tailwind customizada
<p className="text-fluig-title">Título</p>
<button className="bg-fluig-primary text-primary-foreground">Ação</button>
<span className="text-fluig-danger">Erro</span>
<span className="text-fluig-success">Sucesso</span>
```

### 12.3 Temas Light/Dark

O projeto usa `next-themes` com Tailwind. As cores base seguem as variáveis do shadcn/ui (`:root` para light, `.dark` para dark).

---

## 13. Fluxos de Negócio

### 13.1 Ciclo de Vida de uma Conta

```
1. Criar Conta (Contas → + Nova)
   └─► Score 5D calculado → Tier/Onda definidos
   └─► Oportunidade criada automaticamente (estágio inicial)

2. Gerenciar Pipeline (Pipeline → Kanban/Lista)
   └─► Mover entre estágios (drag & drop ou botões)
   └─► Registrar MRR estimado

3. Realizar Visita (Roteiro → Nova Visita)
   └─► Wizard 6 etapas com assessment
   └─► Auto-save 30s
   └─► Gera rascunho de relatório

4. Gerar Relatório (Relatórios)
   └─► Editar inline → Avançar status
   └─► Rascunho → Revisão → Enviado
   └─► Exportar PDF

5. Fechar/Perder (Pipeline)
   └─► Won: informar MRR fechado
   └─► Lost: informar motivo
```

### 13.2 Regras de Scoring

```
Score Total = score_potencial + score_maturidade + score_dor + score_risco_churn + score_acesso
            = (0-5) + (0-5) + (0-5) + (0-5) + (0-5)
            = 0 a 25

Tier:
  A = Score ≥ 20   (top priority)
  B = Score ≥ 12   (medium priority)
  C = Score < 12   (low priority)

Onda:
  1 = Tier A   (ação imediata)
  2 = Tier B   (próximo ciclo)
  3 = Tier C   (nurturing)
```

### 13.3 Regras de Pipeline

- **1 oportunidade ativa por conta** (API retorna 409 se tentar criar segunda)
- **Avanço**: só para estágios posteriores na ordem
- **Retrocesso**: só para o estágio imediatamente anterior
- **Perdido**: pode ir de qualquer estágio ativo
- **Works Fechado / Perdido**: são estágios finais (não podem ser alterados)

### 13.4 KPIs e Alertas

| KPI | Cálculo | Verde | Amarelo | Vermelho |
|-----|---------|-------|---------|----------|
| MRR Pipeline | Soma MRR estimado de opps ativas | ≥ R$ 45k | — | < R$ 45k |
| MRR Fechado | Soma MRR fechado (works_fechado) | ≥ R$ 30k | — | < R$ 30k |
| Taxa Visita→Proposta | % visita_realizada que chegaram a proposta | ≥ 50% | — | < 50% |
| Taxa Proposta→Fech. | % proposta que chegaram a works_fechado | ≥ 33% | — | < 33% |
| Aging Médio | Média de dias sem atualização | ≤ 7d | — | > 7d |
| Sem Próximo Passo | Contas ativas sem proximo_passo | ≤ 5 | — | > 5 |

---

## 14. Deploy e CI/CD

### 14.1 Vercel (Recomendado)

1. Importe o repositório no [Vercel](https://vercel.com)
2. Configure as 3 variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy automático a cada push na branch `main`

### 14.2 Configuração Next.js

```javascript
// next.config.mjs
const nextConfig = {
  typescript: { ignoreBuildErrors: true },  // ignora erros TS no build
  images: { unoptimized: true },            // imagens não otimizadas
}
```

### 14.3 Docker (Auto-hospedado)

```dockerfile
FROM node:18-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 15. Troubleshooting

### Itens duplicados no Pipeline/Roteiro
**Causa:** Race condition entre fetch response e realtime INSERT.
**Solução:** Corrigido com deduplicação atômica no `setState`. Se persistir, recarregar a página (F5).

### Erro 401 nas API Routes
**Causa:** Sessão expirada.
**Solução:** O middleware renova automaticamente. Se persistir, fazer logout e login novamente.

### Erro 409 ao criar oportunidade
**Causa:** Já existe uma oportunidade ativa para a conta.
**Solução:** Feche ou perca a oportunidade existente antes de criar uma nova.

### Campos novos não aparecem
**Causa:** A coluna não existe na tabela do Supabase.
**Solução:** Execute o ALTER TABLE no SQL Editor do Supabase antes de usar o campo.

### Build falha com erros TypeScript
**Nota:** O projeto tem `ignoreBuildErrors: true` no next.config.mjs. Se erros de tipo aparecerem, é recomendável corrigir mas não bloquearão o build.

### Realtime não funciona
**Causa:** Tabela não está na publication `supabase_realtime`.
**Solução:** Execute:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE nome_da_tabela;
```

---

## 16. Convenções de Código

### 16.1 Commits

Padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação (sem mudança de código)
refactor: refatoração
test: testes
chore: tarefas de build/manutenção
```

### 16.2 Nomes de Arquivos

- Componentes: `kebab-case.tsx` (ex: `app-shell.tsx`)
- Hooks: `use-kebab-case.ts` (ex: `use-init-store.ts`)
- API Routes: `route.ts` dentro de pastas nomeadas
- Estilos: `globals.css`

### 16.3 Padrões TypeScript

- Interfaces para entidades: `PascalCase` (ex: `Account`, `Opportunity`)
- Types para enums: `PascalCase` (ex: `Tier`, `OppStage`)
- Funções: `camelCase` (ex: `calcScoreTotal`, `isOppActive`)
- Constantes: `UPPER_SNAKE_CASE` (ex: `OPP_STAGE_ORDER`, `SCORE_LABELS`)

### 16.4 Componentes React

- `"use client"` directive no topo de componentes client-side
- Hooks customizados extraídos para `hooks/`
- Estado global via Zustand (sem prop drilling)
- Componentes de UI via shadcn/ui (componentes headless)

### 16.5 CSS / Tailwind

- Design tokens Fluig como variáveis CSS custom
- Utility-first com Tailwind
- Classes condicionais via `cn()` utility
- Responsivo: mobile-first com breakpoints `sm:`, `md:`, `lg:`, `xl:`

---

<p align="center">
  <strong>Fluig Board</strong> — Documentação Técnica v1.0<br />
  <em>Última atualização: Fevereiro 2026</em>
</p>
