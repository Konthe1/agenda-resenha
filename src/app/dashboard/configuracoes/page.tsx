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

          {activeTab !== 'perfil' && (
            <div style={{ minHeight: '30vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
              <h2 style={{ marginBottom: '1rem' }}>Módulo em Desenvolvimento</h2>
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
                As configurações avançadas desta aba estarão disponíveis nas próximas semanas.
              </p>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
