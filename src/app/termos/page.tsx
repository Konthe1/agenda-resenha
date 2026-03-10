import Link from "next/link";
import "../page.css";

export default function TermosPage() {
  return (
    <div className="landing-container">
      <nav className="navbar" style={{ padding: '1rem 5%', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/" className="nav-brand" style={{ textDecoration: 'none' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'contain' }} />
          <span>Agenda<span className="accent">Resenha</span></span>
        </Link>
        <div className="nav-actions">
          <Link href="/login" className="btn-secondary">Voltar para Login</Link>
        </div>
      </nav>

      <main className="landing-content" style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem', textAlign: 'left', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--text-primary)' }}>Termos de Uso</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Última atualização: 10 de Março de 2026</p>

        <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p>
            Bem-vindo ao <strong>Agenda Resenha</strong>. Ao acessar e utilizar nossa plataforma de agendamentos SaaS, você concorda expressamente com os termos e condições descritos abaixo. Leia com atenção antes de criar sua conta.
          </p>

          <h2 style={{ color: 'var(--text-primary)', marginTop: '1rem', fontSize: '1.5rem' }}>1. Aceitação dos Termos</h2>
          <p>
            Ao se cadastrar como Barbearia (Contratante) ou ao efetuar um agendamento como Cliente Final, você indica que leu, compreendeu e está de acordo com as regras aqui estipuladas. Caso não concorde, interrompa o uso imediatamente.
          </p>

          <h2 style={{ color: 'var(--text-primary)', marginTop: '1rem', fontSize: '1.5rem' }}>2. Objeto do Serviço</h2>
          <p>
            O Agenda Resenha é um software como serviço (SaaS) que fornece ferramentas de gestão de agenda, base de clientes e automação de notificações via WhatsApp nativo (via QR Code) exclusivas para o nicho de barbearias.
          </p>

          <h2 style={{ color: 'var(--text-primary)', marginTop: '1rem', fontSize: '1.5rem' }}>3. Assinatura, Pagamentos e Cancelamento</h2>
          <p>
            Nossos planos (Básico e Pro) são cobrados de forma recorrente e antecipada (mensalmente ou anualmente).
            <br/><br/>
            - Não exigimos contrato de fidelidade. Você pode cancelar a qualquer momento diretamente pelo painel.<br/>
            - Em caso de cancelamento, o acesso continuará liberado até o final do ciclo de faturamento vigente.<br/>
            - Não realizamos reembolsos ou estornos pro rata de dias não utilizados no mês em que o cancelamento for solicitado.
          </p>

          <h2 style={{ color: 'var(--text-primary)', marginTop: '1rem', fontSize: '1.5rem' }}>4. Uso da Integração com WhatsApp (Robô)</h2>
          <p>
            O sistema utiliza a leitura do QR Code do seu WhatsApp para enviar mensagens automáticas de confirmação e lembretes para <strong>seus clientes</strong>. Ao utilizar o módulo de mensagens em massa (PRO) ou os lembretes do dia a dia, você concorda que:
          </p>
          <ul style={{ paddingLeft: '2rem' }}>
             <li>É expressamente proibido utilizar nosso sistema para envio de Spam, mensagens de ódio ou golpes.</li>
             <li>O Agenda Resenha <strong>não se responsabiliza</strong> caso a Meta (Dona do WhatsApp) venha a bloquear ou banir o número do Contratante por mau uso ou excesso exagerado de mensagens sem o consentimento dos clientes finais.</li>
             <li>A estabilidade do envio de mensagens via WhatsApp depende da conexão do seu aparelho celular com a internet e bateria do dispositivo hospedeiro.</li>
          </ul>

          <h2 style={{ color: 'var(--text-primary)', marginTop: '1rem', fontSize: '1.5rem' }}>5. Disponibilidade e Isenção de Responsabilidade</h2>
          <p>
            Esforçamo-nos para manter o sistema online 99,9% do tempo. Entretanto, manutenções, falhas em provedores de nuvem (como Vercel e Supabase) ou paradas no serviço do WhatsApp podem ocorrer. Em nenhuma circunstância o Agenda Resenha ou seus criadores serão responsabilizados por "lucros cessantes" ou "perda de faturamento" que a barbearia venha a sofrer por instabilidades temporárias.
          </p>
        </div>
      </main>

      <footer className="footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2rem 5%', textAlign: 'center' }}>
         <p style={{ color: 'var(--text-secondary)' }}>&copy; {new Date().getFullYear()} Agenda Resenha. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
