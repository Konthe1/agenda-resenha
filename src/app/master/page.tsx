"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function MasterDashboardPage() {
  // Real Data for SaaS Management
  const [mrr, setMrr] = useState(8750.50); // Mock MRR base
  const [activeClients, setActiveClients] = useState(0);
  const [freeTrials, setFreeTrials] = useState(0);
  const [requestsPending, setRequestsPending] = useState(2); // Mock Pending Barber requests
  const [isLoading, setIsLoading] = useState(true);

  const [clientes, setClientes] = useState<any[]>([
    { id: 1, nome: "Resenha Barber", dono: "Administrador", plano: "PRO", valorMensal: 149.99, barbeirosTotais: 5, barbeirosExtras: 0, statusPagamento: "Pago", whatsappOnline: true },
    { id: 2, nome: "The Classic Barber", dono: "Thiago Silva", plano: "PRO", valorMensal: 249.99, barbeirosTotais: 7, barbeirosExtras: 2, statusPagamento: "Pago", whatsappOnline: true },
    { id: 3, nome: "Brotherhood Shop", dono: "Marcos Ribeiro", plano: "Básico", valorMensal: 59.99, barbeirosTotais: 1, barbeirosExtras: 0, statusPagamento: "Atrasado", whatsappOnline: false },
    { id: 4, nome: "Navalha Premium", dono: "João Pedro", plano: "PRO", valorMensal: 149.99, barbeirosTotais: 4, barbeirosExtras: 0, statusPagamento: "Pago", whatsappOnline: true },
    { id: 5, nome: "Barbearia do Zé", dono: "José Carlos", plano: "Trial V.I", valorMensal: 0.00, barbeirosTotais: 2, barbeirosExtras: 0, statusPagamento: "Trial (10 dias)", whatsappOnline: true },
  ]);

  useEffect(() => {
    async function loadKpis() {
      setIsLoading(true);
      // Puxa total de barbearias e quantidade de barbeiros globais
      const { data: bData } = await supabase.from('barbearias').select('*');
      const { data: barbersData } = await supabase.from('barbeiros').select('id, barbearia_id');
      
      if (bData) {
        setActiveClients(bData.length);
        
        // Calcular free trials vazados (últimos 14 dias)
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        
        const trials = bData.filter(b => new Date(b.criado_em) >= fourteenDaysAgo);
        setFreeTrials(trials.length);

        // Preenche de verdade na tabela
        const reais = bData.map((b) => {
           const teamSize = barbersData ? barbersData.filter(barb => barb.barbearia_id === b.id).length : 0;
           return {
             id: b.id,
             nome: b.nome || 'Barbearia Sem Nome',
             dono: 'Sistema',
             plano: b.plano || (new Date(b.criado_em) >= fourteenDaysAgo ? 'Trial 14 Dias' : 'Expirado'),
             valorMensal: b.plano === 'PRO' ? 149.90 : 0,
             barbeirosTotais: teamSize,
             barbeirosExtras: Math.max(0, teamSize - 5), // Assumindo base 5 default
             statusPagamento: b.status_pagamento || 'Pendente',
             whatsappOnline: true
           };
        });
        
        setClientes(reais);
        
        // Estimar MRR Real (Total Clientes Premium * 149.90)
        const premiumCount = reais.filter(c => c.plano === 'PRO').length;
        setMrr((premiumCount * 149.90));
      }
      setIsLoading(false);
    }
    loadKpis();
  }, []);

  const handleToggleStatus = async (barbeariaId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Suspenso' ? 'Ativo' : 'Suspenso';
    const newPlan = newStatus === 'Suspenso' ? 'Expirado' : 'PRO';
    
    // In a real app we would call Supabase
    const { error } = await supabase.from('barbearias').update({ status_pagamento: newStatus, plano: newPlan }).eq('id', barbeariaId);
    if (!error) {
      setClientes(clientes.map(c => c.id === barbeariaId ? { ...c, statusPagamento: newStatus, plano: newPlan } : c));
      alert(`Status atualizado para ${newStatus} com sucesso!`);
    } else {
      alert("Erro ao atualizar o status." + error.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div className="page-title">
          <h1 style={{ color: '#f8fafc' }}>Visão Geral do SaaS</h1>
          <p style={{ color: '#94a3b8' }}>Monitoramento de Clientes, MRR e Aprovações</p>
        </div>
      </div>

      {/* KPIs Gerais */}
      <div className="metrics-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="metric-card master-card">
          <div className="metric-header">
            <span className="metric-title" style={{ color: '#94a3b8' }}>Receita Recorrente (MRR)</span>
            <div className="metric-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>💰</div>
          </div>
          <div className="metric-value" style={{ color: '#f8fafc' }}>R$ {mrr.toFixed(2).replace('.', ',')}</div>
          <div className="metric-trend trend-up">
            <span>↑ 12%</span>
            <span style={{ color: '#64748b', marginLeft: '0.25rem' }}>vs último mês</span>
          </div>
        </div>

        <div className="metric-card master-card">
          <div className="metric-header">
            <span className="metric-title" style={{ color: '#94a3b8' }}>Barbearias Ativas</span>
            <div className="metric-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>💈</div>
          </div>
          <div className="metric-value" style={{ color: '#f8fafc' }}>{activeClients}</div>
          <div className="metric-trend trend-up">
            <span>↑ 3</span>
            <span style={{ color: '#64748b', marginLeft: '0.25rem' }}>novos clientes</span>
          </div>
        </div>

        <div className="metric-card master-card">
          <div className="metric-header">
            <span className="metric-title" style={{ color: '#94a3b8' }}>Alertas de Conexão</span>
            <div className="metric-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>⚠️</div>
          </div>
          <div className="metric-value" style={{ color: '#f8fafc' }}>1</div>
          <div className="metric-trend">
            <span style={{ color: '#64748b' }}>Instância do WhatsApp offline</span>
          </div>
        </div>

        <div className="metric-card master-card">
          <div className="metric-header">
            <span className="metric-title" style={{ color: '#94a3b8' }}>Free Trials Ativos</span>
            <div className="metric-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>⏳</div>
          </div>
          <div className="metric-value" style={{ color: '#f8fafc' }}>{freeTrials}</div>
          <div className="metric-trend">
            <span style={{ color: '#64748b' }}>Teste grátis de 14 dias</span>
          </div>
        </div>
      </div>

      {/* Tabela Remodulada Direta */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#f8fafc' }}>Carteira de Clientes ({clientes.length})</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="Buscar barbearia..." 
              style={{ background: '#1e293b', border: '1px solid #334155', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px' }} 
            />
          </div>
        </div>
        
        <div className="master-card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="master-table">
            <thead>
              <tr>
                <th>Barbearia</th>
                <th>Plano Ativo</th>
                <th>Equipe</th>
                <th>Mensalidade (R$)</th>
                <th>WhatsApp API</th>
                <th>Status Pgto</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(cliente => (
                <tr key={cliente.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{cliente.nome}</div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Dono: {cliente.dono}</div>
                  </td>
                  <td>
                    <span className={`master-badge ${cliente.plano === 'PRO' ? 'info' : 'warning'}`}>
                      {cliente.plano}
                    </span>
                  </td>
                  <td>
                    <div>{cliente.barbeirosTotais} Profissionais</div>
                    {cliente.barbeirosExtras > 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#8b5cf6' }}>({cliente.barbeirosExtras} Extras)</div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600, color: '#34d399' }}>
                    R$ {cliente.valorMensal.toFixed(2).replace('.', ',')}
                  </td>
                  <td>
                    {cliente.whatsappOnline ? (
                      <span className="master-badge success">Conectado</span>
                    ) : (
                      <span className="master-badge danger">Offline</span>
                    )}
                  </td>
                  <td>
                    {cliente.statusPagamento === 'Pago' ? (
                      <span className="master-badge success">Em Dia</span>
                    ) : cliente.statusPagamento.includes('Trial') ? (
                      <span className="master-badge info" style={{ color: '#c4b5fd', background: 'rgba(139, 92, 246, 0.15)' }}>{cliente.statusPagamento}</span>
                    ) : (
                      <span className="master-badge danger">Atrasado</span>
                    )}
                  </td>
                  <td>
                    <button className="btn-master-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                      Gerenciar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
