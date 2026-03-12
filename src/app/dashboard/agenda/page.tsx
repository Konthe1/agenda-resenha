"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

// Mocks e Utilitários para o Calendário
const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 9); // 09:00 as 20:00

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [barbeiros, setBarbeiros] = useState<any[]>([]);
  const [selectedBarbeiroId, setSelectedBarbeiroId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointmentInfo, setSelectedAppointmentInfo] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // States for new appointment
  const [novoClienteNome, setNovoClienteNome] = useState('');
  const [novoClienteWpp, setNovoClienteWpp] = useState('');
  const [novaData, setNovaData] = useState('');
  const [novaHora, setNovaHora] = useState('10:00');
  const [novoBarbeiroId, setNovoBarbeiroId] = useState('');
  
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajusta para Segunda
    return new Date(d.setDate(diff));
  });

  // Load Real Data
  useEffect(() => {
    async function fetchAgenda() {
      setIsLoading(true);
      try {
        const { data: barbearias } = await supabase.from('barbearias').select('id').limit(1);
        const activeBarbeariaId = barbearias?.[0]?.id || '1';

        // Fetch Barbeiros
        let bData = null;
        if (activeBarbeariaId !== '1') {
           const { data } = await supabase.from('barbeiros').select('*').eq('barbearia_id', activeBarbeariaId).eq('ativo', true);
           bData = data;
        }
        
        if (bData && bData.length > 0) {
           setBarbeiros(bData);
           setNovoBarbeiroId(bData[0].id);
        } else {
           const mockBarbeiros = [
             { id: '1', nome: 'Marcos (Chefe)', especialidade: 'Fade e Tesoura', foto_url: 'M' },
             { id: '2', nome: 'Thiago', especialidade: 'Barba e Sobrancelha', foto_url: 'T' },
             { id: '3', nome: 'Lucas', especialidade: 'Degradê e Freestyle', foto_url: 'L' },
           ];
           setBarbeiros(mockBarbeiros);
           setNovoBarbeiroId(mockBarbeiros[0].id);
        }

        const { data } = await supabase
          .from('agendamentos')
          .select(`id, status, valor_total, data_hora_inicio, barbeiro_id, servicos(nome), clientes(nome, telefone), barbeiros(nome, foto_url)`)
          .gte('data_hora_inicio', new Date(currentWeekStart).toISOString())
          // Simplificação: Pegando apenas próximos 7 dias
          .lte('data_hora_inicio', new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString());
        
        if (data) setAppointments(data);
      } catch (e) {
        console.error("Erro ao buscar agenda:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAgenda();
    
    // Realtime changes
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agendamentos' }, () => {
        fetchAgenda();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); }
  }, [currentWeekStart]);

  // Funções de Utilitários de Data
  const getDaysOfWeek = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() + i);
        days.push(d);
    }
    return days;
  };
  const weekDays = getDaysOfWeek();

  // Verifica se há agendamento naquela hora
  const getAppointmentForSlot = (date: Date, hour: number) => {
    return appointments.find(app => {
      if (selectedBarbeiroId !== "all" && app.barbeiro_id !== selectedBarbeiroId) return false;
      const appDate = new Date(app.data_hora_inicio);
      return appDate.getDate() === date.getDate() && 
             appDate.getMonth() === date.getMonth() && 
             appDate.getHours() === hour;
    });
  };

  const nextWeek = () => setCurrentWeekStart(new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000));
  const prevWeek = () => setCurrentWeekStart(new Date(currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000));

  const handleCreateAppointment = async () => {
    if (!novoClienteNome || !novoClienteWpp || !novaData || !novaHora) {
      alert("Preencha todos os campos do cliente e data/hora");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Busca barbearia e servico padrao (simplificado para admin logado, usando o ID "1" provisorio da demo)
      const { data: barbearias } = await supabase.from('barbearias').select('id').limit(1);
      const barbeariaId = barbearias?.[0]?.id;
      
      const { data: servicos } = await supabase.from('servicos').select('id, preco').limit(1);
      const servicoObj = servicos?.[0];

      if (!barbeariaId || !servicoObj || !novoBarbeiroId) {
        alert("Erro estrutural: Cadastre uma barbearia, um barbeiro e um serviço antes de agendar.");
        return;
      }

      // 2. Cria cliente se nao existir (Busca por telefone)
      let clienteId;
      const { data: clientesExt } = await supabase.from('clientes').select('id').eq('telefone', novoClienteWpp).eq('barbearia_id', barbeariaId).limit(1);
      if (clientesExt && clientesExt.length > 0) {
         clienteId = clientesExt[0].id;
      } else {
         const { data: newClient } = await supabase.from('clientes').insert({
            barbearia_id: barbeariaId,
            nome: novoClienteNome,
            telefone: novoClienteWpp
         }).select('id').single();
         clienteId = newClient?.id;
      }

      // 3. Monta data e insere agendamento
      const [ano, mes, dia] = novaData.split('-');
      const [hora, min] = novaHora.split(':');
      const startDateTime = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(min));
      const endDateTime = new Date(startDateTime.getTime() + 30 * 60000); // + 30 minutos provisorio

      const { error } = await supabase.from('agendamentos').insert({
         barbearia_id: barbeariaId,
         cliente_id: clienteId,
         barbeiro_id: novoBarbeiroId,
         servico_id: servicoObj.id,
         data_hora_inicio: startDateTime.toISOString(),
         data_hora_fim: endDateTime.toISOString(),
         valor_total: servicoObj.preco,
         status: 'confirmado'
      });

      if (error) throw error;
      
      setIsModalOpen(false);
      setNovoClienteNome('');
      setNovoClienteWpp('');
      alert("Agendamento criado com sucesso! E o cliente já recebeu o WhatsApp (se o evento de webhook disparar)!");
    } catch(err: any) {
      console.error(err);
      alert("Erro ao criar agendamento: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmExistingBooking = async () => {
    if (!selectedAppointmentInfo) return;
    setIsSubmitting(true);
    try {
      await supabase.from('agendamentos').update({ status: 'confirmado' }).eq('id', selectedAppointmentInfo.id);

      const dtInicio = new Date(selectedAppointmentInfo.data_hora_inicio);
      const payloadWpp = {
        telefone: selectedAppointmentInfo.clientes?.telefone,
        nomeCliente: selectedAppointmentInfo.clientes?.nome?.split(' ')[0],
        dataHora: `${dtInicio.toLocaleDateString('pt-BR')} às ${dtInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' })}`,
        servico: selectedAppointmentInfo.servicos?.nome,
        barbeiro: selectedAppointmentInfo.barbeiros?.nome,
        barbeariaNome: 'Sua Barbearia' // fallback simplificado
      };

      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadWpp)
      });

      alert("Agendamento confirmado com sucesso!");
      setSelectedAppointmentInfo(null);
    } catch (e) {
      console.error(e);
      alert("Erro ao confirmar agendamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectExistingBooking = async () => {
    if (!selectedAppointmentInfo) return;
    setIsSubmitting(true);
    try {
      await supabase.from('agendamentos').update({ status: 'cancelado' }).eq('id', selectedAppointmentInfo.id);
      setSelectedAppointmentInfo(null);
    } catch (e) {
      console.error(e);
      alert("Erro ao rejeitar agendamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}>
      {/* HEADER */}
      <div className="page-header" style={{ marginBottom: '1rem', flexShrink: 0 }}>
        <div className="page-title">
          <h1>Agenda Completa</h1>
          <p>Visão Semanal Interativa</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select 
            value={selectedBarbeiroId} 
            onChange={e => setSelectedBarbeiroId(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: '500', minWidth: '180px' }}
          >
             <option value="all">Filtro: Todos Barbeiros</option>
             {barbeiros.map(b => (
               <option key={b.id} value={b.id}>🧔 {b.nome}</option>
             ))}
          </select>

          <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <button onClick={prevWeek} className="btn-text" style={{ padding: '0.5rem 1rem', borderRight: '1px solid var(--border-color)' }}>←</button>
            <span style={{ padding: '0.5rem 1rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
              {weekDays[0].toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })} a {weekDays[6].toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
            </span>
            <button onClick={nextWeek} className="btn-text" style={{ padding: '0.5rem 1rem', borderLeft: '1px solid var(--border-color)' }}>→</button>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
            + Novo
          </button>
        </div>
      </div>

      {/* CALENDAR GRID */}
      <div className="section-card calendar-container" style={{ flex: 1, overflow: 'auto', padding: '0', display: 'flex', flexDirection: 'column' }}>
        
        {/* Cabecalho Dias */}
        <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', position: 'sticky', top: 0, zIndex: 10, minWidth: '700px' }}>
          <div style={{ padding: '10px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>GMT-3</div>
          {weekDays.map((day, idx) => (
            <div key={idx} style={{ padding: '10px', textAlign: 'center', borderLeft: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{DAYS[day.getDay()].substring(0, 3)}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: day.toDateString() === new Date().toDateString() ? 'bold' : 'normal', color: day.toDateString() === new Date().toDateString() ? 'var(--accent-primary)' : 'inherit' }}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Corpo Horarios */}
        <div style={{ position: 'relative', flex: 1 }}>
          {HOURS.map(hour => (
            <div key={hour} style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', minHeight: '60px', minWidth: '700px' }}>
              
              {/* Coluna de Hora */}
              <div style={{ padding: '10px 5px', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)', transform: 'translateY(-10px)' }}>
                {hour}:00
              </div>
              
              {/* Slots de Dias */}
              {weekDays.map((day, dIdx) => {
                const app = getAppointmentForSlot(day, hour);
                return (
                  <div key={`${hour}-${dIdx}`} style={{ borderBottom: '1px solid var(--border-color)', borderLeft: '1px solid var(--border-color)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }} 
                       className="calendar-slot"
                       onClick={() => {
                         if (app) {
                           setSelectedAppointmentInfo(app);
                         } else {
                           setNovaData(day.toISOString().split('T')[0]);
                           setNovaHora(`${hour.toString().padStart(2, '0')}:00`);
                           setIsModalOpen(true);
                         }
                       }}>
                    
                     {/* Elemento de Agendamento */}
                     {app && (
                        <div style={{
                          position: 'absolute', top: '2px', left: '2px', right: '2px', bottom: '2px',
                          background: app.status === 'solicitado' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(249, 115, 22, 0.15)',
                          borderLeft: app.status === 'solicitado' ? '4px solid #EAB308' : '4px solid var(--accent-primary)',
                          borderRadius: '4px', padding: '4px 8px', overflow: 'hidden', cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', gap: '2px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                             <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', overflow: 'hidden', flexShrink: 0 }}>
                                {app.barbeiros?.foto_url?.startsWith('http') || app.barbeiros?.foto_url?.startsWith('/') ? (
                                   <img src={app.barbeiros.foto_url} alt={app.barbeiros.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                   app.barbeiros?.foto_url || app.barbeiros?.nome?.charAt(0) || '?'
                                )}
                             </div>
                             <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                {app.clientes?.nome || 'Cliente'}
                             </div>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                             {app.servicos?.nome || 'Serviço'}
                          </div>
                        </div>
                     )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* MODAL NOVO AGENDAMENTO */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
           <div className="section-card animate-fade-in" style={{ width: '400px', maxWidth: '90%', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                 <h2>Novo Agendamento</h2>
                 <button className="btn-icon" onClick={() => setIsModalOpen(false)}>❌</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Nome do Cliente</label>
                    <input type="text" value={novoClienteNome} onChange={e => setNovoClienteNome(e.target.value)} placeholder="Nome completo" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                 </div>
                 
                 <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>WhatsApp (Para receber o lembrete)</label>
                    <input type="tel" value={novoClienteWpp} onChange={e => setNovoClienteWpp(e.target.value)} placeholder="(11) 99999-9999" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                 </div>

                 <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Data</label>
                      <input type="date" value={novaData} onChange={e => setNovaData(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                    </div>
                    <div style={{ width: '120px' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Hora</label>
                      <input type="time" value={novaHora} onChange={e => setNovaHora(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }} />
                    </div>
                 </div>

                 <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Profissional (Barbeiro)</label>
                    <select 
                      value={novoBarbeiroId} 
                      onChange={e => setNovoBarbeiroId(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }}
                    >
                       {barbeiros.map(b => (
                         <option key={b.id} value={b.id}>{b.nome}</option>
                       ))}
                    </select>
                 </div>

                 <button className="btn-primary" disabled={isSubmitting} style={{ marginTop: '1rem', padding: '1rem', opacity: isSubmitting ? 0.7 : 1 }} onClick={handleCreateAppointment}>
                    {isSubmitting ? 'Salvando...' : 'Salvar e Avisar Cliente'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL DETALHES DO AGENDAMENTO (VIEW / APPROVE) */}
      {selectedAppointmentInfo && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
           <div className="section-card animate-fade-in" style={{ width: '450px', maxWidth: '90%', padding: '2rem', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                 <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   {selectedAppointmentInfo.status === 'solicitado' ? '⏳ Agendamento Pendente' : '✅ Agendamento'}
                 </h2>
                 <button className="btn-icon" onClick={() => setSelectedAppointmentInfo(null)}>❌</button>
              </div>
              
              <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                <p style={{ marginBottom: '0.8rem' }}><strong style={{ color: 'var(--text-muted)' }}>CLIENTE:</strong> <span style={{ fontSize: '1.1rem', color: 'white' }}>{selectedAppointmentInfo.clientes?.nome}</span></p>
                <p style={{ marginBottom: '0.8rem' }}><strong style={{ color: 'var(--text-muted)' }}>WHATSAPP:</strong> <span style={{ color: 'white' }}>{selectedAppointmentInfo.clientes?.telefone || 'Não informado'}</span></p>
                <p style={{ marginBottom: '0.8rem' }}><strong style={{ color: 'var(--text-muted)' }}>PROFISSIONAL:</strong> <span style={{ color: 'white' }}>{selectedAppointmentInfo.barbeiros?.nome}</span></p>
                <p style={{ marginBottom: '0.8rem' }}><strong style={{ color: 'var(--text-muted)' }}>DATA/HORA:</strong> <span style={{ color: 'white' }}>{new Date(selectedAppointmentInfo.data_hora_inicio).toLocaleString('pt-BR')}</span></p>
                <p style={{ marginBottom: '0.8rem' }}><strong style={{ color: 'var(--text-muted)' }}>SERVIÇO:</strong> <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{selectedAppointmentInfo.servicos?.nome}</span></p>
                <p style={{ marginBottom: '0' }}><strong style={{ color: 'var(--text-muted)' }}>STATUS:</strong> <span style={{ color: selectedAppointmentInfo.status === 'solicitado' ? '#EAB308' : '#10B981', fontWeight: 'bold', textTransform: 'uppercase' }}>{selectedAppointmentInfo.status}</span></p>
              </div>

              {selectedAppointmentInfo.status === 'solicitado' ? (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    className="btn-confirm"
                    style={{ flex: 1, backgroundColor: 'var(--bg-tertiary)', color: '#EF4444', fontWeight: 'bold', padding: '1rem', borderRadius: '12px' }}
                    onClick={handleRejectExistingBooking}
                    disabled={isSubmitting}
                  >
                    Rejeitar
                  </button>
                  <button 
                    className="btn-primary"
                    style={{ flex: 2, padding: '1rem', fontSize: '1rem', fontWeight: 'bold', borderRadius: '12px' }}
                    onClick={handleConfirmExistingBooking}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processando...' : 'Confirmar e Avisar Cliente'}
                  </button>
                </div>
              ) : (
                <button 
                  className="btn-primary"
                  style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 'bold', borderRadius: '12px' }}
                  onClick={() => setSelectedAppointmentInfo(null)}
                >
                  Fechar
                </button>
              )}
           </div>
        </div>
      )}

      {/* Estilos Inline Hover do Grid */}
      <style dangerouslySetInnerHTML={{__html: `
        .calendar-slot:hover {
          background-color: var(--bg-hover) !important;
        }
        .calendar-container::-webkit-scrollbar {
          width: 8px;
        }
        .calendar-container::-webkit-scrollbar-track {
          background: var(--bg-primary); 
        }
        .calendar-container::-webkit-scrollbar-thumb {
          background: #334155; 
          border-radius: 4px;
        }
      `}} />
    </div>
  );
}
