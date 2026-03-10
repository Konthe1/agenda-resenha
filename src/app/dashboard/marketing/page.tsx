"use client";

import { useState } from "react";

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState("fidelidade");

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Marketing & Fidelização <span style={{ fontSize: '0.6em', background: 'linear-gradient(135deg, #f97316, #eab308)', padding: '4px 8px', borderRadius: '4px', verticalAlign: 'middle', marginLeft: '10px' }}>PRO</span></h1>
          <p>Retenha clientes e dispare promoções pelo WhatsApp</p>
        </div>
        <button className="btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
          Ativar Campanha
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
          {activeTab === 'fidelidade' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Cartão Fidelidade Virtual</h2>
              
              <div className="section-card" style={{ background: 'var(--bg-secondary)' }}>
                <h3>Regra do Cartão</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Defina quantos cortes o cliente precisa fazer para ganhar um prêmio.</p>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <input type="number" defaultValue={10} style={{ width: '80px', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'white' }} />
                  <span>Cortes = </span>
                  <select style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'white' }}>
                    <option>1 Corte Grátis</option>
                    <option>1 Barba Grátis</option>
                    <option>50% de Desconto no próximo serviço</option>
                    <option>Cerveja Artesanal Grátis</option>
                  </select>
                </div>

                <div style={{ padding: '15px', background: 'rgba(37, 211, 102, 0.1)', border: '1px solid #25D366', borderRadius: '8px', color: '#25D366' }}>
                  📱 O cliente receberá uma mensagem no WhatsApp com o saldo atualizado a cada corte!
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cashback' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Cashback Automático</h2>
              
              <div className="section-card" style={{ background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h3>Ativar Cashback</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Devolva uma % do valor para uso futuro</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider round"></span>
                  </label>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Devolver</span>
                  <input type="number" defaultValue={5} style={{ width: '80px', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'white' }} />
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>% do valor pago.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'promocoes' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Disparo de Mensagens</h2>
              
              <div className="section-card" style={{ background: 'var(--bg-secondary)' }}>
                <h3>Criar Promoção</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Envie uma mensagem no WhatsApp para todos os clientes que não vêm há mais de 30 dias.</p>
                
                <textarea 
                  rows={4}
                  defaultValue="Fala chefe, tudo certo? Senti sua falta aqui na Resenha Barber! Tem um cupom de 20% de desconto te esperando pra essa semana. Bora dar um talento no visual? Agende aqui: agendaresenha.com/resenhabarber"
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'white', marginBottom: '1rem', resize: 'vertical' }} 
                />
                
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn-primary" style={{ padding: '0.8rem 1.5rem' }}>
                    🚀 Disparar para 142 Clientes Inativos
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Switch CSS directly injected here for the mock UI to prevent touching global CSS right now */}
      <style dangerouslySetInnerHTML={{__html: `
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 28px;
        }
        .switch input { 
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--border-color);
          transition: .4s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
        }
        input:checked + .slider {
          background-color: var(--accent-primary);
        }
        input:checked + .slider:before {
          transform: translateX(22px);
        }
        .slider.round {
          border-radius: 34px;
        }
        .slider.round:before {
          border-radius: 50%;
        }
      `}} />
    </div>
  );
}
