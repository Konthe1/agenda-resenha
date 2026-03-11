"use client";

import { useState } from "react";

export default function PlanosPage() {
  const [assinantes, setAssinantes] = useState<any[]>([
    { id: 1, nome: "Lucas Fernandes", telefone: "11999999999", plano_id: 1, vencimento: "15/04/2026", status: "Ativo", creditos: 'Ilimitado' },
    { id: 2, nome: "Carlos Souza", telefone: "11988888888", plano_id: 2, vencimento: "20/03/2026", status: "Ativo", creditos: 2 },
    { id: 3, nome: "Roberto Almeida", telefone: "11977777777", plano_id: 3, vencimento: "02/03/2026", status: "Atrasado", creditos: 0 },
  ]);

  const [planos, setPlanos] = useState([
    { id: 1, nome: "Plano Ilimitado", descricao: "O cliente corta cabelo quantas vezes quiser no mês.", preco: 150.00, creditos: 'Ilimitado' },
    { id: 2, nome: "Pacote 4 Cortes", descricao: "4 cortes de cabelo p/ usar em 30 dias com desconto.", preco: 110.00, creditos: 4 },
    { id: 3, nome: "Plano Barba + Cabelo", descricao: "Combo Mensal 2 Cortes e 2 Barbas.", preco: 130.00, creditos: 2 }
  ]);

  const [isPlanoModalOpen, setIsPlanoModalOpen] = useState(false);
  const [isAssinanteModalOpen, setIsAssinanteModalOpen] = useState(false);

  // Form states - Planos
  const [novoPlanoNome, setNovoPlanoNome] = useState('');
  const [novoPlanoDesc, setNovoPlanoDesc] = useState('');
  const [novoPlanoPreco, setNovoPlanoPreco] = useState('');

  // Form states - Assinantes
  const [novoAssinanteNome, setNovoAssinanteNome] = useState('');
  const [novoAssinanteTel, setNovoAssinanteTel] = useState('');
  const [selectedPlanoId, setSelectedPlanoId] = useState('');

  const handleCreatePlano = () => {
    if (!novoPlanoNome || !novoPlanoPreco) return;
    const newId = Date.now();
    setPlanos([...planos, { id: newId, nome: novoPlanoNome, descricao: novoPlanoDesc, preco: Number(novoPlanoPreco), creditos: 4 }]);
    setIsPlanoModalOpen(false);
    setNovoPlanoNome(''); setNovoPlanoDesc(''); setNovoPlanoPreco('');
  };

  const handleCreateAssinante = async () => {
    if (!novoAssinanteNome || !novoAssinanteTel || !selectedPlanoId) return;
    
    // Calcula vencimento (30 dias a partir de hoje)
    const today = new Date();
    today.setDate(today.getDate() + 30);
    const vencimentoStr = today.toLocaleDateString('pt-BR');

    const planoSelecionado = planos.find(p => p.id === Number(selectedPlanoId));

    const newAssinante = {
       id: Date.now(),
       nome: novoAssinanteNome,
       telefone: novoAssinanteTel,
       plano_id: Number(selectedPlanoId),
       vencimento: vencimentoStr,
       status: "Ativo",
       creditos: planoSelecionado?.creditos || 0
    };

    setAssinantes([newAssinante, ...assinantes]);
    setIsAssinanteModalOpen(false);
    setNovoAssinanteNome(''); setNovoAssinanteTel(''); setSelectedPlanoId('');

    // SIMULAÇÃO DO WHATSAPP (Evolution API integration seria chamada aqui)
    alert(`💳 Mensalidade Ativada!\n\nUm disparo de WhatsApp (Template de Assinaturas PRO) acaba de ser enviado para o cliente ${novoAssinanteNome} no número ${novoAssinanteTel}.`);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div className="page-title">
          <h1>Planos e Mensalidades</h1>
          <p>Ofereça pacotes pré-pagos e fidelize clientes (Módulo PRO)</p>
        </div>
        <button className="btn-primary" style={{ padding: '0.6rem 1.25rem' }} onClick={() => setIsPlanoModalOpen(true)}>+ Novo Plano</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
        {/* Gerenciamento de Modalidades */}
        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2>Seus Pacotes</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '-1rem' }}>Crie pacotes para vender assinaturas para os clientes recorrentes.</p>
          
          {planos.map(plano => (
            <div key={plano.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
               <div>
                 <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{plano.nome}</h3>
                 <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{plano.descricao}</p>
                 <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>R$ {plano.preco.toFixed(2).replace('.', ',')} <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>/mês</span></div>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                 <button className="btn-text" style={{ padding: '0.4rem', color: 'var(--text-secondary)' }}>✏️</button>
                 <button className="btn-text" style={{ padding: '0.4rem', color: 'var(--accent-primary)' }} onClick={() => setPlanos(planos.filter(p => p.id !== plano.id))}>🗑️</button>
               </div>
            </div>
          ))}
        </div>

        {/* Gerenciamento de Assinantes */}
        <div className="section-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h2>Assinantes Ativos</h2>
             <button className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => setIsAssinanteModalOpen(true)}>+ Adicionar Membro</button>
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
                  <td style={{ padding: '1rem 1.5rem' }}>
                     <strong style={{ display: 'block' }}>{a.nome}</strong>
                     <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.telefone}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{planos.find(p => p.id === a.plano_id)?.nome || 'Plano Deletado'}</td>
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

      {/* MODAL NOVO PLANO */}
      {isPlanoModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
           <div className="section-card animate-fade-in" style={{ width: '400px', maxWidth: '90%', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                 <h2>Criar Novo Plano</h2>
                 <button className="btn-icon" onClick={() => setIsPlanoModalOpen(false)}>❌</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Nome do Pacote</label>
                    <input type="text" value={novoPlanoNome} onChange={e => setNovoPlanoNome(e.target.value)} placeholder="Ex: Pacote 4x Cortes" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                 </div>
                 
                 <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Breve Descrição</label>
                    <input type="text" value={novoPlanoDesc} onChange={e => setNovoPlanoDesc(e.target.value)} placeholder="O que está incluso no pacote" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                 </div>

                 <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Preço Mensal (R$)</label>
                    <input type="number" value={novoPlanoPreco} onChange={e => setNovoPlanoPreco(e.target.value)} placeholder="Ex: 150" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                 </div>

                 <button className="btn-primary" style={{ marginTop: '1rem', padding: '1rem' }} onClick={handleCreatePlano}>
                    Salvar Pacote
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL NOVO ASSINANTE */}
      {isAssinanteModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
           <div className="section-card animate-fade-in" style={{ width: '400px', maxWidth: '90%', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                 <h2>Matricular Cliente</h2>
                 <button className="btn-icon" onClick={() => setIsAssinanteModalOpen(false)}>❌</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Nome do Cliente</label>
                    <input type="text" value={novoAssinanteNome} onChange={e => setNovoAssinanteNome(e.target.value)} placeholder="Nome rápido" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                 </div>
                 
                 <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>WhatsApp do Cliente</label>
                    <input type="tel" value={novoAssinanteTel} onChange={e => setNovoAssinanteTel(e.target.value)} placeholder="Ex: 11999999999" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                 </div>

                 <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Escolha o Pacote</label>
                    <select value={selectedPlanoId} onChange={e => setSelectedPlanoId(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }}>
                       <option value="" disabled>Selecione um plano...</option>
                       {planos.map(p => (
                         <option key={p.id} value={p.id}>{p.nome} - R$ {p.preco.toFixed(2)}</option>
                       ))}
                    </select>
                 </div>

                 <button className="btn-primary" style={{ marginTop: '1rem', padding: '1rem' }} onClick={handleCreateAssinante}>
                    Confirmar Assinatura 🎉
                 </button>
                 <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '0.5rem' }}>
                    O cliente receberá uma notificação automática no WhatsApp!
                 </p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
