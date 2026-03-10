import Link from "next/link";
import "./login.css";

export default function LoginBarbearia() {
  return (
    <div className="login-container">
      <div className="login-card card animate-fade-in">
        <div className="login-header">
           <h2>Acesso <span className="accent">Barbearia</span></h2>
           <p>Gerencie sua agenda, clientes e grave suas resenhas.</p>
        </div>

        <form className="login-form">
          <div className="input-group">
            <label className="input-label" htmlFor="email">E-mail ou Telefone</label>
            <input 
              type="text" 
              id="email" 
              className="input-field" 
              placeholder="ex: contato@barbearia.com"
            />
          </div>
          
          <div className="input-group">
            <label className="input-label" htmlFor="password">Senha ou Código de Acesso</label>
            <input 
              type="password" 
              id="password" 
              className="input-field" 
              placeholder="••••••••"
            />
          </div>

          <button type="button" className="btn-primary login-btn">
            Entrar no Painel
          </button>
        </form>

        <div className="login-footer">
           <Link href="/" className="back-link">
             ← Voltar para o início
           </Link>
           <p className="signup-prompt">
             Ainda não tem conta? <Link href="/cadastro" className="accent-link">Criar agora</Link>
           </p>
        </div>
      </div>
    </div>
  );
}
