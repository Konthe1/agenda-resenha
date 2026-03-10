"use client";

import { useState } from "react";

export default function ProdutosPage() {
  const [produtos] = useState([
    { id: 1, nome: "Pomada Modeladora Efeito Matte", preco: 45.0, estoque: 15 },
    { id: 2, nome: "Óleo para Barba (Blend Argan)", preco: 35.0, estoque: 8 },
    { id: 3, nome: "Minoxidil Kirkland 5%", preco: 85.0, estoque: 22 },
    { id: 4, nome: "Shampoo 3 em 1", preco: 40.0, estoque: 5 },
  ]);

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div className="page-title">
          <h1>Produtos e Estoque</h1>
          <p>Gerencie os produtos para venda na barbearia (Módulo PRO)</p>
        </div>
        <button className="btn-primary" style={{ padding: '0.6rem 1.25rem' }}>+ Novo Produto</button>
      </div>

      <div className="dashboard-content-grid">
        {/* Métricas Rápidas */}
        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-secondary)', borderLeft: '4px solid var(--accent-primary)' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Faturamento Produtos (Mês)</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>R$ 1.450,00</span>
        </div>
        
        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-secondary)', borderLeft: '4px solid #10b981' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Produtos Vendidos</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>32 unid.</span>
        </div>

        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-secondary)', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Avisos de Estoque Baixo</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>1 produto</span>
        </div>
      </div>

      <div className="section-card" style={{ marginTop: '2rem', padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <th style={{ padding: '1rem 1.5rem' }}>Produto</th>
              <th style={{ padding: '1rem 1.5rem' }}>Preço de Venda</th>
              <th style={{ padding: '1rem 1.5rem' }}>Estoque Atual</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{p.nome}</td>
                <td style={{ padding: '1rem 1.5rem', color: '#10b981', fontWeight: 600 }}>R$ {p.preco.toFixed(2).replace('.', ',')}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                   <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 500, background: p.estoque < 10 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: p.estoque < 10 ? '#f59e0b' : '#10b981' }}>
                     {p.estoque} unidades
                   </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  <button className="btn-text" style={{ fontSize: '0.85rem', marginRight: '0.5rem' }}>✏️ Editar</button>
                  <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>🛒 Registrar Venda</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
