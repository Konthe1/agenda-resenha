"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./master.css";

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

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
