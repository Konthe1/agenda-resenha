"use client";

import { useState } from "react";
import Link from "next/link";
import "./page.css";

export default function Home() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <div className="landing-container">
      {/* Background Decor */}
      <div className="bg-decorations">
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>
      </div>

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'contain' }} />
          <span style={{ fontSize: '1.75rem' }}>Agenda<span className="accent">Resenha</span></span>
        </div>
        <div className="nav-links">
          <a href="#recursos" className="nav-link">Recursos</a>
          <a href="#depoimentos" className="nav-link">Cases de Sucesso</a>
          <a href="#precos" className="nav-link">Preços</a>
          <a href="#faq" className="nav-link">FAQ</a>
        </div>
        <div className="nav-actions">
          <Link href="/login" className="nav-link">Entrar</Link>
          <Link href="/login" className="btn-primary" style={{ padding: '0.6rem 1.25rem' }}>Criar Conta</Link>
        </div>
        
        {/* Mobile menu toggle */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-dropdown animate-fade-in">
            <a href="#recursos" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Recursos</a>
            <a href="#depoimentos" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Cases de Sucesso</a>
            <a href="#precos" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Preços</a>
            <a href="#faq" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>FAQ</a>
            <div className="mobile-actions">
              <Link href="/login" className="btn-secondary" onClick={() => setIsMobileMenuOpen(false)}>Entrar</Link>
              <Link href="/login" className="btn-primary" onClick={() => setIsMobileMenuOpen(false)}>Criar Conta</Link>
            </div>
          </div>
        )}
      </nav>

      <main className="landing-content">
        {/* Hero Section */}
        <section className="hero-section animate-fade-in">
          <img src="/logo.png" alt="Resenha Logo Oficial" style={{ width: '180px', height: '180px', borderRadius: '32px', objectFit: 'contain', margin: '0 auto 1.5rem auto', display: 'block', boxShadow: '0 10px 30px rgba(249, 115, 22, 0.2)' }} />
          <div className="badge">🚀 O Novo Padrão para Barbearias</div>
          <h1 className="hero-title">
            Profissionalize sua barbearia sem perder a <span className="highlight">essência da resenha!</span>
          </h1>
          <p className="hero-subtitle">
            O único sistema inteligente focado no lucro do dono. Agendamentos 24h, notificações no WhatsApp e zero dor de cabeça para você focar no corte e nos amigos.
          </p>
          <div className="hero-actions">
            <Link href="/login" className="btn-primary" style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem' }}>
              <span>Começar Agora — Grátis por 14 dias</span>
              <span className="arrow">→</span>
            </Link>
            <Link href="/demo-agendamento" className="btn-secondary" style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem' }}>
              <span>Ver Demo (Visão do Cliente)</span>
            </Link>
          </div>
          <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
             <span style={{ color: '#fbbf24' }}>⭐⭐⭐⭐⭐</span> +30 barbearias já mudaram o jogo
          </p>
        </section>

        {/* Demonstration Gallery (New) */}
        <section id="demonstracao" className="section-header animate-fade-in" style={{ padding: '4rem 2rem' }}>
          <div className="badge">📱 Por Dentro da Plataforma</div>
          <h2>Tudo o que você precisa no seu celular</h2>
          <p>Gestão completa, rápida e intuitiva. Sem complicação.</p>
          
          <div className="gallery-grid" style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
             <div className="gallery-item" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <span style={{ fontSize: '1.2rem' }}>📊</span>
                   <strong style={{ fontSize: '0.9rem' }}>Dashboard Inteligente</strong>
                </div>
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', overflow: 'hidden' }}>
                   <img src="/dashboard_preview.png" alt="Dashboard Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
             </div>
             
             <div className="gallery-item" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <span style={{ fontSize: '1.2rem' }}>📅</span>
                   <strong style={{ fontSize: '0.9rem' }}>Agenda em Tempo Real</strong>
                </div>
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', overflow: 'hidden' }}>
                   <img src="/agenda_preview.png" alt="Agenda Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
             </div>

             <div className="gallery-item" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <span style={{ fontSize: '1.2rem' }}>💬</span>
                   <strong style={{ fontSize: '0.9rem' }}>Notificação WhatsApp</strong>
                </div>
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', overflow: 'hidden' }}>
                   <img src="/whatsapp_preview.png" alt="WhatsApp Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
             </div>
          </div>
        </section>

        {/* Features */}
        <section id="recursos" className="section-header">
          <h2>Tudo que sua barbearia precisa, em um só lugar.</h2>
          <p>Abandonar o caderno e o WhatsApp manual nunca foi tão fácil e rápido.</p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📲</div>
              <h3>Integração WhatsApp Nativa</h3>
              <p>O cliente recebe a confirmação e lembrete automático 2h antes do corte. Diga adeus aos esquecimentos e buracos na agenda.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Zero Burocracia (Sem Login)</h3>
              <p>Seu cliente não precisa baixar app nem criar senha. Ele clica no seu link do Instagram, escolhe o horário e pronto.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Dashboard Financeiro Real-Time</h3>
              <p>Acompanhe faturamento, ticket médio e serviços mais vendidos direto do seu celular, atualizado instantaneamente a cada corte.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💇‍♂️</div>
              <h3>Ficha de Clientes Automática</h3>
              <p>A cada agendamento, o sistema salva o histórico do cliente. Saiba exatamente quando ele veio pela última vez e o que ele cortou.</p>
            </div>
          </div>
        </section>

        {/* Como Funciona */}
        <section id="como-funciona" className="section-header">
           <div className="badge">Passo a Passo</div>
           <h2>Como funciona? Simples como um degradê.</h2>
           <p>Você não precisa ser expert em tecnologia. Nós cuidamos da parte chata.</p>
           
           <div className="steps-container" style={{ marginTop: '3rem', width: '100%' }}>
              <div className="step-item">
                 <div className="step-number">1</div>
                 <h4>Crie sua conta em 2 min</h4>
                 <p>Cadastre seus serviços e barbeiros. É mais rápido que fazer uma barba.</p>
              </div>
              <div className="step-arrow">→</div>
              <div className="step-item">
                 <div className="step-number">2</div>
                 <h4>Coloque o link no Instagram</h4>
                 <p>Compartilhe seu link exclusivo na bio e nos stories. Seus clientes vão amar.</p>
              </div>
              <div className="step-arrow">→</div>
              <div className="step-item">
                 <div className="step-number">3</div>
                 <h4>Receba Agendamentos 24h</h4>
                 <p>O sistema reserva o horário, avisa você e envia lembrete pro cliente via WhatsApp.</p>
              </div>
           </div>
        </section>

        {/* Comparativo Section */}
        <section className="section-header" style={{ background: 'rgba(255,255,255,0.02)', padding: '4rem 2rem', borderRadius: '24px', border: '1px solid var(--bg-tertiary)' }}>
           <h2>Resenha vs. Velha Escola</h2>
           <p>Por que os melhores barbeiros estão abandonando o caderninho e o WhatsApp manual?</p>
           
           <div className="comparison-table" style={{ marginTop: '3rem', width: '100%', maxWidth: '900px' }}>
              <div className="comparison-row header">
                 <div className="comp-feature">Funcionalidade</div>
                 <div className="comp-manual">Agendamento Manual</div>
                 <div className="comp-resenha">Agenda Resenha 🚀</div>
              </div>
              <div className="comparison-row">
                 <div className="comp-feature">Disponibilidade</div>
                 <div className="comp-manual">Só quando você responde</div>
                 <div className="comp-resenha">24h por dia, 7 dias por semana</div>
              </div>
              <div className="comparison-row">
                 <div className="comp-feature">Lembretes</div>
                 <div className="comp-manual">Você tem que lembrar de enviar</div>
                 <div className="comp-resenha">Automático via WhatsApp</div>
              </div>
              <div className="comparison-row">
                 <div className="comp-feature">Esquecimentos</div>
                 <div className="comp-manual">Alta taxa de "furos"</div>
                 <div className="comp-resenha">Redução de até 90% nos furos</div>
              </div>
              <div className="comparison-row">
                 <div className="comp-feature">Gestão</div>
                 <div className="comp-manual">Caderno ou planilha lenta</div>
                 <div className="comp-resenha">Dashboard financeiro instantâneo</div>
              </div>
           </div>
        </section>

        {/* Testimonials */}
        <section id="depoimentos" className="section-header">
          <h2>Barbearias que mudaram o jogo</h2>
          <p>Não acredite apenas na gente. Veja o impacto real no bolso dos nossos parceiros.</p>
          
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="quote-icon">"</div>
              <p className="testimonial-text">Antes nós perdemos pelo menos 3 a 4 horários no sábado porque o pessoal esquecia. Desde que ligamos o disparo de WhatsApp do Resenha, nossa taxa de comparecimento foi para 98%.</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                   <img src="/marcos_navalha_headshot_1773373064245.png" alt="Marcos Ribeiro" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                </div>
                <div className="author-info">
                  <h4>Marcos Ribeiro</h4>
                  <span>Dono, Brotherhood Shop</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="quote-icon">"</div>
              <p className="testimonial-text">A facilidade pro cliente é absurda. Eles mesmos elogiam que não precisam fazer cadastro chato. Clicou no link da bio, escolheu o barbeiro, tá agendado. Dobramos o faturamento mensal.</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                   <img src="/thiago_silva_headshot_1773373080523.png" alt="Thiago Silva" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                </div>
                <div className="author-info">
                  <h4>Thiago Silva</h4>
                  <span>Sócio, The Classic Barber</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Hook */}
        <section className="section-header" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
           <div className="badge" style={{ background: 'rgba(249, 115, 22, 0.1)', color: 'var(--accent-primary)' }}>Experimente Agora</div>
           <h2 style={{ fontSize: '2.5rem', marginTop: '1rem' }}>Sinta a facilidade na pele.</h2>
           <p style={{ maxWidth: '700px' }}>Veja exatamente como seu cliente vai agendar com você. Sem senha, sem app, sem fricção. É clicar e marcar.</p>
           <div style={{ marginTop: '2.5rem' }}>
              <Link href="/demo-agendamento" className="btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.1rem', background: 'transparent', border: '2px solid var(--accent-primary)', color: 'var(--accent-primary)', boxShadow: 'none' }}>
                 <span>Simular Agendamento (Demo ao Vivo)</span>
              </Link>
           </div>
           <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>✨ O diferencial que vai colocar você na frente da concorrência</p>
        </section>

        {/* Pricing */}
        <section id="precos" className="section-header">
          <h2>Planos Simples e Transparentes</h2>
          <p>Escolha o plano ideal para o tamanho do seu negócio. Cancele quando quiser.</p>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem', marginBottom: '3rem' }}>
            <span style={{ fontWeight: !isAnnual ? 'bold' : 'normal', color: !isAnnual ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setIsAnnual(false)}>Mensal</span>
            <div 
              style={{ width: '60px', height: '32px', background: 'var(--accent-primary)', borderRadius: '30px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}
              onClick={() => setIsAnnual(!isAnnual)}
            >
              <div style={{ width: '24px', height: '24px', background: 'white', borderRadius: '50%', position: 'absolute', top: '4px', left: isAnnual ? '32px' : '4px', transition: '0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
            </div>
            <span style={{ fontWeight: isAnnual ? 'bold' : 'normal', color: isAnnual ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setIsAnnual(true)}>
              Anual <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>Economize até 44%</span>
            </span>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Básico (1 Barbeiro Máximo)</h3>
                <div className="price"><span>R$</span>{isAnnual ? '39' : '59'}<span>,99 /mês</span></div>
                <div className="price-sub">{isAnnual ? 'Cobrado R$ 479,88 anualmente' : 'Cobrado mensalmente. Ideal para autônomos.'}</div>
              </div>
              <ul className="pricing-features">
                <li>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  Agendamentos ilimitados
                </li>
                <li>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  Link personalizado na bio
                </li>
                <li>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  Lembretes Básicos via WhatsApp
                </li>
                <li>
                   <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '1.25rem' }}>⚠️ Sem Gestão de Estoque e Fidelidade</span>
                </li>
              </ul>
              <Link href="/login" className="btn-secondary" style={{ width: '100%', textAlign: 'center' }}>Começar Agora</Link>
            </div>

            <div className="pricing-card popular">
              <div className="popular-badge">Mais Escolhido</div>
              <div className="pricing-header">
                <h3>Resenha Pro (Até 5 Barbeiros)</h3>
                <div className="price"><span>R$</span>{isAnnual ? '83' : '149'}<span>,{isAnnual ? '33' : '90'} /mês</span></div>
                <div className="price-sub">{isAnnual ? 'Cobrado R$ 1.000,00 anualmente' : 'Barbeiros extras por +R$50/mês cada'}</div>
              </div>
              <ul className="pricing-features">
                <li>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  Tudo do plano Básico
                </li>
                <li>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  Disparos e **Áudios** no WhatsApp
                </li>
                <li>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  Gestão PRO (Estoque, Vendas, Financeiro)
                </li>
                <li>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  Fidelidade, Cashback e Mensagens em Massa
                </li>
                <li style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Foco Total no Aumento do seu Lucro
                </li>
              </ul>
              <button 
                onClick={async () => {
                   try {
                     const res = await fetch('/api/pagamento/checkout', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({
                          barberiaId: 'novo-cliente', // Em prop real isso viria pós login
                          email: 'comprador@email.com',
                          name: 'Novo Dono de Barbearia',
                          planId: isAnnual ? 'pro_anual' : 'pro_mensal'
                       })
                     });
                     const data = await res.json();
                     if (data.init_point) {
                       window.location.href = data.init_point;
                     }
                   } catch (e) {
                     alert("Erro ao redirecionar para pagamento.");
                   }
                }}
                className="btn-primary" 
                style={{ width: '100%', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', border: 'none', boxShadow: '0 4px 14px 0 rgba(249, 115, 22, 0.39)', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>{isAnnual ? 'Assinar Plano Anual 🏆' : 'Assinar Plano Pro Mensal'}</span>
                  <span style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 400, color: '#fff' }}>{isAnnual ? 'Apenas R$ 83,33/mês' : 'R$ 149,90/mês sem fidelidade'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="section-header">
          <h2>Perguntas Frequentes</h2>
          <p>Tire suas dúvidas antes de começar</p>
          
          <div className="faq-section text-left w-full" style={{ textAlign: 'left', width: '100%' }}>
            <div className="faq-item">
              <div className="faq-question">
                Preciso comprar um equipamento especial para usar o Agenda Resenha?
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                Não! Nosso sistema roda direto na nuvem. Você, seus barbeiros e seus clientes acessam tudo direto navegador pelo celular, tablet ou computador.
              </div>
            </div>
            
            <div className="faq-item">
              <div className="faq-question">
                Como funciona a integração com WhatsApp? Eu pago por mensagem?
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                Não cobramos por mensagem enviada. Nós conectamos via QR Code direto no WhatsApp do seu celular na barbearia. É seguro, rápido e não possui custos ocultos com a Meta.
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question">
                 A partir de quando começo a pagar?
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                 Você tem 14 dias de teste totalmente grátis, sem precisar colocar cartão de crédito agora. Só paga se o sistema realmente te ajudar a ganhar mais dinheiro.
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question">
                 Funciona se eu tiver apenas um barbeiro?
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                 Com certeza! O Plano Básico foi feito exatamente para barbearias individuais. Conforme você cresce e contrata equipe, pode migrar para o Pro.
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question">
                 E se o meu cliente não tiver WhatsApp?
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                 O agendamento é feito via link web (pelo navegador), então qualquer um com internet consegue agendar. O WhatsApp é usado para enviar os lembretes automáticos após o agendamento.
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question">
                 Quanto tempo leva para configurar tudo?
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                 Menos de 10 minutos. Você cadastra o nome da sua barbearia, seus serviços e pronto. Já pode começar a aceitar agendamentos na mesma hora.
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="cta-section">
           <div className="cta-box">
             <h2>Pronto para profissionalizar sua barbearia?</h2>
             <p>Junte-se a centenas de barbeiros que otimizam o tempo e faturam mais todo mês. Teste grátis nos primeiros 14 dias.</p>
             <div className="cta-buttons" style={{ marginTop: '1rem' }}>
                <Link href="/login" className="btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.2rem' }}>
                  <span>Quero parar de perder cliente por esquecimento →</span>
                </Link>
             </div>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-col">
            <div className="nav-brand" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img src="/logo.png" alt="Logo" style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'contain' }} />
              <span style={{ fontSize: '1.75rem' }}>Agenda<span className="accent">Resenha</span></span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              O SaaS que transforma qualquer barbearia comum em uma operação moderna e lucrativa. Feito com amor por quem entende de cabelo e código.
            </p>
          </div>
          
          <div className="footer-col">
            <h4>Produto</h4>
            <ul className="footer-links">
              <li><a href="#recursos">Recursos</a></li>
              <li><a href="#precos">Preços</a></li>
              <li><a href="#depoimentos">Cases de Sucesso</a></li>
              <li><Link href="/demo-agendamento">Ver Demonstração</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Suporte</h4>
            <ul className="footer-links">
              <li><Link href="/docs">Central de Ajuda</Link></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="mailto:contato@agendaresenha.com">Fale Conosco</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li><Link href="/termos">Termos de Uso</Link></li>
              <li><Link href="/privacidade">Política de Privacidade</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Agenda Resenha. Todos os direitos reservados.</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>Instagram</a>
            <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>WhatsApp</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
