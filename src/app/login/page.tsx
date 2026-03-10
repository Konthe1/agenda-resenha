"use client";

import Link from "next/link";
import { useState } from "react";
import { login, signup } from "./actions";
import "./login.css";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (formData: FormData) => {
    setIsLoading(true);
    setErrorMsg('');
    
    // Server action returns object with { error } if it fails
    // Otherwise it redirects automatically
    const result = isRegister ? await signup(formData) : await login(formData);
    
    if (result?.error) {
      setErrorMsg(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="bg-decorations">
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>
      </div>

      <Link href="/" className="back-home">
        <span>←</span> Voltar para a Home
      </Link>

      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <img src="/logo.png" alt="Logo" style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'contain' }} />
            <span>Agenda<span className="accent">Resenha</span></span>
          </div>
          <h1>{isRegister ? 'Crie sua conta' : 'Acesse seu Painel'}</h1>
          <p>{isRegister ? 'Teste grátis por 14 dias. Sem cartão de crédito.' : 'Bem-vindo de volta! Faça login para gerenciar sua barbearia.'}</p>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            {errorMsg}
          </div>
        )}

        <form className="auth-form" action={handleAuth}>
          {isRegister && (
            <div className="form-group">
              <label htmlFor="name">Nome da Barbearia</label>
              <input type="text" id="name" name="name" placeholder="Resenha Barber" required />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">E-mail Profissional</label>
            <input type="email" id="email" name="email" placeholder="contato@suabarbearia.com" required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input type="password" id="password" name="password" placeholder="••••••••" required />
          </div>

          {!isRegister && (
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                Lembrar de mim
              </label>
              <Link href="#" className="forgot-password">Esqueceu a senha?</Link>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '0.5rem' }}>
            {isLoading ? (
              <span>Autenticando...</span>
            ) : (
              <span>{isRegister ? 'Começar Meu Teste Grátis' : 'Entrar no Dashboard'}</span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          {isRegister ? (
            <p>Já tem uma conta? <button type="button" onClick={() => setIsRegister(false)} style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Faça Login</button></p>
          ) : (
            <p>Ainda não é parceiro? <button type="button" onClick={() => setIsRegister(true)} style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Crie sua conta</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
