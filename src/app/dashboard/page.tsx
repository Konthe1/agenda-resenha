"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client"; // Hooking into the realtime client

export default function DashboardOverview() {
  const [copySuccess, setCopySuccess] = useState(false);
  const barbershopLink = "agendaresenha.com/resenhabarber"; // Ideal: vir do banco
  
  // Real Data State
  const [metrics, setMetrics] = useState({ 
    agendamentos: 0, 
    faturamento: 0, 
    novos: 0 
  });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load Initial Data (Mock fallback if DB fails/is empty)
  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Tentar buscar pelo owner_id (Priorizando PRO)
        let { data: barbData } = await supabase
          .from('barbearias')
          .select('id')
          .eq('owner_id', user.id)
          .order('plano', { ascending: false })
          .limit(1)
          .maybeSingle();

        // 2. Fallback
        if (!barbData) {
          const { data: fallbackData } = await supabase
            .from('barbearias')
            .select('id')
            .order('plano', { ascending: false })
            .limit(1)
            .maybeSingle();
          barbData = fallbackData;
        }

        const activeBarbeariaId = barbData?.id || '1';

        // Fetch from Supabase
        const { data: apps } = await supabase
          .from('agendamentos')
          .select(`id, data_hora_inicio, status, clientes ( nome, criado_em ), servicos ( nome )`)
          .eq('barbearia_id', activeBarbeariaId)
          .gte('data_hora_inicio', new Date().toISOString())
          .order('data_hora_inicio', { ascending: true })
          .limit(5);

        if (apps) {
          setAppointments(apps);
          
          // Cálculo real de métricas (Simplificado para hoje)
          const faturamentoTotal = apps.reduce((acc: number, curr: any) => acc + (curr.valor_total || 0), 0);
          setMetrics({ 
            agendamentos: apps.length, 
            faturamento: faturamentoTotal, 
            novos: apps.length > 0 ? 1 : 0 
          });
        }
      } catch (err) {
        console.error("DB Error", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();

    // SETUP REALTIME SUBSCRIPTION
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'agendamentos',
        },
        (payload) => {
          console.log('Realtime Update!', payload);
          // Refetch data or aggressively update state to show real-time magic
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(barbershopLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <>
      <div className="page-header animate-fade-in">
        <div className="page-title">
          <h1>Resumo de Hoje</h1>
          <p>Terça-feira, 10 de Março de 2026</p>
        </div>
        <Link href="/dashboard/agenda" className="btn-primary" style={{ padding: '0.6rem 1.25rem', width: 'auto' }}>
          <span>+ Novo Agendamento</span>
        </Link>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <h3>Agendamentos Hoje</h3>
            <span className="metric-icon">📅</span>
          </div>
          <p className="metric-value">{metrics.agendamentos}</p>
          <span className="metric-trend positive">↑ 12% vs ontem</span>
        </div>

        <div className="metric-card highlight">
          <div className="metric-header">
            <h3>Faturamento Diário</h3>
            <span className="metric-icon">💰</span>
          </div>
          <p className="metric-value">R$ {metrics.faturamento},00</p>
          <span className="metric-trend positive">↑ 5% vs ontem</span>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Novos Clientes</h3>
            <span className="metric-icon">👤</span>
          </div>
          <p className="metric-value">{metrics.novos}</p>
          <span className="metric-trend neutral">- Estável</span>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="dashboard-content-grid">
        <div className="main-panel">
          <div className="panel-header">
            <h2>Próximos Clientes</h2>
            <Link href="/dashboard" className="btn-text">Ver Agenda Completa →</Link>
          </div>
          
          <div className="appointments-list">
            {isLoading ? (
              <p style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Carregando dados em tempo real...</p>
            ) : appointments.length > 0 ? (
              appointments.map((app, idx) => (
                <div key={idx} className="appointment-card">
                  <div className="appointment-time">
                    {new Date(app.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit'})}
                  </div>
                  <div className="appointment-details">
                    <h4>{app.clientes?.nome || 'Cliente não identificado'}</h4>
                    <p>{app.servicos?.nome || 'Serviço não especificado'}</p>
                  </div>
                  <div className="appointment-actions">
                    <button className="btn-icon" title="Iniciar Atendimento">✅</button>
                    <button className="btn-icon danger" title="Cancelar">❌</button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Sua agenda está livre por enquanto.</p>
            )}
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-header">
            <h3>Ações Rápidas</h3>
          </div>
          <div className="quick-actions-grid">
            <button className="quick-action-btn copy-link" onClick={copyToClipboard}>
              <span className="quick-action-icon">{copySuccess ? '✅' : '🔗'}</span>
              <div>
                <h4 style={{ marginBottom: '0.2rem' }}>{copySuccess ? 'Copiado!' : 'Seu Link de Agendamento'}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{barbershopLink}</p>
              </div>
              <span style={{ fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                {copySuccess ? 'Cole no Instagram!' : 'Clique para copiar'}
              </span>
            </button>

            <button className="quick-action-btn" onClick={() => window.open(`whatsapp://send?text=Olá,%20agende%20seu%20horário%20aqui:%20${barbershopLink}`)}>
              <span className="quick-action-icon" style={{ color: '#25D366' }}>💬</span>
              <div>
                <h4 style={{ marginBottom: '0.2rem' }}>Avisar Clientes</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mandar link no WhatsApp</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
