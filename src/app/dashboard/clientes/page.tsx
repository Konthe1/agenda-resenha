"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadClientes() {
      try {
        const { data } = await supabase
          .from('clientes')
          .select(`
            id, 
            nome, 
            telefone, 
            criado_em,
            agendamentos(id, data_hora_inicio, valor_total, status)
          `)
          .order('nome', { ascending: true });
        
        if (data) {
           // Calculate LTV (Lifetime Value) and Last Visit locally
           const processedClientes = data.map(c => {
              const completedApps = c.agendamentos?.filter((a: any) => a.status === 'confirmado' || a.status === 'concluido') || [];
              const ltv = completedApps.reduce((acc: number, curr: any) => acc + Number(curr.valor_total), 0);
              
              // Sort to find the latest appointment
              completedApps.sort((a: any, b: any) => new Date(b.data_hora_inicio).getTime() - new Date(a.data_hora_inicio).getTime());
              const lastVisitDate = completedApps.length > 0 ? new Date(completedApps[0].data_hora_inicio) : null;
              
              let lastVisitText = 'Nunca agendou';
              if (lastVisitDate) {
                 const diffDays = Math.floor((new Date().getTime() - lastVisitDate.getTime()) / (1000 * 3600 * 24));
                 if (diffDays === 0) lastVisitText = 'Hoje';
                 else if (diffDays === 1) lastVisitText = 'Ontem';
                 else lastVisitText = `Há ${diffDays} dias`;
              }

              return {
                 ...c,
                 ltvFormatado: ltv.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                 lastVisitText
              };
           });
           setClientes(processedClientes);
        }
      } catch (err) {
        console.error("Erro ao carregar clientes", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadClientes();
  }, []);

  const filteredClientes = clientes.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.telefone.includes(searchTerm)
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Meus Clientes</h1>
          <p>Base de dados e histórico de atendimentos</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="Buscar por nome ou número..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              padding: '0.6rem 1rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)', 
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              minWidth: '250px'
            }} 
          />
        </div>
      </div>

      <div className="section-card" style={{ marginTop: '2rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1rem' }}>Cliente</th>
              <th style={{ padding: '1rem' }}>WhatsApp</th>
              <th style={{ padding: '1rem' }}>Última Visita</th>
              <th style={{ padding: '1rem' }}>Lifetime Value (LTV)</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
               <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando clientes...</td></tr>
            ) : filteredClientes.length === 0 ? (
               <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhum cliente encontrado.</td></tr>
            ) : (
              filteredClientes.map((cliente) => (
                <tr key={cliente.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {cliente.nome.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500 }}>{cliente.nome}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{cliente.telefone}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{cliente.lastVisitText}</td>
                  <td style={{ padding: '1rem', fontWeight: '600', color: '#10b981' }}>{cliente.ltvFormatado}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <a href={`https://wa.me/55${cliente.telefone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="btn-text" style={{ fontSize: '0.85rem', color: '#25D366' }}>
                      💬 Chamar no Zap
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
