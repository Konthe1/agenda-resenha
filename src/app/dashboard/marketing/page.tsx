"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState("fidelidade");
  const [inativosCount, setInativosCount] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [promoMessage, setPromoMessage] = useState("Fala chefe, tudo certo? Senti sua falta aqui na Resenha Barber! Tem um cupom de 20% de desconto te esperando pra essa semana. Bora dar um talento no visual? Agende aqui: agendaresenha.com/resenhabarber");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [barbeariaId, setBarbeariaId] = useState<string | null>(null);
  const [servicos, setServicos] = useState<any[]>([]);
  
  // Advanced Filtros
  const [filtroAlvo, setFiltroAlvo] = useState("inativos"); 
  
  // Marketing Settings (Dynamic from DB)
  const [settings, setSettings] = useState({
    fidelidade_ativa: true,
    fidelidade_cortes: 10,
    fidelidade_premio_servico_id: '',
    cashback_ativa: true,
    cashback_percentual: 5
  });
  
  const [isEditingRule, setIsEditingRule] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Mock Data for UI demonstration
  const [ranking, setRanking] = useState([
    { id: 1, nome: "João Silva", telefone: "11999999999", cortes: 8, pontos: 80, proxPremio: "2 cortes" },
    { id: 2, nome: "Carlos Eduardo", telefone: "11988888888", cortes: 5, pontos: 50, proxPremio: "5 cortes" },
    { id: 3, nome: "Marcos Lima", telefone: "11977777777", cortes: 3, pontos: 30, proxPremio: "7 cortes" }
  ]);
  
  const [cashbacks, setCashbacks] = useState([
    { id: 1, data: "10/03/2026", cliente: "João Silva", valorAplicado: 4.50, status: "Aguardando Resgate" },
    { id: 2, data: "08/03/2026", cliente: "Pedro Alves", valorAplicado: 7.00, status: "Aguardando Resgate" },
    { id: 3, data: "01/03/2026", cliente: "Carlos Eduardo", valorAplicado: 3.50, status: "Resgatado" }
  ]);

  useEffect(() => {
    async function fetchDados() {
      setIsLoading(true);
      try {
        console.log("Iniciando carregamento de dados de marketing...");
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        
        let barbearia = null;

        if (user) {
          // 1. Tentar buscar pelo owner_id
          const { data: barbOwner } = await supabase
            .from('barbearias')
            .select('*')
            .eq('owner_id', user.id)
            .maybeSingle();
          barbearia = barbOwner;
        }

        // Fallback 1: Buscar qualquer barbearia
        if (!barbearia) {
          const { data: firstBarb } = await supabase
            .from('barbearias')
            .select('*')
            .limit(1)
            .maybeSingle();
          barbearia = firstBarb;
        }

        if (barbearia) {
          setBarbeariaId(barbearia.id);
          setSettings({
            fidelidade_ativa: barbearia.fidelidade_ativa ?? true,
            fidelidade_cortes: barbearia.fidelidade_cortes ?? 10,
            fidelidade_premio_servico_id: barbearia.fidelidade_premio_servico_id || '',
            cashback_ativa: barbearia.cashback_ativo ?? true,
            cashback_percentual: barbearia.cashback_percentual ?? 5
          });
        }

        // 2. Buscar Serviços (Sem filtro rígido, igual à tela de configurações para garantir que apareçam)
        const { data: servData, error: servError } = await supabase
          .from('servicos')
          .select('id, nome')
          .order('nome');
        
        if (servError) console.error("Erro ao buscar serviços:", servError);
        if (servData) {
          console.log(`${servData.length} serviços encontrados.`);
          setServicos(servData);
        }

        // 3. Métricas Básicas
        const { count } = await supabase.from('clientes').select('*', { count: 'exact', head: true });
        if (count) {
          setTotalClientes(count);
          setInativosCount(Math.floor(count * 0.7) || 1);
        }
      } catch (error) {
        console.error("Erro ao carregar dados de marketing:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDados();
  }, []);

  const handleSaveSettings = async (newSettings?: any) => {
    const toSave = newSettings || settings;
    if (!barbeariaId) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('barbearias')
        .update({
          fidelidade_ativa: toSave.fidelidade_ativa,
          fidelidade_cortes: Number(toSave.fidelidade_cortes),
          fidelidade_premio_servico_id: toSave.fidelidade_premio_servico_id || null,
          cashback_ativo: toSave.cashback_ativa,
          cashback_percentual: Number(toSave.cashback_percentual)
        })
        .eq('id', barbeariaId);

      if (error) throw error;
      
      if (!newSettings) setIsEditingRule(false);
      alert("Configurações atualizadas com sucesso!");
    } catch (error: any) {
      alert("Erro ao salvar: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = (type: 'fidelidade' | 'cashback') => {
    const field = type === 'fidelidade' ? 'fidelidade_ativa' : 'cashback_ativa';
    const newVal = !settings[field];
    const newSettings = { ...settings, [field]: newVal };
    setSettings(newSettings);
    handleSaveSettings(newSettings);
  };

  const handleDisparo = async () => {
    let target = filtroAlvo === 'inativos' ? inativosCount : (filtroAlvo === 'todos' ? totalClientes : ranking.length);
    if (target === 0) {
      alert("Nenhum cliente nesse segmento.");
      return;
    }
    setIsSending(true);
    await new Promise(r => setTimeout(r, 2000)); 
    alert(`🚀 Disparo de Marketing em Massa enviado para ${target} clientes com sucesso! (Demonstração)`);
    setIsSending(false);
  };

  const getServiceName = (id: string) => {
    return servicos.find(s => s.id === id)?.nome || "Corte Grátis";
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Marketing & Fidelização <span style={{ fontSize: '0.6em', background: 'linear-gradient(135deg, #f97316, #eab308)', padding: '4px 8px', borderRadius: '4px', verticalAlign: 'middle', marginLeft: '10px', color: 'white' }}>PRO</span></h1>
          <p>Retenha clientes e dispare promoções pelo WhatsApp</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => alert("Módulo de Configurações Avançadas abrirá ferramentas de automação IA e Copywriting PRO em atualizações futuras.")}
          style={{ width: 'auto', padding: '0.8rem 1.5rem', fontWeight: 'bold', fontSize: '1rem', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.4)', borderRadius: '8px' }}>
          ⚙️ Configurações Avançadas
        </button>
      </div>

      <div className="dashboard-content-grid" style={{ marginTop: '2rem' }}>
        {/* Menu Lateral de Marketing */}
        <div className="section-card" style={{ alignSelf: 'start', padding: '0' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <button 
              onClick={() => setActiveTab("fidelidade")}
              style={{ padding: '1rem 1.5rem', textAlign: 'left', background: activeTab === 'fidelidade' ? 'var(--bg-secondary)' : 'transparent', border: 'none', color: activeTab === 'fidelidade' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'fidelidade' ? '600' : '400', cursor: 'pointer', borderLeft: activeTab === 'fidelidade' ? '3px solid var(--accent-primary)' : '3px solid transparent' }}
            >
              ⭐ Programa de Fidelidade
            </button>
            <button 
              onClick={() => setActiveTab("cashback")}
              style={{ padding: '1rem 1.5rem', textAlign: 'left', background: activeTab === 'cashback' ? 'var(--bg-secondary)' : 'transparent', border: 'none', color: activeTab === 'cashback' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'cashback' ? '600' : '400', cursor: 'pointer', borderLeft: activeTab === 'cashback' ? '3px solid var(--accent-primary)' : '3px solid transparent' }}
            >
              💸 Carteira de Cashback
            </button>
            <button 
              onClick={() => setActiveTab("promocoes")}
              style={{ padding: '1rem 1.5rem', textAlign: 'left', background: activeTab === 'promocoes' ? 'var(--bg-secondary)' : 'transparent', border: 'none', color: activeTab === 'promocoes' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'promocoes' ? '600' : '400', cursor: 'pointer', borderLeft: activeTab === 'promocoes' ? '3px solid var(--accent-primary)' : '3px solid transparent' }}
            >
              📢 Disparo em Massa
            </button>
          </div>
        </div>

        {/* Área de Conteúdo */}
        <div className="main-panel">
          {isLoading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando ferramentas de marketing...</div>
          ) : activeTab === 'fidelidade' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h2>Programa de Fidelidade</h2>
                <button 
                  onClick={() => toggleStatus('fidelidade')}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    borderRadius: '20px', 
                    border: 'none', 
                    background: settings.fidelidade_ativa ? '#10b981' : 'var(--bg-primary)',
                    color: settings.fidelidade_ativa ? 'white' : 'var(--text-secondary)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {settings.fidelidade_ativa ? '● Ativo' : '○ Inativo'}
                </button>
              </div>
              
              <div className="metrics-grid" style={{ marginBottom: '2rem' }}>
                <div className="metric-card" style={{ background: 'var(--bg-secondary)', borderLeft: '4px solid var(--accent-primary)' }}>
                   <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Clientes no Programa</div>
                   <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{totalClientes > 0 ? totalClientes : 124}</div>
                </div>
                <div className="metric-card" style={{ background: 'var(--bg-secondary)', borderLeft: '4px solid #10b981' }}>
                   <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Cortes Faltando (Média)</div>
                   <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>4.2</div>
                </div>
                <div className="metric-card" style={{ background: 'var(--bg-secondary)', borderLeft: '4px solid #f59e0b' }}>
                   <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Prêmios Resgatados</div>
                   <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>28</div>
                </div>
              </div>

              <div className="section-card" style={{ background: 'var(--bg-secondary)', marginBottom: '1.5rem', opacity: settings.fidelidade_ativa ? 1 : 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>Regra de Recompensa</h3>
                  {!isEditingRule ? (
                    <button className="btn-text" onClick={() => setIsEditingRule(true)} style={{ fontSize: '0.85rem', color: 'var(--text-primary)', background: 'var(--bg-primary)', padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', cursor: settings.fidelidade_ativa ? 'pointer' : 'not-allowed' }} disabled={!settings.fidelidade_ativa}>✏️ Editar</button>
                  ) : (
                    <button className="btn-text" onClick={() => handleSaveSettings()} style={{ fontSize: '0.85rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid #10b981' }} disabled={isSaving}>{isSaving ? 'Salvando...' : '✅ Salvar'}</button>
                  )}
                </div>
                
                {isEditingRule ? (
                   <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1rem', alignItems: 'center', background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--accent-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="number" min="1" max="50" value={settings.fidelidade_cortes} onChange={(e) => setSettings({...settings, fidelidade_cortes: Number(e.target.value)})} style={{ width: '70px', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white', textAlign: 'center', fontWeight: 'bold' }} />
                        <span style={{ fontWeight: '500' }}>Cortes Acumulados = </span>
                      </div>
                      <select 
                        value={settings.fidelidade_premio_servico_id} 
                        onChange={(e) => setSettings({...settings, fidelidade_premio_servico_id: e.target.value})}
                        style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white', cursor: 'pointer' }}
                      >
                        <option value="">Selecione o Bônus...</option>
                        {servicos.map(s => <option key={s.id} value={s.id}>Grátis: {s.nome}</option>)}
                      </select>
                   </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                     <div style={{ fontSize: '2rem' }}>✂️</div>
                     <div>
                       <strong style={{ display: 'block', fontSize: '1.1rem' }}>{settings.fidelidade_cortes} Cortes = 1 {getServiceName(settings.fidelidade_premio_servico_id)} Grátis</strong>
                       <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>O selo é creditado automaticamente após o pagamento do agendamento ser confirmado.</span>
                     </div>
                  </div>
                )}
              </div>

              <div className="section-card" style={{ background: 'var(--bg-secondary)', padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                   <h3 style={{ fontSize: '1.1rem' }}>Ranking dos Mais Fiéis 🏆</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <th style={{ padding: '0.8rem 1.5rem', fontWeight: 600 }}>Posição</th>
                      <th style={{ padding: '0.8rem 1.5rem', fontWeight: 600 }}>Cliente</th>
                      <th style={{ padding: '0.8rem 1.5rem', fontWeight: 600 }}>Cortes Atuais</th>
                      <th style={{ padding: '0.8rem 1.5rem', fontWeight: 600 }}>Próximo Prêmio Em</th>
                      <th style={{ padding: '0.8rem 1.5rem', fontWeight: 600 }}>Acionar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((r, i) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                         <td style={{ padding: '1rem 1.5rem' }}>
                            {i === 0 ? '🥇 1º' : i === 1 ? '🥈 2º' : '🥉 3º'}
                         </td>
                         <td style={{ padding: '1rem 1.5rem', fontWeight: 'bold' }}>{r.nome} <span style={{display: 'block', fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-secondary)'}}>{r.telefone}</span></td>
                         <td style={{ padding: '1rem 1.5rem' }}>{r.cortes} / {settings.fidelidade_cortes}</td>
                         <td style={{ padding: '1rem 1.5rem', color: 'var(--accent-primary)' }}>{r.proxPremio}</td>
                         <td style={{ padding: '1rem 1.5rem' }}>
                           <button className="btn-primary" style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: '#25D366' }}>WhatsApp</button>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'cashback' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h2>Carteira de Cashback</h2>
                <button 
                  onClick={() => toggleStatus('cashback')}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    borderRadius: '20px', 
                    border: 'none', 
                    background: settings.cashback_ativa ? '#2563eb' : 'var(--bg-primary)',
                    color: settings.cashback_ativa ? 'white' : 'var(--text-secondary)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {settings.cashback_ativa ? `● Ativo (${settings.cashback_percentual}%)` : '○ Inativo'}
                </button>
              </div>
              
              <div className="metrics-grid" style={{ marginBottom: '2rem' }}>
                <div className="metric-card" style={{ background: 'var(--bg-secondary)' }}>
                   <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Distribuído</div>
                   <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>R$ 485,50</div>
                </div>
                <div className="metric-card" style={{ background: 'var(--bg-secondary)' }}>
                   <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Resgatado</div>
                   <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>R$ 120,00</div>
                </div>
                <div className="metric-card" style={{ background: 'var(--bg-secondary)' }}>
                   <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Taxa de Regresso</div>
                   <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>34%</div>
                </div>
              </div>

              {settings.cashback_ativa && (
                <div className="section-card" style={{ background: 'var(--bg-secondary)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '1.5rem' }}>🎯</div>
                    <div>
                      <strong>Configuração de Cashback</strong>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quanto o cliente recebe de volta do valor gasto?</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="number" 
                      value={settings.cashback_percentual} 
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSettings({...settings, cashback_percentual: val});
                      }}
                      onBlur={() => handleSaveSettings()}
                      style={{ width: '80px', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'white', textAlign: 'center', fontWeight: 'bold' }} 
                    />
                    <span style={{ fontWeight: 'bold' }}>%</span>
                  </div>
                </div>
              )}

              <div className="section-card" style={{ background: 'var(--bg-secondary)', padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <h3 style={{ fontSize: '1.1rem' }}>Extrato de Cashbacks</h3>
                   <button className="btn-text" style={{ fontSize: '0.85rem' }}>Filtros</button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <th style={{ padding: '0.8rem 1.5rem', fontWeight: 600 }}>Data da Compra</th>
                      <th style={{ padding: '0.8rem 1.5rem', fontWeight: 600 }}>Cliente</th>
                      <th style={{ padding: '0.8rem 1.5rem', fontWeight: 600 }}>Cashback Gerado</th>
                      <th style={{ padding: '0.8rem 1.5rem', fontWeight: 600 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashbacks.map((c) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                         <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{c.data}</td>
                         <td style={{ padding: '1rem 1.5rem', fontWeight: 'bold' }}>{c.cliente}</td>
                         <td style={{ padding: '1rem 1.5rem', color: '#10b981', fontWeight: 'bold' }}>+ R$ {c.valorAplicado.toFixed(2).replace('.',',')}</td>
                         <td style={{ padding: '1rem 1.5rem' }}>
                            {c.status === 'Resgatado' ? (
                               <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.8rem' }}>Resgatado</span>
                            ) : (
                               <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', borderRadius: '4px', fontSize: '0.8rem' }}>Pendente</span>
                            )}
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>
              <h2 style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Disparo em Massa & CRM</h2>
              
              <div className="section-card" style={{ background: 'var(--bg-secondary)', marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Segmentação de Público</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                   <div 
                      onClick={() => setFiltroAlvo('inativos')}
                      style={{ padding: '1.2rem', background: 'var(--bg-primary)', borderRadius: '8px', border: filtroAlvo === 'inativos' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                   >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <strong>💤 Inativos ({'>'} 30 dias)</strong>
                         <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>{inativosCount}</span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Clientes que não pisam na barbearia há um mês.</span>
                   </div>

                   <div 
                      onClick={() => setFiltroAlvo('vip')}
                      style={{ padding: '1.2rem', background: 'var(--bg-primary)', borderRadius: '8px', border: filtroAlvo === 'vip' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                   >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <strong>⭐ Clientes VIPs (Top 10)</strong>
                         <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>{ranking.length}</span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Os clientes que dão mais lucro.</span>
                   </div>

                   <div 
                      onClick={() => setFiltroAlvo('todos')}
                      style={{ padding: '1.2rem', background: 'var(--bg-primary)', borderRadius: '8px', border: filtroAlvo === 'todos' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                   >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <strong>📢 Toda Base Base</strong>
                         <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>{totalClientes}</span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Disparar para absolutamente todo mundo.</span>
                   </div>
                </div>
              </div>

              <div className="section-card" style={{ background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                   <h3>Conteúdo da Mensagem</h3>
                   <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Variáveis suportadas: <code style={{ margin: '0 4px', background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '4px' }}>{"{nome}"}</code></span>
                </div>
                
                <textarea 
                  rows={5}
                  value={promoMessage}
                  onChange={e => setPromoMessage(e.target.value)}
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'white', marginBottom: '1.5rem', resize: 'vertical' }} 
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <span style={{ fontSize: '1.2rem', color: '#f59e0b' }}>⚠️</span> Não envie spans para evitar bloqueio no WhatsApp.
                  </div>
                  <button className="btn-primary" style={{ width: 'auto', padding: '0.8rem 1.5rem', opacity: isSending ? 0.7 : 1 }} onClick={handleDisparo} disabled={isSending}>
                    {isSending ? 'Processando fila...' : `🚀 Disparar para ${filtroAlvo === 'inativos' ? inativosCount : (filtroAlvo === 'todos' ? totalClientes : ranking.length)} Clientes`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
