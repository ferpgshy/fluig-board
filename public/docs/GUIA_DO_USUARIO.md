<p align="center">
  <img src="../public/icon-index.png" alt="Fluig Board" width="60" />
</p>

<h1 align="center">Fluig Board — Guia do Usuário</h1>

<p align="center">
  <strong>Manual completo de utilização da plataforma</strong><br />
  Versão 1.0 — Fevereiro 2026
</p>

---

## Sumário

1. [Introdução](#1-introdução)
2. [Primeiro Acesso](#2-primeiro-acesso)
3. [Navegação da Plataforma](#3-navegação-da-plataforma)
4. [Módulo Dashboard](#4-módulo-dashboard)
5. [Módulo Contas (CRM)](#5-módulo-contas-crm)
6. [Módulo Pipeline](#6-módulo-pipeline)
7. [Módulo Roteiro de Visita](#7-módulo-roteiro-de-visita)
8. [Módulo Relatórios](#8-módulo-relatórios)
9. [Perfil do Usuário](#9-perfil-do-usuário)
10. [Painel Administrativo](#10-painel-administrativo)
11. [Dúvidas Frequentes (FAQ)](#11-dúvidas-frequentes-faq)

---

## 1. Introdução

### O que é o Fluig Board?

O **Fluig Board** é uma plataforma de gestão comercial inteligente desenvolvida para equipes de vendas e consultoria do ecossistema **Fluig (TOTVS)**. Ele permite que você:

- **Cadastre e classifique** seus clientes com scoring automatizado
- **Acompanhe oportunidades** em um pipeline visual (Kanban)
- **Realize assessments** consultivos estruturados
- **Gere relatórios profissionais** em PDF
- **Monitore KPIs** de performance em tempo real

### Para quem é este manual?

Este manual é destinado a todos os usuários da plataforma: vendedores, consultores, gerentes comerciais e administradores.

---

## 2. Primeiro Acesso

### 2.1 Solicitando acesso

1. Acesse a página inicial do Fluig Board
2. Clique em **"Solicitar Acesso"**
3. Preencha o formulário com seus dados:
   - Nome completo
   - E-mail corporativo
   - Empresa
   - Cargo (opcional)
   - Telefone (opcional)
   - Mensagem (opcional)
4. Clique em **"Enviar Solicitação"**
5. Aguarde a aprovação do administrador — você receberá um e-mail com sua **senha temporária**

> **Importante:** O acesso não é automático. Um administrador precisa aprovar sua solicitação.

### 2.2 Fazendo login

1. Acesse a página de login
2. Insira seu **e-mail** e a **senha** recebida por e-mail
3. Clique em **"Entrar"**
4. Você será direcionado para a plataforma

### 2.3 Recuperando a senha

1. Na tela de login, clique em **"Esqueci minha senha"**
2. Insira seu e-mail cadastrado
3. Verifique sua caixa de entrada — você receberá um link para criar uma nova senha
4. Clique no link e defina sua nova senha

---

## 3. Navegação da Plataforma

Ao entrar na plataforma, você verá a **barra de navegação superior** com 5 abas:

| Aba | Ícone | Função |
|-----|-------|--------|
| **Dashboard** | 📊 | Visão geral com KPIs e gráficos |
| **Contas** | 🏢 | Cadastro e gestão de clientes |
| **Pipeline** | 🔄 | Acompanhamento de oportunidades |
| **Roteiro** | 📝 | Assessment consultivo de clientes |
| **Relatório** | 📄 | Geração e gestão de relatórios |

No canto superior direito, você encontra o **menu do usuário** com:
- Suas **iniciais** (avatar)
- Link para **editar perfil**
- Link para o **Painel Admin** (se você for administrador)
- Botão **Sair**

---

## 4. Módulo Dashboard

O Dashboard é a tela inicial da plataforma. Ele mostra uma visão consolidada da sua operação comercial.

### 4.1 KPIs (Indicadores-Chave)

Na parte superior, você verá **7 cards de KPIs** com alertas coloridos:

| KPI | O que mostra | Alerta Verde | Alerta Vermelho |
|-----|-------------|-------------|----------------|
| **MRR Pipeline** | Receita mensal estimada de oportunidades ativas | ≥ R$ 45.000 | Abaixo de R$ 45.000 |
| **MRR Fechado** | Receita mensal de contratos fechados | ≥ R$ 30.000 | Abaixo de R$ 30.000 |
| **Total de Visitas** | Quantidade de assessments realizados | Informativo | — |
| **Taxa Visita → Proposta** | % de visitas que geraram proposta | ≥ 50% | Abaixo de 50% |
| **Taxa Proposta → Fechamento** | % de propostas que fecharam | ≥ 33% | Abaixo de 33% |
| **Aging Médio** | Tempo médio (dias) que oportunidades ficam paradas | ≤ 7 dias | Acima de 7 dias |
| **Sem Próximo Passo** | Nº de contas sem ação definida | ≤ 5 | Acima de 5 |

### 4.2 Filtro Temporal

No topo do Dashboard, há um seletor para filtrar os dados:
- **7 dias** — última semana
- **30 dias** — último mês
- **Tudo** — toda a campanha

### 4.3 Gráficos

- **Funil de Oportunidades**: mostra quantas oportunidades estão em cada estágio do pipeline
- **MRR por Tier**: compara o MRR estimado entre clientes Tier A, B e C

---

## 5. Módulo Contas (CRM)

### 5.1 Visão Geral

Aqui você gerencia seus **clientes (contas)**. A tabela principal mostra:
- Nome da conta
- Tier (A, B ou C) — badge colorido
- Score total (0-25)
- Estágio da oportunidade
- MRR estimado/fechado
- Onda (1, 2 ou 3)
- Próximo passo
- Data do próximo passo

> As contas são ordenadas automaticamente pelo **Score Total** (maior para menor).

### 5.2 Filtros

Use os filtros acima da tabela para encontrar contas:
- **Busca por nome** — campo de texto
- **Tier** — Todos, A, B ou C
- **Onda** — Todas, 1, 2 ou 3
- **Responsável** — Todos, Camila, Niésio ou Dupla

### 5.3 Criando uma Nova Conta

1. Clique no botão **"+ Nova"**
2. O formulário de criação aparecerá com as seguintes seções:

#### Dados do Cliente
| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| Nome | ✅ | Nome da empresa/cliente |
| Porte | ✅ | PME, Mid-Market ou Enterprise |
| Segmento | ✅ | Agroindústria, Construção, Distribuição, Educação, Logística, Manufatura, Saúde, Serviços, Setor Público ou Varejo |
| Nome do ESN | | Nome do parceiro ESN |
| E-mail do ESN | | E-mail do parceiro ESN |

#### Contato do Cliente / Sponsor
| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| Nome | ✅ | Nome do contato principal |
| Cargo | | Cargo (ex: CTO, Diretor) |
| Email | ⚠️ | Pelo menos email ou WhatsApp |
| WhatsApp | ⚠️ | Pelo menos email ou WhatsApp |

#### Pipeline Inicial
| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| Estágio | ✅ | Estágio inicial da oportunidade (padrão: "Selecionado") |

#### Ambiente Fluig
| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| Versão | | Versão do Fluig instalada (ex: 1.8.2) |
| Módulos | | Módulos Fluig em uso (ECM, BPM, etc.) |

#### Datas
| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| Registro | ✅ | Data de registro da conta |
| Último Contato | | Data do último contato |
| Próxima Visita | | Data prevista da próxima visita |

#### Scoring (5 Dimensões)

O scoring é feito com sliders de **0 a 5** para cada dimensão:

| Dimensão | O que avalia | 0 | 5 |
|----------|-------------|---|---|
| **Potencial de Expansão** | Capacidade de crescimento | Nenhum | Muito alto |
| **Maturidade de Uso** | Nível de uso atual do Fluig | Inexistente | Referência |
| **Intensidade de Dores** | Quanto o cliente sofre com problemas | Nenhuma | Crítica |
| **Risco de Churn** | Risco de perder o cliente | Nenhum | Crítico |
| **Acesso ao Sponsor** | Facilidade de falar com o decisor | Bloqueado | Direto |

O **Score Total** (soma das 5 dimensões) define automaticamente:
- **Tier A** (≥ 20 pontos) → Prioridade máxima — Onda 1
- **Tier B** (≥ 12 pontos) → Prioridade média — Onda 2
- **Tier C** (< 12 pontos) → Prioridade baixa — Onda 3

#### Observações
Campo de texto livre para anotações gerais sobre a conta.

3. Clique em **"Criar Conta + Oportunidade"** — a oportunidade é criada automaticamente no pipeline.

### 5.4 Editando uma Conta

1. Na tabela, clique no ícone de **lápis** (✏️) ao lado da conta
2. O formulário de edição aparecerá preenchido
3. Na edição, você também pode:
   - Alterar o **estágio da oportunidade** diretamente
   - Definir **MRR estimado** e **MRR fechado**
   - Preencher o **próximo passo** e sua data
   - Registrar **datas** de contato, visita, proposta e fechamento
4. Clique em **"Salvar Alterações"**

### 5.5 Visualizando Detalhes

Clique no ícone de **olho** (👁️) para ver os detalhes completos da conta em um painel expandido, incluindo:
- Dados gerais
- Scoring por dimensão (com descrição de cada nível)
- Dados da oportunidade
- Observações

### 5.6 Excluindo uma Conta

1. Clique no ícone de **lixeira** (🗑️)
2. Confirme a exclusão no modal

> **Atenção:** Ao excluir uma conta, todas as oportunidades, visitas e relatórios associados também serão removidos.

### 5.7 Exportando para CSV

Clique no ícone de **download** (⬇️) no topo da tabela para baixar a lista filtrada em formato CSV (abrível no Excel).

---

## 6. Módulo Pipeline

### 6.1 O que é o Pipeline?

O Pipeline mostra suas **oportunidades de vendas** organizadas por estágio. Existem 8 estágios sequenciais mais uma seção para oportunidades perdidas:

```
Selecionado → Contato → Visita Agendada → Visita Realizada → Diagnóstico → Proposta → Negociação → Works Fechado
                                                                                                        ↓
                                                                                                     Perdido
```

### 6.2 Vista Kanban

A vista padrão mostra os estágios como **colunas** com cards. Cada card mostra:
- Nome do cliente
- Tier badge (A/B/C)
- Score total
- Aging (dias sem atualização) — fica vermelho acima de 7 dias
- MRR estimado

**Movendo oportunidades (drag & drop):**
- Arraste o card de uma coluna para outra
- Solte sobre a coluna de destino
- A mudança é salva automaticamente

### 6.3 Vista Lista

Clique em **"Lista"** no topo para ver as oportunidades em formato de tabela:
- Nome do cliente
- Estágio atual
- Responsável
- MRR estimado
- Próximo passo
- Data
- Aging (dias)

### 6.4 Ações nos Cards

Ao clicar ou interagir com um card, você pode:
- **Avançar** para o próximo estágio
- **Voltar** para o estágio anterior
- **Marcar como Perdido** (será solicitado o motivo)
- **Marcar como Won** — ao fechar, informe o MRR fechado

### 6.5 Regra de Unicidade

Cada conta pode ter **apenas uma oportunidade ativa** por vez. Se uma conta já tem oportunidade ativa, não será possível criar outra.

### 6.6 Exportação

- **CSV** — botão de download no canto superior
- **PDF** — gera um relatório profissional do pipeline com header colorido, dados consolidados por estágio e lista completa de oportunidades

---

## 7. Módulo Roteiro de Visita

### 7.1 O que é?

O Roteiro de Visita é um **assessment consultivo estruturado** para visitas a clientes. Ele guia o consultor por 6 etapas, coletando informações detalhadas.

### 7.2 Criando uma Nova Visita

1. Clique em **"Nova Visita"**
2. Selecione a **conta** (cliente) a ser visitada
3. O wizard iniciará com 6 etapas:

#### Etapa 1 — Pré-Visita
| Campo | Descrição |
|-------|-----------|
| Data da Visita | Data em que a visita será/foi realizada |
| Modalidade | Presencial ou Remota |
| Participantes pelo Cliente | Quem participou da reunião |

#### Etapa 2 — Processos
| Campo | Descrição |
|-------|-----------|
| Processos Descritos | Quais processos foram mapeados |
| Dores Identificadas | Dores e problemas encontrados |
| Impacto no Negócio | Impacto das dores nos resultados |

#### Etapa 3 — Automação
| Campo | Descrição |
|-------|-----------|
| Nível de Automação | Nenhuma, Básica, Intermediária ou Avançada |
| Gaps Identificados | Lacunas na automação |

#### Etapa 4 — Integrações
| Campo | Descrição |
|-------|-----------|
| Sistemas | Sistemas integrados ou a integrar |
| Status | Estado atual das integrações |

#### Etapa 5 — Governança
| Campo | Descrição |
|-------|-----------|
| Problemas | Problemas de governança identificados |
| Engajamento do Sponsor | Alto, Médio ou Baixo |

#### Etapa 6 — Síntese
| Campo | Descrição |
|-------|-----------|
| Hipótese Works | Hipótese de solução com Works |
| Escopo Preliminar | Escopo inicial proposto |
| Objeções Levantadas | Objeções do cliente |
| Próximo Passo Acordado | Ação combinada |
| Data do Próximo Passo | Quando será o próximo passo |

### 7.3 Salvamento Automático

O sistema salva automaticamente:
- **A cada 30 segundos** enquanto você está na tela
- **Ao sair de um campo** (save on blur)

Você não precisa se preocupar em perder dados!

### 7.4 Geração Automática de Relatório

Ao concluir a visita (etapa Síntese), o sistema pode **gerar automaticamente um rascunho de relatório** com os dados coletados.

### 7.5 Histórico de Visitas

Na parte inferior do módulo, você vê o **histórico de todas as visitas** realizadas, com busca por nome do cliente e opção de exclusão.

---

## 8. Módulo Relatórios

### 8.1 O que são os Relatórios?

Relatórios são documentos formais gerados a partir das visitas. Existem dois tipos:
- **Relatório Executivo** — síntese para o cliente
- **Proposta Works** — proposta comercial detalhada

### 8.2 Fluxo de Aprovação

Os relatórios seguem um fluxo de 3 etapas:

```
📝 Rascunho  →  🔍 Revisão  →  ✅ Enviado
```

Para avançar o status, clique no botão de **avançar** no card do relatório.

### 8.3 Editando um Relatório

Todos os campos são **editáveis diretamente** no card do relatório:
- Título
- Contexto do Cliente
- Dores Priorizadas
- Impacto Estimado
- Solução Proposta
- Entregáveis
- Investimento (MRR)
- Prazo de Implantação

As alterações são salvas automaticamente ao sair do campo.

### 8.4 Filtros

Filtre relatórios por:
- **Busca** — por nome do cliente ou título
- **Status** — Rascunho, Revisão ou Enviado
- **Tipo** — Relatório Executivo ou Proposta Works

### 8.5 Exportação PDF

Clique no ícone de **PDF** no card do relatório para gerar um documento profissional com:
- Header com identidade visual Fluig
- Informações do cliente
- Todas as seções do relatório formatadas
- Data e responsável

### 8.6 Exportação CSV

- **Individual**: exporte um único relatório
- **Todos**: exporte todos os relatórios filtrados em um arquivo CSV

---

## 9. Perfil do Usuário

### 9.1 Acessando o Perfil

Clique nas suas iniciais no canto superior direito e selecione **"Perfil"**.

### 9.2 Campos editáveis

| Campo | Descrição |
|-------|-----------|
| Nome | Seu nome completo |
| Empresa | Nome da empresa |
| Cargo | Seu cargo |
| Telefone | Telefone de contato |

> O **e-mail** não pode ser alterado (é usado para login).

---

## 10. Painel Administrativo

> **Acesso restrito**: somente usuários com papel de **administrador**.

### 10.1 Acessando o Admin

Clique nas suas iniciais e selecione **"Admin"**, ou acesse diretamente pela URL `/admin`.

### 10.2 Solicitações de Acesso

Gerencie as solicitações de novos usuários:

| Ação | O que acontece |
|------|----------------|
| **Aprovar** | Cria o usuário no sistema com senha temporária e envia por e-mail |
| **Recusar** | Rejeita a solicitação (é possível informar o motivo) |

### 10.3 Gerenciamento de Usuários

| Ação | Descrição |
|------|-----------|
| **Criar Usuário** | Cria um novo usuário diretamente (sem solicitação) |
| **Ativar/Desativar** | Controla o acesso do usuário à plataforma |

> Você não pode desativar sua própria conta.

### 10.4 Setup Inicial

Na primeira vez que um administrador acessa o sistema, ele é direcionado para o **Setup** para completar seus dados (nome, empresa, telefone).

---

## 11. Dúvidas Frequentes (FAQ)

### A oportunidade apareceu duplicada no Pipeline. O que fazer?

Isso foi corrigido na versão mais recente. Atualize a página (F5) e o item duplicado desaparecerá. Se persistir, entre em contato com o suporte.

### Posso criar mais de uma oportunidade para o mesmo cliente?

Não. Cada conta pode ter **apenas uma oportunidade ativa** por vez. Ao fechar (Won) ou perder, será possível criar uma nova.

### Como mudo o estágio de uma oportunidade?

Há duas formas:
1. **Pipeline Kanban**: arraste o card para a coluna desejada
2. **Edição da conta**: clique no lápis da conta → dropdown de estágio da oportunidade

### Meus dados são salvos automaticamente?

- **Roteiro de Visita**: sim, salvamento automático a cada 30 segundos + ao sair do campo
- **Relatórios**: sim, salvamento ao sair do campo
- **Contas e Pipeline**: as ações são salvas ao clicar nos botões

### Como exporto relatórios em PDF?

No módulo Relatórios, clique no ícone de PDF no card do relatório desejado.

### Esqueci minha senha. O que faço?

Na tela de login, clique em **"Esqueci minha senha"** e siga as instruções.

### Quem pode aprovar solicitações de acesso?

Apenas usuários com papel de **administrador**.

---

<p align="center">
  <strong>Fluig Board</strong> — Gestão Comercial Inteligente<br />
  <em>Em caso de dúvidas, entre em contato com o administrador do sistema.</em>
</p>
