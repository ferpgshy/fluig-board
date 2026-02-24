<p align="center">
  <img src="public/icon-index.png" alt="Fluig Board Logo" width="80" />
</p>

<h1 align="center">Fluig Board</h1>

<p align="center">
  <strong>Plataforma de Gestão Comercial Inteligente para o Ecossistema Fluig (TOTVS)</strong>
</p>

<p align="center">
  <a href="#-visão-geral">Visão Geral</a> •
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#%EF%B8%8F-stack-tecnológica">Stack</a> •
  <a href="#-arquitetura">Arquitetura</a> •
  <a href="#-começando">Começando</a> •
  <a href="#-banco-de-dados">Banco de Dados</a> •
  <a href="#-api-reference">API</a> •
  <a href="#-deploy">Deploy</a>
</p>

---

## 📋 Visão Geral

**Fluig Board** é uma plataforma SaaS de gestão comercial voltada para equipes de vendas e consultoria do ecossistema **Fluig (TOTVS)**. Permite gerenciar o pipeline de oportunidades, realizar assessments consultivos em clientes, gerar relatórios executivos e acompanhar KPIs de performance — tudo em uma interface moderna e responsiva.

### Destaques

- **Pipeline Kanban** com drag & drop entre estágios de vendas
- **Assessment consultivo** estruturado em 4 eixos (Processos, Automação, Integrações, Governança)
- **Dashboard com KPIs** em tempo real com alertas visuais (semáforo)
- **Scoring multidimensional** de contas (5 dimensões × 0-5) com classificação automática por Tier e Onda
- **Geração de relatórios PDF** profissionais com fluxo de aprovação
- **Painel administrativo** com gerenciamento de usuários e solicitações de acesso
- **Atualizações otimistas** com rollback automático em caso de falha

---

## ✨ Funcionalidades

### 📊 Dashboard
| Recurso | Descrição |
|---------|-----------|
| KPIs em tempo real | MRR Pipeline, MRR Fechado, Visitas, Taxas de Conversão, Aging Médio |
| Alertas visuais | Semáforo automático (verde/amarelo/vermelho) com regras de negócio |
| Gráficos interativos | Funil de oportunidades + MRR por Tier (Recharts) |
| Filtro temporal | 7 dias, 30 dias ou toda a campanha |

### 🏢 Contas (CRM)
| Recurso | Descrição |
|---------|-----------|
| CRUD completo | Cadastro de contas com dados da empresa, contato e módulos Fluig |
| Scoring 5D | Dor de Negócio, Engajamento, Fit Técnico, Timing, Budget (sliders 0-5) |
| Classificação automática | Tier (A/B/C) e Onda (1/2/3) calculados via score |
| Filtros avançados | Busca textual, Tier, Onda, Responsável |
| Exportação CSV | Download da base filtrada |

### 🔄 Pipeline
| Recurso | Descrição |
|---------|-----------|
| Vista Kanban | 8 estágios + seção "Perdidos" com drag & drop |
| Vista Lista | Tabela completa com todas as informações |
| Gestão de estágios | Avançar, voltar ou marcar como perdido com motivo |
| Cards informativos | Tier badge, Score, Aging (alerta >7d), MRR estimado |
| Regra de unicidade | Uma oportunidade ativa por conta |

### 📝 Roteiro de Visita (Assessment)
| Recurso | Descrição |
|---------|-----------|
| Wizard 6 etapas | Pré-Visita → Processos → Automação → Integrações → Governança → Síntese |
| Assessment consultivo | Campos estruturados por eixo com níveis e observações |
| Auto-save | Salvamento automático a cada 30 segundos + save on blur |
| Geração de relatório | Rascunho automático a partir dos dados coletados |

### 📄 Relatórios
| Recurso | Descrição |
|---------|-----------|
| Edição inline | Todos os campos editáveis diretamente nos cards |
| Fluxo de aprovação | Rascunho → Revisão → Enviado |
| Exportação PDF | Layout profissional com header colorido e seções formatadas (jsPDF) |

