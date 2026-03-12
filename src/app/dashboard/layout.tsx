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
  barbeiro_nome: string;
  barbearia_nome: string;
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

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Escuta eventos de INSERT na tabela agendamentos (Canal ÚNICO para evitar colisão com a agenda)
    const channel = supabase
      .channel('global-dashboard-notifications')
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
          
          // Buscar detalhes completos (Cliente, Servico, Barbeiro, Barbearia)
          const { data: clienteData } = await supabase.from('clientes').select('nome, telefone').eq('id', newAgendamento.cliente_id).single();
          const { data: servicoData } = await supabase.from('servicos').select('nome').eq('id', newAgendamento.servico_id).single();
          const { data: barbeiroData } = await supabase.from('barbeiros').select('nome').eq('id', newAgendamento.barbeiro_id).single();
          const { data: barbeariaData } = await supabase.from('barbearias').select('nome').eq('id', newAgendamento.barbearia_id).single();

          const bookingData: NewBookingAlert = {
            id: newAgendamento.id,
            cliente_nome: clienteData?.nome || 'Cliente Novo',
            telefone: clienteData?.telefone || 'Sem número',
            servico_nome: servicoData?.nome || 'Serviço',
            barbeiro_nome: barbeiroData?.nome || 'Profissional',
            barbearia_nome: barbeariaData?.nome || 'Barbearia',
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

  const handleConfirmBooking = async () => {
    if (!newBooking) return;
    setIsProcessing(true);

    try {
      // 1. Atualizar banco para 'confirmado'
      await supabase
        .from('agendamentos')
        .update({ status: 'confirmado' })
        .eq('id', newBooking.id);

      // 2. Disparar WhatsApp oficial pro cliente
      const dtInicio = new Date(newBooking.data_hora_inicio);
      const payloadWpp = {
        telefone: newBooking.telefone,
        nomeCliente: newBooking.cliente_nome.split(' ')[0],
        dataHora: `${dtInicio.toLocaleDateString('pt-BR')} às ${dtInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' })}`,
        servico: newBooking.servico_nome,
        barbeiro: newBooking.barbeiro_nome,
        barbeariaNome: newBooking.barbearia_nome
      };

      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadWpp)
      });

      alert("Agendamento confirmado com sucesso! O cliente foi avisado via WhatsApp.");
      setNewBooking(null);
    } catch (e) {
      console.error(e);
      alert("Erro ao confirmar agendamento.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectBooking = async () => {
    if (!newBooking) return;
    setIsProcessing(true);
    
    try {
      // Rejeita (Cancele) o agendamento
      await supabase
        .from('agendamentos')
        .update({ status: 'cancelado' })
        .eq('id', newBooking.id);
        
      setNewBooking(null);
    } catch (e) {
      console.error(e);
      alert("Erro ao rejeitar agendamento.");
    } finally {
      setIsProcessing(false);
    }
  };

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
              <p style={{ marginBottom: '0.8rem' }}><strong style={{ color: 'var(--text-muted)' }}>PROFISSIONAL:</strong> <span style={{ color: 'white' }}>{newBooking.barbeiro_nome}</span></p>
              <p style={{ marginBottom: '0.8rem' }}><strong style={{ color: 'var(--text-muted)' }}>SERVIÇO:</strong> <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{newBooking.servico_nome}</span></p>
              <p style={{ marginBottom: '0.8rem' }}><strong style={{ color: 'var(--text-muted)' }}>DATA/HORA:</strong> <span style={{ color: 'white' }}>{new Date(newBooking.data_hora_inicio).toLocaleString('pt-BR')}</span></p>
              <p style={{ marginBottom: '0' }}><strong style={{ color: 'var(--text-muted)' }}>VALOR:</strong> <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1.2rem' }}>R$ {newBooking.valor.toFixed(2)}</span></p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn-confirm"
                style={{ flex: 1, backgroundColor: 'var(--bg-tertiary)', color: '#EF4444', fontWeight: 'bold', padding: '1rem', borderRadius: '12px' }}
                onClick={handleRejectBooking}
                disabled={isProcessing}
              >
                Rejeitar
              </button>
              <button 
                className="btn-primary"
                style={{ flex: 2, padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '12px' }}
                onClick={handleConfirmBooking}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processando...' : 'Confirmar e Avisar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src="/logo.png" alt="Logo" style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'contain' }} />
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
