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
  const [barbeariaPerfil, setBarbeariaPerfil] = useState({ id: '', nome: '', slug: '', endereco: '', logo_url: '' });

  // Modal States
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [newServiceData, setNewServiceData] = useState({ nome: '', descricao: '', preco_base: '', duracao_minutos: '30' });
  
  const [showBarberModal, setShowBarberModal] = useState(false);
  const [newBarberData, setNewBarberData] = useState({ nome: '', especialidade: '' });
  
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'barbeiro' | 'servico', id: string, nome: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for Schedule (Horários)
  const defaultHorarios = {
    segunda: { ativo: false, inicio: "09:00", fim: "18:00" },
    terca: { ativo: true, inicio: "09:00", fim: "18:00" },
    quarta: { ativo: true, inicio: "09:00", fim: "18:00" },
    quinta: { ativo: true, inicio: "09:00", fim: "18:00" },
    sexta: { ativo: true, inicio: "09:00", fim: "18:00" },
    sabado: { ativo: true, inicio: "09:00", fim: "15:00" },
    domingo: { ativo: false, inicio: "09:00", fim: "12:00" }
  };
  const [selectedScheduleId, setSelectedScheduleId] = useState('geral');
  const [scheduleData, setScheduleData] = useState<any>(defaultHorarios);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  // Load correct schedule object when dropdown changes
  useEffect(() => {
    if (selectedScheduleId === 'geral') {
       // Mock for now or load from barbearia if it existed.
       setScheduleData(defaultHorarios);
    } else {
       const barbeiro = barbeiros.find(b => b.id === selectedScheduleId);
       if (barbeiro && barbeiro.horarios_trabalho) {
         setScheduleData(barbeiro.horarios_trabalho);
       } else {
         setScheduleData(defaultHorarios); // Fallback to default
       }
    }
  }, [selectedScheduleId, barbeiros]);

  // Handle Save
  const handleSaveSchedule = async () => {
     setIsSavingSchedule(true);
     try {
       if (selectedScheduleId === 'geral') {
         alert("No futuro, isso atualizará o horário central da Barbearia.");
       } else {
         const { error } = await supabase
           .from('barbeiros')
           .update({ horarios_trabalho: scheduleData })
           .eq('id', selectedScheduleId);
           
         if (error) throw error;
         alert("Horários do profissional salvos com sucesso!");
         // Refresh list memory
         setBarbeiros(bList => bList.map(b => b.id === selectedScheduleId ? { ...b, horarios_trabalho: scheduleData } : b));
       }
     } catch (e: any) {
       alert("Erro ao salvar: " + e.message);
     } finally {
       setIsSavingSchedule(false);
     }
  };

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    if (file.size > 10 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 10MB.');
      return null;
    }
    
    setIsSubmitting(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('barbearia-assets')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('barbearia-assets')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      if (error.message?.includes('Bucket not found') || error.error === 'Bucket not found') {
        alert('Erro: O Bucket "barbearia-assets" não foi encontrado.\n\nPor favor, execute o script SQL "setup_storage.sql" no painel do Supabase.');
      } else if (error.message?.includes('row-level security') || error.message?.includes('RLS')) {
        alert('Erro de Permissão (RLS): O seu banco de dados bloqueou o upload por segurança.\n\nPor favor, copie e execute o NOVO script "fix_storage_rls_v3.sql" que eu criei no painel SQL do Supabase. Ele vai liberar o acesso forçado para você conseguir subir as fotos agora!');
      } else {
        alert('Erro ao fazer upload da imagem: ' + (error.message || 'Erro desconhecido.'));
      }
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePerfil = async () => {
     setIsSubmitting(true);
     try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;
        
        const payload = {
           nome: barbeariaPerfil.nome,
           slug: barbeariaPerfil.slug,
           endereco: barbeariaPerfil.endereco,
           logo_url: barbeariaPerfil.logo_url,
           owner_id: userId
        };

        // Se já temos um ID, incluímos no upsert para atualizar a mesma linha.
        const { data, error } = await supabase
           .from('barbearias')
           .upsert(barbeariaPerfil.id ? { ...payload, id: barbeariaPerfil.id } : payload)
           .select()
           .single();
        
        if (error) throw error;
        
        if (data) {
           setBarbeariaPerfil({
              id: data.id,
              nome: data.nome || '',
              slug: data.slug || '',
              endereco: data.endereco || '',
              logo_url: data.logo_url || ''
           });
        }
        
        alert("Perfil da barbearia atualizado com sucesso!");
     } catch (e: any) {
        console.error("Erro ao salvar perfil:", e);
        alert("Erro ao salvar perfil: " + e.message);
     } finally {
        setIsSubmitting(false);
     }
  };

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      // Fetch barbers
      const { data: bData } = await supabase.from('barbeiros').select('*').order('nome');
      if (bData && bData.length > 0) {
        setBarbeiros(bData);
      }
      
      // Fetch barbearia profile (Prefer results from the logged-in user)
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      let q = supabase.from('barbearias').select('*');
      if (userId) {
         q = q.eq('owner_id', userId);
      }
      
      const { data: barbData, error: barbErr } = await q.limit(1).maybeSingle();
      
      if (barbData) {
        setBarbeariaPerfil({
           id: barbData.id,
           nome: barbData.nome || '',
           slug: barbData.slug || '',
           endereco: barbData.endereco || '',
           logo_url: barbData.logo_url || ''
        });
      } else if (!barbErr) {
        // Se não encontrou nenhuma e não deu erro, tentamos a primeira barbearia global como fallback
        const { data: globalBarb } = await supabase.from('barbearias').select('*').limit(1).maybeSingle();
        if (globalBarb) {
           setBarbeariaPerfil({
              id: globalBarb.id,
              nome: globalBarb.nome || '',
              slug: globalBarb.slug || '',
              endereco: globalBarb.endereco || '',
              logo_url: globalBarb.logo_url || ''
           });
        }
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
        
        if (st.connected) {
           setIsWhatsappConnected(true);
        } else {
           console.log("WhatsApp desconectado. Tentando 'acordar' automaticamente...");
           setQrCodeMessage("📱 Tentando reconectar ao WhatsApp automaticamente...");
           
           const resConnect = await fetch('/api/whatsapp/connect', { method: 'POST' });
           const dataConnect = await resConnect.json();
           
           if (dataConnect.alreadyConnected) {
              console.log("WhatsApp reconectado com sucesso!");
              setIsWhatsappConnected(true);
              setQrCodeMessage("");
           } else if (dataConnect.qrcode) {
              setQrCodeData(dataConnect.qrcode);
              setQrCodeMessage("Escaneie o QR Code abaixo com o WhatsApp da Barbearia");
           }
        }
      } catch(e) {
        console.error("Erro ao tentar auto-conectar WhatsApp:", e);
      }

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
        <button 
           className="btn-primary" 
           style={{ padding: '0.6rem 1.25rem' }} 
           onClick={() => {
              if (activeTab === 'perfil') handleSavePerfil();
              else if (activeTab === 'horarios') handleSaveSchedule();
              else alert("As edições desta aba são salvas automaticamente ou com seus próprios botões na lista abaixo.");
           }}
           disabled={isSubmitting || isSavingSchedule}
        >
          {isSubmitting || isSavingSchedule ? 'Salvando...' : 'Salvar Alterações'}
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
                  <input type="text" value={barbeariaPerfil.nome} onChange={(e) => setBarbeariaPerfil({...barbeariaPerfil, nome: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Logo da Barbearia (Max 10MB)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {barbeariaPerfil.logo_url ? (
                      <img src={barbeariaPerfil.logo_url} alt="Logo Preview" style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }} />
                    ) : (
                      <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'var(--bg-primary)', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>✂️</div>
                    )}
                    <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: '500', transition: 'background 0.2s' }}>
                      <span>📷 Escolher Foto...</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={async (e) => {
                           const file = e.target.files?.[0];
                           if (file) {
                              const publicUrl = await uploadImageToSupabase(file);
                              if (publicUrl) {
                                 setBarbeariaPerfil({...barbeariaPerfil, logo_url: publicUrl});
                              }
                           }
                        }} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Link do Agendamento (Slug)</label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ padding: '0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRight: 'none', borderRadius: '8px 0 0 8px', color: 'var(--text-secondary)' }}>agendaresenha.com/</span>
                    <input type="text" value={barbeariaPerfil.slug} onChange={(e) => setBarbeariaPerfil({...barbeariaPerfil, slug: e.target.value})} style={{ flex: 1, padding: '0.8rem', borderRadius: '0 8px 8px 0', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'white' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Endereço Completo</label>
                  <input type="text" placeholder="Rua, Número, Bairro, Cidade" value={barbeariaPerfil.endereco} onChange={(e) => setBarbeariaPerfil({...barbeariaPerfil, endereco: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
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
                  onClick={() => setShowServiceModal(true)}
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
                        <button className="btn-text" style={{ padding: '0.5rem', color: 'var(--accent-primary)' }} onClick={() => {
                          setDeleteConfirm({ type: 'servico', id: servico.id, nome: servico.nome });
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
                                   value={(servico.precos_barbeiros || {})[barbeiro.id as keyof typeof servico.precos_barbeiros] || ''}
                                   placeholder="0,00"
                                   onChange={(e) => {
                                      const obj = { ...(servico.precos_barbeiros || {}), [barbeiro.id]: Number(e.target.value) };
                                      setServicos(servicos.map(s => s.id === servico.id ? { ...s, precos_barbeiros: obj } : s));
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
                           const preco = (servico.precos_barbeiros || {})[barbeiro.id as keyof typeof servico.precos_barbeiros];
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
                     onClick={() => {
                        if (barbeiros.length >= limiteBarbeiros) {
                           alert('Sua solicitação de Barbeiro Adicional no valor de R$ 50,00/mês foi enviada para o administrador. Aguarde a aprovação para liberar o novo slot em sua agenda.');
                           return;
                        }
                        setShowBarberModal(true);
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
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary) 0%, #ea580c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', overflow: 'hidden', color: 'white' }}>
                          {barbeiro.foto_url?.startsWith('http') || barbeiro.foto_url?.startsWith('/') ? (
                             <img src={barbeiro.foto_url} alt={barbeiro.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                             barbeiro.foto_url || barbeiro.nome.charAt(0)
                          )}
                        </div>
                        <label title="Alterar Foto" style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.7rem', boxShadow: '0 2px 5px rgba(0,0,0,0.3)', zIndex: 2 }}>
                          📷
                          <input 
                             type="file" 
                             accept="image/*" 
                             style={{ display: 'none' }}
                             onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                   const publicUrl = await uploadImageToSupabase(file);
                                   if (publicUrl) {
                                      const { error } = await supabase.from('barbeiros').update({ foto_url: publicUrl }).eq('id', barbeiro.id);
                                      if (!error) {
                                         setBarbeiros(bList => bList.map(b => b.id === barbeiro.id ? { ...b, foto_url: publicUrl } : b));
                                      } else {
                                         alert("Erro ao salvar foto no banco.");
                                      }
                                   }
                                }
                             }}
                          />
                        </label>
                      </div>
                      <div>
                        <input 
                          type="text" 
                          value={barbeiro.nome}
                          onChange={(e) => setBarbeiros(barbeiros.map(b => b.id === barbeiro.id ? { ...b, nome: e.target.value } : b))}
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
                      <button 
                        className="btn-text" 
                        style={{ padding: '0.5rem', color: 'var(--accent-primary)' }} 
                        title="Remover"
                        onClick={() => {
                           setDeleteConfirm({ type: 'barbeiro', id: barbeiro.id, nome: barbeiro.nome });
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
                  value={selectedScheduleId}
                  onChange={(e) => setSelectedScheduleId(e.target.value)}
                >
                   <option value="geral">Geral (Barbearia)</option>
                   {barbeiros.map(b => (
                     <option key={b.id} value={b.id}>Profissional: {b.nome}</option>
                   ))}
                </select>
              </div>
              
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Defina os dias de trabalho e as janelas de agendamento. Se estiver configurando um barbeiro, os horários dele irão <strong>sobrescrever</strong> a regra geral e refletir diretamente no calendário do cliente.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'].map((diaKey) => {
                  const labelStr = diaKey.charAt(0).toUpperCase() + diaKey.slice(1);
                  const conf = scheduleData[diaKey] || { ativo: false, inicio: "09:00", fim: "18:00" };
                  
                  return (
                  <div key={diaKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', opacity: conf.ativo ? 1 : 0.5 }}>
                    <div style={{ width: '100px', fontWeight: '500' }}>{labelStr}</div>
                    
                    {!conf.ativo ? (
                       <div style={{ flex: 1, color: 'var(--text-secondary)', textAlign: 'center' }}>Folga / Fechado</div>
                    ) : (
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input 
                            type="time" 
                            value={conf.inicio} 
                            onChange={(e) => setScheduleData({ ...scheduleData, [diaKey]: { ...conf, inicio: e.target.value } })}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'white' }} 
                          />
                          <span style={{ color: 'var(--text-secondary)' }}>até</span>
                          <input 
                            type="time" 
                            value={conf.fim} 
                            onChange={(e) => setScheduleData({ ...scheduleData, [diaKey]: { ...conf, fim: e.target.value } })}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'white' }} 
                          />
                       </div>
                    )}
                    
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={conf.ativo} 
                        onChange={(e) => setScheduleData({ ...scheduleData, [diaKey]: { ...conf, ativo: e.target.checked } })}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                )})}
              </div>
              
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  className="btn-primary" 
                  style={{ padding: '0.8rem 2rem', background: '#10b981', border: 'none' }} 
                  onClick={handleSaveSchedule}
                  disabled={isSavingSchedule}
                >
                  {isSavingSchedule ? 'Salvando...' : 'Salvar Grade de Horários'}
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

      {/* MODAL: NOVO SERVIÇO */}
      {showServiceModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '450px', border: '1px solid var(--border-color)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>✨ Novo Serviço</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nome do Serviço *</label>
                <input type="text" value={newServiceData.nome} onChange={e => setNewServiceData({...newServiceData, nome: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'white' }} placeholder="Ex: Corte Degradê" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Descrição Breve</label>
                <input type="text" value={newServiceData.descricao} onChange={e => setNewServiceData({...newServiceData, descricao: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'white' }} placeholder="Ex: Corte na tesoura com fade e finalização" />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Preço Base (R$) *</label>
                  <input type="number" step="0.01" value={newServiceData.preco_base} onChange={e => setNewServiceData({...newServiceData, preco_base: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'white' }} placeholder="35.00" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Duração (Min) *</label>
                  <input type="number" value={newServiceData.duracao_minutos} onChange={e => setNewServiceData({...newServiceData, duracao_minutos: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'white' }} placeholder="30" />
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} onClick={() => setShowServiceModal(false)}>Cancelar</button>
              <button 
                className="btn-primary" 
                disabled={isSubmitting || !newServiceData.nome || !newServiceData.preco_base}
                style={{ padding: '0.6rem 1.2rem', opacity: (isSubmitting || !newServiceData.nome || !newServiceData.preco_base) ? 0.5 : 1 }}
                onClick={async () => {
                   setIsSubmitting(true);
                   const { data: bData } = await supabase.from('barbearias').select('id').limit(1).single();
                   const activeBarbeariaId = bData?.id || '12345678-1234-1234-1234-123456789012';
                   
                   const { data, error } = await supabase.from('servicos').insert({ 
                     barbearia_id: activeBarbeariaId, 
                     nome: newServiceData.nome, 
                     descricao: newServiceData.descricao, 
                     preco_base: parseFloat(newServiceData.preco_base), 
                     duracao_minutos: parseInt(newServiceData.duracao_minutos),
                     precos_barbeiros: {}
                   }).select().single();
                   
                   if (data) {
                     setServicos([{...data}, ...servicos]);
                     setShowServiceModal(false);
                     setNewServiceData({ nome: '', descricao: '', preco_base: '', duracao_minutos: '30' });
                     setEditingServiceId(data.id); // Opcional, para abrir os preços individuais
                   } else {
                     alert("Erro ao criar serviço: " + (error?.message || ""));
                   }
                   setIsSubmitting(false);
                }}
              >
                {isSubmitting ? 'Salvando...' : 'Criar Serviço'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO BARBEIRO */}
      {showBarberModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', border: '1px solid var(--border-color)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>🧔 Cadastrar Barbeiro</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nome do Profissional *</label>
                <input type="text" value={newBarberData.nome} onChange={e => setNewBarberData({...newBarberData, nome: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'white' }} placeholder="Ex: Lucas Silva" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Especialidade Principal</label>
                <input type="text" value={newBarberData.especialidade} onChange={e => setNewBarberData({...newBarberData, especialidade: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'white' }} placeholder="Ex: Fade e Barboterapia" />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} onClick={() => setShowBarberModal(false)}>Cancelar</button>
              <button 
                className="btn-primary" 
                disabled={isSubmitting || !newBarberData.nome}
                style={{ padding: '0.6rem 1.2rem', opacity: (isSubmitting || !newBarberData.nome) ? 0.5 : 1 }}
                onClick={async () => {
                   setIsSubmitting(true);
                   const { data: bData } = await supabase.from('barbearias').select('id').limit(1).single();
                   const activeBarbeariaId = bData?.id || '12345678-1234-1234-1234-123456789012';
                   
                   const foto = newBarberData.nome.charAt(0).toUpperCase();
                   const { data, error } = await supabase.from('barbeiros').insert({ 
                     barbearia_id: activeBarbeariaId, 
                     nome: newBarberData.nome, 
                     especialidade: newBarberData.especialidade, 
                     foto_url: foto, 
                     ativo: true 
                   }).select().single();
                   
                   if (data) {
                     setBarbeiros([...barbeiros, data]);
                     setShowBarberModal(false);
                     setNewBarberData({ nome: '', especialidade: '' });
                   } else {
                     alert("Erro ao criar barbeiro: " + (error?.message || ""));
                   }
                   setIsSubmitting(false);
                }}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Barbeiro'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAÇÃO DE EXCLUSÃO */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', border: '1px solid var(--border-color)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>
              ⚠️
            </div>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Tem certeza?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
              Deseja realmente excluir <strong>{deleteConfirm.nome}</strong>? Esta ação não poderá ser desfeita e afetará o histórico e agendamentos futuros.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                style={{ padding: '0.6rem 1.5rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }} 
                onClick={() => setDeleteConfirm(null)}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary"
                disabled={isSubmitting}
                style={{ padding: '0.6rem 1.5rem', background: '#ef4444', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', opacity: isSubmitting ? 0.6 : 1 }}
                onClick={async () => {
                   setIsSubmitting(true);
                   try {
                     if (deleteConfirm.type === 'barbeiro') {
                       await supabase.from('barbeiros').delete().eq('id', deleteConfirm.id);
                       setBarbeiros(barbeiros.filter(b => b.id !== deleteConfirm.id));
                     } else {
                       await supabase.from('servicos').delete().eq('id', deleteConfirm.id);
                       setServicos(servicos.filter(s => s.id !== deleteConfirm.id));
                     }
                     setDeleteConfirm(null);
                   } catch (e) {
                     alert("Erro ao excluir. Tente novamente.");
                   }
                   setIsSubmitting(false);
                }}
              >
                {isSubmitting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
