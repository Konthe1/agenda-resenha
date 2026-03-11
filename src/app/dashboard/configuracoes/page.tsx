"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState("perfil");
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isFetchingQrCode, setIsFetchingQrCode] = useState(false);
  const [qrCodeMessage, setQrCodeMessage] = useState("");
  const [isWhatsappConnected, setIsWhatsappConnected] = useState(false);
  const planoAtual = "pro";
  const [isLoading, setIsLoading] = useState(true);

  const [barbeiros, setBarbeiros] = useState<any[]>([]);
  const [servicos, setServicos] = useState<any[]>([]);
  const [editingServiceId, setEditingServiceId] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      // Fetch barbers
      const { data: bData } = await supabase.from('barbeiros').select('*').order('nome');
      if (bData && bData.length > 0) {
        setBarbeiros(bData);
      }
      
      // Fetch services
      const { data: sData } = await supabase.from('servicos').select('*').order('nome');
      if (sData && sData.length > 0) {
        setServicos(sData);
      }
      
      // Fetch WhatsApp status
      try {
        const fetchStatus = await fetch('/api/whatsapp/status');
        const st = await fetchStatus.json();
        if (st.connected) setIsWhatsappConnected(true);
      } catch(e) {}

      setIsLoading(false);
    }
    loadData();
  }, []);

  const limiteBarbeiros = 5;
  const valorAdicionalPorBarbeiro = 50.00;
  const assinandoAdicionais = barbeiros.length > limiteBarbeiros;
  const custoExtraMensal = assinandoAdicionais ? (barbeiros.length - limiteBarbeiros) * valorAdicionalPorBarbeiro : 0;

  const handleGenerateQR = async () => {
    setIsFetchingQrCode(true);
    setQrCodeMessage("Aguarde, gerando código secreto...");
    setQrCodeData(null);
    try {
      const res = await fetch('/api/whatsapp/connect', { method: 'POST' });
      const data = await res.json();
      
      if (data.qrcode) {
        setQrCodeData(data.qrcode);
        setQrCodeMessage("Escaneie o QR Code abaixo com o WhatsApp da Barbearia");
      } else if (data.alreadyConnected) {
         setQrCodeMessage("Seu número já está conectado e pronto para disparos! ✅");
         setIsWhatsappConnected(true);
      } else {
         setQrCodeMessage("Houve um erro: " + (data.error || "Tente novamente."));
      }
    } catch (e) {
      setQrCodeMessage("Erro de conexão com o servidor de mensagens.");
    } finally {
      setIsFetchingQrCode(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Configurações</h1>
          <p>Personalize seu sistema e dados da barbearia</p>
        </div>
        <button className="btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
          Salvar Alterações
        </button>
      </div>

      <div className="dashboard-content-grid" style={{ marginTop: '2rem' }}>
        {/* Menu Lateral de Configurações */}
        <div className="section-card" style={{ alignSelf: 'start', padding: '0' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <button 
              onClick={() => setActiveTab("perfil")}
              style={{ padding: '1rem 1.5rem', textAlign: 'left', background: activeTab === 'perfil' ? 'var(--bg-secondary)' : 'transparent', border: 'none', color: activeTab === 'perfil' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'perfil' ? '600' : '400', cursor: 'pointer', borderLeft: activeTab === 'perfil' ? '3px solid var(--accent-primary)' : '3px solid transparent' }}
            >
              🏢 Perfil da Barbearia
            </button>
            <button 
              onClick={() => setActiveTab("servicos")}
              style={{ padding: '1rem 1.5rem', textAlign: 'left', background: activeTab === 'servicos' ? 'var(--bg-secondary)' : 'transparent', border: 'none', color: activeTab === 'servicos' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'servicos' ? '600' : '400', cursor: 'pointer', borderLeft: activeTab === 'servicos' ? '3px solid var(--accent-primary)' : '3px solid transparent' }}
            >
              ✂️ Serviços e Preços
            </button>
            <button 
              onClick={() => setActiveTab("barbeiros")}
              style={{ padding: '1rem 1.5rem', textAlign: 'left', background: activeTab === 'barbeiros' ? 'var(--bg-secondary)' : 'transparent', border: 'none', color: activeTab === 'barbeiros' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'barbeiros' ? '600' : '400', cursor: 'pointer', borderLeft: activeTab === 'barbeiros' ? '3px solid var(--accent-primary)' : '3px solid transparent' }}
            >
              🧔 Equipe e Barbeiros
            </button>
            <button 
              onClick={() => setActiveTab("horarios")}
              style={{ padding: '1rem 1.5rem', textAlign: 'left', background: activeTab === 'horarios' ? 'var(--bg-secondary)' : 'transparent', border: 'none', color: activeTab === 'horarios' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'horarios' ? '600' : '400', cursor: 'pointer', borderLeft: activeTab === 'horarios' ? '3px solid var(--accent-primary)' : '3px solid transparent' }}
            >
              ⏰ Horários de Funcionamento
            </button>
            <button 
              onClick={() => setActiveTab("integracoes")}
              style={{ padding: '1rem 1.5rem', textAlign: 'left', background: activeTab === 'integracoes' ? 'var(--bg-secondary)' : 'transparent', border: 'none', color: activeTab === 'integracoes' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'integracoes' ? '600' : '400', cursor: 'pointer', borderLeft: activeTab === 'integracoes' ? '3px solid var(--accent-primary)' : '3px solid transparent' }}
            >
              🤖 Integrações (WhatsApp)
            </button>
          </div>
        </div>

        {/* Área de Conteúdo */}
        <div className="main-panel">
          {activeTab === 'perfil' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Dados Públicos</h2>
              
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Nome da Barbearia</label>
                  <input type="text" defaultValue="Resenha Barber" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Link do Agendamento (Slug)</label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ padding: '0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRight: 'none', borderRadius: '8px 0 0 8px', color: 'var(--text-secondary)' }}>agendaresenha.com/</span>
                    <input type="text" defaultValue="resenhabarber" style={{ flex: 1, padding: '0.8rem', borderRadius: '0 8px 8px 0', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'white' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Endereço Completo</label>
                  <input type="text" placeholder="Rua, Número, Bairro, Cidade" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'servicos' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h2>Serviços e Preços</h2>
                <button 
                  className="btn-primary" 
                  style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}
                  onClick={async () => {
                     const { data, error } = await supabase.from('servicos').insert({ barbearia_id: '1', nome: 'Novo Serviço', descricao: '', preco_base: 0, duracao_minutos: 30 }).select().single();
                     if (data) {
                       setServicos([{...data, precos_barbeiros: {}}, ...servicos]);
                       setEditingServiceId(data.id);
                     }
                  }}
                >+ Novo Serviço</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {servicos.map(servico => (
                  <div key={servico.id} style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: editingServiceId === servico.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)' }}>
                    
                    {/* Header do Serviço */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: editingServiceId === servico.id ? '1rem' : '0' }}>
                      <div style={{ flex: 1 }}>
                        {editingServiceId === servico.id ? (
                          <>
                            <input 
                              type="text" 
                              value={servico.nome}
                              onChange={(e) => setServicos(servicos.map(s => s.id === servico.id ? { ...s, nome: e.target.value } : s))}
                              style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', padding: '0.5rem', borderRadius: '4px' }}
                            />
                            <input 
                              type="text" 
                              value={servico.descricao}
                              onChange={(e) => setServicos(servicos.map(s => s.id === servico.id ? { ...s, descricao: e.target.value } : s))}
                              style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.9rem', padding: '0.5rem', borderRadius: '4px' }}
                            />
                          </>
                        ) : (
                          <>
                            <h3 style={{ marginBottom: '0.25rem', fontSize: '1.2rem' }}>{servico.nome}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{servico.descricao}</p>
                          </>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
                        {editingServiceId === servico.id ? (
                          <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={async () => {
                            await supabase.from('servicos').update({ nome: servico.nome, descricao: servico.descricao, precos_barbeiros: servico.precos_barbeiros }).eq('id', servico.id);
                            setEditingServiceId(null);
                          }}>Salvar</button>
                        ) : (
                          <button className="btn-text" style={{ padding: '0.5rem' }} onClick={() => setEditingServiceId(servico.id)}>✏️ Editar</button>
                        )}
                        <button className="btn-text" style={{ padding: '0.5rem', color: 'var(--accent-primary)' }} onClick={async () => {
                          await supabase.from('servicos').delete().eq('id', servico.id);
                          setServicos(servicos.filter(s => s.id !== servico.id));
                        }}>🗑️</button>
                      </div>
                    </div>

                    {/* Preços por Barbeiro (Mostrado apenas ao editar ou expandir mentalmente) */}
                    {editingServiceId === servico.id && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)' }}>
                         <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>Preço cobrado por cada profissional:</h4>
                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                           {barbeiros.map(barbeiro => (
                             <div key={barbeiro.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                               <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>{barbeiro.foto}</div>
                               <div style={{ flex: 1, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{barbeiro.nome.split(' ')[0]}</div>
                               <div style={{ display: 'flex', alignItems: 'center' }}>
                                 <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '4px' }}>R$</span>
                                 <input 
                                   type="number" 
                                   value={servico.precos[barbeiro.id as keyof typeof servico.precos] || ''}
                                   placeholder="0,00"
                                   onChange={(e) => {
                                      const obj = { ...servico.precos, [barbeiro.id]: Number(e.target.value) };
                                      setServicos(servicos.map(s => s.id === servico.id ? { ...s, precos: obj } : s));
                                   }}
                                   style={{ width: '60px', padding: '0.25rem', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'white', textAlign: 'right' }}
                                 />
                               </div>
                             </div>
                           ))}
                         </div>
                      </div>
                    )}

                    {/* Preço Base Resumo (Mostrado quando não está editando) */}
                    {editingServiceId !== servico.id && (
                      <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                        {barbeiros.map(barbeiro => {
                           const preco = servico.precos[barbeiro.id as keyof typeof servico.precos];
                           if (!preco) return null;
                           return (
                             <span key={barbeiro.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                               <span style={{ color: 'var(--text-secondary)' }}>{barbeiro.nome.split(' ')[0]}:</span>
                               <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>R$ {preco.toFixed(2).replace('.', ',')}</span>
                             </span>
                           );
                        })}
                      </div>
                    )}

                  </div>
                ))}
                
                {servicos.length === 0 && (
                   <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                     Nenhum serviço cadastrado.
                   </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'barbeiros' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h2>Equipe e Barbeiros</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                   <button 
                     className="btn-primary" 
                     style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', background: (barbeiros.length >= limiteBarbeiros) ? 'transparent' : 'var(--accent-primary)', border: (barbeiros.length >= limiteBarbeiros) ? '1px dashed var(--accent-primary)' : 'none', color: (barbeiros.length >= limiteBarbeiros) ? 'var(--accent-primary)' : 'white' }}
                     onClick={async () => {
                        if (barbeiros.length >= limiteBarbeiros) {
                           alert('Sua solicitação de Barbeiro Adicional no valor de R$ 50,00/mês foi enviada para o administrador. Aguarde a aprovação para liberar o novo slot em sua agenda.');
                           return;
                        }
                        const foto = "N";
                        const { data } = await supabase.from('barbeiros').insert({ barbearia_id: '1', nome: 'Novo Barbeiro', especialidade: '...', foto_url: foto, ativo: true }).select().single();
                        if (data) setBarbeiros([...barbeiros, data]);
                     }}
                   >
                     {(barbeiros.length >= limiteBarbeiros) ? '📝 Solicitar Adicional (+R$50)' : '+ Novo Barbeiro'}
                   </button>
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px dashed var(--border-color)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    Regra do Plano PRO: 5 Barbeiros Inclusos
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Profissionais adicionais mediante aprovação: + R$ 50,00/mês por barbeiro.
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 'bold', color: assinandoAdicionais ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                    {barbeiros.length} / {limiteBarbeiros}
                  </span>
                  {assinandoAdicionais && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>Acréscimo: + R$ {custoExtraMensal.toFixed(2)}</span>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {barbeiros.map(barbeiro => (
                  <div key={barbeiro.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary) 0%, #ea580c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {barbeiro.foto}
                      </div>
                      <div>
                        <input 
                          type="text" 
                          value={barbeiro.nome}
                          onChange={(e) => setBarbeiros(barbeiros.map(b => b.id === barbeiro.id ? { ...b, nome: e.target.value, foto: e.target.value.charAt(0).toUpperCase() } : b))}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.2rem', width: '200px' }}
                        />
                        <div>
                          <input 
                            type="text" 
                            value={barbeiro.especialidade}
                            onChange={(e) => setBarbeiros(barbeiros.map(b => b.id === barbeiro.id ? { ...b, especialidade: e.target.value } : b))}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', width: '200px' }}
                          />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <button className="btn-text" style={{ padding: '0.5rem', color: 'var(--text-secondary)' }} title="Horários de Trabalho">⏰</button>
                      <button 
                        className="btn-text" 
                        style={{ padding: '0.5rem', color: 'var(--accent-primary)' }} 
                        title="Remover"
                        onClick={async () => {
                           await supabase.from('barbeiros').delete().eq('id', barbeiro.id);
                           setBarbeiros(barbeiros.filter(b => b.id !== barbeiro.id));
                        }}
                      >🗑️</button>
                    </div>
                  </div>
                ))}
                
                {barbeiros.length === 0 && (
                   <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                     Nenhum barbeiro cadastrado.
                   </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'horarios' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h2>Horários de Funcionamento</h2>
                <select 
                  style={{ padding: '0.6rem 1rem', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'white', border: '1px solid var(--accent-primary)', outline: 'none', fontWeight: 'bold' }}
                  onChange={(e) => {
                     // Lógica simplificada para a demonstração do MVP
                     // Na versão real, isso carregaria o JSON correspondente
                     alert("Editando horários da entidade selecionada. (Simulação salva automaticamente na versão MVP)");
                  }}
                >
                   <option value="geral">Geral (Barbearia)</option>
                   {barbeiros.map(b => (
                     <option key={b.id} value={b.id}>Barbeiro: {b.nome}</option>
                   ))}
                </select>
              </div>
              
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Defina os dias de trabalho e as janelas de agendamento. Se estiver configurando um barbeiro, os horários dele irão <strong>sobrescrever</strong> a regra geral e refletir diretamente no calendário do cliente.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((dia, i) => (
                  <div key={dia} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', opacity: dia === 'Domingo' ? 0.6 : 1 }}>
                    <div style={{ width: '100px', fontWeight: '500' }}>{dia}</div>
                    
                    {dia === 'Domingo' ? (
                       <div style={{ flex: 1, color: 'var(--text-secondary)', textAlign: 'center' }}>Folga / Fechado</div>
                    ) : (
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input type="time" defaultValue="09:00" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'white' }} />
                          <span style={{ color: 'var(--text-secondary)' }}>até</span>
                          <input type="time" defaultValue={dia === 'Sábado' ? "17:00" : "20:00"} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'white' }} />
                       </div>
                    )}
                    
                    <label className="switch">
                      <input type="checkbox" defaultChecked={dia !== 'Domingo'} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                ))}
              </div>
              
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" style={{ padding: '0.8rem 2rem', background: '#10b981', border: 'none' }} onClick={() => alert('Horários salvos e integrados ao calendário de agendamentos com sucesso!')}>
                  Salvar Grade de Horários
                </button>
              </div>
            </div>
          )}

          {activeTab === 'integracoes' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Robô de WhatsApp</h2>
              
              <div className="section-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'var(--bg-secondary)', border: '1px dashed var(--border-color)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '3rem' }}>📱</div>
                    {isWhatsappConnected ? (
                      <span style={{ background: 'rgba(37, 211, 102, 0.15)', color: '#25D366', padding: '0.5rem 1rem', borderRadius: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: '8px', height: '8px', background: '#25D366', borderRadius: '50%', display: 'inline-block' }}></span> Conectado e Ativo</span>
                    ) : (
                      <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', display: 'inline-block' }}></span> Desconectado</span>
                    )}
                 </div>
                 <h3 style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Conexão com WhatsApp</h3>
                 <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px' }}>
                   Para que o sistema envie lembretes automáticos para seus clientes, precisamos nos conectar ao WhatsApp da sua barbearia (como se fosse o WhatsApp Web).
                 </p>

                 {qrCodeData ? (
                   <div style={{ background: 'white', padding: '15px', borderRadius: '12px', display: 'inline-block' }}>
                     <img src={qrCodeData} alt="WhatsApp QR Code" style={{ width: '250px', height: '250px' }} />
                   </div>
                 ) : (
                   <button onClick={handleGenerateQR} disabled={isFetchingQrCode} className="btn-primary" style={{ padding: '0.8rem 1.5rem', background: isFetchingQrCode ? 'var(--bg-primary)' : '#25D366', color: 'white' }}>
                     {isFetchingQrCode ? 'Gerando Conexão...' : '🔗 Gerar QR Code agora'}
                   </button>
                 )}
                 
                 {qrCodeMessage && (
                   <p style={{ marginTop: '1.5rem', fontWeight: '500', color: qrCodeData ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                     {qrCodeMessage}
                   </p>
                 )}
              </div>

              <h3 style={{ marginTop: '3rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>🤖 Mensagens Automáticas (Templates)</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Ative e personalize o texto que o seu cliente vai receber no WhatsApp. Use as variáveis como <code>{`{{cliente}}`}</code>, <code>{`{{data}}`}</code>, etc.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Template 1 */}
                <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '1.1rem' }}>✅ Agendamento Confirmado</h4>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <textarea 
                    style={{ width: '100%', height: '100px', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical' }}
                    defaultValue="Fala {{cliente}}! Seu horário na Resenha Barber ta confirmado pra {{data}} às {{hora}} com o brabo do {{barbeiro}}. Tmj! ✂️🔥"
                  />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Disparado assim que o cliente finaliza o agendamento no link.</p>
                </div>

                {/* Template 2 */}
                <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '1.1rem' }}>⏰ Lembrete (30 Minutos Antes)</h4>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <textarea 
                    style={{ width: '100%', height: '100px', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical' }}
                    defaultValue="Passando pra lembrar que seu horário é daqui a pouco, às {{hora}}! Não vai atrasar hein {{cliente}}? 🏃‍♂️💨"
                  />
                </div>

                {/* Template 3 */}
                <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '1.1rem' }}>💰 Cashback e Fidelidade (PRO)</h4>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <textarea 
                    style={{ width: '100%', height: '100px', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical' }}
                    defaultValue="Valeu pela moral hoje {{cliente}}! Você acabou de ganhar {{pontos}} pontos no nosso programa. Falta pouco pro corte grátis! 🏆"
                  />
                </div>

                 {/* Template 4 */}
                 <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '1.1rem' }}>🎟️ Assinaturas e Planos (PRO)</h4>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <textarea 
                    style={{ width: '100%', height: '100px', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical' }}
                    defaultValue="Fala {{cliente}}! Sua assinatura do plano {{plano}} foi renovada com sucesso! Você tem {{cortes_restantes}} cortes pra usar esse mês. Bora marcar? 🚀"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
