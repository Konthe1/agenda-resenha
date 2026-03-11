"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import "./dashboard.css";

// Som de Cash Register / Bell em Base64 para garantir que tocará sem depender de arquivo externo
const ALARM_SOUND = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="; // (Som mudo fallback rapido)
// Usaremos a API de Síntese de Voz (TTS) do navegador para gritar o agendamento de forma chamativa, além do beep.

type NewBookingAlert = {
  id: string;
  cliente_nome: string;
  telefone: string;
  servico_nome: string;
  valor: number;
  data_hora_inicio: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const [newBooking, setNewBooking] = useState<NewBookingAlert | null>(null);

  useEffect(() => {
    // Escuta eventos de INSERT na tabela agendamentos
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agendamentos',
        },
        async (payload) => {
          console.log("NOVO AGENDAMENTO RECEBIDO NO WEBSOCKET!", payload);
          
          const newAgendamento = payload.new;
          
          // Buscar detalhes do cliente e do serviço para mostrar no popup
          const { data: clienteData } = await supabase
            .from('clientes')
            .select('nome, telefone')
            .eq('id', newAgendamento.cliente_id)
            .single();
            
          const { data: servicoData } = await supabase
            .from('servicos')
            .select('nome')
            .eq('id', newAgendamento.servico_id)
            .single();

          const bookingData: NewBookingAlert = {
            id: newAgendamento.id,
            cliente_nome: clienteData?.nome || 'Cliente Novo',
            telefone: clienteData?.telefone || 'Sem número',
            servico_nome: servicoData?.nome || 'Serviço',
            valor: newAgendamento.valor_total,
            data_hora_inicio: newAgendamento.data_hora_inicio
          };

          setNewBooking(bookingData);

          // Tocar som de Notificação / Falar o nome do cliente alto
          try {
            // Tenta tocar um som genérico (Sino) se houver arquivo, senão ignora o erro
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => {});
            
            // TTS Backup altamente chamativo
            if ('speechSynthesis' in window) {
              const msg = new SpeechSynthesisUtterance(`Atenção, Resenha! Novo agendamento de ${bookingData.cliente_nome}. Valor: ${bookingData.valor} reais.`);
              msg.lang = 'pt-BR';
              msg.rate = 1.1;
              window.speechSynthesis.speak(msg);
            }
          } catch (e) {
            console.error("Audio block", e);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="dashboard-layout">
      {/* OVERLAY DE NOTIFICAÇÃO REALTIME (CHAMATIVO) */}
      {newBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.85)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <div className="animate-fade-in" style={{ background: 'var(--bg-secondary)', padding: '3rem', borderRadius: '16px', border: '2px solid var(--accent-primary)', boxShadow: '0 0 40px rgba(249, 115, 22, 0.4)', textAlign: 'center', maxWidth: '500px', width: '90%' }}>
            
            <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'bounce 1s infinite' }}>🔔</div>
            <h2 style={{ fontSize: '2rem', color: 'var(--accent-primary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Novo Agendamento!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>Um cliente acabou de finalizar um agendamento online.</p>
            
            <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '12px', textAlign: 'left', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
              <p style={{ marginBottom: '0.8rem' }}><strong style={{ color: 'var(--text-muted)' }}>CLIENTE:</strong> <span style={{ fontSize: '1.2rem', color: 'white' }}>{newBooking.cliente_nome}</span></p>
              <p style={{ marginBottom: '0.8rem' }}><strong style={{ color: 'var(--text-muted)' }}>WHATSAPP:</strong> <span style={{ color: 'white' }}>{newBooking.telefone}</span></p>
              <p style={{ marginBottom: '0.8rem' }}><strong style={{ color: 'var(--text-muted)' }}>SERVIÇO:</strong> <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{newBooking.servico_nome}</span></p>
              <p style={{ marginBottom: '0.8rem' }}><strong style={{ color: 'var(--text-muted)' }}>DATA/HORA:</strong> <span style={{ color: 'white' }}>{new Date(newBooking.data_hora_inicio).toLocaleString('pt-BR')}</span></p>
              <p style={{ marginBottom: '0' }}><strong style={{ color: 'var(--text-muted)' }}>VALOR:</strong> <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1.2rem' }}>R$ {newBooking.valor.toFixed(2)}</span></p>
            </div>

            <button 
              className="btn-primary"
              style={{ padding: '1rem 3rem', fontSize: '1.1rem', fontWeight: 'bold', width: '100%', borderRadius: '12px' }}
              onClick={() => setNewBooking(null)}
            >
              Confirmar e Fechar
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src="/logo.png" alt="Logo" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'contain' }} />
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
          <Link href="/dashboard/produtos" className={`nav-item ${pathname === '/dashboard/produtos' ? 'active' : ''}`}>
            <span className="nav-icon">🛍️</span>
            <span>Produtos (PRO)</span>
          </Link>
          <Link href="/dashboard/planos" className={`nav-item ${pathname === '/dashboard/planos' ? 'active' : ''}`}>
            <span className="nav-icon">🎟️</span>
            <span>Assinaturas (PRO)</span>
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
