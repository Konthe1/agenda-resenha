"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function PlanosPage() {
  const [assinantes, setAssinantes] = useState<any[]>([]);
  const [planos, setPlanos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const { data: pData } = await supabase.from('planos').select('*').order('preco', { ascending: false });
      if (pData) setPlanos(pData);

      const { data: aData } = await supabase.from('assinantes').select('*, clientes(nome, telefone), planos(nome)').order('criado_em', { ascending: false });
      if (aData) setAssinantes(aData);
      
      setIsLoading(false);
    }
    loadData();
  }, []);

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

  const handleCreatePlano = async () => {
    if (!novoPlanoNome || !novoPlanoPreco) return;
    const { data } = await supabase.from('planos').insert({ 
      barbearia_id: '1', 
      nome: novoPlanoNome, 
      descricao: novoPlanoDesc, 
      preco: Number(novoPlanoPreco), 
      creditos: 4 
    }).select().single();
    
    if (data) setPlanos([...planos, data]);
    setIsPlanoModalOpen(false);
    setNovoPlanoNome(''); setNovoPlanoDesc(''); setNovoPlanoPreco('');
  };

  const handleCreateAssinante = async () => {
    if (!novoAssinanteNome || !novoAssinanteTel || !selectedPlanoId) return;
    
    // 1 - Criar ou achar Cliente
    let clientId;
    const { data: clients } = await supabase.from('clientes').select('id').eq('telefone', novoAssinanteTel).limit(1);
    if (clients && clients.length > 0) {
      clientId = clients[0].id;
    } else {
      const { data: newC } = await supabase.from('clientes').insert({ barbearia_id: '1', nome: novoAssinanteNome, telefone: novoAssinanteTel }).select().single();
      clientId = newC?.id;
    }

    if (!clientId) return;

    // 2 - Inserir Assinante
    const { data: newA } = await supabase.from('assinantes').insert({
      barbearia_id: '1',
      cliente_id: clientId,
      plano_id: selectedPlanoId,
      dia_vencimento: new Date().getDate()
    }).select('*, clientes(nome, telefone), planos(nome)').single();

    if (newA) {
       setAssinantes([newA, ...assinantes]);
    }

    setIsAssinanteModalOpen(false);
    setNovoAssinanteNome(''); setNovoAssinanteTel(''); setSelectedPlanoId('');

    // Trigger WPP Mock via Endpoint (to match the booking logic)
    try {
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telefone: novoAssinanteTel,
          nomeCliente: novoAssinanteNome,
          dataHora: 'Agora',
          servico: 'Assinatura PRO',
          barbeiro: 'Resenha Barber',
          barbeariaNome: 'Resenha Barber'
        })
      });
    } catch(e) {}
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

      <div className="planos-grid">
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
                 <button className="btn-text" style={{ padding: '0.4rem', color: 'var(--accent-primary)' }} onClick={async () => {
                    await supabase.from('planos').delete().eq('id', plano.id);
                    setPlanos(planos.filter(p => p.id !== plano.id));
                 }}>🗑️</button>
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
              {isLoading ? (
                 <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando dados...</td></tr>
              ) : assinantes.length === 0 ? (
                 <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhum assinante cadastrado.</td></tr>
              ) : (
                assinantes.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                       <strong style={{ display: 'block' }}>{a.clientes?.nome || 'Cliente Removido'}</strong>
                       <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.clientes?.telefone}</span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{a.planos?.nome || 'Plano Deletado'}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>Dia {a.dia_vencimento}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                       <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 500, background: a.status === 'ativo' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: a.status === 'ativo' ? '#10b981' : '#ef4444' }}>
                         {a.status === 'ativo' ? 'Ativo' : 'Atrasado'}
                       </span>
                    </td>
                  </tr>
                ))
              )}
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