### 🔐 Admin
| Recurso | Descrição |
|---------|-----------|
| Solicitações de acesso | Aprovar/recusar com criação automática de usuário |
| Gerenciamento de usuários | Listar, criar, ativar/desativar contas |
| Setup inicial | Assistente de configuração na primeira execução |

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Framework** | [Next.js](https://nextjs.org/) (App Router) | 16.1.6 |
| **Linguagem** | [TypeScript](https://www.typescriptlang.org/) | 5.7 |
| **Estilização** | [Tailwind CSS](https://tailwindcss.com/) | 4.2 |
| **Componentes UI** | [shadcn/ui](https://ui.shadcn.com/) (estilo `new-york`) + [Radix UI](https://www.radix-ui.com/) | — |
| **Ícones** | [Lucide React](https://lucide.dev/) | 0.564 |
| **Gráficos** | [Recharts](https://recharts.org/) | 2.15 |
| **Estado global** | [Zustand](https://zustand-demo.pmnd.rs/) | 5.0 |
| **Auth + Banco** | [Supabase](https://supabase.com/) (Auth + PostgreSQL + RLS) | 2.49 |
| **Formulários** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | 7.54 / 3.24 |
| **PDF** | [jsPDF](https://github.com/parallax/jsPDF) | 2.5 |
| **Drag & Drop** | [@dnd-kit](https://dndkit.com/) | 6.3 |
| **Analytics** | [Vercel Analytics](https://vercel.com/analytics) | 1.6 |
| **Runtime** | [React](https://react.dev/) | 19.2 |
| **Package Manager** | [pnpm](https://pnpm.io/) | — |

---

## 🏗 Arquitetura

### Visão Geral

```
┌──────────────────────────────────────────────────────────┐
│  Landing Page (/)        │  Auth Pages (/login, etc.)    │  ← Público
├──────────────────────────────────────────────────────────┤
│  Middleware (renovação de sessão + proteção de rotas)     │
├──────────────────────────────────────────────────────────┤
│  /app (AppShell + 5 Módulos)   │  /admin (Painel Admin)  │  ← Protegido
├──────────────────────────────────────────────────────────┤
│  Zustand Store (estado otimista client-side + rollback)   │
├──────────────────────────────────────────────────────────┤
│  API Routes (Next.js — 15 endpoints REST)                 │
├──────────────────────────────────────────────────────────┤
│  Supabase (Auth + PostgreSQL + Row Level Security)        │
└──────────────────────────────────────────────────────────┘
```

### Padrão de Renderização

| Área | Padrão |
|------|--------|
| Landing page & Auth | Server + Client Components (híbrido) |
| Aplicação (`/app`) | 100% Client-side com estado global Zustand |
| API Routes | Serverless (Vercel Functions) |

### Estrutura de Diretórios

```
fluig-board/
├── app/                          # App Router (Next.js)
│   ├── layout.tsx                # Layout raiz (metadata, fonts)
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # CSS global + design tokens Fluig
│   ├── login/                    # Página de login
│   ├── cadastro/                 # Solicitação de acesso
│   │   └── sucesso/              # Confirmação de envio
│   ├── esqueci-senha/            # Recuperação de senha
│   ├── redefinir-senha/          # Redefinição de senha
│   ├── auth/
│   │   ├── callback/             # Callback OAuth (route handler)
│   │   └── erro/                 # Erro de autenticação
│   ├── app/                      # ★ Aplicação principal (protegida)
│   ├── admin/                    # ★ Painel administrativo (protegido)
│   │   └── setup/                # Setup inicial do admin
│   ├── perfil/                   # Edição de perfil
│   ├── contato/                  # Página de contato
│   ├── privacidade/              # Política de privacidade (LGPD)
│   ├── seed/                     # Utilitário de seed
│   └── api/                      # API Routes
│       ├── auth/check/           # Verificação pós-login
│       ├── profile/              # Perfil do usuário
│       ├── accounts/             # CRUD de contas
│       ├── opportunities/        # CRUD de oportunidades
│       ├── visits/               # CRUD de visitas
│       ├── reports/              # CRUD de relatórios
│       ├── access-requests/      # Solicitações de acesso
│       └── admin/                # Endpoints administrativos
│           ├── users/            # Gerenciamento de usuários
│           ├── setup/            # Ativação do admin
│           └── seed/             # Seed do admin
├── components/
│   ├── auth/                     # Componentes de autenticação
│   │   └── auth-layout.tsx       # Layout split-screen com branding
│   ├── fluig/                    # Componentes do shell
│   │   ├── app-shell.tsx         # Shell principal (nav, header, menu)
│   │   ├── section-header.tsx    # Header reutilizável de seção
│   │   └── tier-badge.tsx        # Badge colorido Tier A/B/C
│   ├── landing/                  # 9 seções da landing page
│   ├── modules/                  # Módulos da aplicação
│   │   ├── dashboard.tsx         # Dashboard com KPIs e gráficos
│   │   ├── contas.tsx            # Gestão de contas (CRM)
│   │   ├── pipeline.tsx          # Pipeline Kanban
│   │   ├── roteiro.tsx           # Assessment consultivo
│   │   └── relatorio.tsx         # Relatórios com exportação PDF
│   ├── ui/                       # 57 componentes shadcn/ui
│   └── theme-provider.tsx        # Provider de tema (next-themes)
├── hooks/
│   ├── use-init-store.ts         # Hidratação do Zustand via API
│   ├── use-mobile.ts             # Detecção de breakpoint mobile
│   └── use-toast.ts              # Sistema de notificações toast
├── lib/
│   ├── models.ts                 # Tipos, enums e lógica de negócio
│   ├── store.ts                  # Zustand store (estado otimista)
│   ├── utils.ts                  # Utilitários (cn/class merge)
│   └── supabase/
│       ├── client.ts             # Cliente Supabase (browser)
│       ├── server.ts             # Cliente Supabase (server)
│       ├── admin.ts              # Cliente admin (service role)
│       └── middleware.ts         # Middleware de sessão
├── scripts/
│   ├── 001_create_profiles.sql   # Migração: tabela profiles + RLS
│   ├── 002_profile_trigger.sql   # Trigger: auto-create profile
│   └── seed-admin.mjs            # Script de seed do admin
├── middleware.ts                  # Middleware global (proteção de rotas)
├── next.config.mjs               # Configuração Next.js
├── tsconfig.json                 # Configuração TypeScript
├── components.json               # Configuração shadcn/ui
├── postcss.config.mjs            # PostCSS + Tailwind
├── package.json                  # Dependências e scripts
└── pnpm-lock.yaml                # Lock file (pnpm)
```

---

## 🚀 Começando

### Pré-requisitos

- **Node.js** ≥ 18.x
- **pnpm** (recomendado) ou npm/yarn
- Conta no **[Supabase](https://supabase.com/)** (plano gratuito funciona)

### 1. Clonar o repositório

```bash
git clone https://github.com/ferpgshy/fluig-board.git
cd fluig-board
```

### 2. Instalar dependências

```bash
pnpm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase - Obtenha em https://app.supabase.com → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

> ⚠️ **Nunca** exponha a `SUPABASE_SERVICE_ROLE_KEY` no client-side. Ela é usada apenas em API Routes server-side.

### 4. Configurar o banco de dados

Execute os scripts SQL no **Supabase SQL Editor** (Dashboard → SQL Editor):

```sql
-- 1. Criar tabela profiles com RLS
-- Cole o conteúdo de: scripts/001_create_profiles.sql

-- 2. Trigger para auto-criar profile ao registrar usuário
-- Cole o conteúdo de: scripts/002_profile_trigger.sql
```

Crie também as tabelas: `accounts`, `opportunities`, `visits`, `reports` e `access_requests` conforme os modelos descritos na seção [Banco de Dados](#-banco-de-dados).

### 5. Criar usuário admin

**Opção A — Via script:**
```bash
node scripts/seed-admin.mjs
```

**Opção B — Via interface:**
Acesse `/seed` no navegador e preencha os dados do admin.

### 6. Rodar em desenvolvimento

```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Servidor de desenvolvimento (hot reload) |
| `pnpm build` | Build de produção |
| `pnpm start` | Servidor de produção |
| `pnpm lint` | Linting com ESLint |

---

## 💾 Banco de Dados

O projeto utiliza **Supabase** (PostgreSQL gerenciado) com **Row Level Security (RLS)** habilitado.

### Diagrama de Entidades

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  auth.users  │────▶│    profiles       │     │  access_    │
│  (Supabase)  │     │  (role, ativado)  │     │  requests   │
└─────────────┘     └──────────────────┘     └─────────────┘
                           │
                           │ user_id
                           ▼
                    ┌──────────────┐
                    │   accounts   │
                    │ (scoring 5D) │
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    ▼              ▼
            ┌──────────────┐ ┌──────────┐
            │ opportunities│ │  visits   │
            │  (pipeline)  │ │(assessment│
            └──────────────┘ └────┬─────┘
                                  │
                                  ▼
                           ┌──────────┐
                           │ reports  │
                           │  (PDF)   │
                           └──────────┘
```

### Tabelas

#### `profiles`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `UUID` (PK, FK → auth.users) | ID do usuário |
| `nome` | `text` | Nome completo |
| `email` | `text` | Email |
| `empresa` | `text` | Empresa |
| `cargo` | `text` | Cargo |
| `avatar_url` | `text` | URL do avatar |
| `role` | `text` | `admin` ou `user` |
| `ativado` | `boolean` | Conta ativa? |
| `telefone` | `text` | Telefone |
| `created_at` | `timestamptz` | Data de criação |
| `updated_at` | `timestamptz` | Última atualização (auto) |

#### `accounts`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `UUID` (PK) | ID da conta |
| `user_id` | `UUID` (FK → auth.users) | Proprietário |
| `nome` | `text` | Nome da empresa/conta |
| `segmento` | `text` | Segmento de mercado |
| `porte` | `text` | Porte da empresa |
| `contato_nome`, `contato_email`, `contato_telefone` | `text` | Dados do contato |
| `fluig_versao` | `text` | Versão do Fluig |
| `fluig_modulos` | `text[]` | Módulos Fluig em uso |
| `score_dor`, `score_engajamento`, `score_fit`, `score_timing`, `score_budget` | `integer` (0-5) | Scores por dimensão |
| `score_total` | `integer` | Score total calculado |
| `tier` | `text` | A, B ou C (calculado) |
| `onda` | `integer` | 1, 2 ou 3 (calculado) |
| `responsavel` | `text` | Consultor responsável |
| `observacoes` | `text` | Notas livres |
| `created_at`, `updated_at` | `timestamptz` | Timestamps |

#### `opportunities`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `UUID` (PK) | ID da oportunidade |
| `account_id` | `UUID` (FK → accounts) | Conta vinculada |
| `user_id` | `UUID` (FK → auth.users) | Proprietário |
| `stage` | `text` | Estágio atual (9 possíveis) |
| `mrr_estimado` | `numeric` | MRR estimado |
| `mrr_fechado` | `numeric` | MRR fechado (ao ganhar) |
| `pacote_works` | `text` | Pacote Works selecionado |
| `responsavel` | `text` | Consultor responsável |
| `modalidade` | `text` | Modalidade de venda |
| `motivo_perda` | `text` | Motivo (se perdido) |
| `data_inicio`, `data_fechamento` | `timestamptz` | Datas do ciclo |
| `created_at`, `updated_at` | `timestamptz` | Timestamps |

**Estágios do Pipeline:**
`selecionado` → `contato` → `visita_agendada` → `visita_realizada` → `diagnóstico` → `proposta` → `negociação` → `works_fechado` | `perdido`

#### `visits`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `UUID` (PK) | ID da visita |
| `account_id` | `UUID` (FK → accounts) | Conta visitada |
| `user_id` | `UUID` (FK → auth.users) | Consultor |
| Campos de assessment (4 eixos) | `text` / `integer` | Processos, Automação, Integrações, Governança |
| `dores_identificadas` | `text` | Principais dores |
| `gaps` | `text` | Gaps identificados |
| `sponsor_engajamento` | `text` | Nível de engajamento do sponsor |
| `hipotese_works` | `text` | Hipótese de solução Works |
| `created_at`, `updated_at` | `timestamptz` | Timestamps |

#### `reports`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `UUID` (PK) | ID do relatório |
| `visit_id` | `UUID` (FK → visits) | Visita de origem |
| `account_id` | `UUID` (FK → accounts) | Conta |
| `user_id` | `UUID` (FK → auth.users) | Autor |
| `tipo` | `text` | Tipo do relatório |
| `status` | `text` | `rascunho` → `revisao` → `enviado` |
| `contexto`, `dores`, `impacto`, `solucao` | `text` | Seções do relatório |
| `entregaveis` | `text` | Entregáveis propostos |
| `investimento_mrr` | `numeric` | Investimento MRR proposto |
| `created_at`, `updated_at` | `timestamptz` | Timestamps |

#### `access_requests`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `UUID` (PK) | ID da solicitação |
| `nome`, `email`, `empresa`, `cargo`, `telefone` | `text` | Dados do solicitante |
| `mensagem` | `text` | Mensagem opcional |
| `status` | `text` | `pendente` / `aprovado` / `recusado` |
| `motivo_recusa` | `text` | Motivo (se recusado) |
| `reviewed_by` | `UUID` | Admin que avaliou |
| `reviewed_at` | `timestamptz` | Data da avaliação |
| `created_at` | `timestamptz` | Data da solicitação |

### Row Level Security (RLS)

Todas as tabelas possuem RLS habilitado:
- **profiles**: cada usuário só vê/edita o próprio perfil
- **accounts, opportunities, visits, reports**: filtrados por `user_id` do usuário autenticado
- **access_requests**: visíveis apenas para admins
- API Routes admin usam `SUPABASE_SERVICE_ROLE_KEY` para bypassar RLS quando necessário

---

## 🔑 Autenticação & Autorização

### Fluxo de Login

```
┌──────────┐    email/senha    ┌──────────────┐   check profile   ┌──────────────┐
│  /login  │ ─────────────────▶│ Supabase Auth │ ─────────────────▶│ /api/auth/   │
│          │                   │              │                   │    check     │
└──────────┘                   └──────────────┘                   └──────┬───────┘
                                                                         │
                                    ┌────────────────────────────────────┤
                                    ▼                                    ▼
                            ┌──────────────┐                    ┌──────────────┐
                            │   Admin?     │                    │   Usuário?   │
                            │  → /admin    │                    │  → /app      │
                            └──────────────┘                    └──────────────┘
```

### Fluxo de Cadastro (Não é auto-registro)

```
┌───────────┐  POST /api/access-requests  ┌────────────┐  Aprovar  ┌──────────┐
│ /cadastro │ ───────────────────────────▶ │  Pendente  │ ────────▶ │ Criar    │
│           │                             │  (Admin    │          │ usuário  │
└───────────┘                             │   avalia)  │          │ no Auth  │
                                          └────────────┘          └──────────┘
```

### Roles

| Role | Acesso | Descrição |
|------|--------|-----------|
| `admin` | `/admin`, `/app` | Gerencia usuários, solicitações e tem acesso completo |
| `user` | `/app` | Acesso à aplicação principal (módulos) |

### Middleware

O middleware intercepta todas as requisições e:
1. Renova o cookie de sessão do Supabase Auth automaticamente
2. Protege rotas `/app/*` e `/admin/*` — redireciona para `/login` se não autenticado
3. Não bloqueia rotas públicas (landing, auth, contato, etc.)

---

## 📡 API Reference

Todas as rotas verificam autenticação via `supabase.auth.getUser()`. Rotas admin verificam `profile.role === "admin"`.

### Autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/auth/check` | Verifica profile pós-login e redireciona |

### Perfil

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/profile` | Retorna profile do usuário logado |

### Contas

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/accounts` | Lista contas do usuário |
| `POST` | `/api/accounts` | Cria nova conta (com score calculado) |
| `PATCH` | `/api/accounts/:id` | Atualiza conta (recalcula score/tier/onda) |
| `DELETE` | `/api/accounts/:id` | Exclui conta |

### Oportunidades

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/opportunities` | Lista oportunidades |
| `POST` | `/api/opportunities` | Cria oportunidade (1 ativa por conta) |
| `PATCH` | `/api/opportunities/:id` | Atualiza oportunidade |
| `DELETE` | `/api/opportunities/:id` | Exclui oportunidade |

### Visitas

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/visits` | Lista visitas/assessments |
| `POST` | `/api/visits` | Cria visita |
| `PATCH` | `/api/visits/:id` | Atualiza visita |

### Relatórios

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/reports` | Lista relatórios |
| `POST` | `/api/reports` | Cria relatório (1 por visita) |
| `PATCH` | `/api/reports/:id` | Atualiza ou avança status (`?advance=true`) |
| `DELETE` | `/api/reports/:id` | Exclui relatório |

### Solicitações de Acesso

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/access-requests` | Lista solicitações (admin) |
| `POST` | `/api/access-requests` | Cria solicitação (público) |
| `PATCH` | `/api/access-requests/:id` | Aprovar/recusar (admin — cria usuário ao aprovar) |

### Admin

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/admin/users` | Lista todos os usuários |
| `POST` | `/api/admin/users` | Cria novo usuário |
| `PATCH` | `/api/admin/users` | Ativa/desativa usuário |
| `POST` | `/api/admin/setup` | Ativa conta admin com dados pessoais |
| `POST` | `/api/admin/seed` | Cria/atualiza admin via GoTrue Admin API |

---

## 🚢 Deploy

### Vercel (Recomendado)

1. Faça fork ou importe o repositório no [Vercel](https://vercel.com/)
2. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy automático a cada push na branch `main`

### Docker (Auto-hospedado)

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

## 🎨 Design System

O Fluig Board utiliza um design system próprio baseado no **shadcn/ui** com tokens customizados:

| Token | Cor | Uso |
|-------|-----|-----|
| `--fluig-primary` | `#0077b6` | Cor principal (botões, links) |
| `--fluig-secondary` | `#00a8a8` | Cor secundária (destaques) |
| `--fluig-title` | `#0099a0` | Títulos e headings |
| `--fluig-success` | Verde | Indicadores positivos |
| `--fluig-danger` | Vermelho | Alertas e erros |
| `--fluig-warning` | Amarelo | Avisos |

**57 componentes UI** disponíveis incluindo: Accordion, Alert Dialog, Avatar, Badge, Button, Calendar, Card, Carousel, Chart, Checkbox, Command, Dialog, Drawer, Dropdown Menu, Form, Input, Popover, Select, Sheet, Skeleton, Slider, Table, Tabs, Toast, Toggle, Tooltip, e mais.

---

## 📐 Modelos de Negócio

### Scoring & Classificação

```
Score Total = soma(score_dor + score_engajamento + score_fit + score_timing + score_budget)
             Cada dimensão: 0 a 5 | Total máximo: 25

Tier A = Score ≥ 18    → Prioridade máxima
Tier B = Score ≥ 10    → Prioridade média
Tier C = Score < 10    → Prioridade baixa

Onda 1 = Tier A        → Ação imediata
Onda 2 = Tier B        → Próximo ciclo
Onda 3 = Tier C        → Nurturing
```

### KPIs & Alertas

| KPI | Meta | Alerta |
|-----|------|--------|
| MRR Pipeline | ≥ R$ 45.000 (1.5× cobertura) | Vermelho se abaixo |
| MRR Fechado | ≥ R$ 30.000 | Vermelho se abaixo |
| Taxa Visita → Proposta | ≥ 50% | Vermelho se abaixo |
| Taxa Proposta → Fechamento | ≥ 33% | Vermelho se abaixo |
| Aging Médio por Estágio | ≤ 7 dias | Vermelho se acima |
| Contas sem Próximo Passo | ≤ 5 | Vermelho se acima |

---

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie sua branch de feature (`git checkout -b feature/minha-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adicionar minha feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

### Convenções de Commit

O projeto segue o padrão [Conventional Commits](https://www.conventionalcommits.org/):

| Prefixo | Descrição |
|---------|-----------|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `docs:` | Documentação |
| `style:` | Formatação (sem mudança de código) |
| `refactor:` | Refatoração |
| `test:` | Testes |
| `chore:` | Tarefas de build/manutenção |

---

## 📄 Licença

Este projeto é **proprietário** e protegido por direitos autorais. O código-fonte está disponível publicamente apenas para fins informativos e de portfólio. **Nenhuma permissão** é concedida para copiar, modificar, distribuir ou usar o Software sem autorização prévia e por escrito. Consulte o arquivo [LICENSE](LICENSE) para detalhes completos.

---

<p align="center">
  Feito com ❤️ para o ecossistema <strong>Fluig (TOTVS)</strong>
</p>
