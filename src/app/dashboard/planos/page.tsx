"use client";

import { useState } from "react";

export default function PlanosPage() {
  const [assinantes] = useState([
    { id: 1, nome: "Lucas Fernandes", plano: "Mensal Ilimitado", vencimento: "15/04/2026", status: "Ativo" },
    { id: 2, nome: "Carlos Souza", plano: "Plano 4 Cortes", vencimento: "20/03/2026", status: "Ativo" },
    { id: 3, nome: "Roberto Almeida", plano: "Plano Barba + Cabelo", vencimento: "02/03/2026", status: "Atrasado" },
  ]);

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div className="page-title">
          <h1>Planos e Mensalidades</h1>
          <p>Ofereça pacotes pré-pagos e fidelize clientes (Módulo PRO)</p>
        </div>
        <button className="btn-primary" style={{ padding: '0.6rem 1.25rem' }}>+ Novo Plano</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
        {/* Gerenciamento de Modalidades */}
        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2>Seus Pacotes</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '-1rem' }}>Crie pacotes para vender assinaturas para os clientes recorrentes.</p>
          
          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--accent-primary)' }}>
             <h3 style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Plano Ilimitado</h3>
             <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>O cliente corta cabelo quantas vezes quiser no mês.</p>
             <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>R$ 150,00 /mês</div>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
             <h3 style={{ marginBottom: '0.5rem' }}>Pacote 4 Cortes</h3>
             <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>4 cortes de cabelo p/ usar em 30 dias com desconto.</p>
             <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>R$ 110,00 /mês</div>
          </div>
        </div>

        {/* Gerenciamento de Assinantes */}
        <div className="section-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h2>Assinantes Ativos</h2>
             <button className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>+ Adicionar Membro</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <th style={{ padding: '1rem 1.5rem' }}>Cliente</th>
                <th style={{ padding: '1rem 1.5rem' }}>Plano Contratado</th>
                <th style={{ padding: '1rem 1.5rem' }}>Vencimento</th>
                <th style={{ padding: '1rem 1.5rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {assinantes.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{a.nome}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{a.plano}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{a.vencimento}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                     <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 500, background: a.status === 'Ativo' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: a.status === 'Ativo' ? '#10b981' : '#ef4444' }}>
                       {a.status}
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
