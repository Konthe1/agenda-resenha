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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [barbeariaPerfil, setBarbeariaPerfil] = useState({
    id: '',
    nome: 'Carregando...',
    logo_url: '',
    plano: 'FREE',
    endereco: '',
    whatsapp: ''
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    async function fetchBarbearia() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Tentar buscar pelo owner_id (Priorizando PRO se houver duplicatas por erro)
      let { data, error } = await supabase
        .from('barbearias')
        .select('id, nome, logo_url, plano, endereco, whatsapp')
        .eq('owner_id', user.id)
        .order('plano', { ascending: false }) // Prioriza 'PRO' sobre 'FREE'
        .limit(1)
        .maybeSingle();

      // 2. Fallback: buscar qualquer barbearia (para demos ou novos usuários ainda não vinculados)
      if (!data) {
        const { data: fallbackData } = await supabase
          .from('barbearias')
          .select('id, nome, logo_url, plano, endereco, whatsapp')
          .order('plano', { ascending: false })
          .limit(1)
          .maybeSingle();
        data = fallbackData;
      }

      if (data) {
        setBarbeariaPerfil({
          id: data.id,
          nome: data.nome || 'Resenha Barber',
          logo_url: data.logo_url || '',
          plano: (data.plano || 'FREE').toUpperCase(),
          endereco: data.endereco,
          whatsapp: data.whatsapp
        });

        // 3. Sincronização e Despertar do WhatsApp (REALTIME)
        try {
          // Chamada que "acorda" a instância e retorna o status atual
          const resSt = await fetch('/api/whatsapp/status');
          const stData = await resSt.json();
          
          if (stData.connected && stData.number) {
            setBarbeariaPerfil(prev => ({
              ...prev,
              whatsapp: stData.number // Número que está REALMENTE conectado no QR Code
            }));
          }
        } catch (e) {
          console.error("Erro ao despertar WhatsApp no início:", e);
        }
      }
    }
    fetchBarbearia();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };
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
        body: JSON.stringify({
          ...payloadWpp,
          agendamentoId: newBooking.id,
          trigger: 'confirmacao'
        })
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

      {/* Mobile Top Header */}
      <div className="mobile-header">
         <div className="mobile-header-brand" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'contain' }} />
            <span>Resenha<span className="accent">Admin</span></span>
         </div>
         <button className="mobile-menu-btn" onClick={() => setIsMobileSidebarOpen(true)}>☰</button>
      </div>

      {/* Backdrop for Mobile Sidebar */}
      <div 
        className={`sidebar-backdrop ${isMobileSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsMobileSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src="/logo.png" alt="Logo" style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'contain' }} />
            <span>Resenha<span className="accent">Admin</span></span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link href="/dashboard" className={`nav-item ${pathname === '/dashboard' ? 'active' : ''}`} onClick={() => setIsMobileSidebarOpen(false)}>
            <span className="nav-icon">📊</span>
            <span>Visão Geral</span>
          </Link>
          <Link href="/dashboard/agenda" className={`nav-item ${pathname === '/dashboard/agenda' ? 'active' : ''}`} onClick={() => setIsMobileSidebarOpen(false)}>
            <span className="nav-icon">📅</span>
            <span>Agenda</span>
          </Link>
          <Link href="/dashboard/clientes" className={`nav-item ${pathname === '/dashboard/clientes' ? 'active' : ''}`} onClick={() => setIsMobileSidebarOpen(false)}>
            <span className="nav-icon">👥</span>
            <span>Clientes</span>
          </Link>
          <Link href="/dashboard/financeiro" className={`nav-item ${pathname === '/dashboard/financeiro' ? 'active' : ''}`} onClick={() => setIsMobileSidebarOpen(false)}>
            <span className="nav-icon">💰</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>Financeiro</span>
              <span className="pro-badge">PRO</span>
            </div>
          </Link>
          <Link href="/dashboard/marketing" className={`nav-item ${pathname === '/dashboard/marketing' ? 'active' : ''}`} onClick={() => setIsMobileSidebarOpen(false)}>
            <span className="nav-icon">🎯</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>Marketing</span>
              <span className="pro-badge">PRO</span>
            </div>
          </Link>
          <Link href="/dashboard/produtos" className={`nav-item ${pathname === '/dashboard/produtos' ? 'active' : ''}`} onClick={() => setIsMobileSidebarOpen(false)}>
            <span className="nav-icon">🛍️</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>Produtos</span>
              <span className="pro-badge">PRO</span>
            </div>
          </Link>
          <Link href="/dashboard/planos" className={`nav-item ${pathname === '/dashboard/planos' ? 'active' : ''}`} onClick={() => setIsMobileSidebarOpen(false)}>
            <span className="nav-icon">🎟️</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>Assinaturas</span>
              <span className="pro-badge">PRO</span>
            </div>
          </Link>
          <Link href="/dashboard/configuracoes" className={`nav-item ${pathname === '/dashboard/configuracoes' ? 'active' : ''}`} onClick={() => setIsMobileSidebarOpen(false)}>
            <span className="nav-icon">⚙️</span>
            <span>Configurações</span>
          </Link>
          <Link href="/docs" className="nav-item" onClick={() => setIsMobileSidebarOpen(false)}>
            <span className="nav-icon">📚</span>
            <span>Ajuda / Documentação</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile" onClick={() => setIsProfileModalOpen(true)} style={{ cursor: 'pointer' }}>
            {barbeariaPerfil.logo_url ? (
              <img src={barbeariaPerfil.logo_url} alt="Profile" className="avatar" style={{ objectFit: 'cover' }} />
            ) : (
              <div className="avatar" style={{ background: 'var(--accent-primary)', color: 'white' }}>
                {getInitials(barbeariaPerfil.nome)}
              </div>
            )}
            <div className="user-info">
              <span className="user-name">{barbeariaPerfil.nome}</span>
              <span className="user-role" style={{ 
                color: barbeariaPerfil.plano === 'PRO' ? '#f97316' : 'var(--text-secondary)',
                fontWeight: barbeariaPerfil.plano === 'PRO' ? 'bold' : 'normal'
              }}>
                Plano {barbeariaPerfil.plano}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Modal de Perfil Premium */}
      {isProfileModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="section-card animate-scale-in" style={{ maxWidth: '450px', width: '90%', padding: '2rem', background: 'var(--bg-secondary)', border: '1px solid var(--accent-primary)', boxShadow: '0 0 40px rgba(0,0,0,0.5)', position: 'relative' }}>
            <button 
              onClick={() => setIsProfileModalOpen(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              ✕
            </button>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
                {barbeariaPerfil.logo_url ? (
                  <img src={barbeariaPerfil.logo_url} alt="Logo" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-primary)' }} />
                ) : (
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold' }}>
                    {getInitials(barbeariaPerfil.nome)}
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: '0', right: '0', background: '#10b981', width: '25px', height: '25px', borderRadius: '50%', border: '3px solid var(--bg-secondary)' }}></div>
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>{barbeariaPerfil.nome}</h2>
              <span style={{ 
                background: barbeariaPerfil.plano === 'PRO' ? 'linear-gradient(135deg, #f97316, #eab308)' : 'var(--bg-tertiary)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                Plano {barbeariaPerfil.plano}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '1.5rem', opacity: 0.7 }}>📍</div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Endereço</div>
                  <div style={{ fontSize: '0.95rem' }}>{barbeariaPerfil.endereco || 'Não informado'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '1.5rem', opacity: 0.7 }}>💬</div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>WhatsApp Conectado</div>
                  <div style={{ fontSize: '0.95rem' }}>{barbeariaPerfil.whatsapp || 'Não informado'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '1.5rem', opacity: 0.7 }}>🎫</div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status da Assinatura</div>
                  <div style={{ fontSize: '0.95rem', color: '#10b981', fontWeight: 'bold' }}>Ativa (Vence em 30 dias)</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                className="btn-primary" 
                style={{ flex: 1, padding: '1rem' }}
                onClick={() => {
                  setIsProfileModalOpen(false);
                  window.location.href = '/dashboard/configuracoes';
                }}
              >
                ⚙️ Perfil
              </button>
              <button 
                className="btn-text" 
                style={{ flex: 1, padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', fontWeight: 'bold' }}
                onClick={handleLogout}
              >
                🚪 Sair da Conta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
