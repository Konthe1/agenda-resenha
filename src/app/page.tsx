import Link from "next/link";
import "./page.css";

export default function Home() {
  return (
    <div className="landing-container">
      {/* Background Decor */}
      <div className="bg-decorations">
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>
      </div>

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <img src="/logo.png" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain' }} />
          <span>Agenda<span className="accent">Resenha</span></span>
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
      </nav>

      <main className="landing-content">
        {/* Hero Section */}
        <section className="hero-section animate-fade-in">
          <div className="badge">🚀 O Novo Padrão para Barbearias</div>
          <h1 className="hero-title">
            Zere os buracos na agenda com <span className="highlight">notificações automáticas!</span>
          </h1>
          <p className="hero-subtitle">
            O único sistema SaaS focado 100% em barbearias modernas. Agendamento em 30 segundos, avisos via WhatsApp e zero burocracia para você focar no corte perfeito.
          </p>
          <div className="hero-actions">
            <Link href="/login" className="btn-primary">
              <span>Começar Teste de 14 Dias</span>
              <span className="arrow">→</span>
            </Link>
            <Link href="/demo-agendamento" className="btn-secondary">
              <span>Ver Demo (Visão do Cliente)</span>
            </Link>
          </div>
        </section>

        {/* Social Proof */}
        <section className="social-proof animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <p>Potencializando a gestão de mais de 500 barbearias no Brasil</p>
          <div className="logo-cloud">
            <div className="logo-placeholder"><span>✂️</span> The Classic Barber</div>
            <div className="logo-placeholder"><span>💈</span> Navalha Premium</div>
            <div className="logo-placeholder"><span>🧔</span> Brotherhood Shop</div>
            <div className="logo-placeholder"><span>🔪</span> Sharp Fades</div>
            <div className="logo-placeholder"><span>🔥</span> Street Barbers</div>
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

        {/* Testimonials */}
        <section id="depoimentos" className="section-header">
          <h2>Barbearias que mudaram o jogo</h2>
          <p>Não acredite apenas na gente. Veja o impacto real no bolso dos nossos parceiros.</p>
          
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="quote-icon">"</div>
              <p className="testimonial-text">Antes nós perdemos pelo menos 3 a 4 horários no sábado porque o pessoal esquecia. Desde que ligamos o disparo de WhatsApp do Resenha, nossa taxa de comparecimento foi para 98%.</p>
              <div className="testimonial-author">
                <div className="author-avatar">M</div>
                <div className="author-info">
                  <h4>Marcos "Navalha" Ribeiro</h4>
                  <span>Dono, Brotherhood Shop</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="quote-icon">"</div>
              <p className="testimonial-text">A facilidade pro cliente é absurda. Eles mesmos elogiam que não precisam fazer cadastro chato. Clicou no link da bio, escolheu o barbeiro, tá agendado. Dobramos o faturamento mensal.</p>
              <div className="testimonial-author">
                <div className="author-avatar">T</div>
                <div className="author-info">
                  <h4>Thiago Silva</h4>
                  <span>Sócio, The Classic Barber</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="precos" className="section-header">
          <h2>Planos Simples e Transparentes</h2>
          <p>Escolha o plano ideal para o tamanho do seu negócio. Cancele quando quiser.</p>

          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Básico (1 a 2 Barbeiros)</h3>
                <div className="price"><span>R$</span>59<span>,99 /mês</span></div>
                <div className="price-sub">Cobrado mensalmente</div>
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
                  Dashboard Financeiro
                </li>
              </ul>
              <Link href="/login" className="btn-secondary">Assinar Básico</Link>
            </div>

            <div className="pricing-card popular">
              <div className="popular-badge">Mais Escolhido</div>
              <div className="pricing-header">
                <h3>Resenha Pro (Ilimitado)</h3>
                <div className="price"><span>R$</span>149<span>,99 /mês</span></div>
                <div className="price-sub">Para barbearias em crescimento</div>
              </div>
              <ul className="pricing-features">
                <li>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  Tudo do plano Básico
                </li>
                <li>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  Disparos automáticos no WhatsApp
                </li>
                <li>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  Gestão de Produtos (Estoque / Vendas)
                </li>
                <li>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  Planos Pré-Pagos / Mensalistas
                </li>
                <li>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  Fidelidade, Cashback e Mensagens em Massa
                </li>
              </ul>
              <Link href="/login" className="btn-primary" style={{ marginBottom: '1rem' }}>Assinar Mensal</Link>
              <Link href="/login" className="btn-secondary" style={{ width: '100%', padding: '0.8rem', fontSize: '0.9rem' }}>Plano Anual: R$ 1.000/ano (Economize R$ 799)</Link>
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
                Tem fidelidade ou multa de cancelamento?
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                Zero burocracia. O plano é mensal, sem letras miúdas. Se você não gostar do sistema (o que achamos difícil), você pode cancelar com 1 clique.
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
                <Link href="/login" className="btn-primary">
                  <span>Criar Conta Agora</span>
                  <span className="arrow">→</span>
                </Link>
             </div>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-col">
            <div className="nav-brand" style={{ marginBottom: '1rem' }}>
              <img src="/logo.png" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain' }} />
              <span>Agenda<span className="accent">Resenha</span></span>
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
            <a href="#" style={{ color: 'var(--text-secondary)' }}>Instagram</a>
            <a href="#" style={{ color: 'var(--text-secondary)' }}>LinkedIn</a>
            <a href="#" style={{ color: 'var(--text-secondary)' }}>YouTube</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
