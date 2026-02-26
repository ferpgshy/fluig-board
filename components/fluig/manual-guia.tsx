"use client"

/* ─── Guia do Usuário — JSX puro (sem markdown) ─── */

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
  pre: "my-4 p-4 rounded-lg bg-muted border border-border overflow-x-auto text-xs font-mono whitespace-pre",
  hr: "my-8 border-t border-border",
  b: "font-semibold",
} as const

export function ManualGuia() {
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      <h1 className={S.h1}>Fluig Board — Guia do Usuário</h1>
      <p className={S.p}><strong>Manual completo de utilização da plataforma</strong><br />Versão 1.0 — Fevereiro 2026</p>

      <hr className={S.hr} />

      {/* ── 1. Introdução ── */}
      <h2 className={S.h2} id="introducao">1. Introdução</h2>
      <h3 className={S.h3}>O que é o Fluig Board?</h3>
      <p className={S.p}>
        O <strong>Fluig Board</strong> é uma plataforma de gestão comercial inteligente desenvolvida para equipes de vendas e consultoria do ecossistema <strong>Fluig (TOTVS)</strong>. Ele permite que você:
      </p>
      <ul className={S.ul}>
        <li><strong>Cadastre e classifique</strong> seus clientes com scoring automatizado</li>
        <li><strong>Acompanhe oportunidades</strong> em um pipeline visual (Kanban)</li>
        <li><strong>Realize assessments</strong> consultivos estruturados</li>
        <li><strong>Gere relatórios profissionais</strong> em PDF</li>
        <li><strong>Monitore KPIs</strong> de performance em tempo real</li>
      </ul>
      <h3 className={S.h3}>Para quem é este manual?</h3>
      <p className={S.p}>Este manual é destinado a todos os usuários da plataforma: vendedores, consultores, gerentes comerciais e administradores.</p>

      <hr className={S.hr} />

      {/* ── 2. Primeiro Acesso ── */}
      <h2 className={S.h2} id="primeiro-acesso">2. Primeiro Acesso</h2>

      <h3 className={S.h3}>2.1 Solicitando acesso</h3>
      <ol className={S.ol}>
        <li>Acesse a página inicial do Fluig Board</li>
        <li>Clique em <strong>"Solicitar Acesso"</strong></li>
        <li>Preencha o formulário com seus dados: Nome completo, E-mail corporativo, Empresa, Cargo, Telefone, Mensagem</li>
        <li>Clique em <strong>"Enviar Solicitação"</strong></li>
        <li>Aguarde a aprovação do administrador — você receberá um e-mail com sua <strong>senha temporária</strong></li>
      </ol>
      <div className={S.bq}><strong>Importante:</strong> O acesso não é automático. Um administrador precisa aprovar sua solicitação.</div>

      <h3 className={S.h3}>2.2 Fazendo login</h3>
      <ol className={S.ol}>
        <li>Acesse a página de login</li>
        <li>Insira seu <strong>e-mail</strong> e a <strong>senha</strong> recebida por e-mail</li>
        <li>Clique em <strong>"Entrar"</strong></li>
        <li>Você será direcionado para a plataforma</li>
      </ol>

      <h3 className={S.h3}>2.3 Recuperando a senha</h3>
      <ol className={S.ol}>
        <li>Na tela de login, clique em <strong>"Esqueci minha senha"</strong></li>
        <li>Insira seu e-mail cadastrado</li>
        <li>Verifique sua caixa de entrada — você receberá um link para criar uma nova senha</li>
        <li>Clique no link e defina sua nova senha</li>
      </ol>

      <hr className={S.hr} />

      {/* ── 3. Navegação ── */}
      <h2 className={S.h2} id="navegacao">3. Navegação da Plataforma</h2>
      <p className={S.p}>Ao entrar na plataforma, você verá a <strong>barra de navegação superior</strong> com 5 abas:</p>
      <table className={S.table}>
        <thead><tr><th className={S.th}>Aba</th><th className={S.th}>Função</th></tr></thead>
        <tbody>
          <tr><td className={S.td}><strong>Dashboard</strong></td><td className={S.td}>Visão geral com KPIs e gráficos</td></tr>
          <tr><td className={S.td}><strong>Contas</strong></td><td className={S.td}>Cadastro e gestão de clientes</td></tr>
          <tr><td className={S.td}><strong>Pipeline</strong></td><td className={S.td}>Acompanhamento de oportunidades</td></tr>
          <tr><td className={S.td}><strong>Roteiro</strong></td><td className={S.td}>Assessment consultivo de clientes</td></tr>
          <tr><td className={S.td}><strong>Relatório</strong></td><td className={S.td}>Geração e gestão de relatórios</td></tr>
        </tbody>
      </table>
      <p className={S.p}>No canto superior direito, você encontra o <strong>menu do usuário</strong> com suas iniciais, link para editar perfil, Painel Admin (se administrador) e botão Sair.</p>

      <hr className={S.hr} />

      {/* ── 4. Dashboard ── */}
      <h2 className={S.h2} id="dashboard">4. Módulo Dashboard</h2>
      <p className={S.p}>O Dashboard é a tela inicial da plataforma. Ele mostra uma visão consolidada da sua operação comercial.</p>

      <h3 className={S.h3}>4.1 KPIs (Indicadores-Chave)</h3>
      <p className={S.p}>Na parte superior, você verá <strong>7 cards de KPIs</strong> com alertas coloridos:</p>
      <table className={S.table}>
        <thead><tr><th className={S.th}>KPI</th><th className={S.th}>O que mostra</th><th className={S.th}>Alerta Verde</th><th className={S.th}>Alerta Vermelho</th></tr></thead>
        <tbody>
          <tr><td className={S.td}><strong>MRR Pipeline</strong></td><td className={S.td}>Receita mensal estimada de oportunidades ativas</td><td className={S.td}>≥ R$ 45.000</td><td className={S.td}>{"< R$ 45.000"}</td></tr>
          <tr><td className={S.td}><strong>MRR Fechado</strong></td><td className={S.td}>Receita mensal de contratos fechados</td><td className={S.td}>≥ R$ 30.000</td><td className={S.td}>{"< R$ 30.000"}</td></tr>
          <tr><td className={S.td}><strong>Total de Visitas</strong></td><td className={S.td}>Quantidade de assessments realizados</td><td className={S.td}>Informativo</td><td className={S.td}>—</td></tr>
          <tr><td className={S.td}><strong>Taxa Visita → Proposta</strong></td><td className={S.td}>% de visitas que geraram proposta</td><td className={S.td}>≥ 50%</td><td className={S.td}>{"< 50%"}</td></tr>
          <tr><td className={S.td}><strong>Taxa Proposta → Fechamento</strong></td><td className={S.td}>% de propostas que fecharam</td><td className={S.td}>≥ 33%</td><td className={S.td}>{"< 33%"}</td></tr>
          <tr><td className={S.td}><strong>Aging Médio</strong></td><td className={S.td}>Tempo médio (dias) que oportunidades ficam paradas</td><td className={S.td}>≤ 7 dias</td><td className={S.td}>{"> 7 dias"}</td></tr>
          <tr><td className={S.td}><strong>Sem Próximo Passo</strong></td><td className={S.td}>Nº de contas sem ação definida</td><td className={S.td}>≤ 5</td><td className={S.td}>{"> 5"}</td></tr>
        </tbody>
      </table>

      <h3 className={S.h3}>4.2 Filtro Temporal</h3>
      <p className={S.p}>No topo do Dashboard, há um seletor para filtrar os dados: <strong>7 dias</strong> (última semana), <strong>30 dias</strong> (último mês) ou <strong>Tudo</strong> (toda a campanha).</p>

      <h3 className={S.h3}>4.3 Gráficos</h3>
      <ul className={S.ul}>
        <li><strong>Funil de Oportunidades:</strong> mostra quantas oportunidades estão em cada estágio do pipeline</li>
        <li><strong>MRR por Tier:</strong> compara o MRR estimado entre clientes Tier A, B e C</li>
      </ul>

      <hr className={S.hr} />

      {/* ── 5. Contas ── */}
      <h2 className={S.h2} id="contas">5. Módulo Contas (CRM)</h2>

      <h3 className={S.h3}>5.1 Visão Geral</h3>
      <p className={S.p}>Aqui você gerencia seus <strong>clientes (contas)</strong>. A tabela principal mostra nome, Tier (A/B/C), Score Total, Estágio, MRR, Onda, Próximo Passo e Data.</p>
      <div className={S.bq}>As contas são ordenadas automaticamente pelo <strong>Score Total</strong> (maior para menor).</div>

      <h3 className={S.h3}>5.2 Filtros</h3>
      <ul className={S.ul}>
        <li><strong>Busca por nome</strong> — campo de texto</li>
        <li><strong>Tier</strong> — Todos, A, B ou C</li>
        <li><strong>Onda</strong> — Todas, 1, 2 ou 3</li>
        <li><strong>Responsável</strong> — Todos, Camila, Niésio ou Dupla</li>
      </ul>

      <h3 className={S.h3}>5.3 Criando uma Nova Conta</h3>
      <p className={S.p}>Clique no botão <strong>"+ Nova"</strong>. O formulário de criação tem as seguintes seções:</p>

      <h4 className={S.h4}>Dados do Cliente</h4>
      <table className={S.table}>
        <thead><tr><th className={S.th}>Campo</th><th className={S.th}>Obrigatório</th><th className={S.th}>Descrição</th></tr></thead>
        <tbody>
          <tr><td className={S.td}>Nome</td><td className={S.td}>✅</td><td className={S.td}>Nome da empresa/cliente</td></tr>
          <tr><td className={S.td}>Porte</td><td className={S.td}>✅</td><td className={S.td}>PME, Mid-Market ou Enterprise</td></tr>
          <tr><td className={S.td}>Segmento</td><td className={S.td}>✅</td><td className={S.td}>Agro, Construção, Distribuição, Educação, etc.</td></tr>
          <tr><td className={S.td}>Nome do ESN</td><td className={S.td}></td><td className={S.td}>Nome do parceiro ESN</td></tr>
          <tr><td className={S.td}>E-mail do ESN</td><td className={S.td}></td><td className={S.td}>E-mail do parceiro ESN</td></tr>
        </tbody>
      </table>

      <h4 className={S.h4}>Contato do Cliente / Sponsor</h4>
      <table className={S.table}>
        <thead><tr><th className={S.th}>Campo</th><th className={S.th}>Obrigatório</th><th className={S.th}>Descrição</th></tr></thead>
        <tbody>
          <tr><td className={S.td}>Nome</td><td className={S.td}>✅</td><td className={S.td}>Nome do contato principal</td></tr>
          <tr><td className={S.td}>Cargo</td><td className={S.td}></td><td className={S.td}>Cargo (ex: CTO, Diretor)</td></tr>
          <tr><td className={S.td}>Email</td><td className={S.td}>⚠️</td><td className={S.td}>Pelo menos email ou WhatsApp</td></tr>
          <tr><td className={S.td}>WhatsApp</td><td className={S.td}>⚠️</td><td className={S.td}>Pelo menos email ou WhatsApp</td></tr>
        </tbody>
      </table>

      <h4 className={S.h4}>Scoring (5 Dimensões)</h4>
      <p className={S.p}>Sliders de <strong>0 a 5</strong> para cada dimensão:</p>
      <table className={S.table}>
        <thead><tr><th className={S.th}>Dimensão</th><th className={S.th}>O que avalia</th><th className={S.th}>0</th><th className={S.th}>5</th></tr></thead>
        <tbody>
          <tr><td className={S.td}><strong>Potencial de Expansão</strong></td><td className={S.td}>Capacidade de crescimento</td><td className={S.td}>Nenhum</td><td className={S.td}>Muito alto</td></tr>
          <tr><td className={S.td}><strong>Maturidade de Uso</strong></td><td className={S.td}>Nível de uso atual do Fluig</td><td className={S.td}>Inexistente</td><td className={S.td}>Referência</td></tr>
          <tr><td className={S.td}><strong>Intensidade de Dores</strong></td><td className={S.td}>Quanto o cliente sofre com problemas</td><td className={S.td}>Nenhuma</td><td className={S.td}>Crítica</td></tr>
          <tr><td className={S.td}><strong>Risco de Churn</strong></td><td className={S.td}>Risco de perder o cliente</td><td className={S.td}>Nenhum</td><td className={S.td}>Crítico</td></tr>
          <tr><td className={S.td}><strong>Acesso ao Sponsor</strong></td><td className={S.td}>Facilidade de falar com o decisor</td><td className={S.td}>Bloqueado</td><td className={S.td}>Direto</td></tr>
        </tbody>
      </table>
      <p className={S.p}>O <strong>Score Total</strong> define automaticamente:</p>
      <ul className={S.ul}>
        <li><strong>Tier A</strong> (≥ 20 pontos) → Prioridade máxima — Onda 1</li>
        <li><strong>Tier B</strong> (≥ 12 pontos) → Prioridade média — Onda 2</li>
        <li><strong>Tier C</strong> ({"< 12"} pontos) → Prioridade baixa — Onda 3</li>
      </ul>

      <h3 className={S.h3}>5.4 Editando uma Conta</h3>
      <ol className={S.ol}>
        <li>Na tabela, clique no ícone de <strong>lápis</strong> ao lado da conta</li>
        <li>O formulário de edição aparecerá preenchido</li>
        <li>Você pode alterar estágio, MRR estimado/fechado, próximo passo, datas</li>
        <li>Clique em <strong>"Salvar Alterações"</strong></li>
      </ol>

      <h3 className={S.h3}>5.5 Excluindo uma Conta</h3>
      <div className={S.bq}><strong>Atenção:</strong> Ao excluir uma conta, todas as oportunidades, visitas e relatórios associados também serão removidos.</div>

      <h3 className={S.h3}>5.6 Exportando para CSV</h3>
      <p className={S.p}>Clique no ícone de <strong>download</strong> no topo da tabela para baixar a lista filtrada em formato CSV (abrível no Excel).</p>

      <hr className={S.hr} />

      {/* ── 6. Pipeline ── */}
      <h2 className={S.h2} id="pipeline">6. Módulo Pipeline</h2>

      <h3 className={S.h3}>6.1 O que é o Pipeline?</h3>
      <p className={S.p}>O Pipeline mostra suas <strong>oportunidades de vendas</strong> organizadas por estágio. Existem 8 estágios sequenciais:</p>
      <pre className={S.pre}>{`Selecionado → Contato → Visita Agendada → Visita Realizada → Diagnóstico → Proposta → Negociação → Works Fechado
                                                                                                        ↓
                                                                                                     Perdido`}</pre>

      <h3 className={S.h3}>6.2 Vista Kanban</h3>
      <p className={S.p}>A vista padrão mostra os estágios como <strong>colunas</strong> com cards. Cada card mostra nome, Tier, Score, Aging e MRR.</p>
      <p className={S.p}><strong>Movendo oportunidades (drag & drop):</strong> Arraste o card de uma coluna para outra. A mudança é salva automaticamente.</p>

      <h3 className={S.h3}>6.3 Vista Lista</h3>
      <p className={S.p}>Clique em <strong>"Lista"</strong> no topo para ver as oportunidades em formato de tabela.</p>

      <h3 className={S.h3}>6.4 Ações nos Cards</h3>
      <ul className={S.ul}>
        <li><strong>Avançar</strong> para o próximo estágio</li>
        <li><strong>Voltar</strong> para o estágio anterior</li>
        <li><strong>Marcar como Perdido</strong> (será solicitado o motivo)</li>
        <li><strong>Marcar como Won</strong> — ao fechar, informe o MRR fechado</li>
      </ul>

      <h3 className={S.h3}>6.5 Regra de Unicidade</h3>
      <p className={S.p}>Cada conta pode ter <strong>apenas uma oportunidade ativa</strong> por vez.</p>

      <h3 className={S.h3}>6.6 Exportação</h3>
      <ul className={S.ul}>
        <li><strong>CSV</strong> — botão de download no canto superior</li>
        <li><strong>PDF</strong> — gera um relatório profissional do pipeline</li>
      </ul>

      <hr className={S.hr} />

      {/* ── 7. Roteiro ── */}
      <h2 className={S.h2} id="roteiro">7. Módulo Roteiro de Visita</h2>

      <h3 className={S.h3}>7.1 O que é?</h3>
      <p className={S.p}>O Roteiro de Visita é um <strong>assessment consultivo estruturado</strong> para visitas a clientes. Guia o consultor por 6 etapas.</p>

      <h3 className={S.h3}>7.2 Criando uma Nova Visita</h3>
      <ol className={S.ol}>
        <li>Clique em <strong>"Nova Visita"</strong></li>
        <li>Selecione a <strong>conta</strong> (cliente) a ser visitada</li>
        <li>O wizard iniciará com 6 etapas:</li>
      </ol>

      <table className={S.table}>
        <thead><tr><th className={S.th}>Etapa</th><th className={S.th}>O que coleta</th></tr></thead>
        <tbody>
          <tr><td className={S.td}><strong>1 — Pré-Visita</strong></td><td className={S.td}>Data da visita, modalidade (Presencial/Remota), participantes do cliente</td></tr>
          <tr><td className={S.td}><strong>2 — Processos</strong></td><td className={S.td}>Processos descritos, dores identificadas, impacto no negócio</td></tr>
          <tr><td className={S.td}><strong>3 — Automação</strong></td><td className={S.td}>Nível de automação (Nenhuma → Avançada), gaps identificados</td></tr>
          <tr><td className={S.td}><strong>4 — Integrações</strong></td><td className={S.td}>Sistemas integrados/a integrar, status atual</td></tr>
          <tr><td className={S.td}><strong>5 — Governança</strong></td><td className={S.td}>Problemas de governança, engajamento do sponsor (Alto/Médio/Baixo)</td></tr>
          <tr><td className={S.td}><strong>6 — Síntese</strong></td><td className={S.td}>Hipótese Works, escopo preliminar, objeções, próximo passo, data</td></tr>
        </tbody>
      </table>

      <h3 className={S.h3}>7.3 Salvamento Automático</h3>
      <p className={S.p}>O sistema salva automaticamente <strong>a cada 30 segundos</strong> e <strong>ao sair de um campo</strong>. Você não precisa se preocupar em perder dados!</p>

      <h3 className={S.h3}>7.4 Geração Automática de Relatório</h3>
      <p className={S.p}>Ao concluir a visita (etapa Síntese), o sistema pode <strong>gerar automaticamente um rascunho de relatório</strong> com os dados coletados.</p>

      <hr className={S.hr} />

      {/* ── 8. Relatórios ── */}
      <h2 className={S.h2} id="relatorios">8. Módulo Relatórios</h2>

      <h3 className={S.h3}>8.1 Tipos</h3>
      <ul className={S.ul}>
        <li><strong>Relatório Executivo</strong> — síntese para o cliente</li>
        <li><strong>Proposta Works</strong> — proposta comercial detalhada</li>
      </ul>

      <h3 className={S.h3}>8.2 Fluxo de Aprovação</h3>
      <p className={S.p}>Os relatórios seguem 3 etapas:</p>
      <pre className={S.pre}>{`📝 Rascunho  →  🔍 Revisão  →  ✅ Enviado`}</pre>

      <h3 className={S.h3}>8.3 Editando um Relatório</h3>
      <p className={S.p}>Todos os campos são <strong>editáveis diretamente</strong> no card: Título, Contexto do Cliente, Dores Priorizadas, Impacto Estimado, Solução Proposta, Entregáveis, Investimento (MRR), Prazo de Implantação. As alterações são salvas automaticamente ao sair do campo.</p>

      <h3 className={S.h3}>8.4 Filtros</h3>
      <ul className={S.ul}>
        <li><strong>Busca</strong> — por nome do cliente ou título</li>
        <li><strong>Status</strong> — Rascunho, Revisão ou Enviado</li>
        <li><strong>Tipo</strong> — Relatório Executivo ou Proposta Works</li>
      </ul>

      <h3 className={S.h3}>8.5 Exportação PDF</h3>
      <p className={S.p}>Clique no ícone de <strong>PDF</strong> no card do relatório para gerar um documento profissional com header Fluig, dados do cliente, seções formatadas, data e responsável.</p>

      <hr className={S.hr} />

      {/* ── 9. Perfil ── */}
      <h2 className={S.h2} id="perfil">9. Perfil do Usuário</h2>
      <p className={S.p}>Clique nas suas iniciais no canto superior direito e selecione <strong>"Perfil"</strong>.</p>
      <table className={S.table}>
        <thead><tr><th className={S.th}>Campo</th><th className={S.th}>Editável</th></tr></thead>
        <tbody>
          <tr><td className={S.td}>Nome</td><td className={S.td}>✅</td></tr>
          <tr><td className={S.td}>Empresa</td><td className={S.td}>✅</td></tr>
          <tr><td className={S.td}>Cargo</td><td className={S.td}>✅</td></tr>
          <tr><td className={S.td}>Telefone</td><td className={S.td}>✅</td></tr>
          <tr><td className={S.td}>E-mail</td><td className={S.td}>❌ (usado para login)</td></tr>
        </tbody>
      </table>

      <hr className={S.hr} />

      {/* ── 10. Admin ── */}
      <h2 className={S.h2} id="admin">10. Painel Administrativo</h2>
      <div className={S.bq}><strong>Acesso restrito:</strong> somente usuários com papel de administrador.</div>
      <p className={S.p}>Clique nas suas iniciais e selecione <strong>"Admin"</strong>, ou acesse diretamente pela URL <code className={S.code}>/admin</code>.</p>

      <h3 className={S.h3}>10.1 Solicitações de Acesso</h3>
      <table className={S.table}>
        <thead><tr><th className={S.th}>Ação</th><th className={S.th}>O que acontece</th></tr></thead>
        <tbody>
          <tr><td className={S.td}><strong>Aprovar</strong></td><td className={S.td}>Cria o usuário no sistema com senha temporária e envia por e-mail</td></tr>
          <tr><td className={S.td}><strong>Recusar</strong></td><td className={S.td}>Rejeita a solicitação (é possível informar o motivo)</td></tr>
        </tbody>
      </table>

      <h3 className={S.h3}>10.2 Gerenciamento de Usuários</h3>
      <ul className={S.ul}>
        <li><strong>Criar Usuário</strong> — cria um novo usuário diretamente (sem solicitação)</li>
        <li><strong>Ativar/Desativar</strong> — controla o acesso do usuário à plataforma</li>
      </ul>

      <hr className={S.hr} />

      {/* ── 11. FAQ ── */}
      <h2 className={S.h2} id="faq">11. Dúvidas Frequentes (FAQ)</h2>

      <h3 className={S.h3}>A oportunidade apareceu duplicada no Pipeline. O que fazer?</h3>
      <p className={S.p}>Isso foi corrigido na versão mais recente. Atualize a página (F5) e o item duplicado desaparecerá.</p>

      <h3 className={S.h3}>Posso criar mais de uma oportunidade para o mesmo cliente?</h3>
      <p className={S.p}>Não. Cada conta pode ter <strong>apenas uma oportunidade ativa</strong> por vez. Ao fechar (Won) ou perder, será possível criar uma nova.</p>

      <h3 className={S.h3}>Como mudo o estágio de uma oportunidade?</h3>
      <ul className={S.ul}>
        <li><strong>Pipeline Kanban:</strong> arraste o card para a coluna desejada</li>
        <li><strong>Edição da conta:</strong> clique no lápis → dropdown de estágio</li>
      </ul>

      <h3 className={S.h3}>Meus dados são salvos automaticamente?</h3>
      <ul className={S.ul}>
        <li><strong>Roteiro de Visita:</strong> sim, a cada 30 segundos + ao sair do campo</li>
        <li><strong>Relatórios:</strong> sim, ao sair do campo</li>
        <li><strong>Contas e Pipeline:</strong> ao clicar nos botões</li>
      </ul>

      <h3 className={S.h3}>Como exporto relatórios em PDF?</h3>
      <p className={S.p}>No módulo Relatórios, clique no ícone de PDF no card do relatório desejado.</p>

      <h3 className={S.h3}>Esqueci minha senha. O que faço?</h3>
      <p className={S.p}>Na tela de login, clique em <strong>"Esqueci minha senha"</strong> e siga as instruções.</p>

      <h3 className={S.h3}>Quem pode aprovar solicitações de acesso?</h3>
      <p className={S.p}>Apenas usuários com papel de <strong>administrador</strong>.</p>

      <hr className={S.hr} />

      <p className="text-center text-xs text-muted-foreground mt-8">
        <strong>Fluig Board</strong> — Gestão Comercial Inteligente<br />
        Em caso de dúvidas, entre em contato com o administrador do sistema.
      </p>
    </div>
  )
}
