import Link from "next/link";
import "../page.css";

export default function PrivacidadePage() {
  return (
    <div className="landing-container">
      <nav className="navbar" style={{ padding: '1rem 5%', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/" className="nav-brand" style={{ textDecoration: 'none' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'contain' }} />
          <span>Agenda<span className="accent">Resenha</span></span>
        </Link>
        <div className="nav-actions">
          <Link href="/login" className="btn-secondary">Voltar para Login</Link>
        </div>
      </nav>

      <main className="landing-content" style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem', textAlign: 'left', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--text-primary)' }}>Política de Privacidade</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Última atualização: 10 de Março de 2026</p>

        <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p>
            Sua privacidade é importante para nós. Esta Política de Privacidade explica como o <strong>Agenda Resenha</strong> coleta, usa, protege e compartilha as suas informações pessoais e as dos seus clientes.
          </p>

          <h2 style={{ color: 'var(--text-primary)', marginTop: '1rem', fontSize: '1.5rem' }}>1. Informações que Coletamos</h2>
          <p>
            <strong>Dados da Barbearia (Contratante):</strong> Nome do responsável, e-mail, telefone, nome da barbearia, endereço e dados de faturamento/pagamento.
            <br />
            <strong>Dados dos Clientes Finais:</strong> Nome e número de WhatsApp, que são inseridos no sistema tanto manualmente pela Barbearia quanto pelos próprios clientes através do Link Público de agendamento.
          </p>

          <h2 style={{ color: 'var(--text-primary)', marginTop: '1rem', fontSize: '1.5rem' }}>2. Como Utilizamos as Informações</h2>
          <p>
            Os dados coletados são utilizados única e exclusivamente para:
          </p>
          <ul style={{ paddingLeft: '2rem' }}>
             <li>Processar os agendamentos e organizar a agenda da barbearia;</li>
             <li>Disparar as notificações automatizadas via WhatsApp (confirmação, lembretes de horário, campanhas de marketing geradas pela barbearia);</li>
             <li>Gerar relatórios de faturamento visíveis apenas para a Barbearia que detém a conta.</li>
          </ul>

          <h2 style={{ color: 'var(--text-primary)', marginTop: '1rem', fontSize: '1.5rem' }}>3. Segurança e Armazenamento (Supabase)</h2>
          <p>
            O Agenda Resenha utiliza a infraestrutura do <strong>Supabase</strong> (um provedor sólido de banco de dados nativo em nuvem) para armazenar suas informações. Todos os bancos de dados possuem criptografia de ponta a ponta em repouso e implementamos Políticas de Segurança a Nível de Linha (RLS - Row Level Security), o que significa que é matematicamente impossível uma barbearia acessar os dados, a agenda ou os clientes de outra barbearia.
          </p>

          <h2 style={{ color: 'var(--text-primary)', marginTop: '1rem', fontSize: '1.5rem' }}>4. Compartilhamento de Dados</h2>
          <p>
            Nós <strong>nunca venderemos, alugaremos ou compartilharemos</strong> a sua lista de clientes ou os seus dados de faturamento com terceiros, agências de publicidade ou outras empresas. Os dados dos seus clientes pertencem inteiramente à sua Barbearia.
          </p>
          <p>
            Compartilhamos informações apenas com provedores de infraestrutura estritamente necessários para o funcionamento técnico do sistema (ex: servidores da Vercel para hospedagem e gateways de pagamento para processar as assinaturas).
          </p>

          <h2 style={{ color: 'var(--text-primary)', marginTop: '1rem', fontSize: '1.5rem' }}>5. Seus Direitos e Exclusão de Conta</h2>
          <p>
            Você tem o direito de solicitar a exclusão permanente de todos os seus dados e da sua base de clientes armazenada conosco. Ao cancelar a sua assinatura, você poderá acionar o nosso suporte para limpar toda a sua base de dados do nosso sistema de forma irreversível.
          </p>
        </div>
      </main>

      <footer className="footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2rem 5%', textAlign: 'center' }}>
         <p style={{ color: 'var(--text-secondary)' }}>&copy; {new Date().getFullYear()} Agenda Resenha. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
