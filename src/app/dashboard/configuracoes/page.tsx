"use client";

import { useState } from "react";

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState("perfil");
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isFetchingQrCode, setIsFetchingQrCode] = useState(false);
  const [qrCodeMessage, setQrCodeMessage] = useState("");

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
                <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>+ Novo Serviço</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                     <h3 style={{ marginBottom: '0.25rem' }}>Corte Degradê na Régua</h3>
                     <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Máquina, gilete e finalização com pomada • 45 min</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                     <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>R$ 45,00</span>
                     <button className="btn-text" style={{ padding: '0.5rem' }}>✏️</button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                     <h3 style={{ marginBottom: '0.25rem' }}>Barba Terapia Completa</h3>
                     <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Toalha quente, ozônio e massagem facial • 30 min</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                     <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>R$ 35,00</span>
                     <button className="btn-text" style={{ padding: '0.5rem' }}>✏️</button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                     <h3 style={{ marginBottom: '0.25rem' }}>Combo VIP (Corte + Barba + Sobrancelha)</h3>
                     <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Serviço completo VIP • 1h 20m</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                     <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--accent-primary)' }}>R$ 90,00</span>
                     <button className="btn-text" style={{ padding: '0.5rem' }}>✏️</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'horarios' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Horários de Funcionamento</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((dia, i) => (
                  <div key={dia} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', opacity: dia === 'Domingo' ? 0.6 : 1 }}>
                    <div style={{ width: '100px', fontWeight: '500' }}>{dia}</div>
                    
                    {dia === 'Domingo' ? (
                       <div style={{ flex: 1, color: 'var(--text-secondary)', textAlign: 'center' }}>Fechado</div>
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
            </div>
          )}

          {activeTab === 'integracoes' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Robô de WhatsApp</h2>
              
              <div className="section-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'var(--bg-secondary)', border: '1px dashed var(--border-color)' }}>
                 <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
                 <h3 style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Conecte o seu celular</h3>
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
