"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./dashboard.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src="/logo.png" alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'contain' }} />
            <span>Resenha<span className="accent">Admin</span></span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link href="/dashboard" className={`nav-item ${pathname === '/dashboard' ? 'active' : ''}`}>
            <span className="nav-icon">📊</span>
            <span>Visão Geral</span>
          </Link>
          <Link href="/dashboard/agenda" className={`nav-item ${pathname === '/dashboard/agenda' ? 'active' : ''}`}>
            <span className="nav-icon">📅</span>
            <span>Agenda</span>
          </Link>
          <Link href="/dashboard/clientes" className={`nav-item ${pathname === '/dashboard/clientes' ? 'active' : ''}`}>
            <span className="nav-icon">👥</span>
            <span>Clientes</span>
          </Link>
          <Link href="/dashboard/financeiro" className={`nav-item ${pathname === '/dashboard/financeiro' ? 'active' : ''}`}>
            <span className="nav-icon">💰</span>
            <span>Financeiro</span>
          </Link>
          <Link href="/dashboard/marketing" className={`nav-item ${pathname === '/dashboard/marketing' ? 'active' : ''}`}>
            <span className="nav-icon">🎯</span>
            <span>Marketing (PRO)</span>
          </Link>
          <Link href="/dashboard/configuracoes" className={`nav-item ${pathname === '/dashboard/configuracoes' ? 'active' : ''}`}>
            <span className="nav-icon">⚙️</span>
            <span>Configurações</span>
          </Link>
          <Link href="/docs" className="nav-item">
            <span className="nav-icon">📚</span>
            <span>Ajuda / Documentação</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">RS</div>
            <div className="user-info">
              <span className="user-name">Resenha Barber</span>
              <span className="user-role">Plano Pro</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
