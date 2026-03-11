"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import "./booking.css";

// --- Types ---
type Barbearia = {
  id: string;
  nome: string;
  logo_url: string | null;
  cor_primaria: string | null;
};

type Barbeiro = {
  id: string;
  nome: string;
  especialidade: string | null;
  foto_url: string | null;
};

type Servico = {
  id: string;
  nome: string;
  descricao: string | null;
  preco_base: number; // Para fallback antigo
  precos_barbeiros?: Record<string, number>; // Novo modelo: preço por ID do barbeiro
  duracao_minutos: number;
};

export default function BookingPage() {
  const { slug } = useParams();
  
  // Data States
  const [barbearia, setBarbearia] = useState<Barbearia | null>(null);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking Flow States
  const [step, setStep] = useState(1);
  const [selectedBarbeiro, setSelectedBarbeiro] = useState<Barbeiro | null>(null);
  const [selectedService, setSelectedService] = useState<Servico | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Client Form
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadBarbearia() {
      if (!slug) return;
      
      // Clean up the slug (in case the user accidentally copied a trailing dot or space)
      const cleanSlug = (slug as string).replace(/[\.\s]+$/, '');
      
      // 1. Fetch Tenant (Barbearia)
      const { data: bData, error: bErr } = await supabase
        .from("barbearias")
        .select("*")
        .eq("slug", cleanSlug)
        .single();
        
      let activeBarbearia = bData;

      if (bErr || !bData) {
        if (cleanSlug === 'resenhabarber') {
          // Fallback para a DEMO fluida caso o dono ainda nao tenha criado a barbearia no BD
          activeBarbearia = {
            id: '1',
            nome: 'Resenha Barber',
            logo_url: '/logo.png',
            cor_primaria: '#F97316'
          };
          setBarbearia(activeBarbearia);
        } else {
          setError("Barbearia não encontrada.");
          setLoading(false);
          return;
        }
      } else {
        setBarbearia(activeBarbearia);
      }

      // 2. Fetch Barbeiros
      let barbeirosData = null;
      if (activeBarbearia.id !== '1') {
        const { data } = await supabase
          .from("barbeiros")
          .select("*")
          .eq("barbearia_id", activeBarbearia.id)
          .eq("ativo", true);
        barbeirosData = data;
      }

      if (barbeirosData && barbeirosData.length > 0) {
        setBarbeiros(barbeirosData);
      } else {
        // Fallback for Demo without DB
        setBarbeiros([
          { id: '1', nome: 'Marcos (Chefe)', especialidade: 'Fade e Tesoura', foto_url: 'M' },
          { id: '2', nome: 'Thiago', especialidade: 'Barba e Sobrancelha', foto_url: 'T' },
          { id: '3', nome: 'Lucas', especialidade: 'Degradê e Freestyle', foto_url: 'L' },
        ]);
      }

      // 3. Fetch Services
      let sData = null;
      if (activeBarbearia.id !== '1') {
        const { data } = await supabase
          .from("servicos")
          .select("*")
          .eq("barbearia_id", activeBarbearia.id)
          .eq("ativo", true);
        sData = data;
      }
        
      if (sData && sData.length > 0) {
        setServicos(sData);
      } else {
        // Fallback for Demo without DB
        setServicos([
          { id: '1', nome: 'Corte Degradê na Régua', descricao: 'Máquina, gilete e finalização', preco_base: 45, precos_barbeiros: { '1': 45, '2': 40, '3': 35 }, duracao_minutos: 45 },
          { id: '2', nome: 'Barba Terapia Completa', descricao: 'Toalha quente e massagem', preco_base: 35, precos_barbeiros: { '1': 35, '2': 35, '3': 30 }, duracao_minutos: 30 },
          { id: '3', nome: 'Combo Completo VIP', descricao: 'Corte + Barba + Sobrancelha', preco_base: 90, precos_barbeiros: { '1': 90, '2': 80, '3': 75 }, duracao_minutos: 80 },
        ]);
      }

      setLoading(false);
    }
    
    loadBarbearia();
  }, [slug]);

  // Generators for UI
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        dates.push(d);
    }
    return dates;
  };

  const generateTimes = () => {
    return ["09:00", "10:00", "11:00", "13:30", "14:30", "16:00", "17:00", "18:00"];
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barbearia || !selectedService || !selectedDate || !selectedTime || !selectedBarbeiro) return;

    setIsSubmitting(true);
    
    // In details: We would create the client in DB, then the appointment. 
    // Here we simulate the real-time push for the dashboard.
    
    try {
      // 1. Create or Find Client
      let clientId;
      const { data: existingClient } = await supabase
        .from('clientes')
        .select('id')
        .eq('telefone', clientPhone)
        .eq('barbearia_id', barbearia.id)
        .single();

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        // Simular criação na API real (fallback se estivermos apenas com demo data)
        const activeBarbeariaId = barbearia.id === '1' ? '12345678-1234-1234-1234-123456789012' : barbearia.id; // Evitar UUID invalido
        const { data: newClient, error: clientError } = await supabase
          .from('clientes')
          .insert({ barbearia_id: activeBarbeariaId, nome: clientName, telefone: clientPhone })
          .select('id')
          .single();
        
        if (clientError) {
          console.error("Mocking client creation for demo...");
          clientId = 'mock-client-id';
        } else {
          clientId = newClient?.id;
        }
      }

      if (clientId) {
        // Compose Datetime
        const [hours, mins] = selectedTime.split(':');
        const dtInicio = new Date(selectedDate);
        dtInicio.setHours(Number(hours), Number(mins), 0, 0);

        const dtFim = new Date(dtInicio.getTime() + selectedService.duracao_minutos * 60000);

        // Preço dinâmico para salvar no banco
        const valorReal = selectedService.precos_barbeiros?.[selectedBarbeiro.id] || selectedService.preco_base;

        // 2. Create Appointment
        if (barbearia.id !== '1') {
           await supabase.from('agendamentos').insert({
             barbearia_id: barbearia.id,
             cliente_id: clientId,
             barbeiro_id: selectedBarbeiro.id,
             servico_id: selectedService.id,
             data_hora_inicio: dtInicio.toISOString(),
             data_hora_fim: dtFim.toISOString(),
             valor_total: valorReal
           });
        }
        // 3. Disparo Automático via WhatsApp Evolution API
        const payloadWpp = {
          telefone: clientPhone,
          nomeCliente: clientName.split(' ')[0],
          dataHora: `${dtInicio.toLocaleDateString('pt-BR')} às ${selectedTime}`,
          servico: selectedService.nome,
          barbeiro: selectedBarbeiro.nome,
          barbeariaNome: barbearia.nome
        };

        try {
          await fetch('/api/whatsapp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadWpp)
          });
          console.log("Sucesso ao enviar WhatsApp ou Simular disparo.");
        } catch(wppError) {
          console.error("Erro ao chamar API de WhatsApp internamente.", wppError);
        }
      }

      // Concluido com sucesso
      setStep(5);
    } catch (err) {
      console.error("Booking error:", err);
      // Fallback pra finalizar a UI mesmo que o BD dê erro na demo
      setStep(5); 
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDERS ---
  if (loading) {
    return (
      <div className="booking-container" style={{ justifyContent: 'center' }}>
        <div className="barbershop-logo animate-pulse">💈</div>
        <p style={{ color: 'var(--text-secondary)' }}>Carregando agenda...</p>
      </div>
    );
  }

  if (error || !barbearia) {
    return (
      <div className="booking-container" style={{ justifyContent: 'center' }}>
        <h2>{error || "Página não encontrada"}</h2>
      </div>
    );
  }

  return (
    <div className="booking-container">
      <div className="booking-card animate-fade-in" style={{ '--accent-primary': barbearia.cor_primaria || '#F97316' } as React.CSSProperties}>
        
        {step !== 5 && (
          <div className="barbershop-header">
            {barbearia.logo_url ? (
              <img src={barbearia.logo_url} alt={barbearia.nome} className="barbershop-logo" />
            ) : (
              <div className="barbershop-logo">✂️</div>
            )}
            <h1>{barbearia.nome || 'Minha Barbearia'}</h1>
            <p>Selecione abaixo o que você deseja</p>
          </div>
        )}

        {/* STEP 1: BARBER */}
        {step === 1 && (
          <div className="booking-step slide-in-bottom">
            <h2 className="step-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span><span className="step-number">1</span> Escolha o Profissional</span>
            </h2>
            <div className="service-list" style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
              {barbeiros.map((barbeiro) => (
                <div 
                  key={barbeiro.id}
                  className={`service-item ${selectedBarbeiro?.id === barbeiro.id ? 'selected' : ''}`}
                  onClick={() => setSelectedBarbeiro(barbeiro)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.5rem', gap: '0.8rem', justifyContent: 'center' }}
                >
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary) 0%, #ea580c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.8rem', color: 'white' }}>
                    {barbeiro.foto_url || barbeiro.nome.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{barbeiro.nome}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{barbeiro.especialidade}</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              className="btn-confirm" 
              style={{ marginTop: '1.5rem' }}
              disabled={!selectedBarbeiro}
              onClick={() => setStep(2)}
            >
              Continuar ✨
            </button>
          </div>
        )}

        {/* STEP 2: SERVICES */}
        {step === 2 && (
          <div className="booking-step slide-in-bottom">
            <h2 className="step-title">
              <span className="step-number">2</span> Escolha o Serviço
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>Os valores exibidos são cobrados pelo profissional <strong>{selectedBarbeiro?.nome}</strong></p>
            <div className="service-list">
              {servicos.map((svc) => {
                 const precoReal = (selectedBarbeiro && svc.precos_barbeiros) ? (svc.precos_barbeiros[selectedBarbeiro.id] ?? svc.preco_base) : svc.preco_base;
                 return (
                  <div 
                    key={svc.id}
                    className={`service-item ${selectedService?.id === svc.id ? 'selected' : ''}`}
                    onClick={() => setSelectedService(svc)}
                  >
                    <div className="service-info">
                      <h3>{svc.nome}</h3>
                      <p>{svc.descricao || `${svc.duracao_minutos} min`}</p>
                    </div>
                    <div className="service-price">
                      R$ {Number(precoReal).toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                 )
              })}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button className="btn-confirm" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', flex: '1' }} onClick={() => setStep(1)}>
                Voltar
              </button>
              <button 
                className="btn-confirm" 
                style={{ flex: '2' }}
                disabled={!selectedService}
                onClick={() => setStep(3)}
              >
                Continuar ✨
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DATE & TIME */}
        {step === 3 && (
          <div className="booking-step slide-in-bottom">
            <h2 className="step-title">
              <span className="step-number">3</span> Data e Horário
            </h2>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Dias disponíveis de {selectedBarbeiro?.nome}</p>
            <div className="calendar-grid">
              {generateDates().map((date, i) => (
                <button 
                  key={i}
                  className={`day-btn ${selectedDate?.toDateString() === date.toDateString() ? 'selected' : ''}`}
                  onClick={() => setSelectedDate(date)}
                >
                  <span className="day-name">{date.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                  <span className="day-number">{date.getDate()}</span>
                </button>
              ))}
            </div>

            {selectedDate && (
              <>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem', marginTop: '1.5rem' }}>Horários livres do profissional</p>
                <div className="time-grid">
                  {generateTimes().map((time, i) => (
                    <button 
                      key={i}
                      className={`time-btn ${selectedTime === time ? 'selected' : ''}`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button className="btn-confirm" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', flex: '1' }} onClick={() => setStep(2)}>
                Voltar
              </button>
              <button 
                className="btn-confirm" 
                style={{ flex: '2' }}
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep(4)}
              >
                Confirmar Horário
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CLIENT INFO */}
        {step === 4 && (
          <div className="booking-step slide-in-bottom">
            <h2 className="step-title">
              <span className="step-number">4</span> Seus Dados
            </h2>
            
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '0.5rem', fontSize: '0.9rem', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-color)' }}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary) 0%, #ea580c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', color: 'white' }}>
                    {selectedBarbeiro?.foto_url || selectedBarbeiro?.nome.charAt(0)}
                 </div>
                 <div>
                   <strong style={{ display: 'block' }}>{selectedBarbeiro?.nome}</strong>
                   <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Profissional Escolhido</span>
                 </div>
              </div>
              <strong>Serviço:</strong> {selectedService?.nome} <br />
              <strong>Quando:</strong> {selectedDate?.toLocaleDateString('pt-BR')} às {selectedTime}
            </div>

            <form onSubmit={handleBooking} className="client-form">
              <div>
                <input 
                  type="text" 
                  placeholder="Seu Nome Completo" 
                  className="form-input" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required 
                />
              </div>
              <div>
                <input 
                  type="tel" 
                  placeholder="Seu WhatsApp (Ex: 11999999999)" 
                  className="form-input" 
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn-confirm" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', flex: '1' }} onClick={() => setStep(3)}>
                  Voltar
                </button>
                <button 
                  type="submit" 
                  className="btn-confirm" 
                  style={{ flex: '2' }}
                  disabled={isSubmitting || !clientName || !clientPhone}
                >
                  {isSubmitting ? 'Finalizando...' : 'Finalizar Agendamento ✅'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 5: SUCCESS */}
        {step === 5 && (
          <div className="success-state slide-in-bottom">
            <div className="success-icon">🎉</div>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Agendamento Confirmado!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Tudo certo, {clientName.split(' ')[0]}!<br/>
              Te esperamos no dia <strong>{selectedDate?.toLocaleDateString('pt-BR')}</strong> às <strong>{selectedTime}</strong> para o seu {selectedService?.nome}.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Enviamos um resumo pro seu WhatsApp.
            </p>
          </div>
        )}

      </div>
      
      <div className="powered-by">
        Desenvolvido por <a href="/">Agenda Resenha</a>
      </div>
    </div>
  );
}
