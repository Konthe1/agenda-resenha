"use client";

import { useState } from "react";
import Link from "next/link";
import "./docs.css";

const articles: Record<string, { title: string; content: React.ReactNode }> = {
  introducao: {
    title: "Introdução ao Sistema",
    content: (
      <>
        <p>Bem-vindo ao <strong>Agenda Resenha</strong>! O sistema premium desenvolvido para transformar a gestão da sua barbearia, eliminando papéis e automatizando o seu atendimento num fluxo que trabalha 24 horas por dia por você.</p>
        <p>Nosso objetivo é garantir que seu único trabalho seja focar no cliente que está na cadeira. Nós cuidamos dos agendamentos, dos lembretes automatizados enviados direto no seu WhatsApp e de toda a gestão de caixa da sua loja.</p>
        
        <h3>Principais Módulos do Sistema</h3>
        <ul>
          <li><strong>Agenda:</strong> Visualize todos os agendamentos do dia em num calendário intuitivo.</li>
          <li><strong>Clientes:</strong> Uma carteira digital automática. Quem agenda sua barbearia publicamente já cai na sua base de clientes, pronto para ações de marketing.</li>
          <li><strong>Configurações:</strong> Molde o sistema. Preços que variam por profissional, duração de serviços e perfis da equipe.</li>
          <li><strong>Financeiro:</strong> Relatórios rápidos de Faturamento, Despesas, Lucro Líquido e Ticket Médio.</li>
          <li><strong>Marketing:</strong> Disparos em massa pelo WhatsApp e um Cartão Fidelidade digital configurável.</li>
        </ul>
      </>
    )
  },
  configuracao: {
    title: "Configurando sua Barbearia",
    content: (
      <>
        <p>A primeira coisa a se fazer após o primeiro login é deixar o sistema com a sua identidade visual da sua marca.</p>
        
        <h3>Aparência do seu Link</h3>
        <p>Quando o cliente clica para agendar, ele verá as suas cores e a sua logo. Para personalizar isso:</p>
        <ul>
          <li>Vá no menu lateral esquerdo e clique em <strong>Configurações</strong>.</li>
          <li>A primeira aba é o <strong>Perfil da Barbearia</strong>. Ali você digita o nome público da sua barbearia e do dono.</li>
          <li>Role a tela até a aba de <strong>Aparência</strong>.</li>
          <li>Você pode colar o endereço (URL) da sua Logomarca, ou apenas deixar em branco para ele exibir uma logo em emoji ✂️ moderna. E o principal: <strong>Altere a Cor Principal</strong> da sua barbearia (ex: Laranja, Preto, Azul).</li>
          <li>Após ajustar tudo, role a tela e aperte o botão roxo de <strong>Salvar Configurações</strong>.</li>
        </ul>
      </>
    )
  },
  servicos: {
    title: "Cadastrando Serviços e Preços Individuais",
    content: (
      <>
        <p>O coração financeiro do seu sistema dita os valores e tempo de atendimento na tela de serviços do cliente.</p>
        
        <h3>Adicionando o Menu de Serviços</h3>
        <ul>
           <li>Vá em <strong>Configurações</strong> e clique no botão preto <strong>"+ Novo Serviço"</strong>.</li>
           <li>Inseara o Nome (Ex: Corte Degradê), a Descrição (Ex: Somente tesoura e máquina de acabamento), Preço e Duração.</li>
           <li>Todos os serviços cadastrados ficam listados em formato de tabela! Você pode excluí-los em segurança no botão da lixeira vermelha.</li>
        </ul>

        <h3>Preços Individuais (Profissionais diferentes, preços diferentes!)</h3>
        <div className="doc-alert">
           <p><strong>Dica de Ouro:</strong> Seu Master Barber cobra R$50 e o Junior Barber cobra R$30 no mesmíssimo corte degradê? O Agenda Resenha resolve isso.</p>
        </div>
        <p>Após criar um serviço, preste atenção à tabela: Abaixo do título de cada serviço ficam as miniaturas das cabeças dos barbeiros. Se você passar o mouse no barbeiro listado na linha daquele serviço, um campo se abrirá. <strong>Se você digitar R$ 30 ali, aquele barbeiro passará a cobrar esse valor específico por ele!</strong> Essa quantia vai direto pro link público de agendamento na hora em que o cliente escolher as opções dele.</p>
      </>
    )
  },
  barbeiros: {
    title: "Gerenciando Barbeiros (A sua Equipe)",
    content: (
      <>
        <p>Cresceu? Você precisa de um CRUD (Controle) individual em cima de cada profissional que aluga cadeira ou trabalha no seu estabelecimento.</p>
        
        <h3>Como convidar novos Barbeiros</h3>
        <ul>
          <li>No menu de <strong>Configurações</strong>, na linha "Gerenciar Equipe", aperte o botão verde <strong>"+ Novo Barbeiro"</strong>.</li>
          <li>Preencha o Nome de trabalho dele e sua principal Especialidade (ex: "Fade e Tesoura").</li>
          <li>O próprio sistema cuidará de criar e associar a logo dele automaticamente.</li>
        </ul>
        <p>A partir do milissegundo em que você aperta em Salvar, esse barbeiro estará disponível na tela pública para <strong>os clientes escolherem agendar exclusivamente com ele.</strong> Os relatórios financeiros da sua central também poderão separar o faturamento atrelado ao serviço de cada barbeiro na grade horária!</p>
      </>
    )
  },
  instagram: {
    title: "Colocando o Link Público no Instagram",
    content: (
      <>
        <p>Nenhuma automação faz milagre sem tráfego e divulgação! O seu link direto precisa estar acessível pros clientes 24 horas por dia.</p>
        
        <h3>Onde encontro meu link?</h3>
        <p>Acesse seu <strong>Dashboard (Painel)</strong> e no bloco "Link de Agendamento" clique no botão <strong>Copiar e Abrir ou Copiar Link</strong>. Se a sua loja for registrada como "Cortes do Zé", seu link público vitalício será do tipo: <code>agenda-resenha.vercel.app/cortesdoze</code>.</p>
        
        <h3>Como Colocar no seu Perfil</h3>
        <ul>
          <li>Entre pelo App do Instagram logado no perfil da Barbearia.</li>
          <li>Toque no botão <strong>Editar Perfil</strong>.</li>
          <li>Toque em <strong>Links</strong> ou <strong>Adicionar Link Externo</strong> e cole lá sua URL copiada do Dashboard.</li>
          <li>Altere a sua biografia do Insta colocando algo claro. Exemplo: <em>"Aperte o link abaixo 👇🏼 e garanta já o seu horário conosco!"</em>.</li>
        </ul>
      </>
    )
  },
  whatsapp: {
    title: "Como Conectar seu Número (QR Code)",
    content: (
      <>
        <p>O Agenda Resenha se destaca por ser o único sistema do mercado focado em barbearias que possui disparos de WhatsApp nativos <strong>sem cobranças por mensagem.</strong></p>
        <p>Em vez de usar a API oficial cara do Facebook, nós conectamos direto no aparelho da sua barbearia livre de custos de mensagem. É de forma totalmente automatizada.</p>

        <div className="doc-alert">
          <p><strong>⚠️ Atenção:</strong> Só é possível conectar 1 (um) número de WhatsApp por barbearia. Recomendamos usar o número comercial principal da loja em um aparelho exclusivamente dedicado.</p>
        </div>

        <h3>Passo a Passo da Conexão</h3>
        <ul>
          <li>Acesse <strong>Configurações</strong> e vá na aba <strong>WhatsApp</strong>.</li>
          <li>Clique em <strong>"Gerar QR Code de Conexão"</strong> e aguarde 2 a 5 segundos pro QR CODE quadrado abrir.</li>
          <li>Abra o WhatsApp no celular da barbearia.</li>
          <li>Vá em <strong>Configurações (ou os Três Pontinhos)</strong> &gt; <strong>Aparelhos Conectados</strong> &gt; <strong>Conectar um Aparelho</strong>.</li>
          <li>Aponte a tela e escaneie o código na tela do computador.</li>
        </ul>

        <div className="doc-alert" style={{ borderLeftColor: 'var(--success)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
          <p><strong>✅ Pronto!</strong> As notificações de agendamento começarão a ser enviadas para os clientes usando o seu número.</p>
        </div>
      </>
    )
  },
  mensagens: {
    title: "Marketing PRO: Cartão Fidelidade e Disparos",
    content: (
      <>
         <p>Clientes costumam se engajar muito mais e voltar muito em barbearias que recompensam. Nós temos um módulo focado 100% nisso disponível pros clientes Pro!</p>
         
         <h3>Aba de Fidelidade Dinâmica</h3>
         <p>Você pode controlar com quantos cortes uma pessoa pode se beneficiar:</p>
         <ul>
            <li>Vá na aba <strong>Marketing</strong>, no card de <strong>Cartão Fidelidade</strong>.</li>
            <li>Use o botão de <strong>Editar Regra (Ícone do lápis amarelo)</strong>.</li>
            <li>Altere os números de "Cortes Necessários" (Por ex: de 10 para 5) e modifique o Prêmio da vitória para "Corte + Freestyle por nossa conta". Logo depois, aperte Salvar. O sistema irá autualizar no exato instante a sua meta global. Clientes engajados não fogem!</li>
         </ul>

         <h3>Aba de Disparos em Massa</h3>
         <p>Além da automação, se amanhã no final da tarde a lista de agendados sumiu, você pode ativar listas urgentes de lembretes nas conversas ativas no WhatsApp de sua loja para garantir casa cheia em "dia fraco".</p>
         <ul>
           <li>Na primeira aba <strong>Disparos Rápidos</strong> do módulo Marketing, escreva seu texto livre ex: <em>"Bora dar aquele telento pro FDS? Tenho horários hoje."</em></li>
           <li>Escolha disparar pra base inteira da carteira de clientes, ou seja super-focado em disparar de forma customizada pra quem tem horários abertos! E depois clique somente no botão verde "Disparar SMS".</li>
         </ul>
      </>
    )
  },
  financeiro: {
    title: "Masterizando o Módulo Financeiro",
    content: (
       <>
         <p>Todas movimentações confirmadas dos clientes através do painel geral de Agendamentos sobem diretamente, sem nenhuma contabilidade chata posterior, pros cálculos avançados de Relatórios!</p>
         
         <h3>Filtros de Tempo Dinâmico</h3>
         <ul>
            <li>Na tela superior central em <strong>Dashboard Financeiro</strong>, encontre a aba branca de filtros com os termos "Mes", "Semana", "Hoje" ou Data personalizada.</li>
            <li>Quando você modifica e aperta Enter, <strong>todos</strong> os painéis do seu sistema de faturamento bruto mensal, ticket médio dos serviços agregados, a listar de custos futuros a receber se atualizam pro período especificado em milésimos!</li>
         </ul>

         <h3>Fechamento Imprimível em PDF</h3>
         <p>Precisa mandar pra contabilidade real ou entregar em papel impresso num fluxo grande do seu mês atual na hora do fechamento contábil?</p>
         <ul>
            <li>Há um enorme botão azul marinho nomeado <strong>"Imprimir Relatório"</strong>. Se apertar de desktop ou macbook, a interface criará e exibirá num preview lindo as suas finanças atuais com tabelas já pré-moduladas. Sinta-se a vontade para dar export e print PDF dele na sua plataforma padrão num clique.</li>
         </ul>
       </>
    )
  }
};

export default function Docs() {
  const [activeSection, setActiveSection] = useState<string>("introducao");

  const activeArticle = articles[activeSection] || articles["introducao"];

  return (
    <div className="docs-container">
      {/* Navbar Minimalista (Reaproveitada) */}
      <nav className="navbar" style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
        <Link href="/" className="nav-brand">
          <img src="/logo.png" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain' }} />
          <span>Agenda<span className="accent">Resenha</span></span>
        </Link>
        <div className="nav-actions">
          <Link href="/login" className="nav-link">Acessar Sistema</Link>
        </div>
      </nav>

      <header className="docs-header">
        <h1 className="docs-title">Central de Ajuda</h1>
        <p className="docs-subtitle">Tudo que você precisa saber para configurar e operar sua barbearia no Agenda Resenha com sucesso.</p>
        <div className="docs-search">
          <input type="text" placeholder="Buscar artigos (ex: configurar whatsapp)..." />
        </div>
      </header>

      <div className="docs-layout">
        <aside className="docs-sidebar">
          <div className="docs-nav-group">
            <h4>Primeiros Passos</h4>
            <ul className="docs-nav-links">
              <li>
                <button 
                  onClick={() => setActiveSection('introducao')} 
                  className={activeSection === 'introducao' ? 'active' : ''}
                  style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: activeSection === 'introducao' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left' }}
                >
                  Introdução ao Sistema
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('configuracao')} 
                  className={activeSection === 'configuracao' ? 'active' : ''}
                  style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: activeSection === 'configuracao' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left' }}
                >
                  Configurando sua Barbearia
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('instagram')} 
                  className={activeSection === 'instagram' ? 'active' : ''}
                  style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: activeSection === 'instagram' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left' }}
                >
                  Colocando o Link no Instagram
                </button>
              </li>
            </ul>
          </div>

          <div className="docs-nav-group">
            <h4>Configuração dos Negócios</h4>
            <ul className="docs-nav-links">
              <li>
                <button 
                  onClick={() => setActiveSection('servicos')} 
                  className={activeSection === 'servicos' ? 'active' : ''}
                  style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: activeSection === 'servicos' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left' }}
                >
                  Serviços e Preços Individuais
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('barbeiros')} 
                  className={activeSection === 'barbeiros' ? 'active' : ''}
                  style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: activeSection === 'barbeiros' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left' }}
                >
                  Gerenciando sua Equipe (Barbeiros)
                </button>
              </li>
            </ul>
          </div>

          <div className="docs-nav-group">
            <h4>Módulos Finais PRO</h4>
            <ul className="docs-nav-links">
              <li>
                <button 
                  onClick={() => setActiveSection('whatsapp')} 
                  className={activeSection === 'whatsapp' ? 'active' : ''}
                  style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: activeSection === 'whatsapp' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left' }}
                >
                  Conexão Robô de WhatsApp
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('mensagens')} 
                  className={activeSection === 'mensagens' ? 'active' : ''}
                  style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: activeSection === 'mensagens' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left' }}
                >
                  Fidelidade e Disparos em Massa
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('financeiro')} 
                  className={activeSection === 'financeiro' ? 'active' : ''}
                  style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: activeSection === 'financeiro' ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left' }}
                >
                  Fechamento e Financeiro Completo
                </button>
              </li>
            </ul>
          </div>
        </aside>

        <main className="docs-content animate-fade-in">
          <article className="doc-article">
            <h2>{activeArticle.title}</h2>
            {activeArticle.content}
          </article>
        </main>
      </div>
    </div>
  );
}
