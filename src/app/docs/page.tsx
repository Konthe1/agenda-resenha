"use client";

import Link from "next/link";
import "./docs.css";

export default function Docs() {
  return (
    <div className="docs-container">
      {/* Navbar Minimalista (Reaproveitada) */}
      <nav className="navbar" style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
        <Link href="/" className="nav-brand">
          <img src="/logo.png" alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'contain' }} />
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
              <li><Link href="#introducao" className="active">Introdução ao Sistema</Link></li>
              <li><Link href="#configuracao">Configurando sua Barbearia</Link></li>
              <li><Link href="#link-instagram">Colocando o Link no Instagram</Link></li>
            </ul>
          </div>

          <div className="docs-nav-group">
            <h4>WhatsApp e Automação</h4>
            <ul className="docs-nav-links">
              <li><Link href="#conectar-wpp">Como Conectar seu Número (QR Code)</Link></li>
              <li><Link href="#mensagens">Personalizar as Mensagens de Lembrete</Link></li>
              <li><Link href="#erros-wpp">O que fazer se o WhatsApp desconectar</Link></li>
            </ul>
          </div>

          <div className="docs-nav-group">
            <h4>Gestão de Barbeiros (Pro)</h4>
            <ul className="docs-nav-links">
              <li><Link href="#convidar">Convidando Barbeiros para a Equipe</Link></li>
              <li><Link href="#comissoes">Relatório de Comissões</Link></li>
            </ul>
          </div>
        </aside>

        <main className="docs-content">
          <article className="doc-article">
            <h2>Como Conectar seu Número (Integração WhatsApp via QR Code)</h2>
            
            <p>O Agenda Resenha se destaca por ser o único sistema do mercado focado em barbearias que possui disparos de WhatsApp nativos <strong>sem cobranças por mensagem.</strong></p>
            <p>Em vez de usar a API oficial cara do Facebook, nós conectamos direto no aparelho da sua barbearia. É como se você estivesse usando o WhatsApp Web, de forma totalmente automatizada.</p>

            <div className="doc-alert">
              <p><strong>⚠️ Atenção:</strong> Só é possível conectar 1 (um) número de WhatsApp por barbearia. Recomendamos imensamente usar o número comercial principal da loja, não o celular de uso pessoal.</p>
            </div>

            <h3>Passo 1: Prepare seu aparelho</h3>
            <p>Antes de conectar, garanta que o celular da barbearia (o que tem o WhatsApp Business instalado):</p>
            <ul>
              <li>Esteja com a bateria carregada ou na tomada;</li>
              <li>Esteja conectado à internet (preferencialmente Wi-Fi);</li>
              <li>Tenha o WhatsApp atualizado na última versão da loja de aplicativos.</li>
            </ul>

            <h3>Passo 2: Escaneando o QR Code</h3>
            <p>Siga os passos exatamente como descritos abaixo para gerar a ponte de conexão segura entre o nosso servidor SaaS e o seu WhatsApp.</p>
            <ul>
              <li>Acesse o <strong>Painel da Barbearia</strong> pelo seu computador de recepção.</li>
              <li>No menu lateral esquerdo, clique em <strong>Configurações</strong> e depois na aba <strong>WhatsApp</strong>.</li>
              <li>Clique no botão Laranja escrito <strong>"Gerar QR Code de Conexão"</strong>. Um código quadrado irá carregar na sua tela.</li>
              <li>Abra o WhatsApp no celular da barbearia.</li>
              <li>Toque em <strong>Configurações</strong> (ou reticências no topo) e vá em <strong>Aparelhos Conectados</strong>.</li>
              <li>Toque em <strong>Conectar um Aparelho</strong>, aponte a câmera pro monitor do computador e escaneie o código.</li>
            </ul>

            <div className="doc-alert" style={{ borderLeftColor: 'var(--success)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <p><strong>✅ Pronto!</strong> Se você leu a mensagem "Dispositivo Conectado com Sucesso", as notificações de agendamento já começarão a ser enviadas para os clientes usando o seu número.</p>
            </div>

            <h3>Dúvidas Frequentes sobre a Conexão</h3>
            <p><strong>O celular precisa ficar ligado 24h?</strong><br />
            A tecnologia atual do WhatsApp (Múltiplos Aparelhos) permite que as mensagens sejam enviadas pela nossa nuvem <em>mesmo se o celular descarregar ou ficar sem internet</em> por até 14 dias.</p>
            
            <p><strong>Posso continuar usando o WhatsApp normalmente?</strong><br />
            Sim. A automação enviará mensagens de agendamento, mas você ou sua recepcionista podem continuar atendendo clientes pelo mesmo celular ou no WhatsApp Web como de costume. A nossa automação não lerá a sua conversa pessoal nem responderá coisas aleatórias.</p>

            <div className="doc-nav-buttons">
              <Link href="#" className="doc-btn">
                <span>Anterior</span>
                <strong>Colocando o Link no Instagram</strong>
              </Link>
              
              <Link href="#" className="doc-btn next">
                <span>Próximo</span>
                <strong>Personalizar Mensagens de Lembrete</strong>
              </Link>
            </div>
          </article>
        </main>
      </div>
    </div>
  );
}
