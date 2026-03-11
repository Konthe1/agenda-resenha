"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // States para Novo Produto Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoPreco, setNovoPreco] = useState('');
  const [novoEstoque, setNovoEstoque] = useState('');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const { data } = await supabase.from('produtos').select('*').order('nome');
      if (data) setProdutos(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleCreate = async () => {
     if (!novoNome || !novoPreco) return;
     const { data } = await supabase.from('produtos').insert({
        barbearia_id: '1',
        nome: novoNome,
        preco: Number(novoPreco),
        estoque: Number(novoEstoque) || 0
     }).select().single();
     if (data) setProdutos([...produtos, data]);
     
     setIsModalOpen(false);
     setNovoNome(''); setNovoPreco(''); setNovoEstoque('');
  };

  const handleVenda = async (produto: any) => {
     if (produto.estoque <= 0) {
        alert('Estoque esgotado!');
        return;
     }
     const newEstoque = produto.estoque - 1;
     await supabase.from('produtos').update({ estoque: newEstoque }).eq('id', produto.id);
     setProdutos(produtos.map(p => p.id === produto.id ? { ...p, estoque: newEstoque } : p));
  };

  const handleDelete = async (id: string) => {
     if (!confirm('Deseja excluir este produto?')) return;
     await supabase.from('produtos').delete().eq('id', id);
     setProdutos(produtos.filter(p => p.id !== id));
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div className="page-title">
          <h1>Produtos e Estoque</h1>
          <p>Gerencie os produtos para venda na barbearia (Módulo PRO)</p>
        </div>
        <button className="btn-primary" style={{ padding: '0.6rem 1.25rem' }} onClick={() => setIsModalOpen(true)}>+ Novo Produto</button>
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
            {isLoading ? (
               <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando dados...</td></tr>
            ) : produtos.length === 0 ? (
               <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhum produto cadastrado no estoque útil.</td></tr>
            ) : (
              produtos.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{p.nome}</td>
                  <td style={{ padding: '1rem 1.5rem', color: '#10b981', fontWeight: 600 }}>R$ {p.preco.toFixed(2).replace('.', ',')}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                     <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 500, background: p.estoque < 10 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: p.estoque < 10 ? '#f59e0b' : '#10b981' }}>
                       {p.estoque} unidades
                     </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <button className="btn-text" style={{ fontSize: '0.85rem', marginRight: '0.5rem', color: 'var(--accent-primary)' }} onClick={() => handleDelete(p.id)}>🗑️ Excluir</button>
                    <button className="btn-text" style={{ fontSize: '0.85rem', marginRight: '0.5rem' }}>✏️ Editar</button>
                    <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleVenda(p)}>🛒 Baixar 1 Venda</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
           <div className="section-card animate-fade-in" style={{ width: '400px', maxWidth: '90%', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                 <h2>Novo Produto</h2>
                 <button className="btn-icon" onClick={() => setIsModalOpen(false)}>❌</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Nome do Produto</label>
                    <input type="text" value={novoNome} onChange={e => setNovoNome(e.target.value)} placeholder="Ex: Pomada Matte" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                 </div>
                 <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Preço (R$)</label>
                    <input type="number" value={novoPreco} onChange={e => setNovoPreco(e.target.value)} placeholder="Ex: 45" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                 </div>
                 <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Estoque Inicial</label>
                    <input type="number" value={novoEstoque} onChange={e => setNovoEstoque(e.target.value)} placeholder="Ex: 10" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                 </div>
                 <button className="btn-primary" style={{ marginTop: '1rem', padding: '1rem' }} onClick={handleCreate}>
                    Salvar Produto
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
