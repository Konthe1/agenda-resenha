"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import "./master.css";

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorStatus, setErrorStatus] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "resenha6969" && password === "eulouvoadeus") {
      setIsAuthenticated(true);
      setErrorStatus("");
    } else {
      setErrorStatus("Usuário ou senha incorretos.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="master-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="master-card" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
          <div className="master-brand" style={{ justifyContent: 'center', fontSize: '1.5rem' }}>
            <span>Master<span style={{ color: '#8b5cf6' }}>Panel</span></span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Acesso restrito à administração do sistema.</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Usuário</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc' }}
                placeholder="Digite o usuário master"
                autoComplete="off"
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Senha</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#f8fafc' }}
                placeholder="Digite a senha"
              />
            </div>
            
            {errorStatus && (
              <p style={{ color: '#f87171', fontSize: '0.85rem', textAlign: 'center' }}>{errorStatus}</p>
            )}

            <button type="submit" className="btn-master" style={{ width: '100%', marginTop: '0.5rem', padding: '1rem' }}>
              Entrar no Painel Master
            </button>
          </form>

          <Link href="/" style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '1rem', display: 'inline-block' }}>
            ← Voltar para o Site Inicial
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="master-layout">
      {/* Sidebar Privada do SaaS Admin */}
      <aside className="master-sidebar">
        <div className="master-sidebar-header">
          <div className="master-brand">
            <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>Master<span style={{ color: '#8b5cf6' }}>Panel</span></span>
          </div>
        </div>

        <nav className="master-nav">
          <Link href="/master" className={`master-nav-item ${pathname === '/master' ? 'active' : ''}`}>
            <span className="nav-icon">📊</span>
            <span>Visão Geral do SaaS</span>
          </Link>
          <Link href="/master/clientes" className={`master-nav-item ${pathname === '/master/clientes' ? 'active' : ''}`}>
            <span className="nav-icon">🏢</span>
            <span>Barbearias (Clientes)</span>
          </Link>
          <Link href="/master/financeiro" className={`master-nav-item ${pathname === '/master/financeiro' ? 'active' : ''}`}>
            <span className="nav-icon">💰</span>
            <span>Financeiro (Mensalidades)</span>
          </Link>
          <Link href="/master/whatsapp" className={`master-nav-item ${pathname === '/master/whatsapp' ? 'active' : ''}`}>
            <span className="nav-icon">🤖</span>
            <span>Instâncias WhatsApp</span>
          </Link>
        </nav>

        <div className="master-sidebar-footer">
          <div className="user-profile">
            <div className="avatar" style={{ background: '#8b5cf6' }}>AD</div>
            <div className="user-info">
              <span className="user-name">Administrador</span>
              <span className="user-role">SaaS Owner</span>
            </div>
            <Link href="/" style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '1.2rem'}} title="Sair para Landing Page">
               🚪
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="master-content">
        {children}
      </main>
    </div>
  );
}
